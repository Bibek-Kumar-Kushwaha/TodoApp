"use client";

import ProtectedRoute from '@/components/Auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { CalendarDays, CheckCircle, Clock, AlertTriangle, TrendingUp, Users, Target } from 'lucide-react'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Todo } from '@/lib/types'
import { formatDistanceToNow, format, isAfter, isBefore, addDays } from 'date-fns'

interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  priorityBreakdown: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
}

const Dashboard: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    dueToday: 0,
    dueThisWeek: 0,
    priorityBreakdown: { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [recentTodos, setRecentTodos] = useState<Todo[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/todos?limit=100', {
        withCredentials: true
      });

      const todosData: Todo[] = response.data?.data?.map((todo: any) => ({
        ...todo,
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
      })) || [];

      setTodos(todosData);
      calculateStats(todosData);
      setRecentTodos(todosData.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (todosData: Todo[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = addDays(today, 7);

    const total = todosData.length;
    const completed = todosData.filter(todo => todo.completed).length;
    const pending = total - completed;
    
    const overdue = todosData.filter(todo => 
      !todo.completed && todo.dueDate && isBefore(todo.dueDate, today)
    ).length;
    
    const dueToday = todosData.filter(todo => 
      !todo.completed && todo.dueDate && 
      todo.dueDate >= today && todo.dueDate < addDays(today, 1)
    ).length;
    
    const dueThisWeek = todosData.filter(todo => 
      !todo.completed && todo.dueDate && 
      todo.dueDate >= today && todo.dueDate <= weekFromNow
    ).length;

    const priorityBreakdown = todosData.reduce((acc, todo) => {
      if (!todo.completed) {
        acc[todo.priority]++;
      }
      return acc;
    }, { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 });

    setStats({
      total,
      completed,
      pending,
      overdue,
      dueToday,
      dueThisWeek,
      priorityBreakdown
    });
  };

  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const priorityColors = {
    LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    URGENT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Overview of your productivity and todo management
            </p>
          </div>
          <Button asChild className="mt-4 sm:mt-0">
            <Link href="/todos">
              Manage Todos
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pending} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                {completionRate.toFixed(1)}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Today</CardTitle>
              <CalendarDays className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.dueToday}</div>
              <p className="text-xs text-muted-foreground">
                {stats.dueThisWeek} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress and Priority Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Completion Progress</CardTitle>
              <CardDescription>Your overall task completion rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{completionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="ml-2 font-medium text-green-600">{stats.completed}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pending:</span>
                    <span className="ml-2 font-medium text-orange-600">{stats.pending}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Priority Breakdown</CardTitle>
              <CardDescription>Tasks by priority level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.priorityBreakdown).map(([priority, count]) => (
                  <div key={priority} className="flex items-center justify-between">
                    <Badge className={priorityColors[priority as keyof typeof priorityColors]}>
                      {priority}
                    </Badge>
                    <span className="text-sm font-medium">{count} tasks</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Your latest todo items</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTodos.length > 0 ? (
              <div className="space-y-4">
                {recentTodos.map(todo => (
                  <div key={todo.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        todo.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <div>
                        <p className={`font-medium ${
                          todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                        }`}>
                          {todo.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(todo.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={priorityColors[todo.priority]}>
                        {todo.priority}
                      </Badge>
                      {todo.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          Due {format(todo.dueDate, 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <div className="text-center pt-4">
                  <Button variant="outline" asChild>
                    <Link href="/todos">View All Tasks</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tasks found</p>
                <Button asChild className="mt-4">
                  <Link href="/todos">Create Your First Task</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
