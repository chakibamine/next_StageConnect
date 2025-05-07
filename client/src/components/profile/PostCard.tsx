import { useState, useRef, useEffect } from "react";
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
  SmileIcon,
  Loader2
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
import { Post as PostType, Comment as CommentType, postApi, commentApi } from "@/services/api"; 
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/config";

// Update PostType and CommentType to match the API response structure
interface ExtendedPostType extends PostType {
  authorName?: string;
  authorProfileImage?: string;
  likedByCurrentUser?: boolean;
  comments?: ExtendedCommentType[];
}

interface ExtendedCommentType extends CommentType {
  authorName?: string;
  authorProfilePic?: string;
  replies?: ExtendedCommentType[];
}

interface PostCardProps {
  post: ExtendedPostType;
  onUpdate?: (updatedPost: ExtendedPostType) => void;
  onClick?: () => void;
}

interface ReactionType {
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const PostCard = ({ post, onUpdate, onClick }: PostCardProps) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.likedByCurrentUser || false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [comments, setComments] = useState<ExtendedCommentType[]>(post.comments || []);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingLike, setIsSubmittingLike] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // Refs to prevent re-renders
  const commentInputRef = useRef<HTMLInputElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);
  
  const handleLike = async () => {
    if (!user || isSubmittingLike) return;
    
    setIsSubmittingLike(true);
    
    // Save previous state to revert in case of error
    const prevIsLiked = isLiked;
    const prevLikeCount = likeCount;
    
    // Optimistically update UI
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    
    try {
      let newLikeCount;
      
      // Perform the API call
      if (isLiked) {
        newLikeCount = await postApi.unlikePost(post.id.toString(), user.id.toString());
      } else {
        newLikeCount = await postApi.likePost(post.id.toString(), user.id.toString());
      }
      
      // Update the like count with the value from the API response
      setLikeCount(newLikeCount);
      
      // Notify parent component of the update
      if (onUpdate) {
        onUpdate({
          ...post,
          likeCount: newLikeCount,
          likedByCurrentUser: !isLiked
        });
      }
    } catch (error) {
      console.error("Error updating like status:", error);
      
      // Revert to previous state on error
      setIsLiked(prevIsLiked);
      setLikeCount(prevLikeCount);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingLike(false);
    }
  };

  // Load comments when showing the comments section
  useEffect(() => {
    if (showComments && (!post.comments || post.comments.length === 0)) {
      loadComments();
    }
  }, [showComments, post.id, user?.id, post.comments]);

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      const commentsData = await commentApi.getComments(post.id.toString());
      // Cast comment data to our extended type
      setComments(commentsData.content as unknown as ExtendedCommentType[]);
    } catch (error) {
      console.error("Error loading comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingComments(false);
    }
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

  const handleCommentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentText(e.target.value);
  };
  
  const handleReplyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyText(e.target.value);
  };

  const handleComment = async () => {
    if (!commentText.trim() || !user) return;
    
    setIsSubmittingComment(true);
    
    try {
      const newComment = await commentApi.addComment(
        post.id.toString(),
        user.id.toString(),
        commentText
      );
      
      console.log("Comment added successfully:", newComment);
      
      // Make sure we have a valid comment object before updating the UI
      if (newComment) {
        setComments(prevComments => [newComment, ...prevComments]);
        setCommentText("");
        
        // Update post comment count
        if (onUpdate) {
          onUpdate({
            ...post,
            commentCount: (post.commentCount || 0) + 1
          });
        }
        
        toast({
          title: "Comment added",
          description: "Your comment has been posted successfully.",
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReply = async (commentId: number) => {
    if (!replyText.trim() || !user) return;
    
    try {
      const newReply = await commentApi.addReply(
        commentId.toString(),
        user.id.toString(),
        replyText
      );
      
      console.log("Reply added successfully:", newReply);
      
      // Make sure we have a valid reply object before updating the UI
      if (newReply) {
        // Update comments state with the new reply
        setComments(prevComments => 
          prevComments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newReply]
              };
            }
            return comment;
          })
        );
        
        setReplyText("");
        setActiveReplyId(null);
        
        toast({
          title: "Reply added",
          description: "Your reply has been posted successfully.",
        });
      }
    } catch (error) {
      console.error("Error adding reply:", error);
      toast({
        title: "Error",
        description: "Failed to add reply. Please try again.",
        variant: "destructive",
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

  // Update button UI based on like state
  const getLikeButtonContent = () => {
    if (isSubmittingLike) {
      return <Loader2 className="h-4 w-4 mr-1 animate-spin" />;
    }
    
    return (
      <>
        <ThumbsUpIcon className={`h-4 w-4 mr-1 ${isLiked ? 'fill-primary-600' : ''}`} />
        <span>Like</span>
      </>
    );
  };

  // Format the post date
  const formatPostDate = () => {
    try {
      const date = new Date(post.createdAt);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Recently";
    }
  };

  // Get author display name
  const getAuthorName = () => {
    return post.authorName || "Unknown User";
  };

  // Get author photo
  const getAuthorPhoto = () => {
    if (post.authorProfileImage) {
      return `${API_BASE_URL}${post.authorProfileImage}`;
    }
    
    // Get first char of first name and last name
    const nameParts = (post.authorName || '').split(' ');
    const initials = nameParts.length >= 2 
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : (nameParts[0][0] || '?').toUpperCase();
      
    return `https://ui-avatars.com/api/?name=${initials}&background=random`;
  };

  return (
    <Card className="mb-4 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex justify-between mb-4">
          <div className="flex space-x-3">
            <Link href={`/profile/${post.authorId}`}>
              <Avatar className="h-12 w-12 ring-2 ring-primary/10 hover:ring-primary/30 transition-all duration-200">
                <AvatarImage 
                  src={getAuthorPhoto()}
                  alt={getAuthorName()} 
                />
                <AvatarFallback className="bg-primary-50 text-primary-600">
                  {post.authorName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link href={`/profile/${post.authorId}`}>
                <h3 className="font-semibold text-md hover:text-primary-600 transition-colors">
                  {getAuthorName()} 
                </h3>
              </Link>
              <p className="text-xs text-primary-700/70 font-medium">
                User
              </p>
              <p className="text-xs text-neutral-400">{formatPostDate()}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-neutral-500"
              >
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Save post</DropdownMenuItem>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
              <DropdownMenuItem>Report post</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div>
          <p className="text-sm whitespace-pre-line mb-3">{post.content}</p>
          
          {post.imageUrl && (
            <div className="my-3">
              <img 
                src={`${API_BASE_URL}${post.imageUrl}`} 
                alt="Post attachment" 
                className="rounded-md w-full object-cover max-h-96"
              />
            </div>
          )}
          
          {hasInternshipOffer && (
            <div className="mt-3 flex items-center">
              <Badge variant="outline" className="bg-primary-50 text-primary border-primary">
                <BriefcaseIcon className="h-3 w-3 mr-1" />
                Internship Opportunity
              </Badge>
            </div>
          )}
          
          <div className="flex border-t border-neutral-100 mt-4 pt-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex-1 text-neutral-600 ${isLiked ? 'text-primary font-medium' : ''}`}
              onClick={handleLike}
              disabled={isSubmittingLike}
            >
              {getLikeButtonContent()}
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 text-neutral-600"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquareIcon className="h-4 w-4 mr-1" />
              <span>Comment</span>
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 text-neutral-600"
              onClick={handleShare}
            >
              <Share2Icon className="h-4 w-4 mr-1" />
              <span>Share</span>
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex-1 text-neutral-600 ${isSaved ? 'text-primary font-medium' : ''}`}
              onClick={handleSave}
            >
              <BookmarkIcon className={`h-4 w-4 mr-1 ${isSaved ? 'fill-primary-600' : ''}`} />
              <span>Save</span>
            </Button>
          </div>
          
          {/* Show comments section when expanded */}
          {showComments && (
            <div className="mt-4 border-t border-neutral-100 pt-4">
              {isLoadingComments ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={comment.authorProfilePic} 
                          alt={comment.authorName || "User"} 
                        />
                        <AvatarFallback>
                          {comment.authorName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-neutral-100 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">
                              {comment.authorName || "User"}
                            </h4>
                            <span className="text-xs text-neutral-400">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
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
                              <AvatarImage 
                                src={user?.profilePicture} 
                                alt={user?.firstName || "You"} 
                              />
                              <AvatarFallback>{user?.firstName?.charAt(0) || 'Y'}</AvatarFallback>
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
                                  <AvatarImage 
                                    src={reply.authorProfilePic} 
                                    alt={reply.authorName || "User"} 
                                  />
                                  <AvatarFallback>
                                    {reply.authorName?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="bg-neutral-100 rounded-lg p-2">
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-medium text-xs">
                                        {reply.authorName || "User"}
                                      </h4>
                                      <span className="text-xs text-neutral-400">
                                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
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
              ) : (
                <p className="text-center text-neutral-500 text-sm py-2">No comments yet. Be the first to comment!</p>
              )}

              <div className="flex items-center space-x-2 mt-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user?.profilePicture} 
                    alt={user?.firstName || "You"} 
                  />
                  <AvatarFallback>{user?.firstName?.charAt(0) || 'Y'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={handleCommentInputChange}
                    className="pr-10"
                    ref={commentInputRef}
                    disabled={isSubmittingComment}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={handleComment}
                    disabled={!commentText.trim() || isSubmittingComment}
                  >
                    {isSubmittingComment ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SendIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
