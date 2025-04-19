import { useState, useEffect } from "react";
import InternshipSearch from "@/components/internships/InternshipSearch";
import InternshipFilters from "@/components/internships/InternshipFilters";
import InternshipCard from "@/components/internships/InternshipCard";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Internship } from "@shared/schema";

const Internships = () => {
  const [searchParams, setSearchParams] = useState({ keyword: "", location: "" });
  const [filters, setFilters] = useState<Record<string, string[]>>({
    duration: [],
    industry: [],
    workType: [],
    compensation: [],
  });
  const [sortBy, setSortBy] = useState("relevance");
  const [internships, setInternships] = useState<Internship[]>([
    {
      id: 1,
      title: "UX/UI Design Intern",
      company: "DesignHub",
      location: "Paris, France",
      description: "Join our creative team to design intuitive user interfaces for web and mobile applications. You'll work with experienced designers and developers to create elegant solutions to complex UX challenges.",
      requirements: "Proficiency in Figma, Adobe XD, and basic knowledge of HTML/CSS. Studying design or a related field.",
      duration: "6 months",
      isPaid: true,
      workType: "Hybrid",
      compensation: "€800/month",
      applicationDeadline: new Date("2023-06-15"),
      postedBy: 1,
      createdAt: new Date("2023-05-01"),
    },
    {
      id: 2,
      title: "Software Engineering Intern",
      company: "TechCorp",
      location: "Lyon, France",
      description: "Looking for a passionate software engineering intern to join our development team. You'll be working on real projects using technologies like React, Node.js, and AWS. Great opportunity to apply your technical skills in a real-world setting.",
      requirements: "Knowledge of JavaScript, React, and Node.js. Currently pursuing a degree in Computer Science or related field.",
      duration: "3 months",
      isPaid: true,
      workType: "On-site",
      compensation: "€900/month",
      applicationDeadline: new Date("2023-06-30"),
      postedBy: 2,
      createdAt: new Date("2023-04-28"),
    },
    {
      id: 3,
      title: "Marketing Analytics Intern",
      company: "GlobalBrands",
      location: "Paris, France",
      description: "GlobalBrands is seeking a Marketing Analytics Intern to help analyze campaign performance and provide data-driven insights. You'll work with marketing teams to optimize strategies and measure ROI across different channels.",
      requirements: "Strong analytical skills, knowledge of Excel and Google Analytics. Studying Marketing, Business, or Statistics.",
      duration: "6 months",
      isPaid: true,
      workType: "Remote",
      compensation: "€850/month",
      applicationDeadline: new Date("2023-06-10"),
      postedBy: 3,
      createdAt: new Date("2023-04-30"),
    },
    {
      id: 4,
      title: "Research & Development Intern",
      company: "BioInnovate",
      location: "Marseille, France",
      description: "BioInnovate is looking for a research intern to assist in our biotech R&D department. The ideal candidate will have a background in biology or chemistry and a strong interest in laboratory research and innovation.",
      requirements: "Background in Biology, Chemistry or related field. Laboratory experience is a plus.",
      duration: "6+ months",
      isPaid: true,
      workType: "On-site",
      compensation: "€950/month",
      applicationDeadline: new Date("2023-07-15"),
      postedBy: 4,
      createdAt: new Date("2023-04-25"),
    },
  ]);

  useEffect(() => {
    document.title = "Find Internships | StageConnect";
  }, []);

  const handleSearch = (params: { keyword: string; location: string }) => {
    setSearchParams(params);
    // In a real app, this would make an API call to get filtered results
    console.log("Search params:", params);
  };

  const handleFilterChange = (newFilters: Record<string, string[]>) => {
    setFilters(newFilters);
    // In a real app, this would make an API call to get filtered results
    console.log("Filters:", newFilters);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    // In a real app, this would sort the results accordingly
    console.log("Sort by:", value);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <InternshipSearch onSearch={handleSearch} />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <InternshipFilters onFilterChange={handleFilterChange} />
        </div>
        
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="py-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">{internships.length} Internships found</CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-neutral-500">Sort by:</span>
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Most relevant</SelectItem>
                      <SelectItem value="newest">Date: Newest first</SelectItem>
                      <SelectItem value="oldest">Date: Oldest first</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {internships.map((internship) => (
                <InternshipCard key={internship.id} internship={internship} />
              ))}
              
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">4</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">5</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Internships;
