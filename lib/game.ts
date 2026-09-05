import prisma from "@/lib/prisma";
import { pairTournamentParticipants, syncTournamentScores } from "@/lib/tournament";

export async function completeGame({
    gameId,
    winnerId,
    result,
    status = "COMPLETED",
    fen,
    pgn,
    whiteTimeLeft,
    blackTimeLeft,
    lastMoveAt
}: {
    gameId: string;
    winnerId: string | null;
    result: string | null;
    status?: string;
    fen?: string | null;
    pgn?: string | null;
    whiteTimeLeft?: number | null;
    blackTimeLeft?: number | null;
    lastMoveAt?: Date | null;
}) {
    // 1. Fetch game details first to get whiteId, blackId, isRated, tournamentId
    const game = await prisma.game.findUnique({
        where: { id: gameId }
    });

    if (!game) return null;

    // Guard: Prevent double-scoring if game is already completed
    if (game.status === "COMPLETED") {
        return game;
    }

    // 2. Update the Game status
    const updatedGame = await prisma.game.update({
        where: { id: gameId },
        data: {
            status: status as any,
            result,
            winnerId,
            ...(fen ? { fen } : {}),
            ...(pgn ? { pgn } : {}),
            ...(whiteTimeLeft !== undefined ? { whiteTimeLeft } : {}),
            ...(blackTimeLeft !== undefined ? { blackTimeLeft } : {}),
            ...(lastMoveAt !== undefined ? { lastMoveAt } : {})
        },
        include: {
            white: { select: { id: true, name: true, email: true, role: true } },
            black: { select: { id: true, name: true, email: true, role: true } }
        }
    });

    // 3. Tournament Scoring
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

        // Check if all games of the current round are finished, and only then auto-pair the next round
        try {
            const tournament = await prisma.tournament.findUnique({
                where: { id: game.tournamentId },
                include: {
                    participants: {
                        include: {
                            user: { select: { id: true, name: true } }
                        }
                    }
                }
            });

            if (tournament && tournament.status === "ONGOING" && tournament.participants.length >= 2) {
                // Check if there are any active games left in this tournament
                const activeGames = await prisma.game.findMany({
                    where: {
                        tournamentId: tournament.id,
                        status: "IN_PROGRESS"
                    },
                    select: { id: true }
                });

                // If activeGames.length is 0, all games are completed for this round!
                if (activeGames.length === 0) {
                    const updatedRound = tournament.currentRound + 1;
                    
                    if (updatedRound > tournament.totalRounds) {
                        // Tournament completed!
                        await prisma.tournament.update({
                            where: { id: tournament.id },
                            data: { status: "COMPLETED" }
                        });
                        console.log(`[TOURNAMENT] Completed tournament ${tournament.id} after all rounds finished.`);
                    } else {
                        // Advance to the next round
                        await prisma.tournament.update({
                            where: { id: tournament.id },
                            data: { currentRound: updatedRound }
                        });

                        // Pair next round using centralized Swiss pairing
                        await pairTournamentParticipants(tournament.id, tournament.timeControl || "10+0", updatedRound);
                    }

                    // Keep tournament scores synchronized
                    await syncTournamentScores(tournament.id);
                }
            }
        } catch (pairErr) {
            console.error("[AUTO_PAIR_AFTER_GAME_COMPLETE_ERROR]", pairErr);
        }
    }

    // 4. AIM Rating System
    const isRatedGame = (game.isRated || !!game.tournamentId) && !game.isBot;
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
                blackChange = -10;
                whiteOutcome = 'win';
                blackOutcome = 'loss';
            } else if (winnerId === game.blackId) {
                whiteChange = -10;
                blackChange = 15;
                whiteOutcome = 'loss';
                blackOutcome = 'win';
            } else {
                whiteChange = 4;
                blackChange = 4;
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

    return updatedGame;
}
