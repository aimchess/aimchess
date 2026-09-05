import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { pairTournamentParticipants, syncTournamentScores } from "@/lib/tournament";

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
                },
                games: {
                    include: {
                        white: { select: { id: true, name: true, email: true, role: true } },
                        black: { select: { id: true, name: true, email: true, role: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!tournament) {
            return new NextResponse("Tournament not found", { status: 404 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!currentUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        if (tournament.coachId) {
            const hasAccess = 
                currentUser.role === "ADMIN" ||
                (currentUser.role === "COACH" && currentUser.id === tournament.coachId) ||
                (currentUser.role === "STUDENT" && currentUser.coachId === tournament.coachId);
            
            if (!hasAccess) {
                return new NextResponse("Forbidden", { status: 403 });
            }
        }

        // Auto transition to ONGOING if start time reached
        if (tournament.status === "UPCOMING" && new Date(tournament.startDate) <= new Date()) {
            await prisma.tournament.update({
                where: { id: params.id },
                data: { status: "ONGOING" }
            });

            // Automatically pair online participants
            await pairTournamentParticipants(params.id, tournament.timeControl || "10+0", tournament.currentRound);
        }

        // Synchronize and heal any corrupted or duplicate participant scores
        await syncTournamentScores(params.id);

        // Re-fetch clean tournament data with synced scores
        tournament = await prisma.tournament.findUnique({
            where: { id: params.id },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, name: true, lastActiveAt: true } }
                    },
                    orderBy: {
                        score: 'desc'
                    }
                },
                games: {
                    include: {
                        white: { select: { id: true, name: true, email: true, role: true } },
                        black: { select: { id: true, name: true, email: true, role: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

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

        const body = await req.json();
        const { action, status, timeControl } = body;

        let tournament = await prisma.tournament.findUnique({
            where: { id: params.id }
        });

        if (!tournament) {
            return new NextResponse("Tournament not found", { status: 404 });
        }

        if (currentUser?.role !== "ADMIN" && !(currentUser?.role === "COACH" && tournament.coachId === currentUser.id)) {
            return new NextResponse("Forbidden", { status: 403 });
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
            const created = await pairTournamentParticipants(params.id, tournament.timeControl || "10+0", tournament.currentRound);

            return NextResponse.json({ tournament, message: `Tournament started! Paired ${created} matches.`, createdMatches: created });
        }

        if (action === "PAIR_ROUND") {
            const created = await pairTournamentParticipants(params.id, tournament.timeControl || "10+0", tournament.currentRound);
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

        const tournament = await prisma.tournament.findUnique({
            where: { id: params.id }
        });

        if (!tournament) {
            return new NextResponse("Tournament not found", { status: 404 });
        }

        if (currentUser?.role !== "ADMIN" && !(currentUser?.role === "COACH" && tournament.coachId === currentUser.id)) {
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
