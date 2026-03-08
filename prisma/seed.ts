// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('password123', 10)

    // 1. Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@chess.com' },
        update: {},
        create: {
            email: 'admin@chess.com',
            name: 'Admin User',
            password,
            role: 'ADMIN',
        },
    })

    // 2. Create Coach
    const coach = await prisma.user.upsert({
        where: { email: 'coach@chess.com' },
        update: {},
        create: {
            email: 'coach@chess.com',
            name: 'Grandmaster John',
            password,
            role: 'COACH',
        },
    })

    // 3. Create Student
    await prisma.user.upsert({
        where: { email: 'student@chess.com' },
        update: {},
        create: {
            email: 'student@chess.com',
            name: 'Bobby Fischer Jr',
            password,
            role: 'STUDENT',
            coachId: coach.id // Assign to coach
        },
    })

    // 4. Create Content Folder
    const rootFolder = await prisma.folder.create({
        data: { name: 'Chess Basics' }
    })

    // 5. Create a Sample Puzzle
    await prisma.puzzle.create({
        data: {
            title: 'Mate in 1',
            fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
            solution: 'e7e5',
            difficulty: 'BEGINNER',
            folderId: rootFolder.id
        }
    })

    console.log('Database seeded!')
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect())