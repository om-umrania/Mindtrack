import { PrismaRepo, getPrisma } from "./adapters/prisma";
import { MemoryRepo } from "./adapters/memory";
import type { IRepository } from "./interfaces";
import { DATABASE_URL } from "./env";

let repoPromise: Promise<IRepository> | null = null;

async function initializeRepository(): Promise<IRepository> {
  if (!DATABASE_URL) {
    console.warn("[repo] DATABASE_URL not set; using in-memory repository.");
    return new MemoryRepo();
  }

  try {
    const prisma = getPrisma();
    await prisma.user.count();
    console.info("[repo] Connected to database, using Prisma repository.");
    return new PrismaRepo();
  } catch (error) {
    console.warn(
      "[repo] Falling back to in-memory repository due to Prisma connection issue:",
      error,
    );
    return new MemoryRepo();
  }
}

export function getRepo(): Promise<IRepository> {
  if (!repoPromise) {
    repoPromise = initializeRepository();
  }
  return repoPromise;
}
