-- CreateTable
CREATE TABLE "LearnedCharacter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "char" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "LearnedCharacter_char_key" ON "LearnedCharacter"("char");
