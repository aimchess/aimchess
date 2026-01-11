import { NextResponse } from 'next/server'
// import { db } from '@/lib/db' 

export async function GET() {
  try {
    // REAL DB CALL: Fetch ALL folders to populate the move list
    /*
    const folders = await db.content.findMany({
      where: { type: 'FOLDER' },
      select: { id: true, name: true } // Only need ID and Name
    })
    return NextResponse.json(folders)
    */

    // --- MOCK DATA ---
    return NextResponse.json([
        { id: 'f1', name: 'Mating Patterns' },
        { id: 'f2', name: 'Openings' },
        { id: 'f3', name: 'Endgames' }
    ])

  } catch (error) {
    return NextResponse.json({ error: 'Error fetching folders' }, { status: 500 })
  }
}