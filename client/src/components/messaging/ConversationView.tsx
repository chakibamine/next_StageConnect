import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PhoneIcon, VideoIcon, InfoIcon, PaperclipIcon, SendIcon, SmileIcon, ImageIcon, MicIcon } from "lucide-react";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(conversation.id, newMessage);
      setNewMessage("");
    }
  };

  // Group messages by date
  const groupedMessages: {[key: string]: Message[]} = {};
  conversation.messages.forEach(message => {
    const date = format(message.timestamp, 'MMM dd, yyyy');
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  return (
    <div className="flex flex-col h-full">
      {/* Conversation header */}
      <div className="py-3 px-4 border-b bg-white flex items-center space-x-3 flex-shrink-0 shadow-sm z-10">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={conversation.user.profilePicture} 
              alt={conversation.user.name} 
            />
            <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {conversation.user.isOnline && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
          )}
        </div>
        
        <div className="flex-grow min-w-0">
          <h3 className="font-medium text-base truncate">{conversation.user.name}</h3>
          <p className="text-xs text-neutral-500">
            {conversation.user.isOnline ? 
              <span className="flex items-center">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Active now
              </span> : 
              'Offline'
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hidden md:flex">
                  <PhoneIcon className="h-4 w-4 text-neutral-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Call</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hidden md:flex">
                  <VideoIcon className="h-4 w-4 text-neutral-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Video call</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <InfoIcon className="h-4 w-4 text-neutral-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Information</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Message area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6 bg-neutral-50" style={{ height: "calc(100% - 132px)" }}>
        {Object.entries(groupedMessages).map(([date, messages]) => (
          <div key={date} className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-neutral-200 text-neutral-600 text-xs px-2.5 py-1 rounded-md">
                {date}
              </div>
            </div>
            
            {messages.map((message) => {
              const isCurrentUser = message.senderId === currentUserId;
              const time = format(message.timestamp, 'h:mm a');
              const previousMessage = messages[messages.indexOf(message) - 1];
              const isSameSender = previousMessage && previousMessage.senderId === message.senderId;
              const isLongAgo = previousMessage && 
                (message.timestamp.getTime() - previousMessage.timestamp.getTime() > 5 * 60 * 1000);
              const showAvatar = !isCurrentUser && !isSameSender && !isLongAgo;
              
              return (
                <div 
                  key={message.id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isCurrentUser && (
                    <div className="w-8 h-8 mt-1 mr-2 flex-shrink-0">
                      {showAvatar && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={conversation.user.profilePicture} 
                            alt={conversation.user.name} 
                          />
                          <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )}
                  
                  <div className={`rounded-2xl p-3 max-w-[85%] md:max-w-md ${
                    isCurrentUser 
                      ? 'bg-primary text-white'
                      : 'bg-white shadow-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    <p className={`text-xs ${isCurrentUser ? 'text-primary-50' : 'text-neutral-400'} text-right mt-1`}>
                      {time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="p-3 border-t bg-white flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="flex space-x-1 flex-shrink-0">
            <Button variant="ghost" size="icon" type="button" className="rounded-full h-9 w-9">
              <PaperclipIcon className="h-4 w-4 text-neutral-500" />
            </Button>
            
            <Button variant="ghost" size="icon" type="button" className="rounded-full h-9 w-9 hidden md:flex">
              <ImageIcon className="h-4 w-4 text-neutral-500" />
            </Button>
          </div>
          
          <Input 
            type="text" 
            placeholder="Type a message..." 
            className="flex-grow rounded-full bg-neutral-100 border-0 focus-visible:ring-1 py-5 h-10"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            autoComplete="off"
          />
          
          {newMessage.trim() ? (
            <Button 
              type="submit" 
              size="icon" 
              className="rounded-full h-9 w-9 flex-shrink-0"
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              type="button" 
              variant="ghost"
              size="icon" 
              className="rounded-full h-9 w-9 flex-shrink-0"
            >
              <MicIcon className="h-4 w-4 text-neutral-500" />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ConversationView;
