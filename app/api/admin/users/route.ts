import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// ------------------------------
// GET — List all users
// ------------------------------
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      include: {
        coach: {
          select: { id: true, name: true },
        },
        _count: {
          select: { students: true },
        },
      },
    });

    return NextResponse.json(users);
  } catch (e) {
    console.error("GET Users Error:", e);
    return NextResponse.json(
      { error: "Failed to load users" },
      { status: 500 }
    );
  }
}

// ------------------------------
// POST — Create user
// ------------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      password,
      name,
      role,
      stage,
      coachId,
      status,
      joiningDate,
      birthDate,
      address,
      parentName,
      parentPhone,
      photoUrl,
      idCardUrl,
    } = body;

    // 1. Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Base user data
    const data: any = {
      name,
      email,
      password: hashedPassword,
      role,
      status: status || "ACTIVE",
    };

    // 4. Role-specific logic
    if (role === "STUDENT") {
      data.stage = stage || "BEGINNER";
      data.coachId =
        coachId && coachId.trim() !== "" ? coachId : null;

      if (joiningDate) data.joiningDate = new Date(joiningDate);
      if (birthDate) data.birthDate = new Date(birthDate);

      data.address = address || null;
      data.parentName = parentName || null;
      data.parentPhone = parentPhone || null;
      data.photoUrl = photoUrl || null;
      data.idCardUrl = idCardUrl || null;
    } else {
      // ADMIN or COACH
      data.stage = "BEGINNER";
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

    const {
      id,
      password,
      role,
      coachId,
      status,
      joiningDate,
      birthDate,
      address,
      parentName,
      parentPhone,
      photoUrl,
      idCardUrl,
      ...rest
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing user id" },
        { status: 400 }
      );
    }

    const data: any = { ...rest };

    if (status) data.status = status;

    if (password && password.trim() !== "") {
      data.password = await bcrypt.hash(password, 10);
    }

    if (joiningDate) data.joiningDate = new Date(joiningDate);
    if (birthDate) data.birthDate = new Date(birthDate);
    if (address !== undefined) data.address = address;
    if (parentName !== undefined) data.parentName = parentName;
    if (parentPhone !== undefined) data.parentPhone = parentPhone;
    if (photoUrl !== undefined) data.photoUrl = photoUrl;
    if (idCardUrl !== undefined) data.idCardUrl = idCardUrl;

    if (role) {
      data.role = role;

      if (role === "STUDENT") {
        data.coachId =
          coachId && coachId.trim() !== "" ? coachId : null;
      } else {
        data.coachId = null;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedUser);
  } catch (e) {
    console.error("Update User Error:", e);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// ------------------------------
// DELETE — Remove user
// ------------------------------
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing user id" },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete User Error:", e);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
