"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import Searchbar from "./Filter/Searchbar";
import StatusFilter from "./Filter/StatusFilter";
import SortFilter, { SortOption } from "./Filter/SortFilter";
import TodoList from "./TodoList";
import { Priority } from "@/lib/types";
import PriorityFilter from "./Filter/PrioorityFilter";
import PaginationDemo from "./Pagination";
import { useTodos } from "@/hooks/useTodos";

interface OptimizedFilterContainerProps {
  refreshTrigger?: number;
  onStatsUpdate?: (todos: any[]) => void;
}

const OptimizedFilterContainer = ({ refreshTrigger, onStatsUpdate }: OptimizedFilterContainerProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
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

  // Get current page and limit from URL
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "5", 10);

  // Use the custom hook
  const {
    todos,
    pagination,
    loading,
    error,
    fetchTodos,
    updateTodo,
    deleteTodo,
    toggleComplete,
  } = useTodos(filters, page, limit);

  // Update stats when todos length or completion count changes - throttled
  const todosLength = todos.length;
  const completedCount = todos.filter(t => t.completed).length;
  
  // Use a ref to track if we've already called onStatsUpdate for these values
  const lastStatsRef = useRef({ length: -1, completed: -1 });
  
  useEffect(() => {
    if (onStatsUpdate && 
        (lastStatsRef.current.length !== todosLength || 
         lastStatsRef.current.completed !== completedCount)) {
      
      lastStatsRef.current = { length: todosLength, completed: completedCount };
      
      // Use setTimeout to prevent infinite loops
      const timeoutId = setTimeout(() => {
        onStatsUpdate(todos);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [todosLength, completedCount]);

  // Handle refresh trigger
  useEffect(() => {
    if (refreshTrigger) {
      fetchTodos();
    }
  }, [refreshTrigger, fetchTodos]);

  // Update URL when filters change
  const updateURL = (newFilters: typeof filters) => {
    const params = new URLSearchParams();
    
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.completed !== undefined) params.set("completed", newFilters.completed.toString());
    if (newFilters.priority) params.set("priority", newFilters.priority);
    if (newFilters.sortBy) params.set("sortBy", newFilters.sortBy);
    if (newFilters.sortOrder) params.set("sortOrder", newFilters.sortOrder);
    
    params.set("page", "1"); // Reset to first page when filtering
    params.set("limit", limit.toString());

    router.push(`/todos?${params.toString()}`);
  };

  // Memoized filter handlers to prevent unnecessary re-renders
  const handleSearchChange = useMemo(() => (term: string) => {
    const newFilters = { ...filters, search: term || undefined };
    setFilters(newFilters);
    updateURL(newFilters);
  }, [filters]);

  const handleStatusChange = useMemo(() => (val: "all" | "true" | "false") => {
    const newFilters = {
      ...filters,
      completed: val === "all" ? undefined : val === "true",
    };
    setFilters(newFilters);
    updateURL(newFilters);
  }, [filters]);

  const handlePriorityChange = useMemo(() => (val: Priority | "all") => {
    const newFilters = {
      ...filters,
      priority: val === "all" ? undefined : val,
    };
    setFilters(newFilters);
    updateURL(newFilters);
  }, [filters]);

  const handleSortChange = useMemo(() => (sort: SortOption) => {
    const newFilters = { ...filters, ...sort };
    setFilters(newFilters);
    updateURL(newFilters);
  }, [filters]);

  // Enhanced TodoList with optimistic updates
  const todoListProps = useMemo(() => ({
    todo: {
      data: todos,
      pagination: pagination,
    },
    loading,
    onToggleComplete: toggleComplete,
    onUpdateTodo: updateTodo,
    onDeleteTodo: deleteTodo,
    onRefresh: fetchTodos,
  }), [todos, pagination, loading, toggleComplete, updateTodo, deleteTodo, fetchTodos]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={fetchTodos}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Searchbar onSearch={handleSearchChange} />
        <StatusFilter
          value={
            filters.completed === undefined
              ? "all"
              : (filters.completed.toString() as "true" | "false")
          }
          onChange={handleStatusChange}
        />
        <PriorityFilter
          value={filters.priority || "all"}
          onChange={handlePriorityChange}
        />
        <SortFilter
          value={{ sortBy: filters.sortBy, sortOrder: filters.sortOrder }}
          onSortChange={handleSortChange}
        />
      </div>

      <TodoList {...todoListProps} />
      
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

export default OptimizedFilterContainer;
