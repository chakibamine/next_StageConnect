import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  PhoneIcon, VideoIcon, InfoIcon, PaperclipIcon, 
  SendIcon, SmileIcon, ImageIcon, MicIcon,
  FileIcon, FileTextIcon, XIcon, DownloadIcon
} from "lucide-react";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import WebSocketService from "@/services/WebSocketService";

interface Message {
  id: string | number;
  content: string;
  timestamp: Date;
  senderId: number;
  receiverId: number;
  senderName?: string;
  isSystem?: boolean;
  // File attachment properties
  hasAttachment?: boolean;
  attachmentType?: 'pdf' | 'image' | 'file';
  attachmentUrl?: string; 
  attachmentName?: string;
  attachmentSize?: number;
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
    isTyping?: boolean;
  };
  currentUserId: number;
  onSendMessage: (conversationId: number, content: string, file?: File) => void;
}

const ConversationView = ({ 
  conversation, 
  currentUserId, 
  onSendMessage 
}: ConversationViewProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isFileUploading, setIsFileUploading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if we have a message or file to send
    if (newMessage.trim() || selectedFile) {
      setIsFileUploading(true);
      
      // Send message with file if selected
      onSendMessage(conversation.id, newMessage, selectedFile || undefined);
      
      // Clear form
      setNewMessage("");
      setSelectedFile(null);
      setFilePreview(null);
      setIsFileUploading(false);
      
      // Send stopped typing indication
      WebSocketService.sendTypingIndicator(conversation.id, false);
    }
  };
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Clear any existing preview for non-images
      setFilePreview(null);
    }
  };
  
  // Open file selector
  const handleOpenFileSelector = () => {
    fileInputRef.current?.click();
  };
  
  // Clear selected file
  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Send typing indicator with debounce
    if (value.trim()) {
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Send typing indicator
      WebSocketService.sendTypingIndicator(conversation.id, true);
      
      // Set timeout to stop typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        WebSocketService.sendTypingIndicator(conversation.id, false);
      }, 2000);
    } else {
      // If input is empty, send stopped typing
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      WebSocketService.sendTypingIndicator(conversation.id, false);
    }
  };
  
  // Clean up typing timeout when component unmounts or conversation changes
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        // Send stopped typing when leaving conversation
        WebSocketService.sendTypingIndicator(conversation.id, false);
      }
    };
  }, [conversation.id]);

  // Helper function to format file size
  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
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

  // Render file attachment preview based on type
  const renderFileAttachment = (message: Message) => {
    if (!message.hasAttachment || !message.attachmentUrl) return null;
    
    const isCurrentUser = message.senderId === currentUserId;
    
    if (message.attachmentType === 'image') {
      return (
        <div className="mt-2 mb-1 rounded-lg overflow-hidden max-w-xs">
          <img 
            src={message.attachmentUrl} 
            alt={message.attachmentName || "Image"} 
            className="max-w-full h-auto"
            loading="lazy"
          />
          {message.attachmentName && (
            <div className={`text-xs flex justify-between items-center mt-1 ${isCurrentUser ? 'text-primary-50' : 'text-neutral-500'}`}>
              <span>{message.attachmentName}</span>
              {message.attachmentSize && <span>{formatFileSize(message.attachmentSize)}</span>}
            </div>
          )}
        </div>
      );
    } else if (message.attachmentType === 'pdf') {
      return (
        <div className={`mt-2 mb-1 p-3 rounded-lg border ${isCurrentUser ? 'border-primary-50/30' : 'border-neutral-200'} flex items-center gap-2`}>
          <div className={`p-2 rounded ${isCurrentUser ? 'bg-primary-50/20' : 'bg-neutral-100'}`}>
            <FileTextIcon className={`h-6 w-6 ${isCurrentUser ? 'text-primary-50' : 'text-neutral-500'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-medium truncate ${isCurrentUser ? 'text-primary-50' : 'text-neutral-700'}`}>
              {message.attachmentName || "PDF Document"}
            </div>
            {message.attachmentSize && (
              <div className={`text-xs ${isCurrentUser ? 'text-primary-50/80' : 'text-neutral-500'}`}>
                {formatFileSize(message.attachmentSize)}
              </div>
            )}
          </div>
          <a 
            href={message.attachmentUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            download={message.attachmentName}
            className={`p-1.5 rounded-full hover:bg-opacity-10 ${isCurrentUser ? 'hover:bg-white' : 'hover:bg-neutral-100'}`}
          >
            <DownloadIcon className={`h-4 w-4 ${isCurrentUser ? 'text-primary-50' : 'text-neutral-500'}`} />
          </a>
        </div>
      );
    } else {
      // Generic file attachment
      return (
        <div className={`mt-2 mb-1 p-3 rounded-lg border ${isCurrentUser ? 'border-primary-50/30' : 'border-neutral-200'} flex items-center gap-2`}>
          <div className={`p-2 rounded ${isCurrentUser ? 'bg-primary-50/20' : 'bg-neutral-100'}`}>
            <FileIcon className={`h-6 w-6 ${isCurrentUser ? 'text-primary-50' : 'text-neutral-500'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-medium truncate ${isCurrentUser ? 'text-primary-50' : 'text-neutral-700'}`}>
              {message.attachmentName || "File"}
            </div>
            {message.attachmentSize && (
              <div className={`text-xs ${isCurrentUser ? 'text-primary-50/80' : 'text-neutral-500'}`}>
                {formatFileSize(message.attachmentSize)}
              </div>
            )}
          </div>
          <a 
            href={message.attachmentUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            download={message.attachmentName}
            className={`p-1.5 rounded-full hover:bg-opacity-10 ${isCurrentUser ? 'hover:bg-white' : 'hover:bg-neutral-100'}`}
          >
            <DownloadIcon className={`h-4 w-4 ${isCurrentUser ? 'text-primary-50' : 'text-neutral-500'}`} />
          </a>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Conversation header */}
      <div className="px-4 py-3 border-b bg-white flex items-center space-x-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={conversation.user.profilePicture} 
              alt={conversation.user.name} 
            />
            <AvatarFallback>{conversation.user.name?.charAt(0) || '?'}</AvatarFallback>
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
        
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="rounded-full">
                  <PhoneIcon className="h-5 w-5 text-neutral-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Audio call</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="rounded-full">
                  <VideoIcon className="h-5 w-5 text-neutral-600" />
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
                <Button size="icon" variant="ghost" className="rounded-full">
                  <InfoIcon className="h-5 w-5 text-neutral-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Conversation info</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Message list */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6 bg-neutral-50" style={{ height: "calc(100% - 132px)" }}>
        {Object.entries(groupedMessages).map(([date, messages]) => (
          <div key={date} className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-neutral-200 text-neutral-600 text-xs px-2.5 py-1 rounded-md">
                {date}
              </div>
            </div>
            
            {messages.map((message) => {
              // Handle system messages
              if (message.isSystem) {
                return (
                  <div key={message.id} className="flex justify-center my-4">
                    <div className="bg-neutral-100 text-neutral-600 text-xs px-3 py-2 rounded-lg">
                      {message.content}
                    </div>
                  </div>
                );
              }
              
              const isCurrentUser = message.senderId === currentUserId;
              const time = format(message.timestamp, 'h:mm a');
              const previousMessage = messages[messages.indexOf(message) - 1];
              const isSameSender = previousMessage && previousMessage.senderId === message.senderId && !previousMessage.isSystem;
              const isLongAgo = previousMessage && 
                (message.timestamp.getTime() - previousMessage.timestamp.getTime() > 5 * 60 * 1000);
              const showAvatar = !isCurrentUser && !isSameSender && !isLongAgo;
              const showName = !isCurrentUser && (showAvatar || isLongAgo);
              
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
                          <AvatarFallback>{conversation.user.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )}
                  
                  <div className={`rounded-2xl p-3 max-w-[85%] md:max-w-md ${
                    isCurrentUser 
                      ? 'bg-primary text-white'
                      : 'bg-white shadow-sm'
                  }`}>
                    {showName && message.senderName && (
                      <p className="text-xs font-medium text-neutral-500 mb-1">
                        {message.senderName || conversation.user.name}
                      </p>
                    )}
                    
                    {/* Display message text content if any */}
                    {message.content && (
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    )}
                    
                    {/* Display file attachment if any */}
                    {message.hasAttachment && renderFileAttachment(message)}
                    
                    <p className={`text-xs ${isCurrentUser ? 'text-primary-50' : 'text-neutral-400'} text-right mt-1`}>
                      {time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        
        {/* Typing indicator */}
        {conversation.isTyping && (
          <div className="flex justify-start mb-2">
            <div className="w-8 h-8 mt-1 mr-2 flex-shrink-0">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={conversation.user.profilePicture} 
                  alt={conversation.user.name} 
                />
                <AvatarFallback>{conversation.user.name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
            </div>
            <div className="bg-white shadow-sm rounded-2xl p-3 px-4 max-w-[85%] md:max-w-md">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* File preview area */}
      {selectedFile && (
        <div className="px-4 py-2 bg-neutral-50 border-t flex items-center space-x-2">
          <div className="flex-1 flex items-center space-x-3">
            {filePreview ? (
              <img src={filePreview} alt="Preview" className="h-12 w-12 object-cover rounded" />
            ) : (
              <div className="h-12 w-12 bg-neutral-100 rounded flex items-center justify-center">
                {selectedFile.type.includes('pdf') ? (
                  <FileTextIcon className="h-6 w-6 text-neutral-500" />
                ) : (
                  <FileIcon className="h-6 w-6 text-neutral-500" />
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{selectedFile.name}</div>
              <div className="text-xs text-neutral-500">{formatFileSize(selectedFile.size)}</div>
            </div>
          </div>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8" 
            onClick={handleClearFile}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Message input */}
      <div className="p-3 border-t bg-white flex-shrink-0">
        {/* Hidden file input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        />
        
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="flex space-x-1 flex-shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              type="button" 
              className="rounded-full h-9 w-9"
              onClick={handleOpenFileSelector}
            >
              <PaperclipIcon className="h-4 w-4 text-neutral-500" />
            </Button>
            
            <Button variant="ghost" size="icon" type="button" className="rounded-full h-9 w-9 hidden md:flex">
              <ImageIcon className="h-4 w-4 text-neutral-500" />
            </Button>
          </div>
          
          <Input 
            type="text" 
            placeholder={selectedFile ? "Add a caption..." : "Type a message..."} 
            className="flex-grow rounded-full bg-neutral-100 border-0 focus-visible:ring-1 py-5 h-10"
            value={newMessage}
            onChange={handleInputChange}
            autoComplete="off"
            disabled={isFileUploading}
          />
          
          {(newMessage.trim() || selectedFile) ? (
            <Button 
              type="submit" 
              size="icon" 
              className="rounded-full h-9 w-9 flex-shrink-0"
              disabled={isFileUploading}
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
