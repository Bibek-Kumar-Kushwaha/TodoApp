"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { TodoListProps } from "./TodoList";
import { useRouter, useSearchParams } from "next/navigation";

const PaginationDemo = ({ todo, loading = false }: TodoListProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { page, totalPages, hasNext, hasPrev } = todo.pagination;
  const changePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const generatePageNumbers = () => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }

    return pages;
  };

  const pages = generatePageNumbers();

  return (
    <Pagination className="my-3">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className={`${
              hasPrev === false
                ? "hover:cursor-not-allowed bg-muted-foreground/5"
                : "bg-purple-500"
            }`}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (hasPrev) changePage(page - 1);
            }}
          />
        </PaginationItem>

        {pages.map((p, idx) =>
          p === "..." ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={`page-${p}`}>
              <PaginationLink
                isActive={p === page}
                onClick={(e) => {
                  e.preventDefault();
                  changePage(p as number);
                }}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            className={`${
              hasNext === false
                ? "cursor-not-allowed bg-muted-foreground/5"
                : "bg-purple-500"
            }`}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (hasNext) changePage(page + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationDemo;
