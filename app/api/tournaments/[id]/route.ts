import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Helper to auto-pair participants in a tournament into live games
async function pairTournamentParticipants(tournamentId: string, timeControl: string) {
    try {
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, name: true, lastActiveAt: true } }
                    }
                }
            }
        });

        if (!tournament || tournament.participants.length < 2) return 0;

        // Find participants who are not currently in an in-progress game for this tournament
        const activeGames = await prisma.game.findMany({
            where: {
                tournamentId: tournamentId,
                status: "IN_PROGRESS"
            },
            select: { whiteId: true, blackId: true }
        });

        const busyUserIds = new Set<string>();
        activeGames.forEach((g: any) => {
            if (g.whiteId) busyUserIds.add(g.whiteId);
            if (g.blackId) busyUserIds.add(g.blackId);
        });

        // Filter available participants and sort by score descending for Swiss-style pairing
        const availableParticipants = tournament.participants
            .filter((p: any) => !busyUserIds.has(p.userId))
            .sort((a: any, b: any) => b.score - a.score);
            
        if (availableParticipants.length < 2) return 0;

        // Fetch all games (completed or in progress) in this tournament to avoid pairing players who already played
        const allTournamentGames = await prisma.game.findMany({
            where: { tournamentId: tournamentId },
            select: { whiteId: true, blackId: true }
        });

        // Map containing set of opponent IDs for each player
        const playHistory = new Map<string, Set<string>>();
        allTournamentGames.forEach((g: any) => {
            if (g.whiteId && g.blackId) {
                if (!playHistory.has(g.whiteId)) playHistory.set(g.whiteId, new Set());
                if (!playHistory.has(g.blackId)) playHistory.set(g.blackId, new Set());
                playHistory.get(g.whiteId)!.add(g.blackId);
                playHistory.get(g.blackId)!.add(g.whiteId);
            }
        });

        let createdCount = 0;
        const pairedUserIds = new Set<string>();

        // Try to pair players
        for (let i = 0; i < availableParticipants.length; i++) {
            const p1 = availableParticipants[i];
            if (pairedUserIds.has(p1.userId)) continue;

            // Find the best opponent for p1 (someone they haven't played yet)
            let bestOpponentIndex = -1;
            const p1History = playHistory.get(p1.userId) || new Set<string>();

            for (let j = i + 1; j < availableParticipants.length; j++) {
                const p2 = availableParticipants[j];
                if (pairedUserIds.has(p2.userId)) continue;

                // Candidate found. If they haven't played, choose them immediately
                if (!p1History.has(p2.userId)) {
                    bestOpponentIndex = j;
                    break;
                }
            }

            // Fallback: If everyone available has already played p1, pair with the first unpaired available participant
            if (bestOpponentIndex === -1) {
                for (let j = i + 1; j < availableParticipants.length; j++) {
                    const p2 = availableParticipants[j];
                    if (!pairedUserIds.has(p2.userId)) {
                        bestOpponentIndex = j;
                        break;
                    }
                }
            }

            if (bestOpponentIndex !== -1) {
                const p2 = availableParticipants[bestOpponentIndex];
                pairedUserIds.add(p1.userId);
                pairedUserIds.add(p2.userId);

                const isP1White = Math.random() < 0.5;
                const whiteId = isP1White ? p1.userId : p2.userId;
                const blackId = isP1White ? p2.userId : p1.userId;

                const tc = timeControl || "10+0";
                const minutes = parseInt(tc.split("+")[0]) || 10;
                const initialMs = minutes * 60 * 1000;

                await prisma.game.create({
                    data: {
                        whiteId: whiteId,
                        blackId: blackId,
                        timeControl: tc,
                        tournamentId: tournamentId,
                        status: "IN_PROGRESS",
                        whiteTimeLeft: initialMs,
                        blackTimeLeft: initialMs,
                        lastMoveAt: new Date(),
                        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                        pgn: ""
                    }
                });

                createdCount++;

                // Create notifications for both players
                await prisma.notification.createMany({
                    data: [
                        {
                            userId: p1.userId,
                            title: "Tournament Match Started! ⚔️",
                            message: `Your round match against ${p2.user.name} is starting now!`
                        },
                        {
                            userId: p2.userId,
                            title: "Tournament Match Started! ⚔️",
                            message: `Your round match against ${p1.user.name} is starting now!`
                        }
                    ]
                });
            }
        }

        return createdCount;
    } catch (err) {
        console.error("[TOURNAMENT_AUTO_PAIR_ERROR]", err);
        return 0;
    }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        let tournament = await prisma.tournament.findUnique({
            where: { id: params.id },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, name: true, lastActiveAt: true } }
                    },
                    orderBy: {
                        score: 'desc'
                    }
                }
            }
        });

        if (!tournament) {
            return new NextResponse("Tournament not found", { status: 404 });
        }

        // Auto transition to ONGOING if start time reached
        if (tournament.status === "UPCOMING" && new Date(tournament.startDate) <= new Date()) {
            tournament = await prisma.tournament.update({
                where: { id: params.id },
                data: { status: "ONGOING" },
                include: {
                    participants: {
                        include: {
                            user: { select: { id: true, name: true, lastActiveAt: true } }
                        },
                        orderBy: {
                            score: 'desc'
                        }
                    }
                }
            });

            // Automatically pair online participants
            await pairTournamentParticipants(params.id, tournament.timeControl || "10+0");
        }

        return NextResponse.json(tournament);
    } catch (error) {
        console.error("Failed to fetch tournament details:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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

        const body = await req.json();
        const { action, status, timeControl } = body;

        let tournament = await prisma.tournament.findUnique({
            where: { id: params.id }
        });

        if (!tournament) {
            return new NextResponse("Tournament not found", { status: 404 });
        }

        if (action === "START" || status === "ONGOING") {
            tournament = await prisma.tournament.update({
                where: { id: params.id },
                data: { 
                    status: "ONGOING",
                    ...(timeControl ? { timeControl } : {})
                }
            });

            // Create initial pairings
            const created = await pairTournamentParticipants(params.id, tournament.timeControl || "10+0");

            return NextResponse.json({ tournament, message: `Tournament started! Paired ${created} matches.`, createdMatches: created });
        }

        if (action === "PAIR_ROUND") {
            const created = await pairTournamentParticipants(params.id, tournament.timeControl || "10+0");
            return NextResponse.json({ tournament, message: `Paired ${created} matches for current round.`, createdMatches: created });
        }

        if (action === "COMPLETE" || status === "COMPLETED") {
            tournament = await prisma.tournament.update({
                where: { id: params.id },
                data: { status: "COMPLETED" }
            });
            return NextResponse.json({ tournament, message: "Tournament marked as completed." });
        }

        return new NextResponse("Invalid action", { status: 400 });
    } catch (error) {
        console.error("Failed to update tournament:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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

        // Clean up associated games and challenges first
        await prisma.game.deleteMany({
            where: { tournamentId: params.id }
        });

        await prisma.challenge.deleteMany({
            where: { tournamentId: params.id }
        });

        // Delete tournament (will cascade delete participants)
        await prisma.tournament.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ message: "Tournament deleted successfully." });
    } catch (error) {
        console.error("Failed to delete tournament:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
