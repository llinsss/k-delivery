-- CreateEnum
CREATE TYPE "ProviderOperatingModel" AS ENUM ('PLATFORM_FULFILLMENT', 'INFRASTRUCTURE_ONLY', 'HYBRID');

-- CreateEnum
CREATE TYPE "ProviderApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "operatingModel" "ProviderOperatingModel" NOT NULL DEFAULT 'HYBRID';

-- CreateTable
CREATE TABLE "ProviderApplication" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "cacNumber" TEXT,
    "yearsOperating" INTEGER,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "officeAddress" TEXT NOT NULL,
    "operatingModel" "ProviderOperatingModel" NOT NULL,
    "bicycleCount" INTEGER NOT NULL DEFAULT 0,
    "motorcycleCount" INTEGER NOT NULL DEFAULT 0,
    "carCount" INTEGER NOT NULL DEFAULT 0,
    "zones" TEXT[],
    "currentVolumePerDay" INTEGER,
    "integrationPreference" TEXT NOT NULL,
    "notes" TEXT,
    "status" "ProviderApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProviderApplication_status_createdAt_idx" ON "ProviderApplication"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderApplication_email_companyName_key" ON "ProviderApplication"("email", "companyName");
