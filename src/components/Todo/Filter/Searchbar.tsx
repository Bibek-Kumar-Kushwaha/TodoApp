"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "../../ui/input";
import { useRouter, useSearchParams } from "next/navigation";

type SearchbarProps = {
  onSearch: (term: string) => void;
};

const Searchbar: React.FC<SearchbarProps> = ({ onSearch }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [term, setTerm] = useState("");

  // Load from URL
  useEffect(() => {
  const searchTerm = searchParams.get("search") || "";
  if (term !== searchTerm) {
    setTerm(searchTerm);
    onSearch(searchTerm);
  }
}, [searchParams]);


  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value;
  //   setTerm(value);

  //   // Update URL param
  //   const params = new URLSearchParams(searchParams.toString());
  //   if (value) params.set("search", value);
  //   else params.delete("search");

  //   router.push(`?${params.toString()}`, { scroll: false });

  //   onSearch(value);
  // };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setTerm(value);

  const params = new URLSearchParams(searchParams.toString());

  // Update search param
  if (value) params.set("search", value);
  else params.delete("search");

  // Reset to first page on new search
  params.set("page", "1");

  // Update URL
  router.push(`?${params.toString()}`, { scroll: false });

  // Call external handler (if needed)
  onSearch(value);
};

  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search todos..."
        value={term}
        onChange={handleChange}
        className="pl-10"
      />
    </div>
  );
};

export default Searchbar;
