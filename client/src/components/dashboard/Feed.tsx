import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FilterIcon } from "lucide-react";
import CreatePost from "@/components/profile/CreatePost";
import PostCard from "@/components/profile/PostCard";
import { Post } from "@/schema";

const Feed = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      content: "We're excited to announce that we're hiring summer interns for our Software Development department! Looking for passionate students who want to gain real-world experience. #Internships #TechJobs",
      authorId: 2,
      image: null,
      createdAt: new Date("2023-01-02T10:30:00"),
      likeCount: 15,
      commentCount: 3,
    },
    {
      id: 2,
      content: "Just finished my 6-month internship at CreativeEdge. It was an incredible learning experience working with such talented professionals. Huge thanks to my amazing supervisor @JaneSmith for the guidance! #Internship #CareerGrowth",
      authorId: 3,
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
      createdAt: new Date("2023-01-01T09:15:00"),
      likeCount: 42,
      commentCount: 7,
    },
    {
      id: 3,
      content: "Reminder to all my students: The deadline for submitting your internship applications is next Friday. Make sure your CVs are updated and professional. If you need any help with your applications, my office hours are Tuesday 2-4pm. #StudentSuccess",
      authorId: 4,
      image: null,
      createdAt: new Date("2022-12-30T14:45:00"),
      likeCount: 18,
      commentCount: 5,
    }
  ]);

  const handleAddPost = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold">Your Feed</CardTitle>
          <Badge variant="outline" className="text-xs font-normal">Updated 10m ago</Badge>
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
              <Link href="/network">
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
              </Link>
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
          <div>Showing posts from your network and interests</div>
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            Sort by: Recent
          </Button>
        </div>
        
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        
        <div className="text-center pt-2 border-t border-neutral-200">
          <Button variant="outline" className="w-full">
            Show more posts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Feed;
