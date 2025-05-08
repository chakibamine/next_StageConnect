// Polyfill for global to make sockjs-client work in the browser
if (typeof window !== 'undefined' && !window.global) {
  (window as any).global = window;
}

import SockJS from 'sockjs-client';
import { Stomp, Client, IFrame } from '@stomp/stompjs';

// Define WebSocket event types
export enum WebSocketEventType {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  MESSAGE = 'message',
  ERROR = 'error'
}

// Define event handler type
type EventHandler = (data?: any) => void;

/**
 * Service to manage WebSocket connections for real-time messaging
 */
class WebSocketService {
  private stompClient: Client | null = null;
  private socket: any;
  private connected = false;
  private connecting = false;
  private connectionPromise: Promise<void> | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private subscriptions: { [key: string]: any } = {};
  private messageHandlers: { [key: string]: (message: any) => void } = {};
  private eventListeners: { [key in WebSocketEventType]?: EventHandler[] } = {};
  private userId: number | null = null;
  private serverUrl = 'http://localhost:8080';
  
  /**
   * Register an event listener
   */
  addEventListener(eventType: WebSocketEventType, handler: EventHandler) {
    if (!this.eventListeners[eventType]) {
      this.eventListeners[eventType] = [];
    }
    this.eventListeners[eventType]!.push(handler);
    return () => this.removeEventListener(eventType, handler);
  }
  
  /**
   * Remove an event listener
   */
  removeEventListener(eventType: WebSocketEventType, handler: EventHandler) {
    if (!this.eventListeners[eventType]) return;
    this.eventListeners[eventType] = this.eventListeners[eventType]!.filter(h => h !== handler);
  }
  
  /**
   * Trigger an event
   */
  private triggerEvent(eventType: WebSocketEventType, data?: any) {
    if (!this.eventListeners[eventType]) return;
    this.eventListeners[eventType]!.forEach(handler => {
      try {
        handler(data);
      } catch (e) {
        console.error(`Error in ${eventType} event handler:`, e);
      }
    });
  }
  
  /**
   * Set the WebSocket server URL
   */
  setServerUrl(url: string) {
    this.serverUrl = url;
  }
  
  /**
   * Connect to the WebSocket server
   */
  connect(userId: number, token?: string) {
    // Validate userId
    if (userId === undefined || userId === null || isNaN(Number(userId))) {
      console.error('Cannot connect WebSocket: Invalid user ID:', userId);
      this.triggerEvent(WebSocketEventType.ERROR, 'Invalid user ID');
      return Promise.reject(new Error('Invalid user ID'));
    }
    
    // Ensure userId is a number
    userId = Number(userId);
    this.userId = userId;
    
    // If already connected, return immediately
    if (this.connected && this.stompClient) {
      return Promise.resolve();
    }

    // If already connecting, return the existing promise
    if (this.connecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connecting = true;
    
    // Clear any reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.connectionPromise = new Promise<void>((resolve, reject) => {
      try {
        // Disconnect existing connection if any
        if (this.stompClient) {
          try {
            this.stompClient.deactivate();
          } catch (e) {
            console.log('Error disconnecting old client', e);
          }
          this.stompClient = null;
        }
        
        // Create a WebSocket factory function for auto-reconnect
        const socketFactory = () => {
          console.log('Creating new SockJS connection');
          return new SockJS(`${this.serverUrl}/ws`);
        };
        
        // Create STOMP client with factory function
        this.stompClient = Stomp.over(socketFactory);
        
        // Disable debug logging in production
        if (process.env.NODE_ENV === 'production') {
          this.stompClient.debug = () => {};
        }
        
        // Configure client
        this.stompClient.reconnectDelay = 5000; // 5 seconds delay between reconnect attempts
        this.stompClient.heartbeatIncoming = 4000;
        this.stompClient.heartbeatOutgoing = 4000;
        
        // Connect with auth headers if needed
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        // Configure on-connect callback
        this.stompClient.onConnect = (frame: IFrame) => {
          this.connected = true;
          this.connecting = false;
          console.log('WebSocket connected');
          this.triggerEvent(WebSocketEventType.CONNECTED, frame);
          
          try {
            // Subscribe to user-specific topic
            this.subscribeToUserMessages(userId);
            
            // Send join message to notify server
            this.sendJoinMessage(userId);
            
            // Setup heartbeat
            this.setupHeartbeat(userId);
          } catch (error) {
            console.error('Error after connection:', error);
          }
          
          // Notify connection success
          resolve();
        };
        
        // Configure error callback
        this.stompClient.onStompError = (frame: IFrame) => {
          console.error('WebSocket STOMP error:', frame);
          this.triggerEvent(WebSocketEventType.ERROR, {
            type: 'stomp',
            frame
          });
          
          // Don't reject here, as the client will try to reconnect
        };
        
        // Configure disconnect callback
        this.stompClient.onWebSocketClose = (event) => {
          console.warn('WebSocket connection closed:', event);
          this.connected = false;
          this.connecting = false;
          this.triggerEvent(WebSocketEventType.DISCONNECTED, event);
          
          // Schedule reconnect if not intentionally disconnected
          if (!event.wasClean && this.userId) {
            this.scheduleReconnect();
          }
        };
        
        // Activate the client
        this.stompClient.activate();
      } catch (err) {
        console.error('WebSocket setup error:', err);
        this.connected = false;
        this.connecting = false;
        this.stompClient = null;
        this.triggerEvent(WebSocketEventType.ERROR, {
          type: 'connection',
          error: err
        });
        reject(err);
        
        // Schedule reconnect
        if (this.userId) {
          this.scheduleReconnect();
        }
      }
    });
    
    return this.connectionPromise;
  }
  
  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    // Try to reconnect after 5 seconds
    this.reconnectTimeout = setTimeout(() => {
      console.log('Attempting to reconnect WebSocket...');
      if (this.userId) {
        this.connect(this.userId);
      }
    }, 5000);
  }
  
  /**
   * Subscribe to user-specific messages
   */
  private subscribeToUserMessages(userId: number) {
    if (!this.connected || !this.stompClient) {
      console.warn('Cannot subscribe: WebSocket not connected');
      return null;
    }
    
    try {
      const destination = `/topic/user/${userId}`;
      
      // Check if we're already subscribed
      if (this.subscriptions[destination]) {
        return this.subscriptions[destination];
      }
      
      const subscription = this.stompClient.subscribe(destination, (message) => {
        try {
          const parsedMessage = JSON.parse(message.body);
          // Only trigger general event if no specific handlers are registered
          const hasMessageHandlers = Object.keys(this.messageHandlers).length > 0;
          
          if (hasMessageHandlers) {
            // Call any registered message handlers
            Object.values(this.messageHandlers).forEach(handler => {
              try {
                handler(parsedMessage);
              } catch (handlerError) {
                console.error('Error in message handler:', handlerError);
              }
            });
          } else {
            // If no specific handlers, use the general event system
            this.triggerEvent(WebSocketEventType.MESSAGE, parsedMessage);
          }
        } catch (parseError) {
          console.error('Error parsing message:', parseError);
        }
      });
      
      this.subscriptions[destination] = subscription;
      console.log(`Subscribed to ${destination}`);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to user messages:', error);
      return null;
    }
  }
  
  /**
   * Send a join message when connecting
   */
  private sendJoinMessage(userId: number) {
    if (!this.connected || !this.stompClient) return;
    
    // Get user information from localStorage if available
    let userName = 'User';
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        if (user && user.name) {
          userName = user.name;
        } else if (user && user.firstName) {
          userName = `${user.firstName} ${user.lastName || ''}`.trim();
        }
      }
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
    }
    
    const joinMessage = {
      type: 'JOIN',
      senderId: userId,
      content: `${userName} is online`,
      senderName: userName,
      timestamp: new Date()
    };
    
    this.sendMessage('/app/chat.join', joinMessage);
  }
  
  /**
   * Subscribe to a STOMP destination
   */
  subscribe(destination: string, callback: (message: any) => void) {
    if (!this.connected || !this.stompClient) {
      console.warn('Cannot subscribe: WebSocket not connected');
      return null;
    }
    
    try {
      // Check if we're already subscribed
      if (this.subscriptions[destination]) {
        return this.subscriptions[destination];
      }
      
      const subscription = this.stompClient.subscribe(destination, callback);
      this.subscriptions[destination] = subscription;
      return subscription;
    } catch (error) {
      console.error('Error subscribing to', destination, error);
      return null;
    }
  }
  
  /**
   * Send a message to a specific destination
   */
  sendMessage(destination: string, message: any) {
    if (!this.connected || !this.stompClient) {
      console.warn('Cannot send message: WebSocket not connected');
      return false;
    }
    
    try {
      // Deep clone the message to avoid modifying the original
      const safeMessage = { ...message };
      
      // Ensure all fields have proper values
      if (typeof safeMessage === 'object') {
        // Handle senderId
        if (safeMessage.senderId !== undefined) {
          safeMessage.senderId = Number(safeMessage.senderId);
          if (isNaN(safeMessage.senderId)) {
            console.warn('Invalid senderId, defaulting to 0');
            safeMessage.senderId = 0;
          }
        } else {
          safeMessage.senderId = this.userId || 0;
        }
        
        // Handle receiverId
        if (safeMessage.receiverId !== undefined) {
          safeMessage.receiverId = Number(safeMessage.receiverId);
          if (isNaN(safeMessage.receiverId)) {
            console.warn('Invalid receiverId, defaulting to 0');
            safeMessage.receiverId = 0;
          }
        } else if (destination.includes('/chat.sendMessage')) {
          console.warn('Missing receiverId for chat message');
          safeMessage.receiverId = 0;
        }
        
        // Ensure conversationId is a valid string
        if (safeMessage.conversationId === undefined || 
            safeMessage.conversationId === null || 
            safeMessage.conversationId === 'undefined') {
          // Generate a valid conversation ID from the IDs
          safeMessage.conversationId = this.generateConversationId(
            safeMessage.senderId, 
            safeMessage.receiverId
          );
        }
        
        // Ensure other required fields have defaults
        if (safeMessage.type === undefined) safeMessage.type = "CHAT";
        if (safeMessage.content === undefined) safeMessage.content = "";
        if (safeMessage.timestamp === undefined) safeMessage.timestamp = new Date();
      }
      
      this.stompClient.publish({
        destination: destination,
        body: JSON.stringify(safeMessage)
      });
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      return false;
    }
  }
  
  /**
   * Generate a conversation ID from two user IDs
   */
  generateConversationId(userId1: number, userId2: number): string {
    return userId1 < userId2 
      ? `${userId1}_${userId2}`
      : `${userId2}_${userId1}`;
  }
  
  /**
   * Send a chat message to another user
   */
  sendChatMessage(receiverId: number, content: string) {
    if (!this.userId) {
      console.error('Cannot send message: No user ID set');
      return false;
    }
    
    return this.sendMessage('/app/chat.sendMessage', {
      type: 'CHAT',
      senderId: this.userId,
      receiverId,
      content,
      conversationId: this.generateConversationId(this.userId, receiverId),
      timestamp: new Date()
    });
  }
  
  /**
   * Send a typing indicator
   */
  sendTypingIndicator(receiverId: number, isTyping: boolean = true) {
    if (!this.userId) return false;
    
    return this.sendMessage('/app/chat.typing', {
      type: 'TYPING',
      senderId: this.userId,
      receiverId,
      content: isTyping ? 'typing' : 'stopped',
      conversationId: this.generateConversationId(this.userId, receiverId)
    });
  }
  
  /**
   * Send read receipt for messages
   */
  sendReadReceipt(senderId: number) {
    if (!this.userId) return false;
    
    return this.sendMessage('/app/chat.read', {
      type: 'READ',
      senderId: senderId,
      receiverId: this.userId,
      conversationId: this.generateConversationId(this.userId, senderId)
    });
  }
  
  /**
   * Register a message handler that will be called for any incoming message
   */
  registerMessageHandler(handlerId: string, handler: (message: any) => void) {
    this.messageHandlers[handlerId] = handler;
  }
  
  /**
   * Unregister a message handler
   */
  unregisterMessageHandler(handlerId: string) {
    delete this.messageHandlers[handlerId];
  }
  
  /**
   * Disconnect from WebSocket server and clean up
   */
  disconnect() {
    // Unsubscribe from all topics
    Object.values(this.subscriptions).forEach(subscription => {
      if (subscription && subscription.unsubscribe) {
        try {
          subscription.unsubscribe();
        } catch (e) {
          console.warn('Error unsubscribing:', e);
        }
      }
    });
    
    // Clear subscriptions and handlers
    this.subscriptions = {};
    this.messageHandlers = {};
    
    // Disconnect STOMP client
    if (this.stompClient && this.connected) {
      try {
        this.stompClient.deactivate();
      } catch (e) {
        console.warn('Error disconnecting:', e);
      }
    }
    
    // Clear reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // Clear heartbeat interval
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    this.connected = false;
    this.connecting = false;
    this.connectionPromise = null;
    this.userId = null;
    
    this.triggerEvent(WebSocketEventType.DISCONNECTED);
    console.log('WebSocket disconnected');
  }
  
  /**
   * Check if the WebSocket is connected
   */
  isConnected() {
    return this.connected;
  }
  
  /**
   * Send a heartbeat to maintain online status
   */
  private setupHeartbeat(userId: number) {
    // Clear any existing heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Set up a new heartbeat interval
    this.heartbeatInterval = setInterval(() => {
      if (this.connected && this.userId) {
        this.sendMessage('/app/chat.heartbeat', {
          type: 'HEARTBEAT',
          senderId: userId,
          timestamp: new Date()
        });
      }
    }, 30000); // Send heartbeat every 30 seconds
  }
}

// Create singleton instance
const instance = new WebSocketService();
export default instance; 