import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ThumbsUpIcon, 
  MessageSquareIcon, 
  BookmarkIcon, 
  MoreHorizontalIcon, 
  BriefcaseIcon,
  Share2Icon,
  SendIcon,
  XIcon,
  HeartIcon,
  LaughIcon,
  ThumbsDownIcon,
  SmileIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Post } from "@/schema";

interface PostCardProps {
  post: Post;
  onClick?: () => void;
}

interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: Date;
  authorImage: string;
  replies?: Reply[];
}

interface Reply {
  id: number;
  author: string;
  content: string;
  timestamp: Date;
  authorImage: string;
}

interface Reaction {
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const PostCard = ({ post, onClick }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [reaction, setReaction] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: "Sarah Chen",
      content: "Great achievement! Would love to hear more about your experience.",
      timestamp: new Date(new Date().getTime() - 2 * 60 * 60 * 1000),
      authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
      replies: [
        {
          id: 1,
          author: "Alex Johnson",
          content: "Thanks Sarah! I'll share more details soon.",
          timestamp: new Date(new Date().getTime() - 1 * 60 * 60 * 1000),
          authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
        }
      ]
    },
    {
      id: 2,
      author: "Michael Roberts",
      content: "Impressive work! Keep up the great progress.",
      timestamp: new Date(new Date().getTime() - 4 * 60 * 60 * 1000),
      authorImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
    }
  ]);
  
  // Mock data for user information
  const authorData = {
    1: {
      name: "Alex Johnson",
      title: "Computer Science Student at Paris University",
      profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    },
    2: {
      name: "James Wilson",
      title: "HR Director at TechCorp",
      profilePicture: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    },
    3: {
      name: "Sarah Chen",
      title: "Marketing Specialist at CreativeEdge",
      profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    },
    4: {
      name: "Michael Roberts",
      title: "Professor at Paris University",
      profilePicture: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    },
  };
  
  // @ts-ignore (using mock data with number as key)
  const author = authorData[post.authorId];

  // Refs to prevent re-renders
  const commentInputRef = useRef<HTMLInputElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);

  const handleLike = (reactionType: string) => {
    setReaction(reactionType);
    setIsLiked(true);
    setLikeCount(likeCount + 1);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Post removed from saved" : "Post saved",
      description: isSaved 
        ? "The post has been removed from your saved items." 
        : "The post has been saved to your profile.",
    });
  };

  const handleComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: comments.length + 1,
        author: "You",
        content: commentText,
        timestamp: new Date(),
        authorImage: authorData[1].profilePicture
      };
      setComments([newComment, ...comments]);
      setCommentText("");
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
    }
  };

  const handleReply = (commentId: number) => {
    if (replyText.trim()) {
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          const newReply = {
            id: (comment.replies?.length || 0) + 1,
            author: "You",
            content: replyText,
            timestamp: new Date(),
            authorImage: authorData[1].profilePicture
          };
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        return comment;
      });
      setComments(updatedComments);
      setReplyText("");
      setActiveReplyId(null);
      toast({
        title: "Reply added",
        description: "Your reply has been posted successfully.",
      });
    }
  };

  const handleShare = () => {
    toast({
      title: "Share post",
      description: "Post shared successfully.",
    });
  };

  // Check if post contains an internship offer
  const hasInternshipOffer = post.content.toLowerCase().includes("intern") || 
                             post.content.toLowerCase().includes("hiring");

  const reactions: readonly Reaction[] = [
    { type: "like", icon: ThumbsUpIcon, label: "Like" },
    { type: "love", icon: HeartIcon, label: "Love" },
    { type: "laugh", icon: LaughIcon, label: "Laugh" },
    { type: "smile", icon: SmileIcon, label: "Smile" },
    { type: "dislike", icon: ThumbsDownIcon, label: "Dislike" }
  ] as const;

  const getReactionIcon = () => {
    if (!reaction) return <ThumbsUpIcon className="h-4 w-4 mr-1" />;
    const foundReaction = reactions.find((r: Reaction) => r.type === reaction);
    if (!foundReaction) return <ThumbsUpIcon className="h-4 w-4 mr-1" />;
    const Icon = foundReaction.icon;
    return <Icon className="h-4 w-4 mr-1 fill-primary-600" />;
  };

  const getReactionLabel = () => {
    if (!reaction) return 'Like';
    const foundReaction = reactions.find((r: Reaction) => r.type === reaction);
    return foundReaction?.label || 'Like';
  };

  const handleCommentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentText(e.target.value);
  };
  
  const handleReplyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyText(e.target.value);
  };

  return (
    <Card className="mb-4 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex justify-between">
          <div className="flex space-x-3">
            <Link href={`/profile/${author?.id}`}>
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={author?.profilePicture} 
                    alt={author?.name} 
                    />
                  <AvatarFallback>{author?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </Link>
            <div>
              <h3 className="font-semibold hover:text-primary-600 transition-colors">
                {author?.name} <span className="text-neutral-500 font-normal">• 2nd</span>
              </h3>
              <p className="text-sm text-neutral-500">{author?.title}</p>
              <p className="text-xs text-neutral-400">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontalIcon className="h-4 w-4 text-neutral-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Report post</DropdownMenuItem>
              <DropdownMenuItem>Hide post</DropdownMenuItem>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-3">
          <p className="text-sm mb-3 whitespace-pre-line">{post.content}</p>
          
          {post.image && (
            <img 
              src={post.image} 
              alt="Post attachment" 
              className="w-full h-64 object-cover rounded-lg"
            />
          )}
          
          {hasInternshipOffer && (
            <div className="mt-4 border border-neutral-200 rounded-lg p-4 bg-neutral-50">
              <div className="flex">
                <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                  <BriefcaseIcon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold">Software Development Intern</h4>
                  <p className="text-sm text-neutral-600">TechCorp • Paris, France • Remote possible</p>
                  <p className="text-xs text-neutral-500 mt-1">6 month internship • Applied to by 28 people</p>
                </div>
              </div>
              <Link href="/internships/123">
                <Button className="mt-3 w-full">
                  View Internship
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-neutral-200">
          <div className="flex space-x-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`${isLiked ? 'text-primary-600' : 'text-neutral-600 hover:text-primary-600'}`}
                >
                  {getReactionIcon()}
                  <span>{likeCount} {getReactionLabel()}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="flex space-x-2">
                  {reactions.map(({ type, icon: Icon, label }) => (
                    <Button
                      key={type}
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${reaction === type ? 'text-primary-600' : 'text-neutral-600'}`}
                      onClick={() => handleLike(type)}
                    >
                      <Icon className="h-5 w-5" />
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-neutral-600 hover:text-primary-600"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquareIcon className="h-4 w-4 mr-1" />
              <span>{post.commentCount} Comments</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-neutral-600 hover:text-primary-600"
              onClick={handleShare}
            >
              <Share2Icon className="h-4 w-4 mr-1" />
              <span>Share</span>
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className={`${isSaved ? 'text-primary-600' : 'text-neutral-600 hover:text-primary-600'}`}
            onClick={handleSave}
          >
            <BookmarkIcon className={`h-4 w-4 mr-1 ${isSaved ? 'fill-primary-600' : ''}`} />
            <span>Save</span>
          </Button>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center space-x-2 mb-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={authorData[1].profilePicture} alt="You" />
                <AvatarFallback>Y</AvatarFallback>
              </Avatar>
              <div className="flex-1 relative">
                <Input
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={handleCommentInputChange}
                  className="pr-10"
                  ref={commentInputRef}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={handleComment}
                  disabled={!commentText.trim()}
                >
                  <SendIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.authorImage} alt={comment.author} />
                    <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-neutral-100 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{comment.author}</h4>
                        <span className="text-xs text-neutral-400">
                          {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                    </div>
                    <div className="flex space-x-2 mt-1">
                      <Button variant="ghost" size="sm" className="h-6 text-xs">
                        Like
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-xs"
                        onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                      >
                        Reply
                      </Button>
                    </div>

                    {activeReplyId === comment.id && (
                      <div className="mt-2 flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={authorData[1].profilePicture} alt="You" />
                          <AvatarFallback>Y</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 relative">
                          <Input
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={handleReplyInputChange}
                            className="pr-10"
                            ref={replyInputRef}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            onClick={() => handleReply(comment.id)}
                            disabled={!replyText.trim()}
                          >
                            <SendIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-2 space-y-2 ml-8">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={reply.authorImage} alt={reply.author} />
                              <AvatarFallback>{reply.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-neutral-100 rounded-lg p-2">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-medium text-xs">{reply.author}</h4>
                                  <span className="text-xs text-neutral-400">
                                    {formatDistanceToNow(new Date(reply.timestamp), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-xs mt-1">{reply.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;
