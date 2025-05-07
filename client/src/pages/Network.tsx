import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusIcon, XIcon, CheckIcon, BriefcaseIcon, GraduationCapIcon, MapPinIcon, LinkIcon, SearchIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { connectionService, Connection } from "@/services/connectionService";

interface NetworkConnection {
  id: number;
  name: string;
  title: string;
  company: string;
  location: string;
  profilePicture?: string;
  connectionStatus: "connected" | "pending" | "none";
  mutualConnections: number;
}

const Network = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("suggestions");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStats, setConnectionStats] = useState({
    connectionsCount: 0,
    pendingCount: 0,
  });

  // State for connections data
  const [connections, setConnections] = useState<NetworkConnection[]>([]);
  const [pendingConnections, setPendingConnections] = useState<NetworkConnection[]>([]);
  const [suggestions, setSuggestions] = useState<NetworkConnection[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    document.title = "Network | StageConnect";
    if (user) {
      fetchNetworkData();
    }
  }, [user]);

  const fetchNetworkData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch connection stats
      const stats = await connectionService.getConnectionStats(user.id);
      setConnectionStats({
        connectionsCount: stats.connectionsCount || 0,
        pendingCount: stats.pendingCount || 0,
      });

      // Fetch connections
      const connectionsResponse = await connectionService.getConnections(user.id);
      const formattedConnections = connectionsResponse.connections?.map(connection => formatConnection(connection, "connected")) || [];
      setConnections(formattedConnections);

      // Fetch pending connections
      const pendingResponse = await connectionService.getPendingConnections(user.id);
      const formattedPending = pendingResponse.pendingConnections?.map(connection => formatConnection(connection, "pending")) || [];
      setPendingConnections(formattedPending);

      // Fetch suggestions
      const suggestionsResponse = await connectionService.getConnectionSuggestions(user.id);
      const formattedSuggestions = suggestionsResponse.suggestions?.map((suggestion: any) => ({
        id: suggestion.id,
        name: suggestion.name || `${suggestion.firstName || ''} ${suggestion.lastName || ''}`.trim(),
        title: suggestion.title || "Student",
        company: suggestion.company || "Unknown",
        location: suggestion.location || "France",
        profilePicture: suggestion.profilePicture,
        connectionStatus: "none",
        mutualConnections: suggestion.mutualConnections || 0,
      })) || [];
      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error("Error fetching network data:", error);
      toast({
        title: "Error",
        description: "Failed to load network data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format connection data
  const formatConnection = (connection: Connection, status: "connected" | "pending"): NetworkConnection => {
    return {
      id: connection.requesterId,
      name: connection.requesterName,
      title: connection.requesterTitle || "Student",
      company: connection.requesterCompany || "Unknown",
      location: connection.requesterLocation || "France",
      profilePicture: connection.requesterProfilePicture,
      connectionStatus: status,
      mutualConnections: 0, // This information is not provided by the API
    };
  };

  const handleConnect = async (person: NetworkConnection) => {
    if (!user) return;

    if (person.connectionStatus === "none") {
      try {
        // Send connection request
        const response = await connectionService.sendConnectionRequest(user.id, person.id);
        
        if (response.success) {
          // Update suggestions
          setSuggestions(suggestions.map(p => 
            p.id === person.id 
              ? { ...p, connectionStatus: "pending" } 
              : p
          ));
          
          // Add to pending
          setPendingConnections([...pendingConnections, { ...person, connectionStatus: "pending" }]);
          
          // Update stats
          setConnectionStats({
            ...connectionStats,
            pendingCount: connectionStats.pendingCount + 1,
          });
          
          toast({
            title: "Connection Request Sent",
            description: `You've sent a connection request to ${person.name}.`,
          });
        }
      } catch (error) {
        console.error("Error sending connection request:", error);
        
        // Show appropriate error message
        const errorMessage = error instanceof Error 
          ? error.message
          : "Failed to send connection request. Please try again.";
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  const handleAccept = async (person: NetworkConnection) => {
    if (!user) return;

    try {
      // Find the connection in pendingConnections
      const pendingConnection = pendingConnections.find(p => p.id === person.id);
      if (!pendingConnection) {
        throw new Error("Connection not found");
      }

      // Fetch connection details to get actual connectionId
      const pendingResponse = await connectionService.getPendingConnections(user.id);
      const pendingConnectionDetails = pendingResponse.pendingConnections?.find(
        conn => conn.requesterId === person.id
      );

      if (!pendingConnectionDetails) {
        throw new Error("Connection details not found");
      }

      // Accept connection request using the actual connectionId from the response
      const response = await connectionService.acceptConnectionRequest(
        user.id,
        pendingConnectionDetails.id
      );
      
      if (response.success) {
        // Remove from pending
        setPendingConnections(pendingConnections.filter(p => p.id !== person.id));
        
        // Add to connections
        setConnections([...connections, { ...person, connectionStatus: "connected" }]);
        
        // Update stats
        setConnectionStats({
          ...connectionStats,
          connectionsCount: connectionStats.connectionsCount + 1,
          pendingCount: Math.max(0, connectionStats.pendingCount - 1),
        });
        
        toast({
          title: "Connection Accepted",
          description: `You are now connected with ${person.name}. A conversation has been created.`,
        });
      }
    } catch (error) {
      console.error("Error accepting connection request:", error);
      toast({
        title: "Error",
        description: "Failed to accept connection request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (person: NetworkConnection) => {
    if (!user) return;

    try {
      // Fetch connection details to get actual connectionId
      const pendingResponse = await connectionService.getPendingConnections(user.id);
      const pendingConnectionDetails = pendingResponse.pendingConnections?.find(
        conn => conn.requesterId === person.id
      );

      if (!pendingConnectionDetails) {
        throw new Error("Connection details not found");
      }

      // Reject connection request using the actual connectionId
      await connectionService.rejectConnectionRequest(user.id, pendingConnectionDetails.id);
      
      // Remove from pending
      setPendingConnections(pendingConnections.filter(p => p.id !== person.id));
      
      // If it was a suggestion before, revert back to "none"
      setSuggestions(suggestions.map(p => 
        p.id === person.id 
          ? { ...p, connectionStatus: "none" } 
          : p
      ));
      
      // Update stats
      setConnectionStats({
        ...connectionStats,
        pendingCount: Math.max(0, connectionStats.pendingCount - 1),
      });
      
      toast({
        title: "Connection Rejected",
        description: `You've rejected the connection request from ${person.name}.`,
      });
    } catch (error) {
      console.error("Error rejecting connection request:", error);
      toast({
        title: "Error",
        description: "Failed to reject connection request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = (person: NetworkConnection) => {
    setSuggestions(suggestions.filter(p => p.id !== person.id));
  };

  const filteredConnections = connections.filter(
    person => person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              person.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              person.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSuggestions = suggestions.filter(
    person => person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              person.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              person.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Please Log In</h2>
            <p className="text-neutral-500 mb-4">You need to be logged in to view your network.</p>
            <Button onClick={() => window.location.href = "/login"}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Your Professional Network</h1>
        
        <div className="flex gap-2">
          <div className="relative w-full md:w-auto">
            <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
            <Input 
              placeholder="Search connections..." 
              className="pl-10 w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>
            <PlusIcon className="h-4 w-4 mr-1" /> Grow Network
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Your Network Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Connections</span>
                <Badge variant="outline">{connectionStats.connectionsCount}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Pending</span>
                <Badge variant="outline">{connectionStats.pendingCount}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Profile views</span>
                <Badge variant="outline">27</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Post impressions</span>
                <Badge variant="outline">148</Badge>
              </div>
              <div className="pt-2">
                <Button variant="link" className="text-sm p-0 h-auto text-primary">View full stats →</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex justify-between">
                <span>Industry News</span>
                <Badge variant="outline" className="font-normal">Top picks for you</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <div className="h-32 bg-neutral-100 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80" 
                      alt="Tech news" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm">Tech Internships: What Companies Look For in 2025</h3>
                    <p className="text-xs text-neutral-500 mt-1">TechReview • 3 days ago</p>
                  </div>
                </div>
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <div className="h-32 bg-neutral-100 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80" 
                      alt="Professional development" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm">Networking in the Digital Age: Building Professional Relationships Online</h3>
                    <p className="text-xs text-neutral-500 mt-1">CareerInsight • 1 week ago</p>
                  </div>
                </div>
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <div className="h-32 bg-neutral-100 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=869&q=80" 
                      alt="Resume tips" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm">Resume Trends: What Catches Employers' Attention in 2025</h3>
                    <p className="text-xs text-neutral-500 mt-1">ResumeHub • 5 days ago</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Button variant="link" className="text-sm p-0 h-auto text-primary">See more industry news →</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="connections">My Connections ({connectionStats.connectionsCount})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({connectionStats.pendingCount})</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions ({suggestions.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="connections">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading your connections...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConnections.length > 0 ? (
                filteredConnections.map((person) => (
                  <Card key={person.id} className="overflow-hidden">
                    <div className="h-20 bg-gradient-to-r from-primary-100 to-primary-200"></div>
                    <CardContent className="pt-0 relative">
                      <Avatar className="h-16 w-16 absolute -top-8 border-4 border-white">
                        <AvatarImage src={person.profilePicture} alt={person.name} />
                        <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="mt-10">
                        <h3 className="font-semibold">{person.name}</h3>
                        <p className="text-sm text-neutral-600">{person.title}</p>
                        <div className="mt-2 space-y-1 text-sm text-neutral-500">
                          <div className="flex items-center">
                            <BriefcaseIcon className="h-3.5 w-3.5 mr-1" />
                            <span>{person.company}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPinIcon className="h-3.5 w-3.5 mr-1" />
                            <span>{person.location}</span>
                          </div>
                          <div className="flex items-center">
                            <LinkIcon className="h-3.5 w-3.5 mr-1" />
                            <span>{person.mutualConnections} mutual connections</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex space-x-2">
                          <Button size="sm" variant="outline" asChild className="flex-1">
                            <a href={`/messaging`}>Message</a>
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="p-6 text-center flex flex-col items-center justify-center min-h-[200px]">
                      <h3 className="text-lg font-medium mb-2">No connections found</h3>
                      <p className="text-neutral-500 mb-4">
                        {searchQuery 
                          ? "No connections match your search. Try a different search term." 
                          : "You haven't connected with anyone yet. Check out the suggestions tab to find people to connect with."}
                      </p>
                      {searchQuery && (
                        <Button variant="outline" onClick={() => setSearchQuery("")}>
                          Clear Search
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading pending requests...</p>
            </div>
          ) : (
            pendingConnections.length > 0 ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pending Invitations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pendingConnections.map((person) => (
                      <div key={person.id} className="flex items-center justify-between p-4 border-b border-neutral-100 last:border-0">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={person.profilePicture} alt={person.name} />
                            <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{person.name}</h3>
                            <p className="text-sm text-neutral-500">{person.title} at {person.company}</p>
                            <p className="text-xs text-neutral-400">{person.mutualConnections} mutual connections</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="h-8"
                            onClick={() => handleAccept(person)}
                          >
                            <CheckIcon className="h-4 w-4 mr-1" /> Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8"
                            onClick={() => handleReject(person)}
                          >
                            <XIcon className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center flex flex-col items-center justify-center min-h-[200px]">
                  <h3 className="text-lg font-medium mb-2">No pending invitations</h3>
                  <p className="text-neutral-500">When someone sends you a connection request, it will appear here.</p>
                </CardContent>
              </Card>
            )
          )}
        </TabsContent>
        
        <TabsContent value="suggestions">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading suggestions...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((person) => (
                  <Card key={person.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src={person.profilePicture} alt={person.name} />
                          <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-medium">{person.name}</h3>
                          <p className="text-sm text-neutral-600">{person.title}</p>
                          <p className="text-sm text-neutral-500">{person.company}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {person.mutualConnections} mutual connections
                          </Badge>
                          
                          <div className="mt-3 flex space-x-2">
                            <Button 
                              size="sm" 
                              className="h-8"
                              onClick={() => handleConnect(person)}
                              disabled={person.connectionStatus === "pending"}
                            >
                              {person.connectionStatus === "pending" ? (
                                "Pending"
                              ) : (
                                <>
                                  <PlusIcon className="h-4 w-4 mr-1" /> Connect
                                </>
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleDismiss(person)}
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="p-6 text-center flex flex-col items-center justify-center min-h-[200px]">
                      <h3 className="text-lg font-medium mb-2">No suggestions found</h3>
                      <p className="text-neutral-500 mb-4">
                        {searchQuery 
                          ? "No suggestions match your search. Try a different search term." 
                          : "We're working on finding more people for you to connect with."}
                      </p>
                      {searchQuery && (
                        <Button variant="outline" onClick={() => setSearchQuery("")}>
                          Clear Search
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Network;
