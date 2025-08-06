import { z } from "zod";

//Priority enum for todos
export const PrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
export type Priority = z.infer<typeof PrioritySchema>

//User schemas
export const UserCreateSchema = z.object({
    name: z.string().min(2, "Name must be at least contains 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters")
})

export const UserLoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required")
})

export const UserUpdateSchema = z.object({
    name: z.string().min(2, "Name must be at least contains 2 characters").optional(),
    email: z.string().email("Invalid email address").optional(),
})


// Todo Schemas
export const TodoCreateSchema = z.object({
    title: z.string().min(1,"Title is required").max(200,"Title too long"),
    description: z.string().max(1000,"Description too long").optional(),
    priority: PrioritySchema.optional().default("MEDIUM"),
    category: z.string().max(50,"Category too long").optional(),
    dueDate: z.date().optional()
})

export const TodoUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long").optional(),
  description: z.string().max(1000, "Description too long").optional(),
  completed: z.boolean().optional(),
  priority: PrioritySchema.optional(),
  category: z.string().max(50, "Category too long").optional(),
  dueDate: z.date().optional(),
});

export const TodoFilterSchema = z.object({
    search: z.string().optional(),
    completed: z.boolean().optional(),
    priority: PrioritySchema.optional(),
    category: z.string().optional(),
    dueBefore: z.date().optional(),
    dueAfter: z.date().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(5),
    sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'title']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

//type for user
export type UserCreate = z.infer<typeof UserCreateSchema>
export type UserLogin = z.infer<typeof UserLoginSchema>
export type UserUpdate = z.infer<typeof UserUpdateSchema>

//type for todos
export type TodoCreate = z.infer<typeof TodoCreateSchema>
export type TodoUpdate = z.infer<typeof TodoUpdateSchema>
export type TodoFilter = z.infer<typeof TodoFilterSchema>

//Todo type from Prisma model
export interface Todo {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    priority: Priority;
    category?: string;
    dueDate?: Date;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

//API Response types
export interface ApiRespoonse<T = any>{
    success: boolean;
    date?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    date: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    }
}

