import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { lichessUsername } = body;

        if (!lichessUsername) {
            return new NextResponse("Lichess username required", { status: 400 });
        }

        // Fetch from Lichess public API
        const lichessRes = await fetch(`https://lichess.org/api/user/${lichessUsername}`, {
            headers: { 
                'Accept': 'application/json',
                'User-Agent': 'AIM-Chess-Academy-CRM/1.0 (academyaimchess@gmail.com)'
            },
            cache: 'no-store'
        });

        if (!lichessRes.ok) {
            return NextResponse.json({ error: "Lichess user not found or Lichess API error" }, { status: 404 });
        }

        const data = await lichessRes.json();
        
        const perfs = data.perfs || {};
        const rapid = perfs.rapid?.rating || 1500;
        const blitz = perfs.blitz?.rating || 1500;
        const bullet = perfs.bullet?.rating || 1500;
        const puzzle = perfs.puzzle?.rating || 1500;

        // Fetch user from DB to compare highest ratings
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const newHighestRapid = Math.max(user.highestLichessRapid, rapid);
        const newHighestBlitz = Math.max(user.highestLichessBlitz, blitz);
        const newHighestBullet = Math.max(user.highestLichessBullet, bullet);
        const newHighestPuzzle = Math.max(user.highestLichessPuzzle, puzzle);

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                lichessUsername,
                lichessRapid: rapid,
                lichessBlitz: blitz,
                lichessBullet: bullet,
                lichessPuzzle: puzzle,
                highestLichessRapid: newHighestRapid,
                highestLichessBlitz: newHighestBlitz,
                highestLichessBullet: newHighestBullet,
                highestLichessPuzzle: newHighestPuzzle
            }
        });

        return NextResponse.json({
            success: true,
            ratings: {
                rapid,
                blitz,
                bullet,
                puzzle
            }
        });

    } catch (error) {
        console.error("Lichess sync error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
