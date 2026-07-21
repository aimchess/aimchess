import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const coach = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!coach || (coach.role !== "COACH" && coach.role !== "ADMIN")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Fetch coach's students
    const students = await prisma.user.findMany({
      where: { coachId: coach.id, role: "STUDENT" },
      include: {
        performanceReports: {
          orderBy: { createdAt: "desc" }
        },
        certificates: {
          where: { status: "PENDING" }
        },
        assignments: {
          where: { isCompleted: false },
          include: {
            puzzle: true,
            mcq: true
          }
        },
        attendanceRecords: {
          take: 20,
          orderBy: { date: "desc" }
        }
      }
    });

    // 1. Gold, Silver, Bronze stars eligibility (latest report)
    const goldEligible = [];
    const silverEligible = [];
    const bronzeEligible = [];

    // 2. Rating Club Certificates eligibility
    const certEligible = [];

    // 3. Low Attendance (< 75% present rate of marked classes or < 3 classes)
    const lowAttendance = [];

    // 4. Homework Pending
    const homeworkPendingList = [];

    // 5. Assignment Pending
    const assignmentPendingList = [];

    // 6. Highest Monthly Rating Gain
    let highestGainPlayer = null;
    let maxGain = -999;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    for (const s of students) {
      // Stars eligibility
      const latestReport = s.performanceReports[0];
      if (latestReport) {
        if (latestReport.totalPoints >= 90) goldEligible.push(s);
        else if (latestReport.totalPoints >= 80) silverEligible.push(s);
        else if (latestReport.totalPoints >= 70) bronzeEligible.push(s);
      }

      // Cert eligibility
      const pendingCerts = s.certificates.filter((c: any) => c.type === "AIM_CLUB");
      if (pendingCerts.length > 0) {
        certEligible.push({ student: s, certs: pendingCerts });
      }

      // Attendance check
      const totalMarked = s.attendanceRecords.length;
      const presentCount = s.attendanceRecords.filter((r: any) => r.status === "PRESENT").length;
      const attendanceRate = totalMarked > 0 ? (presentCount / totalMarked) : 1;
      if (attendanceRate < 0.75 && totalMarked > 0) {
        lowAttendance.push({ student: s, rate: Math.round(attendanceRate * 100), totalMarked });
      }

      // Homework and Assignment pending
      for (const a of s.assignments) {
        if (a.mcqId) {
          homeworkPendingList.push({ studentName: s.name, task: a.mcq.question, assignedAt: a.assignedAt });
        } else if (a.puzzleId) {
          assignmentPendingList.push({ studentName: s.name, task: a.puzzle.title, assignedAt: a.assignedAt });
        }
      }

      // Rating gain calculation
      let gain = 0;
      const history = Array.isArray(s.aimRatingHistory) ? (s.aimRatingHistory as any[]) : [];
      if (history.length > 0) {
        const historyThisMonth = history.filter((h: any) => new Date(h.date) >= startOfMonth);
        if (historyThisMonth.length > 0) {
          gain = s.aimRating - historyThisMonth[0].rating;
        }
      }
      if (gain > maxGain) {
        maxGain = gain;
        highestGainPlayer = { name: s.name, gain };
      }
    }

    return NextResponse.json({
      goldEligible: goldEligible.map(s => ({ id: s.id, name: s.name })),
      silverEligible: silverEligible.map(s => ({ id: s.id, name: s.name })),
      bronzeEligible: bronzeEligible.map(s => ({ id: s.id, name: s.name })),
      certEligible: certEligible.map(c => ({ id: c.student.id, name: c.student.name, clubs: c.certs.map((x: any) => x.clubName) })),
      lowAttendance: lowAttendance.map(l => ({ name: l.student.name, rate: l.rate })),
      homeworkPending: homeworkPendingList,
      assignmentPending: assignmentPendingList,
      highestGain: highestGainPlayer && maxGain > 0 ? highestGainPlayer : null
    });
  } catch (error) {
    console.error("[COACH_DASHBOARD_API]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
