import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../ui/select";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  value?: "all" | "true" | "false";
  onChange: (value: "all" | "true" | "false") => void;
};

const StatusFilter: React.FC<Props> = ({ value = "all", onChange }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleChange = (val: "all" | "true" | "false") => {
    onChange(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val === "all") params.delete("completed");
    else params.set("completed", val);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger>
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="false">Pending</SelectItem>
        <SelectItem value="true">Completed</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default StatusFilter;
