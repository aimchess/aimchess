import prisma from "@/lib/prisma";

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

                // If activeGames.length is > 0, it means some players are still playing their games for the current round
                if (activeGames.length === 0) {
                    // All games are completed for this round!
                    // Increment the round count
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

                        // Filter participants and sort by score descending for Swiss system pairing
                        const availableParticipants = [...tournament.participants].sort((a: any, b: any) => b.score - a.score);

                        if (availableParticipants.length >= 2) {
                            const allTournamentGames = await prisma.game.findMany({
                                where: { tournamentId: tournament.id },
                                select: { whiteId: true, blackId: true }
                            });

                            const playHistory = new Map<string, Set<string>>();
                            allTournamentGames.forEach((g: any) => {
                                if (g.whiteId && g.blackId) {
                                    if (!playHistory.has(g.whiteId)) playHistory.set(g.whiteId, new Set());
                                    if (!playHistory.has(g.blackId)) playHistory.set(g.blackId, new Set());
                                    playHistory.get(g.whiteId)!.add(g.blackId);
                                    playHistory.get(g.blackId)!.add(g.whiteId);
                                }
                            });

                            const pairedUserIds = new Set<string>();
                            for (let i = 0; i < availableParticipants.length; i++) {
                                const p1 = availableParticipants[i];
                                if (pairedUserIds.has(p1.userId)) continue;

                                let bestOpponentIndex = -1;
                                const p1History = playHistory.get(p1.userId) || new Set<string>();

                                for (let j = i + 1; j < availableParticipants.length; j++) {
                                    const p2 = availableParticipants[j];
                                    if (pairedUserIds.has(p2.userId)) continue;

                                    if (!p1History.has(p2.userId)) {
                                        bestOpponentIndex = j;
                                        break;
                                    }
                                }

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

                                    const tc = tournament.timeControl || "10+0";
                                    const minutes = parseInt(tc.split("+")[0]) || 10;
                                    const initialMs = minutes * 60 * 1000;

                                    await prisma.game.create({
                                        data: {
                                            whiteId,
                                            blackId,
                                            timeControl: tc,
                                            tournamentId: tournament.id,
                                            status: "IN_PROGRESS",
                                            whiteTimeLeft: initialMs,
                                            blackTimeLeft: initialMs,
                                            lastMoveAt: new Date(),
                                            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                                            pgn: "",
                                            round: updatedRound
                                        }
                                    });

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

                            // Award BYEs to leftover participants
                            for (let i = 0; i < availableParticipants.length; i++) {
                                const p = availableParticipants[i];
                                if (!pairedUserIds.has(p.userId)) {
                                    await prisma.tournamentParticipant.update({
                                        where: {
                                            tournamentId_userId: {
                                                tournamentId: tournament.id,
                                                userId: p.userId
                                            }
                                        },
                                        data: {
                                            score: { increment: 1.0 }
                                        }
                                    });

                                    await prisma.notification.create({
                                        data: {
                                            userId: p.userId,
                                            title: "Tournament Round BYE ⌛",
                                            message: `You received a BYE for Round ${updatedRound}. You automatically receive 1.0 point for this round.`
                                        }
                                    });
                                }
                            }
                        }
                    }
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
