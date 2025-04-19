import { useState, useEffect } from "react";
import ConversationsList from "@/components/messaging/ConversationsList";
import ConversationView from "@/components/messaging/ConversationView";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircleIcon, UsersIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Message {
  id: number;
  content: string;
  timestamp: Date;
  senderId: number;
  receiverId: number;
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

const Messaging = () => {
  const { user } = useAuth();
  const currentUserId = user?.id || 1;
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      user: {
        id: 2,
        name: "Emma Davis",
        profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
        isOnline: true,
      },
      lastMessage: {
        content: "Hi Alex! I wanted to ask you about the software internship at Google...",
        timestamp: new Date(new Date().getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: false,
      },
      unreadCount: 2,
      messages: [
        {
          id: 101,
          content: "Hi Alex! I wanted to ask you about the software internship at Google that you mentioned last week. Do you know if they're still accepting applications?",
          timestamp: new Date(new Date().getTime() - 9 * 60 * 1000), // 9 minutes ago
          senderId: 2,
          receiverId: 1,
        },
        {
          id: 102,
          content: "Hey Emma! Yes, I believe they're accepting applications until the end of this month. The position is for a 6-month internship starting in January.",
          timestamp: new Date(new Date().getTime() - 6 * 60 * 1000), // 6 minutes ago
          senderId: 1,
          receiverId: 2,
        },
        {
          id: 103,
          content: "That's perfect! I'm looking for something that starts in January. Do you have a link to the application page?",
          timestamp: new Date(new Date().getTime() - 4 * 60 * 1000), // 4 minutes ago
          senderId: 2,
          receiverId: 1,
        },
        {
          id: 104,
          content: "I'll send you the link when I get home. I also recommend customizing your resume to highlight your React and JavaScript experience since that's what they're looking for.",
          timestamp: new Date(new Date().getTime() - 2 * 60 * 1000), // 2 minutes ago
          senderId: 1,
          receiverId: 2,
        },
        {
          id: 105,
          content: "Thanks so much for the advice! I'll update my resume tonight. By the way, have you used the CV generator on this platform? Is it any good?",
          timestamp: new Date(), // now
          senderId: 2,
          receiverId: 1,
        },
      ],
    },
    {
      id: 2,
      user: {
        id: 3,
        name: "David Kim",
        profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
        isOnline: false,
      },
      lastMessage: {
        content: "Thanks for connecting! Let's catch up soon about potential opportunities.",
        timestamp: new Date(new Date().getTime() - 25 * 60 * 60 * 1000), // 1 day ago
        isRead: true,
      },
      unreadCount: 0,
      messages: [
        {
          id: 201,
          content: "Hi Alex, I saw your profile and thought your skills would be a great fit for our company.",
          timestamp: new Date(new Date().getTime() - 50 * 60 * 60 * 1000), // 2 days ago
          senderId: 3,
          receiverId: 1,
        },
        {
          id: 202,
          content: "Hello David, thanks for reaching out! I'd be interested in learning more about the opportunities at your company.",
          timestamp: new Date(new Date().getTime() - 48 * 60 * 60 * 1000), // 2 days ago
          senderId: 1,
          receiverId: 3,
        },
        {
          id: 203,
          content: "Great! We're looking for interns in our product development department. Would you be available for a call next week?",
          timestamp: new Date(new Date().getTime() - 28 * 60 * 60 * 1000), // 1 day ago
          senderId: 3,
          receiverId: 1,
        },
        {
          id: 204,
          content: "That sounds interesting. Yes, I'm available Monday or Tuesday afternoon next week.",
          timestamp: new Date(new Date().getTime() - 26 * 60 * 60 * 1000), // 1 day ago
          senderId: 1,
          receiverId: 3,
        },
        {
          id: 205,
          content: "Thanks for connecting! Let's catch up soon about potential opportunities.",
          timestamp: new Date(new Date().getTime() - 25 * 60 * 60 * 1000), // 1 day ago
          senderId: 3,
          receiverId: 1,
        },
      ],
    },
    {
      id: 3,
      user: {
        id: 4,
        name: "James Wilson",
        profilePicture: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
        isOnline: true,
      },
      lastMessage: {
        content: "Your application for the Software Development Intern position has been received.",
        timestamp: new Date(new Date().getTime() - 72 * 60 * 60 * 1000), // 3 days ago
        isRead: true,
      },
      unreadCount: 0,
      messages: [
        {
          id: 301,
          content: "Hello Alex, I'm James from TechCorp. I noticed you applied for our Software Development Intern position.",
          timestamp: new Date(new Date().getTime() - 96 * 60 * 60 * 1000), // 4 days ago
          senderId: 4,
          receiverId: 1,
        },
        {
          id: 302,
          content: "Hi James, yes I did! I'm very interested in the position and believe my skills in React and Node.js would be valuable to your team.",
          timestamp: new Date(new Date().getTime() - 96 * 60 * 60 * 1000), // 4 days ago
          senderId: 1,
          receiverId: 4,
        },
        {
          id: 303,
          content: "Your application for the Software Development Intern position has been received.",
          timestamp: new Date(new Date().getTime() - 72 * 60 * 60 * 1000), // 3 days ago
          senderId: 4,
          receiverId: 1,
        },
      ],
    },
    {
      id: 4,
      user: {
        id: 5,
        name: "Sophie Martin",
        profilePicture: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
        isOnline: false,
      },
      lastMessage: {
        content: "I'm looking forward to your application. Let me know if you have any questions.",
        timestamp: new Date(new Date().getTime() - 168 * 60 * 60 * 1000), // 7 days ago
        isRead: true,
      },
      unreadCount: 0,
      messages: [
        {
          id: 401,
          content: "Hello Alex, I'm the HR Manager at CreativeEdge. We have an opening for a UX/UI Design intern that might interest you.",
          timestamp: new Date(new Date().getTime() - 192 * 60 * 60 * 1000), // 8 days ago
          senderId: 5,
          receiverId: 1,
        },
        {
          id: 402,
          content: "Hi Sophie, thank you for reaching out! I am interested in UX/UI design and would like to learn more about the position.",
          timestamp: new Date(new Date().getTime() - 188 * 60 * 60 * 1000), // 7.8 days ago
          senderId: 1,
          receiverId: 5,
        },
        {
          id: 403,
          content: "Great! You can find the full job description on our company profile. The internship is for 6 months, starting in January 2023.",
          timestamp: new Date(new Date().getTime() - 180 * 60 * 60 * 1000), // 7.5 days ago
          senderId: 5,
          receiverId: 1,
        },
        {
          id: 404,
          content: "Thanks for the info. I'll review the job description and submit my application by the end of the week.",
          timestamp: new Date(new Date().getTime() - 172 * 60 * 60 * 1000), // 7.2 days ago
          senderId: 1,
          receiverId: 5,
        },
        {
          id: 405,
          content: "I'm looking forward to your application. Let me know if you have any questions.",
          timestamp: new Date(new Date().getTime() - 168 * 60 * 60 * 1000), // 7 days ago
          senderId: 5,
          receiverId: 1,
        },
      ],
    },
  ]);

  const [activeConversationId, setActiveConversationId] = useState<number | null>(1);
  const activeConversation = conversations.find(conv => conv.id === activeConversationId) || null;
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.title = "Messages | StageConnect";
  }, []);

  const handleSelectConversation = (conversationId: number) => {
    setActiveConversationId(conversationId);
    
    // Mark messages as read
    setConversations(conversations.map(conv => 
      conv.id === conversationId 
        ? { 
            ...conv, 
            unreadCount: 0, 
            lastMessage: { ...conv.lastMessage, isRead: true } 
          } 
        : conv
    ));
  };

  const handleSendMessage = (conversationId: number, content: string) => {
    const newMessage: Message = {
      id: Math.floor(Math.random() * 10000),
      content,
      timestamp: new Date(),
      senderId: currentUserId,
      receiverId: conversations.find(c => c.id === conversationId)?.user.id || 0,
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

  // Filter conversations based on search query
  const filteredConversations = searchQuery 
    ? conversations.filter(conv => 
        conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <div className="container mx-auto px-4 py-4 md:py-6 mb-16">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 border rounded-lg shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 160px)' }}>
        {/* Left sidebar (conversation list) */}
        <div className="lg:col-span-1 h-full border-r bg-white overflow-hidden flex flex-col">
          {/* List header */}
          
          
          {/* Conversation list - explicitly set height for scrolling */}
          <div className="h-100% overflow-hidden">
            <ConversationsList 
              conversations={filteredConversations}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
            />
          </div>
        </div>
        
        {/* Right side (conversation view) */}
        <div className="lg:col-span-3 bg-neutral-50 h-full overflow-hidden">
          {activeConversation ? (
            <ConversationView 
              conversation={activeConversation}
              currentUserId={currentUserId}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;
