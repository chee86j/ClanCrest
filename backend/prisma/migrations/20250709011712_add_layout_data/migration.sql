-- CreateTable
CREATE TABLE "LayoutData" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "positions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LayoutData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LayoutData_userId_key" ON "LayoutData"("userId");

-- AddForeignKey
ALTER TABLE "LayoutData" ADD CONSTRAINT "LayoutData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
