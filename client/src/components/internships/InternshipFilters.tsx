import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";

interface FilterOption {
  id: string;
  label: string;
}

interface FilterGroup {
  name: string;
  options: FilterOption[];
  expanded?: boolean;
}

interface InternshipFiltersProps {
  onFilterChange: (filters: Record<string, string[]>) => void;
}

const InternshipFilters = ({ onFilterChange }: InternshipFiltersProps) => {
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([
    {
      name: "duration",
      options: [
        { id: "less-than-3", label: "Less than 3 months" },
        { id: "3-6", label: "3-6 months" },
        { id: "6-plus", label: "6+ months" },
      ],
    },
    {
      name: "industry",
      options: [
        { id: "technology", label: "Technology" },
        { id: "finance", label: "Finance" },
        { id: "healthcare", label: "Healthcare" },
        { id: "marketing", label: "Marketing" },
        { id: "education", label: "Education" },
      ],
      expanded: false,
    },
    {
      name: "workType",
      options: [
        { id: "on-site", label: "On-site" },
        { id: "remote", label: "Remote" },
        { id: "hybrid", label: "Hybrid" },
      ],
    },
    {
      name: "compensation",
      options: [
        { id: "paid", label: "Paid" },
        { id: "unpaid", label: "Unpaid" },
      ],
    },
  ]);

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    duration: [],
    industry: [],
    workType: [],
    compensation: [],
  });

  const handleFilterToggle = (groupName: string, optionId: string) => {
    setSelectedFilters((prev) => {
      const updated = { ...prev };
      
      if (updated[groupName].includes(optionId)) {
        updated[groupName] = updated[groupName].filter(id => id !== optionId);
      } else {
        updated[groupName] = [...updated[groupName], optionId];
      }
      
      onFilterChange(updated);
      return updated;
    });
  };

  const toggleGroupExpansion = (groupName: string) => {
    setFilterGroups(filterGroups.map(group => 
      group.name === groupName 
        ? { ...group, expanded: !group.expanded } 
        : group
    ));
  };

  const clearAllFilters = () => {
    const emptyFilters = Object.keys(selectedFilters).reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {} as Record<string, string[]>);
    
    setSelectedFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {filterGroups.map((group) => (
          <div key={group.name}>
            <h3 className="font-medium text-sm mb-2 capitalize">{group.name}</h3>
            <div className="space-y-2">
              {group.options.slice(0, group.expanded ? undefined : 3).map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={option.id} 
                    checked={selectedFilters[group.name].includes(option.id)}
                    onCheckedChange={() => handleFilterToggle(group.name, option.id)}
                  />
                  <Label htmlFor={option.id} className="text-sm">{option.label}</Label>
                </div>
              ))}
            </div>
            {group.options.length > 3 && (
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-auto text-sm text-primary-600 font-medium mt-1"
                onClick={() => toggleGroupExpansion(group.name)}
              >
                {group.expanded ? "Show less" : "Show more"}
                <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform ${group.expanded ? "rotate-180" : ""}`} />
              </Button>
            )}
          </div>
        ))}
        
        <div className="pt-3 border-t border-neutral-200">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={clearAllFilters}
          >
            Clear all filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InternshipFilters;
