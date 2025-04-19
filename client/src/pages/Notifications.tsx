import { useState, useEffect } from "react";
import { 
  BellRing, 
  Users, 
  Briefcase, 
  MessageSquare, 
  ThumbsUp, 
  Clock, 
  Calendar, 
  Trash2, 
  Eye, 
  CheckCircle, 
  Settings,
  Filter,
  Search,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

// Types for notifications
type NotificationType = 
  | "connection" 
  | "message" 
  | "internship" 
  | "event" 
  | "like" 
  | "system";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  actionTaken: boolean;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  meta?: {
    internshipId?: string;
    internshipTitle?: string;
    companyName?: string;
    messageId?: string;
    eventId?: string;
    eventDate?: Date;
    postId?: string;
  };
}

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | NotificationType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setNotifications(generateMockNotifications());
      setIsLoading(false);
    }, 800);

    document.title = "Notifications | StageConnect";
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const titleMatch = notification.title.toLowerCase().includes(query);
      const descMatch = notification.description.toLowerCase().includes(query);
      const senderMatch = notification.sender?.name.toLowerCase().includes(query);
      
      if (!titleMatch && !descMatch && !senderMatch) {
        return false;
      }
    }
    
    // Apply type filter
    if (filter === "all") {
      return true;
    } else if (filter === "unread") {
      return !notification.read;
    } else {
      return notification.type === filter;
    }
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const takeAction = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, actionTaken: true, read: true } : notif
      )
    );
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "connection":
        return <Users className="h-5 w-5 text-blue-500" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case "internship":
        return <Briefcase className="h-5 w-5 text-purple-500" />;
      case "event":
        return <Calendar className="h-5 w-5 text-orange-500" />;
      case "like":
        return <ThumbsUp className="h-5 w-5 text-pink-500" />;
      case "system":
        return <BellRing className="h-5 w-5 text-gray-500" />;
      default:
        return <BellRing className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRelativeTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getUnreadCount = (type: "all" | NotificationType) => {
    if (type === "all") {
      return notifications.filter(n => !n.read).length;
    }
    return notifications.filter(n => !n.read && n.type === type).length;
  };

  const renderActionButton = (notification: Notification) => {
    if (notification.actionTaken) {
      return (
        <Button variant="outline" size="sm" disabled className="opacity-70 min-w-24">
          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs">Responded</span>
        </Button>
      );
    }

    switch (notification.type) {
      case "connection":
        return (
          <Button size="sm" className="min-w-24">
            <span className="text-xs">Accept</span>
          </Button>
        );
      case "message":
        return (
          <Button size="sm" className="min-w-24">
            <span className="text-xs">Reply</span>
          </Button>
        );
      case "internship":
        return (
          <Button size="sm" className="min-w-24">
            <span className="text-xs">Apply</span>
          </Button>
        );
      case "event":
        return (
          <Button size="sm" className="min-w-24">
            <span className="text-xs">RSVP</span>
          </Button>
        );
      default:
        return (
          <Button size="sm" variant="outline" className="min-w-24">
            <span className="text-xs">View</span>
          </Button>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-6 mb-16">
      <div className="max-w-4xl mx-auto">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary/90 to-primary text-white px-6 py-5 rounded-lg shadow-md mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
            <BellRing className="h-48 w-48 -mt-8 -mr-8" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              <p className="text-primary-foreground/80 mt-1">
                Stay updated with your network and opportunities
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={markAllAsRead} 
                variant="secondary"
                className="text-sm shadow-sm"
                disabled={!notifications.some(n => !n.read)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Notification settings</DropdownMenuItem>
                  <DropdownMenuItem>Email preferences</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    Clear all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search */}
          <div className={`relative transition-all duration-200 ${isSearchFocused ? 'scale-105' : ''}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-foreground/70 h-4 w-4" />
            <Input 
              placeholder="Search notifications..." 
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
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setFilter(value as any)}>
            <TabsList className="w-full grid grid-cols-7 p-1 rounded-xl h-10 bg-neutral-100">
              <TabsTrigger value="all" className="text-xs rounded-lg flex items-center justify-center">
                All
                {getUnreadCount("all") > 0 && (
                  <Badge className="ml-2 h-5 min-w-5 bg-primary text-[10px]">
                    {getUnreadCount("all")}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs rounded-lg">Unread</TabsTrigger>
              <TabsTrigger value="connection" className="text-xs rounded-lg">
                Connections
                {getUnreadCount("connection") > 0 && (
                  <Badge className="ml-2 h-5 min-w-5 bg-primary text-[10px]">
                    {getUnreadCount("connection")}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="message" className="text-xs rounded-lg">Messages</TabsTrigger>
              <TabsTrigger value="internship" className="text-xs rounded-lg">Jobs</TabsTrigger>
              <TabsTrigger value="event" className="text-xs rounded-lg">Events</TabsTrigger>
              <TabsTrigger value="system" className="text-xs rounded-lg">System</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Search status indicator */}
        {searchQuery && (
          <div className="px-4 py-2 mb-4 flex items-center justify-between text-xs bg-neutral-100 rounded-lg">
            <div className="flex items-center text-primary font-medium">
              <Search className="h-3 w-3 mr-1.5" />
              Searching for "{searchQuery}"
            </div>
            <span className="text-neutral-500">
              {filteredNotifications.length} {filteredNotifications.length === 1 ? 'result' : 'results'}
            </span>
          </div>
        )}

        {/* Notifications list */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <p className="text-neutral-500">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <BellRing className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="font-medium text-lg text-neutral-700 mb-2">No notifications found</h3>
              <p className="text-neutral-500 text-center max-w-md mb-4">
                {searchQuery 
                  ? "No notifications match your search criteria" 
                  : filter === "unread" 
                    ? "You've read all your notifications" 
                    : filter === "all" 
                      ? "You don't have any notifications yet" 
                      : `You don't have any ${filter} notifications`}
              </p>
              {filter !== "all" && (
                <Button variant="outline" onClick={() => setFilter("all")}>
                  View all notifications
                </Button>
              )}
            </div>
          ) : (
            <AnimatePresence initial={false}>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="divide-y"
              >
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    variants={itemVariants}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      "p-4 hover:bg-neutral-50 transition-colors flex items-start space-x-4",
                      notification.read ? "bg-white" : "bg-primary/5"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    {/* Icon or avatar */}
                    <div>
                      {notification.sender ? (
                        <Avatar className="h-10 w-10 border-2 border-neutral-100">
                          <AvatarImage src={notification.sender.avatar} alt={notification.sender.name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {notification.sender.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-10 w-10 bg-neutral-100 rounded-full flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-neutral-800">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></span>
                        )}
                      </div>
                      
                      <p className="text-sm text-neutral-600 mt-1">
                        {notification.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center text-xs text-neutral-500">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {getRelativeTime(notification.timestamp)}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {renderActionButton(notification)}
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-neutral-400 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

// Mock data generator
const generateMockNotifications = (): Notification[] => {
  return [
    {
      id: "1",
      type: "connection",
      title: "Emma Davis wants to connect",
      description: "Emma Davis, Software Engineer at Google, sent you a connection request.",
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      read: false,
      actionTaken: false,
      sender: {
        id: "user1",
        name: "Emma Davis",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
      }
    },
    {
      id: "2",
      type: "message",
      title: "New message from David Kim",
      description: "Hey, I wanted to ask about the software internship at Google that you mentioned...",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      actionTaken: false,
      sender: {
        id: "user2",
        name: "David Kim",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
      },
      meta: {
        messageId: "msg1"
      }
    },
    {
      id: "3",
      type: "internship",
      title: "New internship opportunity",
      description: "TechCorp is looking for Software Development Interns. This matches your profile!",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      read: true,
      actionTaken: false,
      meta: {
        internshipId: "job1",
        internshipTitle: "Software Development Intern",
        companyName: "TechCorp"
      }
    },
    {
      id: "4",
      type: "event",
      title: "Upcoming Tech Career Fair",
      description: "Virtual Tech Career Fair happening next week. Register now to secure your spot!",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      actionTaken: true,
      meta: {
        eventId: "event1",
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    },
    {
      id: "5",
      type: "like",
      title: "James Wilson liked your post",
      description: "James Wilson liked your post about your new internship at Google.",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
      actionTaken: false,
      sender: {
        id: "user3",
        name: "James Wilson",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
      },
      meta: {
        postId: "post1"
      }
    },
    {
      id: "6",
      type: "system",
      title: "Profile completeness reminder",
      description: "Your profile is 75% complete. Add your skills and work experiences to make it 100%.",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      read: false,
      actionTaken: false
    },
    {
      id: "7",
      type: "connection",
      title: "Sophie Martin accepted your request",
      description: "Sophie Martin, HR Manager at CreativeEdge, accepted your connection request.",
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      read: true,
      actionTaken: false,
      sender: {
        id: "user4",
        name: "Sophie Martin",
        avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
      }
    },
    {
      id: "8",
      type: "internship",
      title: "Application status update",
      description: "Your application for UX/UI Design Intern at CreativeEdge has been reviewed.",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      read: true,
      actionTaken: true,
      meta: {
        internshipId: "job2",
        internshipTitle: "UX/UI Design Intern",
        companyName: "CreativeEdge"
      }
    },
    {
      id: "9",
      type: "event",
      title: "Webinar: Career Development Skills",
      description: "Join our webinar on 'Building Your Career in Tech' this Friday at 3 PM.",
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      read: true,
      actionTaken: false,
      meta: {
        eventId: "event2",
        eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      }
    },
    {
      id: "10",
      type: "system",
      title: "New feature available",
      description: "StageConnect now offers CV analytics to improve your internship applications.",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      read: true,
      actionTaken: false
    }
  ];
};

export default Notifications; 