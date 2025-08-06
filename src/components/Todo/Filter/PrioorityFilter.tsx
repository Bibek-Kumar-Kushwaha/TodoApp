import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../ui/select";
import { Flag, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

const icons = {
  LOW: <Flag className="h-3 w-3 text-blue-500" />,
  MEDIUM: <Flag className="h-3 w-3 text-yellow-500" />,
  HIGH: <Flag className="h-3 w-3 text-orange-500" />,
  URGENT: <AlertCircle className="h-3 w-3 text-red-500" />,
};

type Props = {
  value?: Priority | "all";
  onChange: (value: Priority | "all") => void;
};

const PriorityFilter: React.FC<Props> = ({ value = "all", onChange }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleChange = (val: Priority | "all") => {
    onChange(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val === "all") params.delete("priority");
    else params.set("priority", val);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger>
        <SelectValue placeholder="Priority" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {(["URGENT", "HIGH", "MEDIUM", "LOW"] as Priority[]).map((p) => (
          <SelectItem key={p} value={p}>
            <div className="flex items-center gap-2">
              {icons[p]}
              {p}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default PriorityFilter;
