import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { parseMultiGamePgn } from "@/lib/pgn-syllabus";

// GET: Returns list of existing courses with chapter summaries
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const courses = await prisma.course.findMany({
            include: {
                chapters: {
                    select: {
                        id: true,
                        title: true,
                        order: true,
                        fen: true
                    },
                    orderBy: { order: "asc" }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(courses);
    } catch (error) {
        console.error("Failed to fetch syllabus courses:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST: Handles PGN preview or direct course creation
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (currentUser?.role !== "ADMIN" && currentUser?.role !== "COACH") {
            return new NextResponse("Forbidden: Admin or Coach access required", { status: 403 });
        }

        const contentType = req.headers.get("content-type") || "";

        // Check if JSON request (e.g. confirming preview or reparsing)
        if (contentType.includes("application/json")) {
            const body = await req.json();

            // Action: Repair an existing course's chapters from their stored PGNs
            if (body.action === "REPAIR_COURSE" && body.courseId) {
                const targetCourse = await prisma.course.findUnique({
                    where: { id: body.courseId },
                    include: { chapters: true }
                });

                if (!targetCourse) {
                    return new NextResponse("Course not found", { status: 404 });
                }

                // Concatenate or parse each chapter's content
                const fullPgn = targetCourse.chapters
                    .map((ch: any) => ch.content)
                    .filter(Boolean)
                    .join("\n\n");

                const parsed = parseMultiGamePgn(fullPgn, targetCourse.title);

                await prisma.$transaction(async (tx: any) => {
                    // Update course level if currently BEGINNER and detected level is higher
                    if (parsed.suggestedLevel && targetCourse.level === "BEGINNER") {
                        await tx.course.update({
                            where: { id: targetCourse.id },
                            data: { level: parsed.suggestedLevel }
                        });
                    }

                    // Update chapters concurrently
                    const updatePromises = [];
                    for (let i = 0; i < targetCourse.chapters.length; i++) {
                        const ch = targetCourse.chapters[i];
                        const matchedParsed = parsed.chapters[i];
                        if (matchedParsed) {
                            updatePromises.push(
                                tx.chapter.update({
                                    where: { id: ch.id },
                                    data: {
                                        title: matchedParsed.title,
                                        order: matchedParsed.order,
                                        fen: matchedParsed.fen
                                    }
                                })
                            );
                        }
                    }
                    await Promise.all(updatePromises);
                }, { timeout: 30000, maxWait: 10000 });

                const updatedCourse = await prisma.course.findUnique({
                    where: { id: targetCourse.id },
                    include: { chapters: { orderBy: { order: "asc" } } }
                });

                return NextResponse.json({ success: true, course: updatedCourse });
            }

            // Action: Direct JSON creation from confirmed preview
            const { title, level, description, chapters } = body;
            if (!title || !chapters || chapters.length === 0) {
                return new NextResponse("Missing title or chapters", { status: 400 });
            }

            const validLevel = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].includes(level)
                ? level
                : "BEGINNER";

            const course = await prisma.$transaction(async (tx: any) => {
                const created = await tx.course.create({
                    data: {
                        title: title.trim(),
                        level: validLevel,
                        description: description?.trim() || `Course with ${chapters.length} lessons.`
                    }
                });

                await tx.chapter.createMany({
                    data: chapters.map((ch: any, idx: number) => ({
                        title: (ch.title || `Lesson ${idx + 1}`).trim(),
                        content: ch.rawPgn || ch.content || "",
                        fen: ch.fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                        order: typeof ch.order === "number" ? ch.order : idx + 1,
                        courseId: created.id
                    }))
                });

                return await tx.course.findUnique({
                    where: { id: created.id },
                    include: { chapters: { orderBy: { order: "asc" } } }
                });
            });

            return NextResponse.json({ success: true, course });
        }

        // Otherwise Handle FormData upload
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const isPreview = formData.get("preview") === "true";
        const customTitle = formData.get("title") as string | null;
        const customLevel = formData.get("level") as string | null;
        const customDescription = formData.get("description") as string | null;

        if (!file) {
            return new NextResponse("No file uploaded", { status: 400 });
        }

        const pgnText = await file.text();
        if (!pgnText.trim()) {
            return new NextResponse("The uploaded file is empty", { status: 400 });
        }

        // Parse multi-game PGN using robust parser
        const parsed = parseMultiGamePgn(pgnText, file.name);

        if (parsed.totalGames === 0) {
            return new NextResponse("No valid chess games or lessons found in the PGN file", { status: 400 });
        }

        // If preview mode requested, return parsed data immediately
        if (isPreview) {
            return NextResponse.json({
                preview: true,
                suggestedTitle: customTitle?.trim() || parsed.suggestedTitle,
                suggestedLevel: (customLevel as any) || parsed.suggestedLevel,
                description: customDescription?.trim() || parsed.description,
                totalGames: parsed.totalGames,
                validGames: parsed.validGames,
                chapters: parsed.chapters
            });
        }

        // Determine final course metadata
        const finalTitle = customTitle?.trim() || parsed.suggestedTitle;
        const finalLevel = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].includes(customLevel || "")
            ? (customLevel as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT")
            : parsed.suggestedLevel;
        const finalDescription = customDescription?.trim() || parsed.description;

        // Save Course and Chapters in a single atomic transaction
        const course = await prisma.$transaction(async (tx: any) => {
            const createdCourse = await tx.course.create({
                data: {
                    title: finalTitle,
                    description: finalDescription,
                    level: finalLevel
                }
            });

            // Create chapters
            await tx.chapter.createMany({
                data: parsed.chapters.map((ch, idx) => ({
                    title: ch.title,
                    content: ch.rawPgn,
                    fen: ch.fen,
                    order: ch.order || idx + 1,
                    courseId: createdCourse.id
                }))
            });

            return await tx.course.findUnique({
                where: { id: createdCourse.id },
                include: { chapters: { orderBy: { order: "asc" } } }
            });
        });

        return NextResponse.json({
            success: true,
            course,
            message: `Successfully created course "${finalTitle}" with ${parsed.chapters.length} lessons.`
        });
    } catch (error: any) {
        console.error("Failed to upload syllabus:", error);
        return new NextResponse(`Upload Error: ${error.message || "Internal server error"}`, { status: 500 });
    }
}
