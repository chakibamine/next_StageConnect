import { useState, useEffect, useCallback, useRef } from "react";
import ConversationsList from "@/components/messaging/ConversationsList";
import ConversationView from "@/components/messaging/ConversationView";
import WebSocketStatus from "@/components/messaging/WebSocketStatus";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircleIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import WebSocketService, { WebSocketEventType } from "@/services/WebSocketService";

interface Message {
  id: number;
  content: string;
  timestamp: Date;
  senderId: number;
  receiverId: number;
  conversationId?: string;
  senderName?: string;
  isSystem?: boolean;
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
  isTyping?: boolean;
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
const createDefaultUser = (id: number, name?: string) => ({
  id,
  name: name && name.trim() !== '' ? name : `User ${id}`,
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
  const [userConnections, setUserConnections] = useState<Connection[]>([]);
  const [pendingConnections, setPendingConnections] = useState<Connection[]>([]);
  const [activeTab, setActiveTab] = useState<'chats' | 'connections' | 'pending'>('chats');
  
  // Refs to prevent infinite useEffect loops
  const connectionsInitialized = useRef(false);
  const conversationsInitialized = useRef(false);
  
  const activeConversation = conversations.find(conv => conv.id === activeConversationId) || null;

  const formatName = (user: any): string => {
    // If a complete name is provided, use it
    if (user.name && user.name.trim() && user.name !== 'No Name') {
      return user.name.trim();
    }
    
    // Try to build from firstName and lastName
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    // Last resort - use userId if available
    if (user.id || user.userId) {
      return `User ${user.id || user.userId}`;
    }
    
    return "Unknown User";
  };

  // Fetch user connections and suggestions
  const fetchConnections = useCallback(async () => {
    try {
      if (!currentUserId) return;

      // Primary API - fetch existing connections using authenticated user ID
      const connectionsResponse = await fetch(`${API_BASE_URL}/api/connections/user/${currentUserId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      if (!connectionsResponse.ok) return;

      const connectionsData = await connectionsResponse.json();
      
      if (connectionsData.connections && Array.isArray(connectionsData.connections)) {
        // Process each connection to extract the other user's details
        const formattedConnections = connectionsData.connections.map((conn: any) => {
          // Determine if current user is requester or receiver
          const isRequester = conn.requesterId === currentUserId;
          
          // Extract the other user's ID and name
          const userId = isRequester ? conn.receiverId : conn.requesterId;
          const name = isRequester ? conn.receiverName : conn.requesterName;
          const profilePicture = isRequester ? conn.receiverPhoto : conn.requesterPhoto;
          
          // Split name into first and last name if possible
          let firstName = '', lastName = '';
          if (name) {
            const nameParts = name.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          }
          
          // Ensure there's a display name
          const displayName = name || `${firstName} ${lastName}`.trim() || `User ${userId}`;
          
          return {
            connectionId: conn.id,
            userId: userId,
            name: displayName,
            firstName: firstName,
            lastName: lastName,
            formattedName: displayName,
            profilePicture: profilePicture,
            status: conn.status,
            role: conn.receiverTitle || conn.requesterTitle || 'User'
          };
        });
        
        setUserConnections(formattedConnections);
        
        // Automatically create conversations for all connections
        setConversations(prevConversations => {
          const updatedConversations = [...prevConversations];
          
          formattedConnections.forEach((connection: Connection) => {
            const connectionUserId = connection.userId;
            if (!connectionUserId) return;
            
            // Check if this connection already has a conversation
            const existingConversation = updatedConversations.find(conv => conv.id === connectionUserId);
            if (!existingConversation) {
              // Ensure we have a valid name for the conversation
              const displayName = connection.name || connection.formattedName || `User ${connectionUserId}`;
              
              const newConversation: Conversation = {
                id: connectionUserId,
      user: {
                  id: connectionUserId,
                  name: displayName,
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
              
              updatedConversations.push(newConversation);
            }
          });
          
          return updatedConversations;
        });
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
            name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
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
            name: conn.name || `${conn.firstName || ''} ${conn.lastName || ''}`.trim(),
            formattedName: formatName(conn)
          }));
          setPendingConnections(formattedPending);
        }
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
    }
  }, [currentUserId, formatName]);

  // Fetch user's conversations
  const fetchConversations = useCallback(async () => {
    try {
      // Validate current user ID
      if (!currentUserId) return;
      
      console.log("Fetching conversations for user:", currentUserId);
      
      const response = await fetch(`${API_BASE_URL}/api/messages/conversations/${currentUserId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      // Handle 404 - no conversations yet
      if (response.status === 404) {
        console.log("No conversations found - this is normal for new users");
        return;
      }
      
      if (!response.ok) {
        console.error("Error fetching conversations:", response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      console.log("Conversations data:", data);
      
      if (data.success && data.conversations) {
        // Transform backend data to our Conversation format
        const formattedConversations = data.conversations.map((conv: {
          partnerId: number;
          partnerName?: string;
          partnerFirstName?: string;
          partnerLastName?: string;
          partnerPhoto?: string;
          lastMessage?: {
            content: string;
            timestamp: string;
            read: boolean;
          };
          unreadCount?: number;
          messages?: Array<any>;
        }) => {
          // Use all available name sources with fallbacks
          let partnerName = "Unknown User";
          
          // Prefer explicit partnerName from API
          if (conv.partnerName) {
            partnerName = conv.partnerName;
          } 
          // Next try firstName + lastName 
          else if (conv.partnerFirstName || conv.partnerLastName) {
            partnerName = `${conv.partnerFirstName || ''} ${conv.partnerLastName || ''}`.trim();
          }
          // Last resort - use ID
          else if (conv.partnerId) {
            partnerName = `User ${conv.partnerId}`;
          }
          
          // Check if we already have this user in connections and use that name if available
          const connection = userConnections.find(c => c.userId === conv.partnerId);
          if (connection && connection.name && connection.name !== 'No Name') {
            partnerName = connection.name;
          }

          return {
            id: conv.partnerId,
      user: {
              id: conv.partnerId,
              name: partnerName,
              profilePicture: conv.partnerPhoto || (connection?.profilePicture) || undefined,
        isOnline: false,
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
          };
        });
        
        // Merge with existing conversations, preserving unread counts and messages
        setConversations(prevConversations => {
          // Create lookup map of existing conversations by ID
          const existingConvsMap = new Map(
            prevConversations.map(conv => [conv.id, conv])
          );
          
          // Merge and update
          const updated = formattedConversations.map((newConv: Conversation) => {
            const existing = existingConvsMap.get(newConv.id);
            
            if (existing) {
              // Preserve messages and other state from existing conversation
              return {
                ...newConv,
                messages: existing.messages.length > 0 ? existing.messages : newConv.messages,
                unreadCount: existing.unreadCount,
                // Always prefer the better name
                user: {
                  ...newConv.user,
                  name: chooseBetterName(newConv.user.name, existing.user.name, newConv.id),
                }
              };
            }
            return newConv;
          });
          
          // Keep any existing conversations not returned by the API
          const updatedIds = new Set(updated.map((conv: Conversation) => conv.id));
          const remainingConvs = prevConversations.filter((conv: Conversation) => !updatedIds.has(conv.id));
          
          // Combine and sort by most recent message
          const result = [...updated, ...remainingConvs].sort((a, b) => 
            b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime()
          );
          
          return result;
        });
        
        // Set first conversation as active if none is selected
        if (formattedConversations.length > 0 && activeConversationId === null) {
          setActiveConversationId(formattedConversations[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }, [currentUserId, userConnections]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (currentUserId) {
      const token = localStorage.getItem('token') || '';
      
      // Connect WebSocket
      WebSocketService.connect(currentUserId, token)
        .then(() => {
          console.log("WebSocket connected successfully");
          setIsConnected(true);
        })
        .catch(error => {
          console.error("WebSocket connection error:", error);
          setIsConnected(false);
        });
      
      // Setup WebSocket event listeners  
      const connectedHandler = () => setIsConnected(true);
      const disconnectedHandler = () => setIsConnected(false);
      
      // Register event listeners for connection state only
      WebSocketService.addEventListener(WebSocketEventType.CONNECTED, connectedHandler);
      WebSocketService.addEventListener(WebSocketEventType.DISCONNECTED, disconnectedHandler);
      
      // Register message handler - use only this method to avoid duplicate messages
      WebSocketService.registerMessageHandler('messaging', handleWebSocketMessage);
      
      // Clean up on unmount
      return () => {
        WebSocketService.unregisterMessageHandler('messaging');
        WebSocketService.disconnect();
      };
    }
  }, [currentUserId]);
  
  // Initial data fetch
  useEffect(() => {
    if (currentUserId && !connectionsInitialized.current) {
      connectionsInitialized.current = true;
      fetchConnections();
    }
  }, [currentUserId, fetchConnections]);

  useEffect(() => {
    if (currentUserId && !conversationsInitialized.current) {
      conversationsInitialized.current = true;
      fetchConversations();
    }
  }, [currentUserId, fetchConversations]);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((message: any) => {
    if (!message || !message.type) return;
    
    console.log("Received WebSocket message:", message);
    
    switch (message.type) {
      case 'CHAT':
        // Process chat message
        handleIncomingChatMessage(message);
        break;
        
      case 'READ':
        // Process read receipt
        handleReadReceipt(message);
        break;
        
      case 'TYPING':
        // Handle typing indicator
        handleTypingIndicator(message);
        break;
        
      case 'JOIN':
        // Update online status when user joins
        handleOnlineStatus(message.senderId, true);
        break;
        
      case 'LEAVE':
        // Update online status when user leaves
        handleOnlineStatus(message.senderId, false);
        break;
    }
  }, []);
  
  /**
   * Send read receipt to sender
   */
  const sendReadReceipt = (senderId: number) => {
    if (isConnected && currentUserId) {
      WebSocketService.sendReadReceipt(senderId);
    }
  };

  // Handle incoming chat message
  const handleIncomingChatMessage = useCallback((message: any) => {
    const { senderId, receiverId, content, timestamp, conversationId, senderName, senderPhoto } = message;
    
    // Don't process if message doesn't involve current user
    if (currentUserId !== senderId && currentUserId !== receiverId) return;
    
    // Update online status when receiving a message
    if (senderId !== currentUserId) {
      handleOnlineStatus(senderId, true);
    }
    
    // Determine which user ID is the other party in this conversation
    const otherUserId = currentUserId === senderId ? receiverId : senderId;
    
    // Get the other user's details from connections if available
    const userConnection = userConnections.find(conn => conn.userId === otherUserId);
    
    // Determine a good display name (prefer message senderName, then connection name, then ID)
    const displayName = ((senderId !== currentUserId) && senderName) || 
      (userConnection?.name) || 
      (userConnection?.formattedName) || 
      `User ${otherUserId}`;
    
    // Format message
    const formattedMessage: Message = {
      id: Date.now(), // Temporary ID until we reload
      content,
      timestamp: new Date(timestamp),
      senderId,
      receiverId,
      conversationId,
      senderName: senderName || displayName,
      isSystem: false
    };
    
    console.log("Formatting incoming message:", {
      otherUserId,
      displayName,
      senderName, 
      formattedMessage
    });
    
    setConversations(prevConversations => {
      // Find if conversation exists
      const existingConversationIndex = prevConversations.findIndex(c => c.id === otherUserId);
      const updatedConversations = [...prevConversations];
      
      if (existingConversationIndex >= 0) {
        // Update existing conversation
        const conversation = {...updatedConversations[existingConversationIndex]};
        
        // Update user info if we received it and this message is not from current user
        if (senderId !== currentUserId) {
          // Always use the best display name
          conversation.user = {
            ...conversation.user,
            name: chooseBetterName(displayName, conversation.user.name, otherUserId)
          };
        
          // Update profile picture if provided
          if (senderPhoto) {
            conversation.user = {
              ...conversation.user,
              profilePicture: senderPhoto
            };
          }
        }
        
        // Add message to conversation
        conversation.messages = [...conversation.messages, formattedMessage];
        
        // Update last message
        conversation.lastMessage = {
          content,
          timestamp: new Date(timestamp),
          isRead: senderId === currentUserId // If I sent it, mark as read
        };
        
        // Update unread count (increment if received, keep same if sent)
        if (senderId !== currentUserId) {
          conversation.unreadCount = activeConversationId === otherUserId 
            ? 0 // If this conversation is active, mark as read
            : conversation.unreadCount + 1;
        }
        
        updatedConversations[existingConversationIndex] = conversation;
      } else {
        // Create new conversation
        console.log("Creating new conversation for:", otherUserId, "with name:", displayName);
        
        const newConversation: Conversation = {
          id: otherUserId,
          user: {
            id: otherUserId,
            name: displayName,
            profilePicture: senderPhoto || userConnection?.profilePicture,
            isOnline: false
          },
          lastMessage: {
            content,
            timestamp: new Date(timestamp),
            isRead: senderId === currentUserId
          },
          unreadCount: senderId === currentUserId ? 0 : 1,
          messages: [formattedMessage]
        };
        
        updatedConversations.push(newConversation);
      }
      
      // Sort conversations by most recent message
      updatedConversations.sort((a, b) => {
        return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
      });
      
      return updatedConversations;
    });
    
    // If this message is for the active conversation, mark as read
    if (otherUserId === activeConversationId && senderId !== currentUserId) {
      sendReadReceipt(senderId);
    }
  }, [currentUserId, activeConversationId, userConnections, sendReadReceipt]);
  
  // Handle online status updates
  const handleOnlineStatus = useCallback((userId: number, isOnline: boolean) => {
    if (!currentUserId || !isConnected) return;
    
    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv.id === userId) {
          return {
            ...conv,
            user: {
              ...conv.user,
              isOnline: isOnline
            }
          };
        }
        return conv;
      });
    });
  }, [currentUserId, isConnected]);
  
  // Handle read receipts
  const handleReadReceipt = useCallback((message: any) => {
    const { senderId, receiverId } = message;
    
    // If user is sending read receipts, they are online
    if (senderId !== currentUserId) {
      handleOnlineStatus(senderId, true);
    }
    
    // If current user sent the messages that were read
    if (currentUserId === senderId) {
      setConversations(prevConversations => {
        const targetConversationIndex = prevConversations.findIndex(c => c.id === receiverId);
        if (targetConversationIndex < 0) return prevConversations;
        
        const updatedConversations = [...prevConversations];
        const conversation = {...updatedConversations[targetConversationIndex]};
        
        // Mark conversation's last message as read
        conversation.lastMessage = {
          ...conversation.lastMessage,
          isRead: true
        };
        
        // Update all messages in conversation
        conversation.messages = conversation.messages.map(msg => {
          if (msg.senderId === currentUserId && !msg.isSystem) {
            return {...msg, isRead: true};
          }
          return msg;
        });
        
        updatedConversations[targetConversationIndex] = conversation;
        return updatedConversations;
      });
    }
  }, [currentUserId, handleOnlineStatus]);

  // Handle typing indicators
  const handleTypingIndicator = useCallback((message: any) => {
    const { senderId, receiverId, content } = message;
    
    // Only process if this message is for the current user
    if (receiverId !== currentUserId) return;
    
    // Determine if user is typing or stopped typing
    const isTyping = content === 'typing';
    
    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv.id === senderId) {
          // Update conversation with typing status
          return {
            ...conv,
            isTyping: isTyping
          };
        }
        return conv;
      });
    });
  }, [currentUserId]);

  // Load conversation details when selected
  const loadConversation = async (partnerId: number) => {
    if (!partnerId || currentUserId === null) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/conversation/${currentUserId}/${partnerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      let conversationData = { messages: [] };
      
      if (response.status === 404) {
        // Conversation doesn't exist yet on the server - this is okay
        conversationData = { messages: [] };
      } else if (response.ok) {
        // Successfully fetched conversation
        const data = await response.json();
        
        if (data.success && data.conversation) {
          conversationData = data.conversation;
        }
      }
      
      // Create a placeholder message if no messages
      if (!conversationData.messages || conversationData.messages.length === 0) {
        conversationData.messages = [{
          id: 0,
          content: 'Start a conversation by typing a message below.',
          timestamp: new Date(),
          senderId: 0,
          receiverId: 0,
          senderName: 'System',
          isSystem: true
        }] as any; // Use type assertion to bypass type error
      }
      
      // Update the specific conversation with message history (empty or loaded)
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
              messages: conversationData.messages?.map((msg: any) => ({
                id: msg.id || Math.floor(Math.random() * 10000),
                content: msg.content || '',
                timestamp: new Date(msg.timestamp || Date.now()),
                senderId: msg.senderId || 0,
                receiverId: msg.receiverId || 0,
                senderName: msg.senderName || '',
                isSystem: msg.isSystem || false
              })) || []
            };
          }
          return conv;
        });
      });
    } catch (error) {
      console.error("Error fetching conversation details:", error);
      
      // Even if there's an error, create a conversation with a placeholder message
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
              messages: [{
                id: 0,
                content: 'Start a conversation by typing a message below.',
                timestamp: new Date(),
                senderId: 0,
                receiverId: 0,
                senderName: 'System',
                isSystem: true
              } as Message] // Cast as Message type
            };
          }
          return conv;
        });
      });
    }
  };

  const handleSelectConversation = (conversationId: number) => {
    if (!conversationId || currentUserId === null) return;
    
    // Always set as active first to ensure UI updates immediately
    setActiveConversationId(conversationId);
    
    // Load full conversation
    loadConversation(conversationId);
    
    // Mark messages as read in UI
    setConversations(prevConversations => 
      prevConversations.map(conv => 
      conv.id === conversationId 
        ? { 
            ...conv, 
            unreadCount: 0, 
            lastMessage: { ...conv.lastMessage, isRead: true } 
          } 
        : conv
      )
    );
    
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
    if (!currentUserId || !isConnected) {
      console.error("Cannot send message: Not connected");
      return false;
    }
    
    if (!content.trim()) {
      return false;
    }
    
    try {
      // Send message via WebSocket
      const success = WebSocketService.sendChatMessage(conversationId, content);
      
      // Return whether send was successful
      return success;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  };

  // Helper function to generate conversation ID
  const generateConversationId = (userId1: number, userId2: number) => {
    // Ensure both IDs are valid numbers
    const id1 = Number(userId1);
    const id2 = Number(userId2);
    
    if (isNaN(id1) || isNaN(id2)) {
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

  // Create or select a conversation with a connection
  const selectOrCreateConversation = (connection: Connection) => {
    if (!connection || !connection.userId) return;
    
    try {
      // Make sure we have a good display name
      const displayName = connection.name || connection.formattedName || `User ${connection.userId}`;
      
      // Find existing conversation
      const existingConversation = conversations.find(conv => conv.id === connection.userId);
      
      if (existingConversation) {
        // Use existing conversation but update the name if it's "No Name"
        if (existingConversation.user.name === 'No Name' || !existingConversation.user.name) {
          setConversations(prevConversations => 
            prevConversations.map(conv => 
              conv.id === connection.userId 
                ? {
                    ...conv,
                    user: {
                      ...conv.user,
                      name: displayName
                    }
                  }
                : conv
            )
          );
        }
        
        // Select the conversation
        handleSelectConversation(existingConversation.id);
        setActiveTab('chats'); // Switch to chats tab
      } else {
        // Create new conversation with proper name
        const newConversation: Conversation = {
          id: connection.userId,
          user: {
            id: connection.userId,
            name: displayName,
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
        
        // Add to conversations and set as active
        setConversations(prev => [...prev, newConversation]);
        
        // Wait for state update then select the conversation
        setTimeout(() => {
          handleSelectConversation(newConversation.id);
          setActiveTab('chats');
        }, 50);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };
  
  // Refresh connections
  const refreshConnections = () => fetchConnections();

  // Helper function to choose the better name between two options
  const chooseBetterName = (name1: string, name2: string, userId: number): string => {
    // "No Name" is never good
    if (name1 === 'No Name' && name2 !== 'No Name') return name2;
    if (name2 === 'No Name' && name1 !== 'No Name') return name1;
    
    // Prefer non-generic names (those that don't start with "User")
    if (name1.startsWith('User ') && !name2.startsWith('User ')) return name2;
    if (name2.startsWith('User ') && !name1.startsWith('User ')) return name1;
    
    // Prefer longer names as they're likely more complete
    if (name1.length > name2.length) return name1;
    if (name2.length > name1.length) return name2;
    
    // Default to name1, or fall back to User ID if both are bad
    return name1 || `User ${userId}`;
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-6 mb-16">
      {/* Small WebSocket status indicator */}
      <WebSocketStatus />
      
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
                      className="flex items-center p-3 rounded-lg mb-2 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        {(connection.formattedName || connection.name || ' ').charAt(0).toLowerCase()}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium">{connection.formattedName || connection.name}</p>
                        <p className="text-xs text-gray-500">
                          {connection.role || 'Connected'}
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          selectOrCreateConversation(connection);
                        }}
                        className="bg-primary text-white hover:bg-primary/90"
                        size="sm"
                      >
                        Message
                      </Button>
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
                        {(request.formattedName || request.name || ' ').charAt(0).toLowerCase()}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium">{request.formattedName || request.name}</p>
                        <p className="text-sm text-gray-500">Wants to connect</p>
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
                          {(suggestion.formattedName || suggestion.name || ' ').charAt(0).toLowerCase()}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="font-medium">{suggestion.formattedName || suggestion.name}</p>
                        </div>
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
