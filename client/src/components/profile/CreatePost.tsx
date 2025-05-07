import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon, VideoIcon, LinkIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { postApi } from "@/services/api";

interface CreatePostProps {
  onAddPost: (post: any) => void;
  className?: string;
}

const CreatePost = ({ onAddPost, className = "" }: CreatePostProps) => {
  const { user } = useAuth();
  console.log("user : ", user);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && !selectedImage) return;
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a post",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newPost = await postApi.createPost(
        user.id.toString(), 
        content,
        selectedImage || undefined
      );
      
      onAddPost(newPost);
      
      // Reset form
      setContent("");
      clearImage();
      
      toast({
        title: "Post created",
        description: "Your post has been published successfully.",
      });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle clicking the image button
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`mb-6 border border-neutral-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <Avatar>
          <AvatarImage 
            src={user?.profilePicture} 
            alt={user?.firstName || "User"} 
          />
          <AvatarFallback>
            {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || 'S'}
          </AvatarFallback>
        </Avatar>
        <Input 
          placeholder="Share something with your network..." 
          className="rounded-full"
          value={content}
          onChange={handleInputChange}
          ref={contentInputRef}
          disabled={isSubmitting}
        />
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="mt-2 mb-4 relative">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="max-h-60 rounded-lg object-contain mx-auto border border-neutral-200" 
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full"
            onClick={clearImage}
          >
            <LinkIcon className="h-4 w-4 text-neutral-600" />
          </Button>
        </div>
      )}
      
      {/* Hidden file input */}
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleImageSelect}
        disabled={isSubmitting}
      />

      <div className="flex justify-between border-t border-neutral-200 pt-3">
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-neutral-600 hover:text-neutral-800"
            onClick={handleImageClick}
            disabled={isSubmitting}
          >
            <ImageIcon className="h-4 w-4 mr-1 text-green-500" />
            <span>Photo</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-neutral-600 hover:text-neutral-800"
            disabled={isSubmitting}
          >
            <VideoIcon className="h-4 w-4 mr-1 text-purple-500" />
            <span>Video</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-neutral-600 hover:text-neutral-800"
            disabled={isSubmitting}
          >
            <LinkIcon className="h-4 w-4 mr-1 text-primary-500" />
            <span>Link</span>
          </Button>
        </div>
        <Button 
          variant="default" 
          size="sm" 
          disabled={(!content.trim() && !selectedImage) || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Posting...
            </>
          ) : (
            "Post"
          )}
        </Button>
      </div>
    </div>
  );
};

export default CreatePost;
