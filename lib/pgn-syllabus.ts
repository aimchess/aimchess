import { Chess } from "chess.js";

export interface ParsedChapter {
    order: number;
    title: string;
    fen: string;
    finalFen?: string;
    movesCount: number;
    moves: string[];
    notes: string;
    rawPgn: string;
    isValid: boolean;
    tags: Record<string, string>;
}

export interface ParsedCourseResult {
    suggestedTitle: string;
    suggestedLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
    description: string;
    totalGames: number;
    validGames: number;
    chapters: ParsedChapter[];
}

/**
 * Normalizes line breaks and cleans whitespace
 */
export function normalizePgnText(text: string): string {
    return text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/^\uFEFF/, ""); // Remove UTF-8 BOM if present
}

/**
 * Splits a PGN string into individual games reliably.
 */
export function splitPgnGames(pgnText: string): string[] {
    if (!pgnText || !pgnText.trim()) return [];

    const normalized = normalizePgnText(pgnText).trim();

    // Check if multiple [Event ...] tags exist
    const eventRegex = /\[Event\s+["'][^"']*?["']\]/gi;
    const eventMatches = normalized.match(eventRegex);

    if (eventMatches && eventMatches.length > 1) {
        // Split before [Event ...]
        const games = normalized.split(/\n*(?=\[Event\s+["'][^"']*?["']\])/gi);
        return games.map(g => g.trim()).filter(g => g.length > 0);
    }

    // Secondary split: standard PGN game boundary is blank lines followed by tag headers
    const tagBoundaryRegex = /\n\s*\n\s*(?=\[[A-Za-z0-9_]+\s+["'][^"']*?["']\])/g;
    const tagSplit = normalized.split(tagBoundaryRegex);
    if (tagSplit.length > 1) {
        return tagSplit.map(g => g.trim()).filter(g => g.length > 0);
    }

    // Tertiary split: game results (*, 1-0, 0-1, 1/2-1/2) followed by a tag
    const resultBoundaryRegex = /(?<=\*|1-0|0-1|1\/2-1\/2)\s*\n+\s*(?=\[[A-Za-z0-9_]+)/g;
    const resultSplit = normalized.split(resultBoundaryRegex);
    if (resultSplit.length > 1) {
        return resultSplit.map(g => g.trim()).filter(g => g.length > 0);
    }

    return [normalized];
}

/**
 * Parses tags from a single PGN game text.
 */
export function parsePgnTags(gameText: string): Record<string, string> {
    const tags: Record<string, string> = {};
    const tagRegex = /\[([A-Za-z0-9_]+)\s+["'](.*?)["']\]/g;
    let match;
    while ((match = tagRegex.exec(gameText)) !== null) {
        tags[match[1]] = match[2].trim();
    }
    return tags;
}

/**
 * Extracts comments enclosed in { ... } from the PGN.
 */
export function extractPgnComments(gameText: string): string {
    const comments: string[] = [];
    const commentRegex = /\{([^}]*)\}/g;
    let match;
    while ((match = commentRegex.exec(gameText)) !== null) {
        const c = match[1].trim();
        if (c.length > 0) comments.push(c);
    }
    return comments.join("\n\n");
}

/**
 * Extracts clean notes for coach/student display, removing raw PGN markup.
 */
export function extractCleanNotes(rawGame: string, tags: Record<string, string>): string {
    const comments = extractPgnComments(rawGame);
    if (comments) return comments;
    if (tags["Description"]) return tags["Description"];
    if (tags["Objective"]) return tags["Objective"];
    return "";
}

/**
 * Detects the most meaningful chapter title.
 */
export function detectChapterTitle(tags: Record<string, string>, index: number): string {
    const generic = [
        "aim curriculum",
        "student practice",
        "sample line",
        "white",
        "black",
        "coach",
        "student",
        "lesson",
        "chapter",
        "?",
        "unknown",
        "untitled"
    ];

    // 1. Explicit Chapter tag
    if (tags["Chapter"] && tags["Chapter"].trim()) {
        return tags["Chapter"].trim();
    }

    // 2. Event tag if it contains lesson info (e.g. "BG1 | 01 | Board coordinates" or "Lesson 1 - Italian Game")
    if (tags["Event"]) {
        const ev = tags["Event"].trim();
        if (ev.includes("|") || ev.toLowerCase().includes("lesson") || ev.toLowerCase().includes("chapter")) {
            return ev;
        }
    }

    // 3. White tag if meaningful
    if (tags["White"] && !generic.includes(tags["White"].toLowerCase())) {
        const white = tags["White"].trim();
        if (tags["Black"] && !generic.includes(tags["Black"].toLowerCase())) {
            return `${white} vs ${tags["Black"].trim()}`;
        }
        return white;
    }

    // 4. Black tag if meaningful and White is generic
    if (tags["Black"] && !generic.includes(tags["Black"].toLowerCase())) {
        return tags["Black"].trim();
    }

    // 5. Round tag
    if (tags["Round"] && tags["Round"].trim() && tags["Round"] !== "?") {
        return `Lesson ${tags["Round"].trim()}`;
    }

    // 6. Fallback
    return `Lesson ${index + 1}`;
}

/**
 * Detects appropriate course level based on filenames, tags, or text content.
 */
export function detectCourseLevel(
    text: string,
    filename: string = ""
): "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" {
    const combined = `${filename} ${text}`.toUpperCase();

    // Check Expert
    if (/\b(EX\d*|EXPERT|MASTER|ADVANCED[-_ ]?2)\b/.test(combined)) {
        return "EXPERT";
    }

    // Check Advanced
    if (/\b(AD\d*|ADVANCED|ADV|INTERMEDIATE[-_ ]?2)\b/.test(combined)) {
        return "ADVANCED";
    }

    // Check Intermediate
    if (/\b(IM\d*|INTERMEDIATE|INT|MEDIUM)\b/.test(combined)) {
        return "INTERMEDIATE";
    }

    // Default to Beginner (BG1, BG2, BG3, etc.)
    return "BEGINNER";
}

/**
 * Detects course title from PGN or filename.
 */
export function detectCourseTitle(
    games: string[],
    filename: string = ""
): string {
    const cleanFilename = filename ? filename.replace(/\.pgn$/i, "").trim() : "";

    if (games.length === 0) {
        return cleanFilename || "Uploaded Chess Course";
    }

    const firstTags = parsePgnTags(games[0]);
    const event = firstTags["Event"] || "";

    // If the event name represents the entire course, e.g. "AIM Chess Academy - BG1 Sample Course"
    if (event && !event.includes("|")) {
        // Strip out academy prefix if user wants concise title
        const cleaned = event.replace(/^AIM\s+Chess\s+(Academy\s+[-–—]\s*)?/i, "").trim();
        return cleaned || event;
    }

    // If event is in format "BG1 | 01 | Chapter Name", extract the course code prefix "BG1"
    if (event && event.includes("|")) {
        const parts = event.split("|").map(p => p.trim());
        if (parts[0]) {
            const prefix = parts[0];
            return `${prefix} Curriculum`;
        }
    }

    // Fall back to clean filename
    if (cleanFilename) {
        return cleanFilename;
    }

    return "Uploaded Chess Course";
}

/**
 * Parses an individual PGN game into a structured Chapter object.
 */
export function parseIndividualGame(rawGame: string, index: number): ParsedChapter {
    const tags = parsePgnTags(rawGame);
    const title = detectChapterTitle(tags, index);
    const notes = extractCleanNotes(rawGame, tags);

    // Starting FEN: default or from FEN tag
    let startingFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    if (tags["FEN"]) {
        startingFen = tags["FEN"];
    }

    // Validate and play through moves using chess.js
    const chess = new Chess();
    if (tags["FEN"]) {
        try {
            chess.load(tags["FEN"]);
        } catch (e) {
            // Keep default
        }
    }

    let isValid = false;
    let movesList: string[] = [];
    let finalFen = startingFen;

    try {
        chess.loadPgn(rawGame);
        movesList = chess.history();
        finalFen = chess.fen();
        isValid = true;
    } catch (err) {
        // If full loadPgn failed because of comments/brackets, try parsing moves cleanly
        try {
            const movesOnly = rawGame
                .replace(/\[.*?\]/g, "")
                .replace(/\{.*?\}/g, "")
                .trim();
            const tempChess = new Chess(startingFen);
            tempChess.loadPgn(movesOnly);
            movesList = tempChess.history();
            finalFen = tempChess.fen();
            isValid = true;
        } catch (err2) {
            isValid = false;
        }
    }

    // Determine lesson order: use numeric [Round] if present, else index + 1
    let order = index + 1;
    if (tags["Round"]) {
        const parsedRound = parseInt(tags["Round"], 10);
        if (!isNaN(parsedRound) && parsedRound > 0) {
            order = parsedRound;
        }
    }

    return {
        order,
        title,
        fen: startingFen,
        finalFen,
        movesCount: movesList.length,
        moves: movesList,
        notes,
        rawPgn: rawGame.trim(),
        isValid,
        tags
    };
}

/**
 * Full parsing pipeline for a complete multi-game PGN file.
 */
export function parseMultiGamePgn(
    pgnText: string,
    filename: string = ""
): ParsedCourseResult {
    const games = splitPgnGames(pgnText);

    const chapters = games.map((game, index) => parseIndividualGame(game, index));

    // Sort chapters by order
    chapters.sort((a, b) => a.order - b.order);

    const suggestedTitle = detectCourseTitle(games, filename);
    const suggestedLevel = detectCourseLevel(pgnText, filename);

    const validGames = chapters.filter(c => c.isValid).length;

    return {
        suggestedTitle,
        suggestedLevel,
        description: `Comprehensive ${suggestedLevel.toLowerCase()} chess syllabus with ${chapters.length} lessons.`,
        totalGames: chapters.length,
        validGames,
        chapters
    };
}
