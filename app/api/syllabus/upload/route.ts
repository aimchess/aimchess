import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Chess } from "chess.js";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (currentUser?.role !== "ADMIN") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return new NextResponse("No file uploaded", { status: 400 });
        }

        const pgnText = await file.text();
        
        // Simple regex to split PGN file into individual games. 
        // A new game usually starts with an [Event "xxx"] tag.
        const games = pgnText.split(/(?=\[Event ".*?"\])/g).filter(g => g.trim().length > 0);

        if (games.length === 0) {
            return new NextResponse("No games found in PGN", { status: 400 });
        }

        // Try to get a course title from the first game's Event tag
        let courseTitle = "Uploaded PGN Course";
        const eventMatch = games[0].match(/\[Event "(.*?)"\]/);
        if (eventMatch && eventMatch[1]) {
            courseTitle = eventMatch[1];
        } else {
            courseTitle = file.name.replace(".pgn", "");
        }

        const course = await prisma.course.create({
            data: {
                title: courseTitle,
                description: "Auto-generated from PGN upload.",
                level: "BEGINNER"
            }
        });

        const chapterPromises = [];
        for (let i = 0; i < games.length; i++) {
            const gameText = games[i].trim();
            const chess = new Chess();
            
            let fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"; // Default starting pos
            
            try {
                // Try to load the PGN to validate and get the final FEN. 
                // Note: For a "chapter/lesson", usually you want the starting position or specific moments. 
                // But for now, we'll store the PGN in the content, and the starting FEN of the puzzle.
                // Since `content` in our schema holds the text, we'll put the PGN there.
                chess.loadPgn(gameText);
            } catch (e) {
                // Ignore parse errors for individual games and just save the text
            }

            // Extract White/Black for title if possible
            let chapterTitle = `Chapter ${i + 1}`;
            const whiteMatch = gameText.match(/\[White "(.*?)"\]/);
            const blackMatch = gameText.match(/\[Black "(.*?)"\]/);
            if (whiteMatch && blackMatch) {
                chapterTitle = `${whiteMatch[1]} vs ${blackMatch[1]}`;
            }

            chapterPromises.push(
                prisma.chapter.create({
                    data: {
                        title: chapterTitle,
                        content: gameText, // Store the raw PGN in content
                        fen: fen, 
                        order: i + 1,
                        courseId: course.id
                    }
                })
            );
        }

        const createdChapters = await Promise.all(chapterPromises);

        return NextResponse.json({ course: { ...course, chapters: createdChapters } });
    } catch (error) {
        console.error("Failed to upload syllabus:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
