import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import z, { date } from "zod";
import prisma from "@/lib/prisma";
import { title } from "process";

// Get todo
export async function GET(request: NextRequest) {
  try {
    const authUser = authenticateUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    //Extract quary parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const search = searchParams.get('search') || '';
    const completed = searchParams.get('completed') === 'true' ? true : searchParams.get('completed') === 'false' ? false : null;
    const priority = searchParams.get('priority')?.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | null;
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';

    // filter by authenticated user
    const where: any = {
      userId: authUser.userId
    };

    if(search) {
      where.OR = [
        {title: {contains: search, mode: 'insensitive'} },
        {description: {contains: search, mode: 'insensitive'}},
      ];
    }

    if(completed !== null){
      where.completed = completed;
    }

    if(priority){
      where.priority = priority;
    }

    if(category){
      where.category = {contains: category, mode: 'insensitive'};
    }

    // pagination
    const skip = (page - 1) * limit;

    //get todos with pagination
    const [todos, totalCount] = await Promise.all([
      prisma.todo.findMany({
        where,
        orderBy: {[sortBy]: sortOrder},
        skip,
        take: limit,
      }),
      prisma.todo.count({where})
    ])

    const totalPages = Math.ceil(totalCount/limit);

    return NextResponse.json({
      data: todos,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}


//create a new todo
export async function POST(request: NextRequest) {
  try {
    const authUser = authenticateUser(request);

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const todoSchema = z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().optional(),
      completed: z.boolean().default(false),
      priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
      category: z.string().optional(),
      dueDate: z
        .string()
        .optional()
        .transform((val) => (val ? new Date(val) : null)),
    });

    //Validate input
    const validatedData = todoSchema.parse(body);

    const todo = await prisma.todo.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        completed: validatedData.completed,
        priority: validatedData.priority,
        category: validatedData.category,
        dueDate: validatedData.dueDate,
        userId: authUser.userId,
      },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating todo:", error);
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}
