"use client";

import ProtectedRoute from '@/components/Auth/ProtectedRoute'
import OptimizedFilterContainer from '@/components/Todo/OptimizedFilterContainer'
import Header from '@/components/Todo/Header'
import React, { useState, useCallback, useMemo } from 'react'
import { Todo } from '@/lib/types'

const Todos: React.FC = () => {
  const [todoStats, setTodoStats] = useState({ total: 0, pending: 0 });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTodoAdded = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleStatsUpdate = useCallback((todos: Todo[]) => {
    const newStats = {
      total: todos.length,
      pending: todos.filter(t => !t.completed).length
    };
    
    // Only update if stats actually changed to prevent infinite loops
    setTodoStats(prevStats => {
      const hasChanged = prevStats.total !== newStats.total || prevStats.pending !== newStats.pending;
      return hasChanged ? newStats : prevStats;
    });
  }, []);

  // Memoize the props to prevent unnecessary re-renders
  const headerProps = useMemo(() => ({
    todoCount: todoStats.total,
    pendingCount: todoStats.pending,
    onTodoAdded: handleTodoAdded,
  }), [todoStats.total, todoStats.pending, handleTodoAdded]);

  const containerProps = useMemo(() => ({
    refreshTrigger,
    onStatsUpdate: handleStatsUpdate,
  }), [refreshTrigger, handleStatsUpdate]);

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header {...headerProps} />
        <OptimizedFilterContainer {...containerProps} />
      </div>
    </ProtectedRoute>
  )
}

export default Todos
