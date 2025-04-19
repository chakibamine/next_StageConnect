import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter(
    conversation => conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold mb-3">Messages</CardTitle>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
          <Input 
            type="text" 
            placeholder="Search conversations..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto px-3 py-0">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-6 text-neutral-500">
            No conversations found
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div 
              key={conversation.id} 
              className={`p-3 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer ${
                activeConversationId === conversation.id ? 'bg-primary-50' : ''
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage 
                      src={conversation.user.profilePicture} 
                      alt={conversation.user.name} 
                    />
                    <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                    conversation.user.isOnline ? 'bg-green-500' : 'bg-neutral-300'
                  }`}></div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <h3 className={`font-medium ${activeConversationId === conversation.id ? 'text-primary-600' : ''}`}>
                      {conversation.user.name}
                    </h3>
                    <span className="text-xs text-neutral-500">
                      {formatDistanceToNow(conversation.lastMessage.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-sm truncate mr-2 ${
                      conversation.lastMessage.isRead 
                        ? 'text-neutral-500' 
                        : 'text-neutral-800 font-medium'
                    }`}>
                      {conversation.lastMessage.content}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-primary-500 text-white rounded-full px-1.5 py-0.5 h-5 min-w-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationsList;
