import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import { ChevronDown, Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export type SortOption = {
  sortBy: "createdAt" | "dueDate" | "priority" | "title";
  sortOrder: "asc" | "desc";
};

type Props = {
  onSortChange: (sort: SortOption) => void;
  value?: SortOption;
};

const SortFilter: React.FC<Props> = ({ onSortChange, value }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const setSort = (sortBy: SortOption["sortBy"], sortOrder: SortOption["sortOrder"]) => {
    onSortChange({ sortBy, sortOrder });
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Sort
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Sort</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setSort("createdAt", "desc")}>
          Newest First
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSort("createdAt", "asc")}>
          Oldest First
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSort("dueDate", "asc")}>
          Due Date (Earliest)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSort("priority", "desc")}>
          Priority (High to Low)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSort("title", "asc")}>
          Title (A-Z)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortFilter;
