import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        performanceReports: true,
        whiteGames: { where: { status: "COMPLETED" } },
        blackGames: { where: { status: "COMPLETED" } }
      }
    });

    // 1. AIM Rating Leaderboard
    const ratingLeaderboard = [...students]
      .sort((a, b) => b.aimRating - a.aimRating)
      .map(s => ({
        id: s.id,
        name: s.name,
        photoUrl: s.photoUrl,
        stage: s.stage,
        score: s.aimRating,
        label: "AIM Rating"
      }));

    // 2. Monthly Performance Points
    const performanceLeaderboard = [...students]
      .map(s => {
        const latestReport = s.performanceReports[0]; // assuming latest is first
        return {
          id: s.id,
          name: s.name,
          photoUrl: s.photoUrl,
          stage: s.stage,
          score: latestReport ? latestReport.totalPoints : 0,
          label: "Performance Points"
        };
      })
      .sort((a, b) => b.score - a.score);

    // 3. Monthly Rating Gain
    const ratingGainLeaderboard = [...students]
      .map(s => {
        let gain = 0;
        const history = Array.isArray(s.aimRatingHistory) ? (s.aimRatingHistory as any[]) : [];
        if (history.length > 0) {
          // Calculate gain in current month
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const historyThisMonth = history.filter(h => new Date(h.date) >= startOfMonth);
          if (historyThisMonth.length > 0) {
            const startRating = historyThisMonth[0].rating;
            const currentRating = s.aimRating;
            gain = Math.max(0, currentRating - startRating);
          }
        }
        return {
          id: s.id,
          name: s.name,
          photoUrl: s.photoUrl,
          stage: s.stage,
          score: gain,
          label: "Rating Gained"
        };
      })
      .sort((a, b) => b.score - a.score);

    // 4. Most Games Played
    const gamesPlayedLeaderboard = [...students]
      .map(s => {
        const total = s.wins + s.losses + s.draws;
        return {
          id: s.id,
          name: s.name,
          photoUrl: s.photoUrl,
          stage: s.stage,
          score: total,
          label: "Games Played"
        };
      })
      .sort((a, b) => b.score - a.score);

    // 5. Highest Win Percentage
    const winPercentageLeaderboard = [...students]
      .map(s => {
        const total = s.wins + s.losses + s.draws;
        const pct = total > 0 ? Math.round((s.wins / total) * 100) : 0;
        return {
          id: s.id,
          name: s.name,
          photoUrl: s.photoUrl,
          stage: s.stage,
          score: pct,
          label: "Win Rate %"
        };
      })
      .sort((a, b) => b.score - a.score);

    // 6. Longest Winning Streak (Mock/Calculated from wins count or history)
    const winningStreakLeaderboard = [...students]
      .map(s => {
        // Calculate streak: check recent games
        let streak = 0;
        const games = [...s.whiteGames, ...s.blackGames].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        for (const g of games) {
          if (g.winnerId === s.id) {
            streak++;
          } else {
            break;
          }
        }
        return {
          id: s.id,
          name: s.name,
          photoUrl: s.photoUrl,
          stage: s.stage,
          score: streak,
          label: "Wins Streak"
        };
      })
      .sort((a, b) => b.score - a.score);

    // 7. Best Attendance
    const attendanceLeaderboard = [...students]
      .map(s => {
        const latestReport = s.performanceReports[0];
        return {
          id: s.id,
          name: s.name,
          photoUrl: s.photoUrl,
          stage: s.stage,
          score: latestReport ? latestReport.attendancePoints : 0,
          label: "Attendance Points"
        };
      })
      .sort((a, b) => b.score - a.score);

    // 8. Homework Leader
    const homeworkLeaderboard = [...students]
      .map(s => {
        const latestReport = s.performanceReports[0];
        return {
          id: s.id,
          name: s.name,
          photoUrl: s.photoUrl,
          stage: s.stage,
          score: latestReport ? latestReport.homeworkPoints : 0,
          label: "Homework Points"
        };
      })
      .sort((a, b) => b.score - a.score);

    return NextResponse.json({
      rating: ratingLeaderboard,
      performance: performanceLeaderboard,
      ratingGain: ratingGainLeaderboard,
      gamesPlayed: gamesPlayedLeaderboard,
      winPercentage: winPercentageLeaderboard,
      winningStreak: winningStreakLeaderboard,
      attendance: attendanceLeaderboard,
      homework: homeworkLeaderboard
    });
  } catch (error) {
    console.error("[LEADERBOARD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
