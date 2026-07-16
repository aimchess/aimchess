import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Chess } from "chess.js";

export async function POST(req: Request, { params }: { params: { gameId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!currentUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        const { move, fen, pgn } = await req.json();

        const game = await prisma.game.findUnique({
            where: { id: params.gameId }
        });

        if (!game) {
            return new NextResponse("Game not found", { status: 404 });
        }

        // Verify the user is a player
        if (game.whiteId !== currentUser.id && game.blackId !== currentUser.id) {
            return new NextResponse("Not a player in this game", { status: 403 });
        }

        // Check if game is already over
        const chess = new Chess();
        if (game.fen) chess.load(game.fen);
        
        if (chess.isGameOver()) {
            return new NextResponse("Game is already over", { status: 400 });
        }

        // Apply the move to verify it
        try {
            chess.move(move);
        } catch (e) {
            return new NextResponse("Invalid move", { status: 400 });
        }

        // Determine if game is over after this move
        let status = "IN_PROGRESS";
        let result = null;
        let winnerId = null;

        if (chess.isCheckmate()) {
            status = "COMPLETED";
            if (chess.turn() === 'w') {
                result = "0-1";
                winnerId = game.blackId;
            } else {
                result = "1-0";
                winnerId = game.whiteId;
            }
        } else if (chess.isGameOver()) { // Draw, Stalemate, etc.
            status = "COMPLETED";
            result = "1/2-1/2";
        }

        const updatedGame = await prisma.game.update({
            where: { id: params.gameId },
            data: {
                fen: chess.fen(),
                pgn: chess.pgn(),
                status,
                result,
                winnerId
            }
        });

        // Rating Updates and Tournament Scoring Logic
        if (status === "COMPLETED") {
            const isRatedGame = game.isRated || !!game.tournamentId;
            
            // Tournament Scoring
            if (game.tournamentId) {
                if (winnerId) {
                    await prisma.tournamentParticipant.update({
                        where: {
                            tournamentId_userId: {
                                tournamentId: game.tournamentId,
                                userId: winnerId
                            }
                        },
                        data: { score: { increment: 1 } }
                    });
                } else {
                    await prisma.tournamentParticipant.update({
                        where: {
                            tournamentId_userId: {
                                tournamentId: game.tournamentId,
                                userId: game.whiteId
                            }
                        },
                        data: { score: { increment: 0.5 } }
                    });
                    await prisma.tournamentParticipant.update({
                        where: {
                            tournamentId_userId: {
                                tournamentId: game.tournamentId,
                                userId: game.blackId
                            }
                        },
                        data: { score: { increment: 0.5 } }
                    });
                }
            }

            // AIM Rating System
            if (isRatedGame) {
                const white = await prisma.user.findUnique({ where: { id: game.whiteId } });
                const black = await prisma.user.findUnique({ where: { id: game.blackId } });

                if (white && black) {
                    let whiteChange = 0;
                    let blackChange = 0;
                    let whiteOutcome: 'win' | 'loss' | 'draw';
                    let blackOutcome: 'win' | 'loss' | 'draw';

                    if (winnerId === game.whiteId) {
                        whiteChange = 15;
                        blackChange = -8;
                        whiteOutcome = 'win';
                        blackOutcome = 'loss';
                    } else if (winnerId === game.blackId) {
                        whiteChange = -8;
                        blackChange = 15;
                        whiteOutcome = 'loss';
                        blackOutcome = 'win';
                    } else {
                        whiteChange = 5;
                        blackChange = 5;
                        whiteOutcome = 'draw';
                        blackOutcome = 'draw';
                    }

                    const updatePlayerRating = async (player: any, change: number, outcome: 'win' | 'loss' | 'draw') => {
                        const newRating = Math.max(100, player.aimRating + change); // rating floor at 100
                        const newHighest = Math.max(player.highestAimRating, newRating);
                        
                        const oldHistory = Array.isArray(player.aimRatingHistory) ? player.aimRatingHistory : [];
                        const newHistory = [...oldHistory, { rating: newRating, date: new Date().toISOString() }];

                        const getClubInfo = (r: number) => {
                            if (r >= 2000) return { club: "AIM 2000 Club", level: "Grandmaster Level" };
                            if (r >= 1800) return { club: "AIM 1800 Club", level: "Master Level" };
                            if (r >= 1600) return { club: "AIM 1600 Club", level: "Champion Level" };
                            if (r >= 1400) return { club: "AIM 1400 Club", level: "Elite Level" };
                            if (r >= 1200) return { club: "AIM 1200 Club", level: "Platinum Level" };
                            if (r >= 1000) return { club: "AIM 1000 Club", level: "Gold Level" };
                            if (r >= 800) return { club: "AIM 800 Club", level: "Silver Level" };
                            if (r >= 600) return { club: "AIM 600 Club", level: "Bronze Level" };
                            return { club: "Beginner", level: "Starter Level" };
                        };

                        const { club: newClub, level: newLevel } = getClubInfo(newRating);
                        const clubUnlocked = newClub !== player.aimClub && newRating > player.aimRating;

                        await prisma.user.update({
                            where: { id: player.id },
                            data: {
                                aimRating: newRating,
                                highestAimRating: newHighest,
                                wins: outcome === 'win' ? { increment: 1 } : undefined,
                                losses: outcome === 'loss' ? { increment: 1 } : undefined,
                                draws: outcome === 'draw' ? { increment: 1 } : undefined,
                                aimRatingHistory: newHistory,
                                aimClub: newClub,
                                aimLevel: newLevel,
                                aimClubDate: clubUnlocked ? new Date() : undefined
                            }
                        });

                        if (clubUnlocked) {
                            // Create Certificate
                            await prisma.certificate.create({
                                data: {
                                    studentId: player.id,
                                    type: "AIM_CLUB",
                                    clubName: newClub,
                                    status: "PENDING"
                                }
                            });

                            // Create Notification
                            await prisma.notification.create({
                                data: {
                                    userId: player.id,
                                    title: "New Rating Club Unlocked!",
                                    message: `Congratulations! You joined the ${newClub} (${newLevel}). Your certificate is ready.`
                                }
                            });
                        }
                    };

                    await updatePlayerRating(white, whiteChange, whiteOutcome);
                    await updatePlayerRating(black, blackChange, blackOutcome);
                }
            }
        }

        return NextResponse.json(updatedGame);
    } catch (error) {
        console.error("Failed to make move:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
