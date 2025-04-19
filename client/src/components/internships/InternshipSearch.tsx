import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, MapPinIcon } from "lucide-react";

interface InternshipSearchProps {
  onSearch: (searchParams: { keyword: string; location: string }) => void;
}

const InternshipSearch = ({ onSearch }: InternshipSearchProps) => {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ keyword, location });
  };

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-3">Find your perfect internship</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4">
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
          <Input 
            type="text" 
            placeholder="Job title, keyword, or company" 
            className="pl-10"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <div className="relative flex-grow">
          <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
          <Input 
            type="text" 
            placeholder="Location" 
            className="pl-10"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <Button type="submit" className="md:w-auto">
          Search
        </Button>
      </form>
    </div>
  );
};

export default InternshipSearch;
