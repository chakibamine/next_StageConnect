import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusIcon, XIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SuggestionPerson {
  id: number;
  name: string;
  title: string;
  company: string;
  mutualConnections: number;
  profilePicture?: string;
}

const NetworkSuggestions = () => {
  const [suggestions, setSuggestions] = useState<SuggestionPerson[]>([
    {
      id: 1,
      name: "Emma Davis",
      title: "Software Engineer",
      company: "Google",
      mutualConnections: 5,
      profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    },
    {
      id: 2,
      name: "David Kim",
      title: "Product Manager",
      company: "TechCorp",
      mutualConnections: 2,
      profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    },
    {
      id: 3,
      name: "Sophie Martin",
      title: "HR Manager",
      company: "CreativeEdge",
      mutualConnections: 7,
      profilePicture: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    },
  ]);

  const handleConnect = (personId: number) => {
    const person = suggestions.find(p => p.id === personId);
    if (person) {
      toast({
        title: "Connection Request Sent",
        description: `You've sent a connection request to ${person.name}.`,
      });
    }
  };

  const handleDismiss = (personId: number) => {
    setSuggestions(suggestions.filter(person => person.id !== personId));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">People you may know</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((person) => (
          <div key={person.id} className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={person.profilePicture} 
                alt={person.name} 
              />
              <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium text-sm">{person.name}</h3>
              <p className="text-xs text-neutral-500">{person.title} at {person.company}</p>
              <p className="text-xs text-neutral-400">{person.mutualConnections} mutual connections</p>
              <div className="mt-2 flex space-x-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="h-7 rounded-full text-xs"
                  onClick={() => handleConnect(person.id)}
                >
                  <PlusIcon className="h-3 w-3 mr-1" /> Connect
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 w-7 p-0 rounded-full"
                  onClick={() => handleDismiss(person.id)}
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        <Button variant="link" className="w-full text-sm text-primary-600 font-medium hover:underline">
          View more suggestions
        </Button>
      </CardContent>
    </Card>
  );
};

export default NetworkSuggestions;
