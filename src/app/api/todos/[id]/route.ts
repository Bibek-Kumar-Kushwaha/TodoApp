import { authenticateUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { TodoUpdateSchema } from "@/lib/types";

//Get specific todo by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = authenticateUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const params = await context.params;
    const todo = await prisma.todo.findUnique({
      where: {
        id: params.id,
        userId: authUser.userId,
      },
    });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Error fetching todo:", error);
    return NextResponse.json(
      { error: "Failed to fetch todo" },
      { status: 500 }
    );
  }
}

// Update a specific todo
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = authenticateUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const body = await request.json();

    // Transform date string to Date object if present
    const processedBody = {
      ...body,
      dueDate: body.dueDate ? new Date(body.dueDate) : body.dueDate
    };

    // Validate input
    const validateData = TodoUpdateSchema.parse(processedBody);
    const existingTodo = await prisma.todo.findUnique({
      where: {
        id: params.id,
        userId: authUser.userId,
      },
    });

    if (!existingTodo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    const updatedTodo = await prisma.todo.update({
      where: { id: params.id },
      data: {
        title: validateData.title,
        description: validateData.description,
        completed: validateData.completed,
        priority: validateData.priority,
        category: validateData.category,
        dueDate:
          validateData.dueDate !== undefined ? validateData.dueDate : undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error("Error updating todo:", error);
    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

// Delete a specific todo
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = authenticateUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const params = await context.params;

    //check if todo exist and belongs to the user
    const existingTodo = await prisma.todo.findUnique({
      where: {
        id: params.id,
        userId: authUser.userId,
      },
    });

    if (!existingTodo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    await prisma.todo.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "Todo deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting todo:", error);
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}
