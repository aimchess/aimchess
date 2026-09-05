import prisma from "@/lib/prisma";

export async function pairTournamentParticipants(tournamentId: string, timeControl: string, roundNum: number) {
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

        // 1. Get all games already created for THIS round (including in-progress, completed, and BYEs)
        const gamesInThisRound = await prisma.game.findMany({
            where: {
                tournamentId: tournamentId,
                round: roundNum
            },
            select: { whiteId: true, blackId: true }
        });

        const pairedUserIdsInThisRound = new Set<string>();
        gamesInThisRound.forEach((g: any) => {
            if (g.whiteId) pairedUserIdsInThisRound.add(g.whiteId);
            if (g.blackId) pairedUserIdsInThisRound.add(g.blackId);
        });

        // 2. Filter available participants who have NOT yet been paired for THIS roundNum
        const availableParticipants = tournament.participants
            .filter((p: any) => !pairedUserIdsInThisRound.has(p.userId))
            .sort((a: any, b: any) => b.score - a.score);

        if (availableParticipants.length < 2) {
            // If there is exactly 1 leftover participant who hasn't been paired for this round:
            if (availableParticipants.length === 1) {
                const leftover = availableParticipants[0];

                // Create a BYE game record to prevent duplicate BYE assignments for this round
                await prisma.game.create({
                    data: {
                        whiteId: leftover.userId,
                        blackId: leftover.userId,
                        timeControl: timeControl || "10+0",
                        tournamentId: tournamentId,
                        status: "COMPLETED",
                        result: "1-0 (BYE)",
                        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                        pgn: "1. BYE",
                        round: roundNum
                    }
                });

                await prisma.tournamentParticipant.update({
                    where: {
                        tournamentId_userId: {
                            tournamentId: tournamentId,
                            userId: leftover.userId
                        }
                    },
                    data: { score: { increment: 1.0 } }
                });

                await prisma.notification.create({
                    data: {
                        userId: leftover.userId,
                        title: "Tournament Round BYE ⌛",
                        message: `You received a BYE for Round ${roundNum}. You automatically receive 1.0 point for this round.`
                    }
                });
            }
            return 0;
        }

        // 3. Fetch all tournament games to avoid repeat pairings across rounds if possible
        const allTournamentGames = await prisma.game.findMany({
            where: { tournamentId: tournamentId },
            select: { whiteId: true, blackId: true }
        });

        const playHistory = new Map<string, Set<string>>();
        allTournamentGames.forEach((g: any) => {
            if (g.whiteId && g.blackId && g.whiteId !== g.blackId) {
                if (!playHistory.has(g.whiteId)) playHistory.set(g.whiteId, new Set());
                if (!playHistory.has(g.blackId)) playHistory.set(g.blackId, new Set());
                playHistory.get(g.whiteId)!.add(g.blackId);
                playHistory.get(g.blackId)!.add(g.whiteId);
            }
        });

        let createdCount = 0;
        const newlyPairedUserIds = new Set<string>();

        // 4. Swiss Pairing Algorithm
        for (let i = 0; i < availableParticipants.length; i++) {
            const p1 = availableParticipants[i];
            if (newlyPairedUserIds.has(p1.userId)) continue;

            let bestOpponentIndex = -1;
            const p1History = playHistory.get(p1.userId) || new Set<string>();

            for (let j = i + 1; j < availableParticipants.length; j++) {
                const p2 = availableParticipants[j];
                if (newlyPairedUserIds.has(p2.userId)) continue;

                if (!p1History.has(p2.userId)) {
                    bestOpponentIndex = j;
                    break;
                }
            }

            if (bestOpponentIndex === -1) {
                for (let j = i + 1; j < availableParticipants.length; j++) {
                    const p2 = availableParticipants[j];
                    if (!newlyPairedUserIds.has(p2.userId)) {
                        bestOpponentIndex = j;
                        break;
                    }
                }
            }

            if (bestOpponentIndex !== -1) {
                const p2 = availableParticipants[bestOpponentIndex];
                newlyPairedUserIds.add(p1.userId);
                newlyPairedUserIds.add(p2.userId);

                const isP1White = Math.random() < 0.5;
                const whiteId = isP1White ? p1.userId : p2.userId;
                const blackId = isP1White ? p2.userId : p1.userId;

                const tc = timeControl || "10+0";
                const minutes = parseInt(tc.split("+")[0]) || 10;
                const initialMs = minutes * 60 * 1000;

                await prisma.game.create({
                    data: {
                        whiteId,
                        blackId,
                        timeControl: tc,
                        tournamentId,
                        status: "IN_PROGRESS",
                        whiteTimeLeft: initialMs,
                        blackTimeLeft: initialMs,
                        lastMoveAt: new Date(),
                        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                        pgn: "",
                        round: roundNum
                    }
                });

                createdCount++;

                await prisma.notification.createMany({
                    data: [
                        {
                            userId: p1.userId,
                            title: "Tournament Match Started! ⚔️",
                            message: `Your round ${roundNum} match against ${p2.user.name} is starting now!`
                        },
                        {
                            userId: p2.userId,
                            title: "Tournament Match Started! ⚔️",
                            message: `Your round ${roundNum} match against ${p1.user.name} is starting now!`
                        }
                    ]
                });
            }
        }

        // 5. Award BYE to unpaired leftover participant for this round
        for (let i = 0; i < availableParticipants.length; i++) {
            const p = availableParticipants[i];
            if (!newlyPairedUserIds.has(p.userId)) {
                await prisma.game.create({
                    data: {
                        whiteId: p.userId,
                        blackId: p.userId,
                        timeControl: timeControl || "10+0",
                        tournamentId: tournamentId,
                        status: "COMPLETED",
                        result: "1-0 (BYE)",
                        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                        pgn: "1. BYE",
                        round: roundNum
                    }
                });

                await prisma.tournamentParticipant.update({
                    where: {
                        tournamentId_userId: {
                            tournamentId: tournamentId,
                            userId: p.userId
                        }
                    },
                    data: { score: { increment: 1.0 } }
                });

                await prisma.notification.create({
                    data: {
                        userId: p.userId,
                        title: "Tournament Round BYE ⌛",
                        message: `You received a BYE for Round ${roundNum}. You automatically receive 1.0 point for this round.`
                    }
                });
            }
        }

        return createdCount;
    } catch (err) {
        console.error("[TOURNAMENT_AUTO_PAIR_ERROR]", err);
        return 0;
    }
}

export async function syncTournamentScores(tournamentId: string) {
    try {
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId },
            include: {
                participants: true,
                games: true
            }
        });

        if (!tournament) return;

        for (const participant of tournament.participants) {
            const playerGames = tournament.games.filter(g => 
                g.status === "COMPLETED" && (g.whiteId === participant.userId || g.blackId === participant.userId)
            );

            let calculatedScore = 0;

            playerGames.forEach(g => {
                if (g.result?.includes("BYE") || (g.whiteId === g.blackId && g.whiteId === participant.userId)) {
                    calculatedScore += 1.0;
                } else if (g.winnerId === participant.userId) {
                    calculatedScore += 1.0;
                } else if (!g.winnerId && (g.result === "1/2-1/2" || g.result?.includes("1/2"))) {
                    calculatedScore += 0.5;
                }
            });

            // Cap calculated score at maximum possible rounds elapsed
            const maxPossible = Math.min(tournament.currentRound, tournament.totalRounds);
            if (calculatedScore > maxPossible) {
                calculatedScore = maxPossible;
            }

            if (participant.score !== calculatedScore) {
                await prisma.tournamentParticipant.update({
                    where: {
                        tournamentId_userId: {
                            tournamentId: tournamentId,
                            userId: participant.userId
                        }
                    },
                    data: { score: calculatedScore }
                });
            }
        }
    } catch (err) {
        console.error("[SYNC_TOURNAMENT_SCORES_ERROR]", err);
    }
}
