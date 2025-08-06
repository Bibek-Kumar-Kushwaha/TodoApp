"use client";

import React from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { TodoCreate } from "@/lib/types";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import { Textarea } from "../ui/textarea";
import { useRouter } from "next/navigation";

interface HeaderProps {
  todoCount?: number;
  pendingCount?: number;
  onTodoAdded?: () => void;
}

const Header = ({ todoCount = 0, pendingCount = 0, onTodoAdded }: HeaderProps) => {
  const router = useRouter();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Setup form
  const createForm = useForm({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "MEDIUM" as const,
      dueDate: "",
    },
  });

  const handleCreateTodo = async (data: any) => {
    setLoading(true);
    try {
      // Basic validation
      if (!data.title?.trim()) {
        alert('Title is required');
        return;
      }

      await axios.post("/api/todos", {
        title: data.title.trim(),
        priority: data.priority,
        description: data.description?.trim() || undefined,
        category: data.category?.trim() || undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        completed: false,
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setIsAddDialogOpen(false);
      createForm.reset();
      
      // Trigger refresh in parent component
      if (onTodoAdded) {
        onTodoAdded();
      }
    } catch (error: any) {
      console.error("Failed to create todo:", error);
      
      if (error.response?.status === 401) {
        router.push('/login');
      }

      if (error.response?.data?.details) {
        console.error("Validation issues:", error.response.data.details);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Todos</h1>
          <p className="text-muted-foreground mt-2">
            {todoCount} total, {pendingCount} pending
          </p>
        </div>

        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Todo
        </Button>
      </div>
      {/* Add Todo Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={createForm.handleSubmit(handleCreateTodo)}>
            <DialogHeader>
              <DialogTitle>Add Todo</DialogTitle>
              <DialogDescription>
                Create a new todo item with optional due date and priority.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                <Input
                  {...createForm.register('title')}
                  placeholder="Enter todo title..."
                />
                {createForm.formState.errors.title && (
                  <p className="text-sm text-red-600 mt-1">
                    {createForm.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  {...createForm.register('description')}
                  placeholder="Add description (supports Markdown)..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
                  <Controller
                    name="priority"
                    control={createForm.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">LOW</SelectItem>
                          <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                          <SelectItem value="HIGH">HIGH</SelectItem>
                          <SelectItem value="URGENT">URGENT</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                  <Input
                    {...createForm.register('category')}
                    placeholder="e.g., Work, Personal..."
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dueDate" className="text-sm font-medium">DueDate</Label>
                <Input
                  type="date"
                  {...createForm.register('dueDate')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Loading...": "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Header;
