"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Todo, Priority } from '@/lib/types';

interface UseTodosFilters {
  search?: string;
  completed?: boolean;
  priority?: Priority;
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
}

interface UseTodosReturn {
  todos: Todo[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  loading: boolean;
  error: string | null;
  fetchTodos: () => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
}

export const useTodos = (
  filters: UseTodosFilters,
  page: number = 1,
  limit: number = 5
): UseTodosReturn => {
  const router = useRouter();
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
  const [error, setError] = useState<string | null>(null);

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.set("search", filters.search);
      if (filters.completed !== undefined) params.set("completed", filters.completed.toString());
      if (filters.priority) params.set("priority", filters.priority);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
      
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
      
      // Parse dates properly
      const parsedTodos: Todo[] = data.map((todo: any) => ({
        ...todo,
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        createdAt: todo.createdAt ? new Date(todo.createdAt) : new Date(),
        updatedAt: todo.updatedAt ? new Date(todo.updatedAt) : new Date(),
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
    } catch (e: any) {
      console.error('Error fetching todos:', e);
      setError('Failed to fetch todos');
      
      if (e.response?.status === 401) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [
    filters.search, 
    filters.completed, 
    filters.priority, 
    filters.sortBy, 
    filters.sortOrder, 
    page, 
    limit, 
    router
  ]);

  // Optimistic update for toggle complete
  const toggleComplete = useCallback(async (id: string) => {
    // Optimistic update
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === id 
          ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
          : todo
      )
    );

    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      await axios.put(`/api/todos/${id}`, {
        completed: !todo.completed
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error: any) {
      // Revert optimistic update on error
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.id === id 
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      );
      
      console.error('Error updating todo:', error);
      setError('Failed to update todo');
      
      if (error.response?.status === 401) {
        router.push('/login');
      }
    }
  }, [todos, router]);

  // Update todo with optimistic updates
  const updateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    // Optimistic update
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === id 
          ? { ...todo, ...updates, updatedAt: new Date() }
          : todo
      )
    );

    try {
      // Convert Date to ISO string for API
      const apiUpdates = {
        ...updates,
        dueDate: updates.dueDate ? updates.dueDate.toISOString() : updates.dueDate
      };
      
      await axios.put(`/api/todos/${id}`, apiUpdates, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error: any) {
      // Revert optimistic update on error and refetch
      await fetchTodos();
      console.error('Error updating todo:', error);
      setError('Failed to update todo');
      
      if (error.response?.status === 401) {
        router.push('/login');
      }
    }
  }, [fetchTodos, router]);

  // Delete todo with optimistic updates
  const deleteTodo = useCallback(async (id: string) => {
    // Optimistic update
    const originalTodos = [...todos];
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));

    try {
      await axios.delete(`/api/todos/${id}`, {
        withCredentials: true
      });
    } catch (error: any) {
      // Revert optimistic update on error
      setTodos(originalTodos);
      console.error('Error deleting todo:', error);
      setError('Failed to delete todo');
      
      if (error.response?.status === 401) {
        router.push('/login');
      }
    }
  }, [todos, router]);

  // Effect to fetch todos when dependencies change
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Memoize the return value to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    todos,
    pagination,
    loading,
    error,
    fetchTodos,
    updateTodo,
    deleteTodo,
    toggleComplete,
  }), [todos, pagination, loading, error, fetchTodos, updateTodo, deleteTodo, toggleComplete]);

  return returnValue;
};
