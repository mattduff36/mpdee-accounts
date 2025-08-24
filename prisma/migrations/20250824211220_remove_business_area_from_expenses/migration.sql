/*
  Warnings:

  - You are about to drop the column `business_area` on the `expenses` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_expenses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "receipt_url" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_expenses" ("amount", "category", "created_at", "date", "description", "id", "notes", "receipt_url", "updated_at") SELECT "amount", "category", "created_at", "date", "description", "id", "notes", "receipt_url", "updated_at" FROM "expenses";
DROP TABLE "expenses";
ALTER TABLE "new_expenses" RENAME TO "expenses";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
