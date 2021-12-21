/*
  Warnings:

  - Added the required column `interval` to the `Monitor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Monitor" ADD COLUMN     "interval" TEXT NOT NULL;
