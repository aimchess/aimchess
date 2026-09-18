import { prisma } from './prisma';

/**
 * Generates a human-readable temporary reference number for an application.
 * Format: REF-2026-XXXX (e.g., REF-2026-8492)
 */
export function generateReferenceNumber(): string {
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `REF-${currentYear}-${randomSuffix}`;
}

/**
 * Generates a unique sequential AIM Student ID.
 * Format: AIM-2026-1001, AIM-2026-1002, etc.
 */
export async function generateAIMStudentId(txPrisma?: any): Promise<string> {
  const client = txPrisma || prisma;
  const currentYear = new Date().getFullYear();
  const prefix = `AIM-${currentYear}-`;

  // Find the user or application with the highest AIM Student ID for the current year
  const lastUser = await client.user.findFirst({
    where: {
      aimStudentId: {
        startsWith: prefix,
      },
    },
    orderBy: {
      aimStudentId: 'desc',
    },
    select: {
      aimStudentId: true,
    },
  });

  const lastApp = await client.admissionApplication.findFirst({
    where: {
      aimStudentId: {
        startsWith: prefix,
      },
    },
    orderBy: {
      aimStudentId: 'desc',
    },
    select: {
      aimStudentId: true,
    },
  });

  let maxNum = 1000; // Starting index

  if (lastUser?.aimStudentId) {
    const numPart = parseInt(lastUser.aimStudentId.replace(prefix, ''), 10);
    if (!isNaN(numPart) && numPart > maxNum) {
      maxNum = numPart;
    }
  }

  if (lastApp?.aimStudentId) {
    const numPart = parseInt(lastApp.aimStudentId.replace(prefix, ''), 10);
    if (!isNaN(numPart) && numPart > maxNum) {
      maxNum = numPart;
    }
  }

  const nextNum = maxNum + 1;
  return `${prefix}${nextNum}`;
}
