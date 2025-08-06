"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Clock, Edit, Trash2, Search, Loader2, Calendar, Save, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDistanceToNow, format } from "date-fns";
import { Todo, Priority } from "@/lib/types";
import axios from "axios";
import { useRouter } from "next/navigation";

export interface TodoListProps {
  todo: {
    data: Todo[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  loading?: boolean;
  onSearch?: (term: string) => void;
  onRefresh?: () => void;
  onToggleComplete?: (id: string) => Promise<void>;
  onUpdateTodo?: (id: string, updates: Partial<Todo>) => Promise<void>;
  onDeleteTodo?: (id: string) => Promise<void>;
}

const priorityColors = {
  LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  MEDIUM:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  URGENT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const priorityIcons = {
  LOW: "🟢",
  MEDIUM: "🟡",
  HIGH: "🟠",
  URGENT: "🔴",
};

const getDueDateStatus = (dueDate?: Date) => {
  if (!dueDate) return null;
  const now = new Date();
  const due = new Date(dueDate);
  if (due < now) return { label: "Overdue", color: "text-red-500" };
  return { label: "Upcoming", color: "text-green-500" };
};

interface EditTodoData {
  title: string;
  description: string;
  priority: Priority;
  category: string;
  dueDate: string;
}

const TodoList = ({ 
  todo, 
  loading = false, 
  onRefresh,
  onToggleComplete,
  onUpdateTodo,
  onDeleteTodo 
}: TodoListProps) => {
  const router = useRouter();
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editData, setEditData] = useState<EditTodoData>({
    title: "",
    description: "",
    priority: "MEDIUM",
    category: "",
    dueDate: "",
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [updatingTodos, setUpdatingTodos] = useState<Set<string>>(new Set());

  const filteredTodos = todo?.data || [];

  const handleToggleComplete = async (todoItem: Todo) => {
    if (updatingTodos.has(todoItem.id)) return;
    
    setUpdatingTodos(prev => new Set([...prev, todoItem.id]));
    
    try {
      if (onToggleComplete) {
        await onToggleComplete(todoItem.id);
      } else {
        // Fallback to direct API call
        await axios.put(`/api/todos/${todoItem.id}`, {
          completed: !todoItem.completed
        }, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Refresh the todos list
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error: any) {
      console.error('Error updating todo:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setUpdatingTodos(prev => {
        const newSet = new Set(prev);
        newSet.delete(todoItem.id);
        return newSet;
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (onDeleteTodo) {
        await onDeleteTodo(id);
      } else {
        // Fallback to direct API call
        await axios.delete(`/api/todos/${id}`, {
          withCredentials: true
        });

        // Refresh the todos list
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error: any) {
      console.error('Error deleting todo:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    }
  };

  const handleEdit = (todoItem: Todo) => {
    setEditingTodo(todoItem);
    setEditData({
      title: todoItem.title,
      description: todoItem.description || "",
      priority: todoItem.priority,
      category: todoItem.category || "",
      dueDate: todoItem.dueDate ? format(new Date(todoItem.dueDate), "yyyy-MM-dd") : "",
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTodo) return;

    try {
      const updateData = {
        title: editData.title,
        description: editData.description || undefined,
        priority: editData.priority,
        category: editData.category || undefined,
        dueDate: editData.dueDate ? new Date(editData.dueDate) : undefined,
      };

      if (onUpdateTodo) {
        await onUpdateTodo(editingTodo.id, updateData);
      } else {
        // Fallback to direct API call
        const apiData = {
          ...updateData,
          dueDate: updateData.dueDate ? updateData.dueDate.toISOString() : undefined,
        };
        
        await axios.put(`/api/todos/${editingTodo.id}`, apiData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // Refresh the todos list
        if (onRefresh) {
          onRefresh();
        }
      }

      setIsEditDialogOpen(false);
      setEditingTodo(null);
    } catch (error: any) {
      console.error('Error updating todo:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Loading todos...</p>
        </CardContent>
      </Card>
    );
  }

  if (!filteredTodos || filteredTodos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Results
          </h3>
          <p className="text-muted-foreground text-center">
            Try adjusting your search or filters to find what you're looking
            for.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {filteredTodos.map((todoItem) => {
        const dueDateStatus = getDueDateStatus(todoItem.dueDate);
        const isUpdating = updatingTodos.has(todoItem.id);

        return (
          <Card
            key={todoItem.id}
            className={`transition-all hover:shadow-md ${
              todoItem.completed ? "opacity-70" : ""
            } ${isUpdating ? "opacity-50" : ""}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Checkbox
                    checked={todoItem.completed}
                    onCheckedChange={() => handleToggleComplete(todoItem)}
                    className="mt-1"
                    disabled={isUpdating}
                  />
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-medium ${
                        todoItem.completed
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {todoItem.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge className={priorityColors[todoItem.priority]}>
                        {priorityIcons[todoItem.priority]}
                        <span className="ml-1">{todoItem.priority}</span>
                      </Badge>
                      {todoItem.category && (
                        <Badge variant="outline">{todoItem.category}</Badge>
                      )}
                      {dueDateStatus && (
                        <div
                          className={`flex items-center text-xs ${dueDateStatus.color}`}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {dueDateStatus.label}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(todoItem)}
                    disabled={isUpdating}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isUpdating}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your todo.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(todoItem.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>

            {todoItem.description && (
              <CardContent className="pt-0">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {todoItem.description}
                  </ReactMarkdown>
                </div>
              </CardContent>
            )}

            <CardFooter className="text-xs text-muted-foreground pt-0">
              Created{" "}
              {formatDistanceToNow(new Date(todoItem.createdAt), {
                addSuffix: true,
              })}
              {todoItem.dueDate && (
                <>
                  {" • "}
                  Due {format(new Date(todoItem.dueDate), "MMM d, yyyy")}
                </>
              )}
            </CardFooter>
          </Card>
        );
      })}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Todo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter todo title"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter todo description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority
              </label>
              <Select
                value={editData.priority}
                onValueChange={(value: Priority) => setEditData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">🟢 Low</SelectItem>
                  <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                  <SelectItem value="HIGH">🟠 High</SelectItem>
                  <SelectItem value="URGENT">🔴 Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <Input
                id="category"
                value={editData.category}
                onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Enter category (optional)"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="dueDate" className="text-sm font-medium">
                Due Date
              </label>
              <Input
                id="dueDate"
                type="date"
                value={editData.dueDate}
                onChange={(e) => setEditData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TodoList;
