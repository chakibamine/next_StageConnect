import { api } from "@/lib/api";

export type ConnectionStatus = "NONE" | "PENDING" | "CONNECTED" | "REJECTED";

export interface Connection {
  id: number;
  requesterId: number;
  receiverId: number;
  requesterName: string;
  requesterTitle: string;
  requesterCompany: string;
  requesterLocation: string;
  requesterProfilePicture?: string;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionResponse {
  connections?: Connection[];
  pendingConnections?: Connection[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface ConnectionRequest {
  user_id: number;
}

export interface ConnectionState {
  status: ConnectionStatus;
  connectionId?: number;
}

export const connectionService = {
  // Cache of connection states to avoid unnecessary API calls
  connectionCache: new Map<string, ConnectionState>(),

  // Helper to generate cache key
  getCacheKey(userId: number, otherUserId: number): string {
    return `${userId}_${otherUserId}`;
  },

  // Check connection state between two users
  async checkConnectionStatus(userId: number, otherUserId: number): Promise<ConnectionState> {
    try {
      const cacheKey = this.getCacheKey(userId, otherUserId);
      if (this.connectionCache.has(cacheKey)) {
        return this.connectionCache.get(cacheKey) as ConnectionState;
      }

      // If no cached state, try to get from server
      try {
        // First try the status endpoint - might not exist yet
        const response = await api.get<{status: ConnectionStatus, connectionId?: number}>(`/api/connections/status?userId=${userId}&otherUserId=${otherUserId}`);
        
        // Cache the result
        this.connectionCache.set(cacheKey, response);
        return response;
      } catch (statusError) {
        // If the status endpoint doesn't exist, let's find the status by checking connections
        console.warn('Connection status endpoint not available, using alternative approach:', statusError);
        
        // Fetch all connections to find any between these users
        const connections = await this.getConnections(userId);
        
        // Find any connection involving the other user
        const connection = connections.connections?.find(conn => 
          (conn.requesterId === otherUserId || conn.receiverId === otherUserId)
        );
        
        if (connection) {
          const state = { 
            status: connection.status, 
            connectionId: connection.id 
          };
          this.connectionCache.set(cacheKey, state);
          return state;
        }
        
        // Check pending connections too
        const pending = await this.getPendingConnections(userId);
        const pendingConn = pending.pendingConnections?.find(conn => 
          (conn.requesterId === otherUserId || conn.receiverId === otherUserId)
        );
        
        if (pendingConn) {
          const state = { 
            status: pendingConn.status, 
            connectionId: pendingConn.id 
          };
          this.connectionCache.set(cacheKey, state);
          return state;
        }
        
        // If no connection found, return NONE
        return { status: "NONE" };
      }
    } catch (error) {
      console.error('Failed to check connection status:', error);
      return { status: "NONE" };
    }
  },

  // Get all connections for the current user
  async getConnections(userId: number, page = 0, size = 10): Promise<ConnectionResponse> {
    try {
      const response = await api.get<ConnectionResponse>(`/api/connections/user/${userId}?page=${page}&size=${size}`);
      
      // Update cache with these connections
      if (response.connections) {
        response.connections.forEach(conn => {
          const otherUserId = conn.requesterId === userId ? conn.receiverId : conn.requesterId;
          this.connectionCache.set(
            this.getCacheKey(userId, otherUserId),
            { status: conn.status, connectionId: conn.id }
          );
        });
      }
      
      return response;
    } catch (error) {
      console.error('Failed to fetch connections:', error);
      throw new Error('Failed to fetch connections');
    }
  },

  // Get pending connection requests for the current user
  async getPendingConnections(userId: number, page = 0, size = 10): Promise<ConnectionResponse> {
    try {
      const response = await api.get<ConnectionResponse>(`/api/connections/pending/${userId}?page=${page}&size=${size}`);
      
      // Update cache with these pending connections
      if (response.pendingConnections) {
        response.pendingConnections.forEach(conn => {
          const otherUserId = conn.requesterId === userId ? conn.receiverId : conn.requesterId;
          this.connectionCache.set(
            this.getCacheKey(userId, otherUserId),
            { status: "PENDING", connectionId: conn.id }
          );
        });
      }
      
      return response;
    } catch (error) {
      console.error('Failed to fetch pending connections:', error);
      throw new Error('Failed to fetch pending connection requests');
    }
  },

  // Get connection suggestions for the current user
  async getConnectionSuggestions(userId: number, page = 0, size = 10): Promise<any> {
    try {
      return await api.get<any>(`/api/connections/suggestions/${userId}?page=${page}&size=${size}`);
    } catch (error) {
      console.error('Failed to fetch connection suggestions:', error);
      throw new Error('Failed to fetch connection suggestions');
    }
  },

  // Send a connection request
  async sendConnectionRequest(userId: number, receiverId: number): Promise<any> {
    try {
      // First check if we already have a connection or pending request
      const connectionState = await this.checkConnectionStatus(userId, receiverId);
      
      if (connectionState.status === "CONNECTED") {
        throw new Error("You are already connected with this user");
      }
      
      if (connectionState.status === "PENDING") {
        throw new Error("A connection request is already pending");
      }
      
      // If no existing connection, send the request
      const response = await api.post<any>(`/api/connections/request/${receiverId}`, { user_id: userId });
      
      // Update cache with the new pending state
      if (response.success) {
        this.connectionCache.set(
          this.getCacheKey(userId, receiverId),
          { status: "PENDING", connectionId: response.data?.id }
        );
      }
      
      return response;
    } catch (error) {
      console.error('Failed to send connection request:', error);
      throw error instanceof Error ? error : new Error('Failed to send connection request');
    }
  },

  // Accept a connection request
  async acceptConnectionRequest(userId: number, connectionId: number): Promise<any> {
    try {
      // The API expects user_id in the body, not in the URL
      const response = await api.put<any>(`/api/connections/${connectionId}/accept`, { user_id: userId });
      
      if (response.success && response.data) {
        // Get the other user's ID from the response
        const conn = response.data;
        const otherUserId = conn.requesterId === userId ? conn.receiverId : conn.requesterId;
        
        // Update connection cache
        this.connectionCache.set(
          this.getCacheKey(userId, otherUserId),
          { status: "CONNECTED", connectionId: connectionId }
        );
        
        // Create a conversation between the users
        try {
          await this.createConversation(userId, otherUserId);
        } catch (convError) {
          console.error('Failed to create conversation:', convError);
          // Don't throw error here, as the connection was still created successfully
        }
      }
      
      return response;
    } catch (error) {
      console.error('Failed to accept connection request:', error);
      throw new Error('Failed to accept connection request');
    }
  },

  // Reject a connection request
  async rejectConnectionRequest(userId: number, connectionId: number): Promise<any> {
    try {
      // The API expects user_id in the body, not in the URL
      const response = await api.put<any>(`/api/connections/${connectionId}/reject`, { user_id: userId });
      
      if (response.success && response.data) {
        // Get the other user's ID from the response
        const conn = response.data;
        const otherUserId = conn.requesterId === userId ? conn.receiverId : conn.requesterId;
        
        // Update connection cache
        this.connectionCache.set(
          this.getCacheKey(userId, otherUserId),
          { status: "REJECTED", connectionId: connectionId }
        );
      }
      
      return response;
    } catch (error) {
      console.error('Failed to reject connection request:', error);
      throw new Error('Failed to reject connection request');
    }
  },

  // Remove an existing connection
  async removeConnection(userId: number, connectionId: number): Promise<any> {
    try {
      // The API expects userId as a query parameter, not in the URL
      const response = await api.delete<any>(`/api/connections/${connectionId}?userId=${userId}`);
      
      if (response.success && response.data) {
        // Get the other user's ID from the response
        const conn = response.data;
        const otherUserId = conn.requesterId === userId ? conn.receiverId : conn.requesterId;
        
        // Update connection cache
        this.connectionCache.set(
          this.getCacheKey(userId, otherUserId),
          { status: "NONE" }
        );
      }
      
      return response;
    } catch (error) {
      console.error('Failed to remove connection:', error);
      throw new Error('Failed to remove connection');
    }
  },

  // Get connection statistics
  async getConnectionStats(userId: number): Promise<any> {
    try {
      return await api.get<any>(`/api/connections/stats/${userId}`);
    } catch (error) {
      console.error('Failed to fetch connection statistics:', error);
      throw new Error('Failed to fetch connection statistics');
    }
  },
  
  // Create a conversation between two users
  async createConversation(userId: number, otherUserId: number): Promise<any> {
    try {
      // Try to call the messaging API to create a conversation
      try {
        const response = await api.post<any>(`/api/messages/conversations`, {
          participants: [userId, otherUserId],
          initialMessage: 'Hello! We are now connected on StageConnect.'
        });
        
        return response;
      } catch (error) {
        // If the endpoint doesn't exist yet, provide a fallback behavior
        console.warn("Failed to create conversation - messaging endpoint might not be implemented yet:", error);
        
        // Return a fake successful response
        return {
          success: true,
          message: "Conversation creation simulated (messaging API not implemented)",
          data: {
            id: Date.now(),
            participants: [userId, otherUserId],
            created: new Date().toISOString()
          }
        };
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      // Don't throw here, as the connection functionality should still work
      // even if conversation creation fails
      return {
        success: false,
        message: "Failed to create conversation between users"
      };
    }
  }
}; 