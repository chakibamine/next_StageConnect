import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FilterIcon, Loader2 } from "lucide-react";
import CreatePost from "@/components/profile/CreatePost";
import PostCard from "@/components/profile/PostCard";
import { Post, postApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const Feed = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch posts on component mount and tab change
  useEffect(() => {
    fetchPosts();
    console.log("posts : ", posts);
  }, [activeTab]);

  const fetchPosts = async (reset = true) => {
    if (!user) return;
    
    if (reset) {
      setIsLoading(true);
      setPage(0);
    } else {
      setIsLoadingMore(true);
    }

    try {
      let postsData;
      
      // Fetch different posts based on active tab
      if (activeTab === "network") {
        // Get posts from user's network
        postsData = await postApi.getFeed(user.id.toString(), reset ? 0 : page);
      } else {
        // Get all posts
        postsData = await postApi.getAllPosts(user.id.toString(), reset ? 0 : page);
      }
      
      const newPosts = postsData.content;
      
      // Update posts state
      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts(prevPosts => [...prevPosts, ...newPosts]);
      }
      
      // Check if there are more posts to load
      setHasMore(postsData.currentPage < postsData.totalPages - 1);
      
      // Update page for next fetch
      if (!reset) {
        setPage(page + 1);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      setPage(prevPage => prevPage + 1);
      fetchPosts(false);
    }
  };

  const handleAddPost = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  const getTimeAgo = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 60000); // in minutes
    
    if (diff === 0) return "Just now";
    if (diff === 1) return "1m ago";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 120) return "1h ago";
    return `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold">Your Feed</CardTitle>
          <Badge variant="outline" className="text-xs font-normal">Updated {getTimeAgo()}</Badge>
        </div>
        <div className="flex space-x-1.5">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden md:block">
            <TabsList className="bg-transparent border-b border-neutral-200 p-0 h-auto">
              <TabsTrigger 
                value="all" 
                className={`h-8 rounded-none border-b-2 ${
                  activeTab === "all" 
                    ? "border-primary text-primary font-medium" 
                    : "border-transparent text-neutral-500"
                }`}
              >
                All
              </TabsTrigger>
              <Link href="/internships">
                <TabsTrigger 
                  value="internships" 
                  className={`h-8 rounded-none border-b-2 ${
                    activeTab === "internships" 
                      ? "border-primary text-primary font-medium" 
                      : "border-transparent text-neutral-500"
                  }`}
                >
                  Internships
                </TabsTrigger>
              </Link>
              <TabsTrigger 
                value="network" 
                className={`h-8 rounded-none border-b-2 ${
                  activeTab === "network" 
                    ? "border-primary text-primary font-medium" 
                    : "border-transparent text-neutral-500"
                }`}
              >
                Network
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" className="h-8 ml-2">
            <FilterIcon className="h-4 w-4 mr-1" />
            Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <CreatePost onAddPost={handleAddPost} />
        
        <div className="flex items-center justify-between text-sm text-neutral-500 border-b border-neutral-200 pb-2">
          <div>Showing posts from {activeTab === "network" ? "your network" : "everyone"}</div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => fetchPosts()}>
            Refresh
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onUpdate={handlePostUpdate} />
            ))}
            
            <div className="text-center pt-2 border-t border-neutral-200">
              {isLoadingMore ? (
                <Button variant="outline" className="w-full" disabled>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading more...
                </Button>
              ) : hasMore ? (
                <Button variant="outline" className="w-full" onClick={handleLoadMore}>
                  Show more posts
                </Button>
              ) : (
                <p className="text-sm text-neutral-500 py-2">No more posts to show</p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-neutral-500">No posts found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Feed;
