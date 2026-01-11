import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// ------------------------------
// GET — List all users
// ------------------------------
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' },
      include: {
        coach: {
          select: { id: true, name: true }
        },
        _count: { 
          select: { students: true } 
        }
      }
    });

    return NextResponse.json(users);
  } catch (e) {
    console.error("GET Users Error:", e);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}

// ------------------------------
// POST — Create user
// ------------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Added 'status' to destructuring
    const { email, password, name, role, stage, coachId, status } = body;

    // 1. Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Prepare user data
    const data: any = {
      name,
      email,
      password: hashedPassword,
      role,
      status: status || "ACTIVE", // Default to ACTIVE if not provided
    };

    // 4. Role specific logic
    if (role === "STUDENT") {
      data.stage = stage || "BEGINNER";
      // Ensure empty strings are converted to null for optional relations
      data.coachId = coachId && coachId.trim() !== "" ? coachId : null;
    } else {
      data.stage = "BEGINNER"; // Default fallback
      data.coachId = null;
    }

    // 5. Create user
    const user = await prisma.user.create({ data });
    return NextResponse.json(user);

  } catch (e: any) {
    console.error("Create User Error:", e);

    if (e.code === "P2002") {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

// ------------------------------
// PUT — Update user
// ------------------------------
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    // Added 'status' to destructuring so we can explicitly handle it if needed
    const { id, password, role, coachId, status, ...rest } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    // Start with the generic rest properties (name, email, stage, etc.)
    const data: any = { ...rest };

    // Explicitly add status if it was sent in the body
    if (status) {
        data.status = status;
    }

    // Hash new password if provided
    if (password && password.trim() !== "") {
      data.password = await bcrypt.hash(password, 10);
    }

    // Handle Role & Coach logic
    if (role) {
      data.role = role;
      if (role === "STUDENT") {
         data.coachId = coachId && coachId.trim() !== "" ? coachId : null;
      } else {
        // If changing to Coach/Admin, remove student-specific links
        data.coachId = null;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data
    });

    return NextResponse.json(updatedUser);

  } catch (e) {
    console.error("Update User Error:", e);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// ------------------------------
// DELETE — Remove user
// ------------------------------
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete User Error:", e);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}