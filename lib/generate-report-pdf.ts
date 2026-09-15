import { jsPDF } from "jspdf";

export interface StudentReportData {
    month: number;
    year: number;
    attendancePoints?: number;
    homeworkPoints?: number;
    assignmentPoints?: number;
    tournamentPoints?: number;
    totalPoints?: number;
    award?: string | null;
    studentProgress?: string | null;
    strengths?: string | null;
    weaknesses?: string | null;
    behavior?: string | null;
    nextMonthFocus?: string | null;
    recommendation?: string | null;
}

export interface StudentProfileData {
    name?: string | null;
    aimLevel?: string | null;
    aimRating?: number | null;
    lichessRapid?: number | null;
    coach?: {
        name?: string | null;
    } | null;
}

/**
 * Generates and triggers download for the AIM Chess Academy Monthly Performance Report PDF.
 */
export const downloadReportPdf = (report: StudentReportData, student?: StudentProfileData) => {
    const doc = new jsPDF();
    const primaryColor = [11, 29, 58]; // Navy
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const monthIndex = Math.max(0, Math.min(11, (report.month || 1) - 1));
    const monthName = months[monthIndex];

    // Header Background
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 45, "F");

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("AIM CHESS ACADEMY", 15, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("ACHIEVE • INSPIRE • MAINTAIN", 15, 28);
    doc.text("MONTHLY PERFORMANCE REPORT", 15, 34);

    // Month
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`${monthName} ${report.year}`, 155, 20);

    // Student Card Info border
    doc.setDrawColor(212, 175, 55); // Gold
    doc.rect(15, 55, 180, 35);

    doc.setFontSize(10);
    doc.setTextColor(33, 37, 41);

    doc.setFont("helvetica", "bold");
    doc.text("Student Name:", 20, 63);
    doc.setFont("helvetica", "normal");
    doc.text(student?.name || "N/A", 50, 63);

    doc.setFont("helvetica", "bold");
    doc.text("Current Level:", 20, 71);
    doc.setFont("helvetica", "normal");
    doc.text(student?.aimLevel || "Starter Level", 50, 71);

    doc.setFont("helvetica", "bold");
    doc.text("AIM Rating:", 20, 79);
    doc.setFont("helvetica", "normal");
    doc.text(String(student?.aimRating || 500), 50, 79);

    doc.setFont("helvetica", "bold");
    doc.text("Coach Name:", 110, 63);
    doc.setFont("helvetica", "normal");
    doc.text(student?.coach?.name || "Unassigned", 140, 63);

    doc.setFont("helvetica", "bold");
    doc.text("Lichess Rapid:", 110, 71);
    doc.setFont("helvetica", "normal");
    doc.text(String(student?.lichessRapid || 1500), 140, 71);

    // Scorecard Section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("SCORECARD RATINGS", 15, 105);
    doc.line(15, 107, 195, 107);

    doc.setTextColor(33, 37, 41);
    doc.setFontSize(10);

    doc.setFont("helvetica", "bold");
    doc.text("Attendance Rating:", 20, 117);
    doc.setFont("helvetica", "normal");
    doc.text(`${report.attendancePoints || 0} / 40`, 70, 117);

    doc.setFont("helvetica", "bold");
    doc.text("Homework Score:", 20, 125);
    doc.setFont("helvetica", "normal");
    doc.text(`${report.homeworkPoints || 0} / 20`, 70, 125);

    doc.setFont("helvetica", "bold");
    doc.text("Assignment Score:", 110, 117);
    doc.setFont("helvetica", "normal");
    doc.text(`${report.assignmentPoints || 0} / 20`, 160, 117);

    doc.setFont("helvetica", "bold");
    doc.text("Tournament Score:", 110, 125);
    doc.setFont("helvetica", "normal");
    doc.text(`${report.tournamentPoints || 0} / 20`, 160, 125);

    // Total Rating points
    doc.setFillColor(240, 244, 248);
    doc.rect(15, 133, 180, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.text(`Total Score: ${report.totalPoints || 0} / 100`, 20, 141);
    doc.text(`Award: ${report.award || 'Participant'}`, 110, 141);

    // Written Assessment
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("COACH WRITTEN ASSESSMENT", 15, 160);
    doc.line(15, 162, 195, 162);

    doc.setTextColor(33, 37, 41);
    doc.setFontSize(9);

    const writeBlock = (title: string, textContent: string | null | undefined, yPos: number) => {
        doc.setFont("helvetica", "bold");
        doc.text(title + ":", 15, yPos);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(textContent || "No assessment written.", 185);
        doc.text(lines, 15, yPos + 5);
        return yPos + 7 + (lines.length * 4.5);
    };

    let nextY = 168;
    nextY = writeBlock("Student Progress", report.studentProgress, nextY);
    nextY = writeBlock("Key Strengths", report.strengths, nextY);
    nextY = writeBlock("Weaknesses / Areas of Improvement", report.weaknesses, nextY);
    nextY = writeBlock("Attitude & Behavior", report.behavior, nextY);
    nextY = writeBlock("Next Month Focus Areas", report.nextMonthFocus, nextY);
    nextY = writeBlock("Coach Recommendations", report.recommendation, nextY);

    // Signatures
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Soumen Banerjee", 150, 275);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Founder & Head Coach", 150, 279);
    doc.text("AIM Chess Academy", 150, 283);

    const safeStudentName = student?.name ? student.name.trim().replace(/[^a-zA-Z0-9_-]/g, '_') + '_' : '';
    doc.save(`AIM_Chess_Report_${safeStudentName}${monthName}_${report.year}.pdf`);
};
