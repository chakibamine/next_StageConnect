import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { PlusIcon, MessageCircleIcon, SearchIcon, XCircleIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

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
}

interface ConversationsListProps {
  conversations: Conversation[];
  activeConversationId: number | null;
  onSelectConversation: (conversationId: number) => void;
}

const ConversationsList = ({ 
  conversations, 
  activeConversationId, 
  onSelectConversation 
}: ConversationsListProps) => {
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'online'>('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Calculate total unread count
  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  
  // Apply filters to conversations
  const filteredConversations = conversations.filter(conversation => {
    // First apply search filter if there's a query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = conversation.user.name.toLowerCase().includes(query);
      const contentMatch = conversation.lastMessage.content.toLowerCase().includes(query);
      if (!nameMatch && !contentMatch) return false;
    }
    
    // Then apply tab filters
    if (filterType === 'unread') return conversation.unreadCount > 0;
    if (filterType === 'online') return conversation.user.isOnline;
    return true;
  });
  
  // Sort conversations by timestamp and unread messages
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    // First sort by unread
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
    
    // Then sort by timestamp
    return b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime();
  });

  const getTruncatedMessage = (message: string) => {
    return message.length > 35 ? message.substring(0, 35) + '...' : message;
  };

  // Highlight matching text in search results
  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim() || !text.toLowerCase().includes(highlight.toLowerCase())) {
      return <span>{text}</span>;
    }
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    
    return (
      <span>
        {parts.map((part, index) => 
          part.toLowerCase() === highlight.toLowerCase() 
            ? <span key={index} className="bg-primary/20 rounded-sm px-0.5">{part}</span> 
            : part
        )}
      </span>
    );
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: false });
    }
    
    if (diffInHours < 48) {
      return 'Yesterday';
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-primary/90 to-primary text-white px-4 pt-5 pb-4 rounded-b-lg shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <MessageCircleIcon className="h-5 w-5 text-white mr-2" />
            <h1 className="font-semibold text-lg">Messages</h1>
            {totalUnreadCount > 0 && (
              <span className="ml-2 bg-white text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                {totalUnreadCount}
              </span>
            )}
          </div>
        </div>
        
        {/* Animated search bar with clear button */}
        <div className={`relative transition-all duration-200 ${isSearchFocused || searchQuery ? 'scale-105' : ''}`}>
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-foreground/70 h-4 w-4" />
          <Input 
            placeholder="Search conversations..." 
            className="pl-9 py-2 w-full text-sm bg-white/20 border-0 placeholder:text-white/70 text-white focus-visible:ring-offset-2 focus-visible:ring-white/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery && (
            <button 
              className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
              onClick={() => setSearchQuery("")}
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs with pill style */}
      <div className="px-4 py-3">
        <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setFilterType(value as any)}>
          <TabsList className="w-full grid grid-cols-3 p-1 bg-neutral-100 rounded-full h-9">
            <TabsTrigger value="all" className="text-xs rounded-full">All</TabsTrigger>
            <TabsTrigger value="unread" className="text-xs rounded-full">Unread</TabsTrigger>
            <TabsTrigger value="online" className="text-xs rounded-full">Online</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Search status indicator */}
      {searchQuery && (
        <div className="px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center text-primary font-medium">
            <SearchIcon className="h-3 w-3 mr-1.5" />
            Searching for "{searchQuery}"
          </div>
          <span className="text-neutral-500">
            {filteredConversations.length} {filteredConversations.length === 1 ? 'result' : 'results'}
          </span>
        </div>
      )}

      {/* Conversation list with improved styling - now fills to bottom */}
      <div className="overflow-y-auto flex-1" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0, 0, 0, 0.1) transparent'
      }}>
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="bg-neutral-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-3">
              <MessageCircleIcon className="h-8 w-8 text-neutral-400" />
            </div>
            <p className="text-neutral-500 mb-2 font-medium">No conversations found</p>
            <p className="text-xs text-neutral-400 max-w-[200px] mx-auto">
              {searchQuery 
                ? 'No results match your search criteria' 
                : filterType === 'unread' 
                  ? 'You have no unread messages at the moment' 
                  : filterType === 'online' 
                    ? 'No contacts are currently online'
                    : 'Start a new conversation by tapping the + button'}
            </p>
          </div>
        ) : (
          <div className="pb-16"> {/* Added padding at the bottom to prevent content from being hidden under the FAB */}
            {sortedConversations.map((conversation, index) => (
              <div 
                key={conversation.id} 
                className={`px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-neutral-50 ${
                  activeConversationId === conversation.id 
                    ? 'bg-primary/5 border-l-4 border-l-primary pl-3' 
                    : 'border-l-4 border-l-transparent'
                } ${index === sortedConversations.length - 1 ? 'border-b' : 'border-b border-neutral-100'}`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className={`border-2 ${conversation.user.isOnline ? 'border-green-500' : 'border-transparent'}`}>
                      <AvatarImage 
                        src={conversation.user.profilePicture} 
                        alt={conversation.user.name} 
                      />
                      <AvatarFallback className="bg-primary/20 text-primary font-medium">
                        {conversation.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.user.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className={`font-medium truncate ${
                        conversation.unreadCount > 0 ? 'text-neutral-900' : 'text-neutral-700'
                      }`}>
                        {searchQuery 
                          ? getHighlightedText(conversation.user.name, searchQuery)
                          : conversation.user.name
                        }
                      </h3>
                      <span className="text-xs text-neutral-500 flex-shrink-0 ml-1">
                        {getRelativeTime(conversation.lastMessage.timestamp)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <p className={`text-xs truncate ${
                        conversation.unreadCount > 0 
                          ? 'text-neutral-800 font-medium' 
                          : 'text-neutral-500'
                      }`}>
                        {searchQuery 
                          ? getHighlightedText(getTruncatedMessage(conversation.lastMessage.content), searchQuery)
                          : getTruncatedMessage(conversation.lastMessage.content)
                        }
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge className="ml-1.5 bg-primary hover:bg-primary text-white text-[10px] rounded-full h-5 min-w-[20px] flex-shrink-0 flex items-center justify-center">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Floating action button for new message - z-index ensures it stays on top */}
      <div className="absolute bottom-5 right-5 z-10">
        <Button size="icon" className="h-12 w-12 rounded-full shadow-lg transition-transform hover:scale-105">
          <PlusIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ConversationsList;
