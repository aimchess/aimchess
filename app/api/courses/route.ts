import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: List all courses
export async function GET() {
  const courses = await prisma.course.findMany({
    include: { chapters: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(courses)
}

// POST: Create a NEW Course
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, level, description, chapters, audioUrl } = body

    const newCourse = await prisma.course.create({
      data: {
        title,
        level,
        description,
        audioUrl: audioUrl || null,
        chapters: {
          create: chapters?.map((c: any, index: number) => ({
            title: c.title,
            content: c.content,
            fen: c.fen,
            order: index
          })) || []
        }
      }
    })
    return NextResponse.json(newCourse)
  } catch (error) {
    console.error("Course Create Error:", error)
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}

// PUT: Update EXISTING Course
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, title, level, description, chapters, audioUrl } = body

    if (!id) return NextResponse.json({ error: 'Course ID required' }, { status: 400 })

    // Transaction to update course and replace chapters
    const updated = await prisma.$transaction(async (tx: any) => {
      // 1. Update basic info
      const course = await tx.course.update({
        where: { id },
        data: { title, level, description, audioUrl: audioUrl || null }
      })

      // 2. Delete old chapters (Simplest strategy for editing)
      await tx.chapter.deleteMany({ where: { courseId: id } })

      // 3. Create new chapters
      if (chapters && chapters.length > 0) {
        await tx.chapter.createMany({
          data: chapters.map((c: any, index: number) => ({
            title: c.title,
            content: c.content,
            fen: c.fen,
            order: index,
            courseId: id
          }))
        })
      }
      return course
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Course Update Error:", error)
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
  }
}

// DELETE: Remove a Course
export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { id } = body

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await prisma.course.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Course Delete Error:", error)
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}