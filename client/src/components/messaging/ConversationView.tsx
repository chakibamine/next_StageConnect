import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PhoneIcon, VideoIcon, InfoIcon, PaperclipIcon, SendIcon } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: number;
  content: string;
  timestamp: Date;
  senderId: number;
  receiverId: number;
}

interface ConversationViewProps {
  conversation: {
    id: number;
    user: {
      id: number;
      name: string;
      profilePicture?: string;
      isOnline: boolean;
    };
    messages: Message[];
  };
  currentUserId: number;
  onSendMessage: (conversationId: number, content: string) => void;
}

const ConversationView = ({ 
  conversation, 
  currentUserId, 
  onSendMessage 
}: ConversationViewProps) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(conversation.id, newMessage);
      setNewMessage("");
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3 px-4 border-b border-neutral-200 flex flex-row items-center space-x-3">
        <div className="relative">
          <Avatar>
            <AvatarImage 
              src={conversation.user.profilePicture} 
              alt={conversation.user.name} 
            />
            <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
            conversation.user.isOnline ? 'bg-green-500' : 'bg-neutral-300'
          }`}></div>
        </div>
        <div className="flex-grow">
          <h3 className="font-medium text-base">{conversation.user.name}</h3>
          <p className="text-xs text-neutral-500">{conversation.user.isOnline ? 'Online' : 'Offline'}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon">
            <PhoneIcon className="h-5 w-5 text-neutral-500" />
          </Button>
          <Button variant="ghost" size="icon">
            <VideoIcon className="h-5 w-5 text-neutral-500" />
          </Button>
          <Button variant="ghost" size="icon">
            <InfoIcon className="h-5 w-5 text-neutral-500" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4 bg-neutral-50">
        {conversation.messages.map((message) => {
          const isCurrentUser = message.senderId === currentUserId;
          
          return (
            <div 
              key={message.id} 
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`rounded-lg p-3 max-w-xs lg:max-w-md ${
                isCurrentUser 
                  ? 'bg-primary-100'
                  : 'bg-white shadow-sm'
              }`}>
                <p className="text-sm">{message.content}</p>
                <p className="text-xs text-neutral-400 text-right mt-1">
                  {format(message.timestamp, 'h:mm a')}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
      
      <div className="p-4 border-t border-neutral-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" type="button">
            <PaperclipIcon className="h-5 w-5 text-neutral-500" />
          </Button>
          <Input 
            type="text" 
            placeholder="Type a message..." 
            className="flex-grow rounded-full"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full h-10 w-10"
            disabled={!newMessage.trim()}
          >
            <SendIcon className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default ConversationView;
