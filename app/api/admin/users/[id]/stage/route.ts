import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { stage } = await req.json()

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { stage }
    })

    if (stage !== 'NONE') {
      await prisma.enrollment.upsert({
        where: {
          userId_stage: {
            userId: params.id,
            stage
          }
        },
        update: {},
        create: {
          userId: params.id,
          stage
        }
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user stage:', error)
    return NextResponse.json(
      { error: 'Failed to update user stage' },
      { status: 500 }
    )
  }
}
