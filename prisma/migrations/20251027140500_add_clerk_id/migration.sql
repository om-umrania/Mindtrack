-- Add clerkId column for Clerk integration
ALTER TABLE "User" ADD COLUMN "clerkId" TEXT;

-- Ensure unique mapping between Clerk user and local user
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");
