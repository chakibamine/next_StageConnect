import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon, VideoIcon, LinkIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import type { Post } from "@shared/schema";

interface CreatePostProps {
  onAddPost: (post: Post) => void;
}

const CreatePost = ({ onAddPost }: CreatePostProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contentInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // In a full implementation, this would be an API call
      const newPost: Post = {
        id: Math.floor(Math.random() * 10000),
        content,
        authorId: user?.id || 1,
        image: null,
        createdAt: new Date(),
        likeCount: 0,
        commentCount: 0,
      };
      
      onAddPost(newPost);
      setContent("");
      toast({
        title: "Post created",
        description: "Your post has been published successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6 border border-neutral-200 rounded-lg p-4">
      <div className="flex items-center space-x-3 mb-4">
        <Avatar>
          <AvatarImage 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80" 
            alt="User profile" 
          />
          <AvatarFallback>AJ</AvatarFallback>
        </Avatar>
        <Input 
          placeholder="Share something with your network..." 
          className="rounded-full"
          value={content}
          onChange={handleInputChange}
          ref={contentInputRef}
        />
      </div>
      <div className="flex justify-between border-t border-neutral-200 pt-3">
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="text-neutral-600 hover:text-neutral-800">
            <ImageIcon className="h-4 w-4 mr-1 text-green-500" />
            <span>Photo</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-neutral-600 hover:text-neutral-800">
            <VideoIcon className="h-4 w-4 mr-1 text-purple-500" />
            <span>Video</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-neutral-600 hover:text-neutral-800">
            <LinkIcon className="h-4 w-4 mr-1 text-primary-500" />
            <span>Link</span>
          </Button>
        </div>
        <Button 
          variant="default" 
          size="sm" 
          disabled={!content.trim() || isSubmitting}
          onClick={handleSubmit}
        >
          Post
        </Button>
      </div>
    </div>
  );
};

export default CreatePost;
