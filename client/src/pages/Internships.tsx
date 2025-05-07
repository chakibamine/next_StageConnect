import { useState, useEffect } from "react";
import InternshipSearch from "@/components/internships/InternshipSearch";
import InternshipFilters from "@/components/internships/InternshipFilters";
import InternshipCard from "@/components/internships/InternshipCard";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { internshipApi, type Internship, type PaginatedResponse } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/config";

const Internships = () => {
  const [searchParams, setSearchParams] = useState({ keyword: "", location: "" });
  const [filters, setFilters] = useState<Record<string, string[]>>({
    duration: [],
    industry: [],
    workType: [],
    compensation: [],
  });
  const [sortBy, setSortBy] = useState("relevance");
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Find Internships | StageConnect";
  }, []);

  const fetchInternships = async (page = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get company ID from context or URL params
      const companyId = "1"; // Replace with actual company ID
      
      // Use the new active internships endpoint
      const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/internships/active`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch internships: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setInternships(result.data || []);
        // Since the new endpoint doesn't support pagination yet, we'll set these to default values
        setTotalPages(1);
        setCurrentPage(0);
      } else {
        throw new Error(result.message || 'Failed to fetch internships');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch internships");
      setInternships([]);
      setTotalPages(0);
      setCurrentPage(0);
      toast({
        title: "Error",
        description: "Failed to fetch internships. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships(currentPage);
  }, [currentPage, filters]);

  const handleSearch = (params: { keyword: string; location: string }) => {
    setSearchParams(params);
    // Reset to first page when searching
    setCurrentPage(0);
    fetchInternships(0);
  };

  const handleFilterChange = (newFilters: Record<string, string[]>) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    setCurrentPage(0);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    // Implement sorting logic here
    const sortedInternships = [...internships].sort((a, b) => {
      switch (value) {
        case "newest":
          return new Date(b.posted).getTime() - new Date(a.posted).getTime();
        case "oldest":
          return new Date(a.posted).getTime() - new Date(b.posted).getTime();
        default:
          return 0;
      }
    });
    setInternships(sortedInternships);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    // Since we're not using pagination from the API yet, we'll hide the pagination
    return null;
  };

  const renderInternshipList = () => {
    if (loading) {
      return Array(3).fill(0).map((_, index) => (
        <div key={index} className="mb-4">
          <Skeleton className="h-32 w-full" />
        </div>
      ));
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => fetchInternships(currentPage)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!internships || internships.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-neutral-500">No active internships found matching your criteria.</p>
        </div>
      );
    }

    return internships.map((internship) => (
      <InternshipCard key={internship.id} internship={internship} />
    ));
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
                <CardTitle className="text-lg font-semibold">
                  {loading ? (
                    <Skeleton className="h-6 w-48" />
                  ) : error ? (
                    "Error loading internships"
                  ) : (
                    `${internships?.length || 0} Active Internships found`
                  )}
                </CardTitle>
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
              {renderInternshipList()}
              
              {!loading && !error && internships?.length > 0 && (
                <Pagination className="mt-6">
                  {renderPagination()}
                </Pagination>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Internships;
