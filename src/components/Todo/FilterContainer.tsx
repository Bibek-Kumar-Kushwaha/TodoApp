"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";

import Searchbar from "./Filter/Searchbar";
import StatusFilter from "./Filter/StatusFilter";
import SortFilter, { SortOption } from "./Filter/SortFilter";
import TodoList from "./TodoList";
import { Priority, Todo } from "@/lib/types";
import PriorityFilter from "./Filter/PrioorityFilter";
import PaginationDemo from "./Pagination";

interface FilterContainerProps {
  refreshTrigger?: number;
  onStatsUpdate?: (todos: Todo[]) => void;
}

const FilterContainer = ({ refreshTrigger, onStatsUpdate }: FilterContainerProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalCount: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(false);
 
  // Filters state synced with URL params
  const [filters, setFilters] = useState<{
    search?: string;
    completed?: boolean;
    priority?: Priority;
    sortBy: SortOption["sortBy"];
    sortOrder: SortOption["sortOrder"];
  }>({
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Parse URL params to filters on mount and when params change
  useEffect(() => {
    const search = searchParams.get("search") || undefined;
    const completedRaw = searchParams.get("completed");
    const completed =
      completedRaw === "true"
        ? true
        : completedRaw === "false"
        ? false
        : undefined;
    const priorityRaw = searchParams.get("priority") as Priority | null;
    const priority =
      priorityRaw && ["LOW", "MEDIUM", "HIGH", "URGENT"].includes(priorityRaw)
        ? priorityRaw
        : undefined;
    const sortBy =
      (searchParams.get("sortBy") as SortOption["sortBy"]) || "createdAt";
    const sortOrder =
      (searchParams.get("sortOrder") as SortOption["sortOrder"]) || "desc";

    setFilters({ search, completed, priority, sortBy, sortOrder });
  }, [searchParams]);

  // Fetch todos once
const fetchTodos = async () => {
  setLoading(true);
  try {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.completed !== undefined) params.set("completed", filters.completed.toString());
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    params.set("page", page.toString());
    params.set("limit", limit.toString());

    const response = await axios.get(`/api/todos?${params.toString()}`, {
      withCredentials: true,
    });

    if (response.status === 401) {
      router.push("/login");
      return;
    }

    const data = response.data?.data || [];

    const parsedTodos: Todo[] = data.map((todo: any) => ({
      ...todo,
      dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
      createdAt: todo.createdAt ? new Date(todo.createdAt) : new Date(),
    }));

    setTodos(parsedTodos);
    setPagination({
      page,
      limit,
      totalCount: response.data.pagination.totalCount,
      totalPages: response.data.pagination.totalPages,
      hasNext: response.data.pagination.hasNext,
      hasPrev: response.data.pagination.hasPrev,
    });
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  fetchTodos();
}, [searchParams, refreshTrigger]); 

// Update stats when todos change
useEffect(() => {
  if (onStatsUpdate) {
    onStatsUpdate(todos);
  }
}, [todos, onStatsUpdate]); 


  // Filter and sort todos locally based on filters
  useEffect(() => {
    let filtered = [...todos];

    if (filters.search) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
          t.description?.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.completed !== undefined) {
      filtered = filtered.filter((t) => t.completed === filters.completed);
    }

    if (filters.priority) {
      filtered = filtered.filter((t) => t.priority === filters.priority);
    }

    filtered.sort((a, b) => {
      const dir = filters.sortOrder === "asc" ? 1 : -1;
      switch (filters.sortBy) {
        case "title":
          return dir * a.title.localeCompare(b.title);
        case "dueDate":
          return (
            dir * ((a.dueDate?.getTime() ?? 0) - (b.dueDate?.getTime() ?? 0))
          );
        case "priority":
          const order = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          return dir * (order[a.priority] - order[b.priority]);
        case "createdAt":
        default:
          return (
            dir *
            (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          );
      }
    });
  }, [todos, filters]);

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Searchbar
          onSearch={(term) =>
            setFilters((f) => ({ ...f, search: term || undefined }))
          }
        />
        <StatusFilter
          value={
            filters.completed === undefined
              ? "all"
              : (filters.completed.toString() as "true" | "false")
          }
          onChange={(val) => {
            setFilters((f) => ({
              ...f,
              completed: val === "all" ? undefined : val === "true",
            }));
          }}
        />
        <PriorityFilter
          value={filters.priority || "all"}
          onChange={(val) => {
            setFilters((f) => ({
              ...f,
              priority: val === "all" ? undefined : val,
            }));
          }}
        />
        <SortFilter
          value={{ sortBy: filters.sortBy, sortOrder: filters.sortOrder }}
          onSortChange={(sort) => setFilters((f) => ({ ...f, ...sort }))}
        />
      </div>

      <TodoList
        todo={{
          data: todos,
          pagination: pagination,
        }}
        loading={loading}
        onRefresh={fetchTodos}
      />
      <PaginationDemo
        todo={{
          data: todos,
          pagination: pagination,
        }}
        loading={loading}
      />
    </div>
  );
};

export default FilterContainer;
