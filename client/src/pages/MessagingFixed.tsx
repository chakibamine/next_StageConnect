import { useState, useEffect, useCallback } from "react";
import ConversationsList from "@/components/messaging/ConversationsList";
import ConversationView from "@/components/messaging/ConversationView";
import WebSocketStatus from "@/components/messaging/WebSocketStatus";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircleIcon, UsersIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import WebSocketService from "@/services/WebSocketService";

interface Message {
  id: number;
  content: string;
  timestamp: Date;
  senderId: number;
  receiverId: number;
  conversationId?: string;
  senderName: string;
}

interface Conversation {
  id: number;
  user: {
    id: number;
    name: string;
    profilePicture?: string;
    isOnline: boolean;
  };
  lastMessage: {
    content: string;
    timestamp: Date;
    isRead: boolean;
  };
  unreadCount: number;
  messages: Message[];
}

// Define a Connection interface for better type safety
interface Connection {
  userId: number;
  connectionId?: number;
  id?: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  formattedName?: string;
  profilePicture?: string;
  role?: string;
  status?: string;
}

const API_BASE_URL = "http://localhost:8080";

// Default values for new conversations
const createDefaultUser = (id: number, name = 'Unknown User') => ({
  id,
  name,
  profilePicture: undefined,
  isOnline: false
});

const createDefaultMessage = (content = 'No messages yet') => ({
  content,
  timestamp: new Date(),
  isRead: true
});

const Messaging = () => {
  const { user } = useAuth();
  const currentUserId = user?.id ? Number(user.id) : null;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionSuggestions, setConnectionSuggestions] = useState<any[]>([]);
  const [userConnections, setUserConnections] = useState<any[]>([]);
  const [pendingConnections, setPendingConnections] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'chats' | 'connections' | 'pending'>('chats');
  
  const activeConversation = conversations.find(conv => conv.id === activeConversationId) || null;

  // Fetch user's conversations
  const fetchConversations = useCallback(async () => {
    try {
      // Validate current user ID
      if (!currentUserId) {
        console.warn("Cannot fetch conversations: No user ID available");
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/messages/conversations/${currentUserId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch conversations');
      
      const data = await response.json();
      
      if (data.success && data.conversations) {
        // Transform backend data to our Conversation format
        const formattedConversations = data.conversations.map((conv: any) => ({
          id: conv.partnerId,
          user: {
            id: conv.partnerId,
            name: conv.partnerName || `${conv.partnerFirstName || ''} ${conv.partnerLastName || ''}`.trim() || 'Unknown User',
            profilePicture: conv.partnerPhoto || undefined,
            isOnline: false, // We don't have online status from API yet
          },
          lastMessage: {
            content: conv.lastMessage?.content || "No messages yet",
            timestamp: conv.lastMessage?.timestamp ? new Date(conv.lastMessage.timestamp) : new Date(),
            isRead: conv.lastMessage?.read || true,
          },
          unreadCount: conv.unreadCount || 0,
          messages: conv.messages?.map((msg: any) => ({
            id: msg.id || Math.floor(Math.random() * 10000),
            content: msg.content || '',
            timestamp: new Date(msg.timestamp || Date.now()),
            senderId: msg.senderId || 0,
            receiverId: msg.receiverId || 0,
            senderName: msg.senderName || '',
          })) || [],
        }));
        
        setConversations(formattedConversations);
        
        // Set first conversation as active if none is selected
        if (formattedConversations.length > 0 && activeConversationId === null) {
          setActiveConversationId(formattedConversations[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }, [currentUserId]);

  // Handle incoming messages
  const handleIncomingMessage = useCallback((message: any) => {
    if (!message || message.type !== "CHAT") return;
    
    const incomingMsg = {
      id: message.id || Math.floor(Math.random() * 10000),
      content: message.content || '',
      timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
      senderId: message.senderId || 0,
      receiverId: message.receiverId || 0,
      conversationId: message.conversationId,
      senderName: message.senderName || 'Unknown User'
    };
    
    // Find conversation based on the sender/receiver
    const partnerId = message.senderId === currentUserId ? message.receiverId : message.senderId;
    if (!partnerId) return;
    
    setConversations(prevConversations => {
      // Check if conversation exists
      const existingConvIndex = prevConversations.findIndex(c => c.user.id === partnerId);
      
      if (existingConvIndex !== -1) {
        // Update existing conversation
        const updatedConversations = [...prevConversations];
        const conv = {...updatedConversations[existingConvIndex]};
        
        // Add message to conversation
        conv.messages = [...conv.messages, incomingMsg];
        
        // Update last message
        conv.lastMessage = {
          content: incomingMsg.content,
          timestamp: incomingMsg.timestamp,
          isRead: incomingMsg.senderId === currentUserId // Mark as read if sent by current user
        };
        
        // Update unread count if not the active conversation and message is from the other person
        if (activeConversationId !== conv.id && incomingMsg.senderId !== currentUserId) {
          conv.unreadCount += 1;
        }
        
        updatedConversations[existingConvIndex] = conv;
        return updatedConversations;
      }
      
      // If conversation doesn't exist yet, create a new one
      if (incomingMsg.senderId !== currentUserId) {
        const newConversation = {
          id: partnerId,
          user: createDefaultUser(partnerId, message.senderName || 'Unknown User'),
          lastMessage: {
            content: incomingMsg.content,
            timestamp: incomingMsg.timestamp,
            isRead: false
          },
          unreadCount: 1,
          messages: [incomingMsg]
        };
        
        return [...prevConversations, newConversation];
      }
      
      // Refresh conversations from server
      fetchConversations();
      return prevConversations;
    });
  }, [currentUserId, activeConversationId, fetchConversations]);

  // Connect to WebSocket
  const connectWebSocket = useCallback(async () => {
    try {
      // Skip if not authenticated
      if (currentUserId === null) {
        console.warn("Cannot connect WebSocket: Not authenticated");
        return;
      }
      
      const token = localStorage.getItem('token') || '';
      
      // Check if already connected
      if (WebSocketService.isConnected()) {
        setIsConnected(true);
        WebSocketService.registerMessageHandler('messagingPage', handleIncomingMessage);
        return;
      }
      
      // Try to connect
      await WebSocketService.connect(currentUserId, token);
      setIsConnected(true);
      
      // Register message handler
      WebSocketService.registerMessageHandler('messagingPage', handleIncomingMessage);
      
      // Send join message
      WebSocketService.sendMessage("/app/chat.join", {
        type: "JOIN",
        senderId: currentUserId,
        content: "user joined"
      });
    } catch (error) {
      console.error("WebSocket connection error:", error);
      setIsConnected(false);
    }
  }, [currentUserId, handleIncomingMessage]);

  // Fetch user connections and suggestions
  const fetchConnections = useCallback(async () => {
    try {
      if (!currentUserId) {
        console.warn("Cannot fetch connections: Not authenticated");
        return;
      }

      console.log("Fetching connections for user ID:", currentUserId);

      // Primary API - fetch existing connections using authenticated user ID
      const connectionsResponse = await fetch(`${API_BASE_URL}/api/connections/user/${currentUserId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      console.log("Connections response:", connectionsResponse);

      if (!connectionsResponse.ok) {
        console.error("Failed to fetch connections:", connectionsResponse.statusText);
        return;
      }

      const connectionsData = await connectionsResponse.json();
      console.log("User connections data:", connectionsData);
      
      // Initialize an array to hold new conversations
      const newConversations: Conversation[] = [];
      
      if (connectionsData.connections && Array.isArray(connectionsData.connections)) {
        console.log(`Found ${connectionsData.connections.length} connections`);
        
        // Format connection names properly
        const formattedConnections = connectionsData.connections.map((conn: any) => ({
          ...conn,
          userId: conn.userId || conn.id, // Ensure we have userId
          name: conn.name || `${conn.firstName || ''} ${conn.lastName || ''}`.trim() || 'Unknown User',
          formattedName: formatName(conn)
        }));
        
        setUserConnections(formattedConnections);
        
        // Automatically create conversations for all connections
        formattedConnections.forEach((connection: Connection) => {
          const connectionUserId = connection.userId;
          if (!connectionUserId) {
            console.warn("Connection missing userId:", connection);
            return;
          }
          
          // Check if this connection already has a conversation
          const existingConversation = conversations.find(conv => conv.id === connectionUserId);
          if (!existingConversation) {
            // Create a new conversation for this connection
            console.log(`Creating new conversation for: ${connection.formattedName || connection.name} (ID: ${connectionUserId})`);
            
            const newConversation: Conversation = {
              id: connectionUserId,
              user: {
                id: connectionUserId,
                name: connection.formattedName || connection.name || 'Unknown User',
                profilePicture: connection.profilePicture,
                isOnline: false
              },
              lastMessage: {
                content: "Start a conversation",
                timestamp: new Date(),
                isRead: true
              },
              unreadCount: 0,
              messages: []
            };
            
            newConversations.push(newConversation);
          }
        });
        
        // Add all new conversations to the state
        if (newConversations.length > 0) {
          console.log(`Adding ${newConversations.length} new conversations from connections`);
          setConversations(prev => [...prev, ...newConversations]);
        }
      } else {
        console.warn("No connections found in response:", connectionsData);
      }

      // Fetch connection suggestions (optional feature)
      const suggestionsResponse = await fetch(`${API_BASE_URL}/api/connections/suggestions/${currentUserId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (suggestionsResponse.ok) {
        const data = await suggestionsResponse.json();
        if (data.suggestions) {
          // Ensure we have proper name formatting for suggestions
          const formattedSuggestions = data.suggestions.map((user: any) => ({
            ...user,
            name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
            formattedName: formatName(user)
          }));
          setConnectionSuggestions(formattedSuggestions);
        }
      }

      // Fetch pending connection requests
      const pendingResponse = await fetch(`${API_BASE_URL}/api/connections/pending/${currentUserId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (pendingResponse.ok) {
        const data = await pendingResponse.json();
        if (data.pendingConnections) {
          // Format pending connection names properly
          const formattedPending = data.pendingConnections.map((conn: any) => ({
            ...conn,
            name: conn.name || `${conn.firstName || ''} ${conn.lastName || ''}`.trim() || 'Unknown User',
            formattedName: formatName(conn)
          }));
          setPendingConnections(formattedPending);
        }
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
    }
  }, [currentUserId, conversations]);

  // Helper function to format user names
  const formatName = (user: any): string => {
    if (user.name && user.name.trim()) return user.name;
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    return 'Unknown User';
  };

  // Accept or reject a connection request
  const handleConnectionRequest = async (connectionId: number, action: 'accept' | 'reject') => {
    try {
      if (!currentUserId) return;

      const endpoint = `${API_BASE_URL}/api/connections/${connectionId}/${action}`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ user_id: currentUserId })
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh connections after accepting/rejecting
        fetchConnections();
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error ${action}ing connection request:`, error);
      return false;
    }
  };

  // Send a connection request to another user
  const sendConnectionRequest = async (receiverId: number) => {
    try {
      if (!currentUserId) {
        console.warn("Cannot send connection request: Not authenticated");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/connections/request/${receiverId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ user_id: currentUserId })
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh connection suggestions
        fetchConnections();
        return true;
      } else {
        console.error("Failed to send connection request:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      return false;
    }
  };

  // Load conversations on mount
  useEffect(() => {
    document.title = "Messages | StageConnect";
    
    // Only load conversations if user is authenticated
    if (currentUserId !== null) {
      fetchConversations();
      connectWebSocket();
      
      // Explicitly fetch connections and log the results
      const getConnections = async () => {
        console.log("Explicitly fetching connections via useEffect");
        await fetchConnections();
        console.log("Connections fetch completed");
      };
      
      getConnections();
    }
    
    // Cleanup on unmount
    return () => {
      WebSocketService.unregisterMessageHandler('messagingPage');
      WebSocketService.disconnect();
    };
  }, [connectWebSocket, fetchConversations, fetchConnections, currentUserId]);

  // Debug function to force refresh connections
  const refreshConnections = async () => {
    console.log("Manually refreshing connections...");
    await fetchConnections();
    console.log("Connections refresh complete");
  };

  // Load conversation details when selected
  const loadConversation = async (partnerId: number) => {
    if (!partnerId) {
      console.warn("Cannot load conversation: missing partner ID");
      return;
    }
    
    if (currentUserId === null) {
      console.warn("Cannot load conversation: not authenticated");
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/conversation/${currentUserId}/${partnerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch conversation');
      
      const data = await response.json();
      
      if (data.success && data.conversation) {
        // Update the specific conversation with full message history
        setConversations(prevConversations => {
          return prevConversations.map(conv => {
            if (conv.id === partnerId) {
              return {
                ...conv,
                unreadCount: 0,
                lastMessage: {
                  ...conv.lastMessage,
                  isRead: true
                },
                messages: data.conversation.messages?.map((msg: any) => ({
                  id: msg.id || Math.floor(Math.random() * 10000),
                  content: msg.content || '',
                  timestamp: new Date(msg.timestamp || Date.now()),
                  senderId: msg.senderId || 0,
                  receiverId: msg.receiverId || 0,
                })) || []
              };
            }
            return conv;
          });
        });
      }
    } catch (error) {
      console.error("Error fetching conversation details:", error);
    }
  };

  const handleSelectConversation = (conversationId: number) => {
    if (!conversationId) return;
    
    // Validate current user ID
    if (currentUserId === null) {
      console.warn("Cannot select conversation: Not authenticated");
      return;
    }
    
    setActiveConversationId(conversationId);
    
    // Load full conversation
    loadConversation(conversationId);
    
    // Mark messages as read in UI
    setConversations(conversations.map(conv => 
      conv.id === conversationId 
        ? { 
            ...conv, 
            unreadCount: 0, 
            lastMessage: { ...conv.lastMessage, isRead: true } 
          } 
        : conv
    ));
    
    // Send read receipt through WebSocket
    if (isConnected) {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation && conversation.user && conversation.user.id) {
        const receiverId = Number(conversation.user.id);
        
        // Generate conversation ID
        const convId = generateConversationId(currentUserId, receiverId);
        
        // Send read message
        WebSocketService.sendMessage("/app/chat.read", {
          type: "READ",
          senderId: currentUserId,
          receiverId: receiverId,
          conversationId: convId
        });
      }
    }
  };

  const handleSendMessage = (conversationId: number, content: string) => {
    if (!content.trim() || !isConnected) return;
    
    // Validate user authentication
    if (currentUserId === null) {
      console.warn("Cannot send message: Not authenticated");
      return;
    }
    
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation || !conversation.user || !conversation.user.id) {
      console.warn("Cannot send message: Invalid conversation");
      return;
    }
    
    const receiverId = Number(conversation.user.id);
    
    // Generate conversation ID
    const conversationIdStr = generateConversationId(currentUserId, receiverId);
    
    // Get the current user's full name
    const currentUserName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || "User";
    
    // Create message object for WebSocket
    const chatMessage = {
      type: "CHAT",
      senderId: currentUserId,
      receiverId: receiverId,
      content: content,
      senderName: currentUserName,
      conversationId: conversationIdStr,
      timestamp: new Date()
    };
    
    // Send through WebSocket
    WebSocketService.sendMessage("/app/chat.sendMessage", chatMessage);
    
    // Also update local state for immediate feedback
    const newMessage: Message = {
      id: Math.floor(Math.random() * 10000),
      content,
      timestamp: new Date(),
      senderId: currentUserId,
      receiverId: receiverId,
      senderName: currentUserName,
    };

    setConversations(conversations.map(conv => 
      conv.id === conversationId 
        ? {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessage: {
              content,
              timestamp: new Date(),
              isRead: true,
            },
          }
        : conv
    ));
  };

  // Helper function to generate conversation ID
  const generateConversationId = (userId1: number, userId2: number) => {
    // Ensure both IDs are valid numbers
    const id1 = Number(userId1);
    const id2 = Number(userId2);
    
    if (isNaN(id1) || isNaN(id2)) {
      console.error('Invalid user IDs for conversation:', userId1, userId2);
      return '0_0'; // Fallback to prevent undefined
    }
    
    return id1 < id2 
      ? `${id1}_${id2}` 
      : `${id2}_${id1}`;
  };

  // Filter conversations based on search query
  const filteredConversations = searchQuery 
    ? conversations.filter(conv => 
        conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  // Create a new conversation for a connection
  const createConversationForConnection = (connection: any) => {
    if (!connection || !connection.userId) return;
    
    // Check if conversation already exists
    if (conversations.some(conv => conv.id === connection.userId)) {
      return; // Already exists
    }
    
    // Create a new conversation object
    const newConversation = {
      id: connection.userId,
      user: {
        id: connection.userId,
        name: connection.formattedName || connection.name || 'Unknown User',
        profilePicture: connection.profilePicture,
        isOnline: false
      },
      lastMessage: {
        content: "Start a conversation",
        timestamp: new Date(),
        isRead: true
      },
      unreadCount: 0,
      messages: []
    };
    
    // Add to conversations
    setConversations(prev => [...prev, newConversation]);
    return newConversation;
  };

  // Select and potentially create a conversation with a connection
  const selectOrCreateConversation = (connection: any) => {
    if (!connection || !connection.userId) return;
    
    // Find existing conversation
    const existingConversation = conversations.find(conv => conv.id === connection.userId);
    
    if (existingConversation) {
      // Use existing conversation
      handleSelectConversation(existingConversation.id);
    } else {
      // Create new conversation
      const newConversation = createConversationForConnection(connection);
      if (newConversation) {
        handleSelectConversation(newConversation.id);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-6 mb-16">
      {/* WebSocket Status Component - Remove in production */}
      <WebSocketStatus />
      
      {/* Debug button - remove in production */}
      <button 
        onClick={refreshConnections}
        className="absolute top-2 right-2 text-xs bg-gray-200 px-2 py-1 rounded-md">
        Refresh Connections
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 border rounded-lg shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 160px)' }}>
        {/* Left sidebar (conversation list) */}
        <div className="lg:col-span-1 h-full border-r bg-white overflow-hidden flex flex-col">
          {/* Navigation tabs */}
          <div className="flex border-b">
            <button 
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'chats' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              onClick={() => setActiveTab('chats')}
            >
              Chats
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'connections' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              onClick={() => setActiveTab('connections')}
            >
              Connections
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'pending' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending
              {pendingConnections.length > 0 && (
                <span className="ml-1 bg-primary text-white text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">
                  {pendingConnections.length}
                </span>
              )}
            </button>
          </div>
          
          {/* Content based on active tab */}
          <div className="h-100% overflow-auto">
            {activeTab === 'chats' && (
              <ConversationsList 
                conversations={filteredConversations}
                activeConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
              />
            )}
            
            {activeTab === 'connections' && (
              <div className="p-2">
                <div className="mb-2 px-2">
                  <h3 className="text-sm font-medium text-gray-700">Your connections</h3>
                  <p className="text-xs text-gray-500">People you can message directly</p>
                </div>
                
                {userConnections.length > 0 ? (
                  userConnections.map((connection: Connection) => (
                    <div 
                      key={connection.connectionId || connection.userId} 
                      className="flex items-center p-3 rounded-lg mb-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => selectOrCreateConversation(connection)}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        {(connection.formattedName || connection.name || 'U').charAt(0)}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium">{connection.formattedName || connection.name || 'Unknown User'}</p>
                        <p className="text-xs text-gray-500">
                          {connection.role || 'Connected'} • ID: {connection.userId}
                        </p>
                      </div>
                      <button 
                        className="text-sm text-primary hover:bg-primary/10 p-2 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectOrCreateConversation(connection);
                        }}
                        title="Start conversation"
                      >
                        <MessageCircleIcon size={18} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>No connections yet</p>
                    <p className="text-sm mt-2">Connect with other users to start messaging</p>
                    <button 
                      onClick={refreshConnections}
                      className="mt-3 text-xs bg-primary text-white px-3 py-1 rounded-md">
                      Refresh Connections
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'pending' && (
              <div className="p-2">
                {pendingConnections.length > 0 ? (
                  pendingConnections.map(request => (
                    <div key={request.connectionId} className="flex items-center p-3 rounded-lg mb-2 bg-gray-50">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        {(request.formattedName || request.name || 'U').charAt(0)}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium">{request.formattedName || request.name || 'Unknown User'}</p>
                        <p className="text-sm text-gray-500">Wants to connect</p>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          className="text-xs px-2 py-1 bg-primary text-white rounded-md" 
                          onClick={() => handleConnectionRequest(request.connectionId, 'accept')}
                        >
                          Accept
                        </button>
                        <button 
                          className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-md"
                          onClick={() => handleConnectionRequest(request.connectionId, 'reject')}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>No pending requests</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Right side (conversation view) */}
        <div className="lg:col-span-3 bg-neutral-50 h-full overflow-hidden">
          {activeConversation ? (
            <ConversationView 
              conversation={activeConversation}
              currentUserId={currentUserId || 0}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="bg-primary/10 rounded-full p-4 mb-4">
                <MessageCircleIcon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-neutral-700 mb-2">No conversation selected</h3>
              <p className="text-neutral-500 max-w-md">
                Select a conversation from the list to start messaging or connect with new contacts through the network
              </p>
              
              {/* Display connection suggestions */}
              {connectionSuggestions.length > 0 && activeTab === 'chats' && (
                <div className="mt-6 w-full max-w-md">
                  <h4 className="text-md font-medium text-neutral-700 mb-2">People you may know</h4>
                  <div className="border rounded-md overflow-hidden">
                    {connectionSuggestions.map(suggestion => (
                      <div 
                        key={suggestion.id} 
                        className="flex items-center p-3 border-b last:border-0 bg-white hover:bg-gray-50"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          {(suggestion.formattedName || suggestion.name || 'U').charAt(0)}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="font-medium">{suggestion.formattedName || suggestion.name || 'Unknown User'}</p>
                        </div>
                        <button 
                          className="text-sm text-primary font-medium hover:bg-primary/10 py-1 px-3 rounded-md"
                          onClick={() => sendConnectionRequest(suggestion.id)}
                        >
                          Connect
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging; 