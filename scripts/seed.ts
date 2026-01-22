import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@Royal Rook.com' },
    update: {},
    create: {
      email: 'admin@Royal Rooks.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      stage: 'ADVANCED'
    }
  })

  console.log('Created admin user:', admin.email)

  const puzzles = [
    {
      title: 'Back Rank Mate',
      description: 'Find the checkmate in one move',
      fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
      solution: 'a1a8',
      stage: 'BEGINNER',
      difficulty: 2,
      category: 'Checkmate',
      order: 1
    },
    {
      title: 'Fork the King and Queen',
      description: 'Win the queen with a knight fork',
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
      solution: 'f3g5',
      stage: 'BEGINNER',
      difficulty: 3,
      category: 'Tactics',
      order: 2
    },
    {
      title: 'Pin and Win',
      description: 'Use a pin to win material',
      fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
      solution: 'f1e1',
      stage: 'INTERMEDIATE',
      difficulty: 5,
      category: 'Tactics',
      order: 1
    },
    {
      title: 'Sacrifice to Checkmate',
      description: 'Find the forcing sequence',
      fen: 'r2qk2r/ppp2ppp/2n5/2bppb2/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 1',
      solution: 'c4f7',
      stage: 'ADVANCED',
      difficulty: 8,
      category: 'Combinations',
      order: 1
    }
  ]

  for (const puzzle of puzzles) {
    await prisma.puzzle.upsert({
      where: { id: puzzle.title },
      update: puzzle as any,
      create: puzzle as any
    })
  }

  console.log('Created sample puzzles')
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
