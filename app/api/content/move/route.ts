import { NextResponse } from 'next/server'
import prisma from "@/lib/prisma"

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { itemId, targetFolderId } = body

    if (!itemId || !targetFolderId) {
      return NextResponse.json({ error: 'Missing Data' }, { status: 400 })
    }

    const folderId = targetFolderId === 'root' ? null : targetFolderId;

    // Check if item is Folder
    const isFolder = await prisma.folder.findUnique({
      where: { id: itemId }
    });

    if (isFolder) {
      const updated = await prisma.folder.update({
        where: { id: itemId },
        data: { parentId: folderId }
      });
      return NextResponse.json(updated);
    }

    // Check if item is MCQ
    const isMCQ = await prisma.mCQ.findUnique({
      where: { id: itemId }
    });

    if (isMCQ) {
      const updated = await prisma.mCQ.update({
        where: { id: itemId },
        data: { folderId }
      });
      return NextResponse.json(updated);
    }

    // Must be Puzzle
    const updated = await prisma.puzzle.update({
      where: { id: itemId },
      data: { folderId }
    });
    return NextResponse.json(updated);

  } catch (error) {
    console.error("Move error:", error);
    return NextResponse.json({ error: 'Error moving item' }, { status: 500 })
  }
}
