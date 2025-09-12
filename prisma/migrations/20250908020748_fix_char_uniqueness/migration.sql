-- CreateTable
CREATE TABLE "CharacterSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "char" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL DEFAULT '',
    "characterSetId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Character_characterSetId_fkey" FOREIGN KEY ("characterSetId") REFERENCES "CharacterSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSet_name_key" ON "CharacterSet"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Character_char_characterSetId_key" ON "Character"("char", "characterSetId");
