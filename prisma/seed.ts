import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─────────────────────────────────────────────
  // SEED USERS (3 roles)
  // ─────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("demo1234", 12);

  const supervisor = await prisma.user.upsert({
    where: { email: "supervisor@apparelflow.com" },
    update: {},
    create: {
      email: "supervisor@apparelflow.com",
      passwordHash,
      role: Role.cutting_supervisor,
      fullName: "Kasun Supervisor",
    },
  });

  const verifier = await prisma.user.upsert({
    where: { email: "verifier@apparelflow.com" },
    update: {},
    create: {
      email: "verifier@apparelflow.com",
      passwordHash,
      role: Role.cutting_verifier,
      fullName: "Amali Verifier",
    },
  });

  const sewing = await prisma.user.upsert({
    where: { email: "sewing@apparelflow.com" },
    update: {},
    create: {
      email: "sewing@apparelflow.com",
      passwordHash,
      role: Role.sewing_supervisor,
      fullName: "Nimal Sewing",
    },
  });

  console.log("✅ Users seeded:", supervisor.email, verifier.email, sewing.email);

  // ─────────────────────────────────────────────
  // SEED RECIPE A: Casual Blouse (REC-BL01)
  // ─────────────────────────────────────────────
  const blouse = await prisma.recipe.upsert({
    where: { recipeCode: "REC-BL01" },
    update: {},
    create: {
      recipeCode: "REC-BL01",
      name: "Casual Blouse",
      category: "Blouse",
      stdFabricYards: 1.8,
      wastageCap: 5.0,
      components: {
        createMany: {
          data: [
            { componentName: "Front Body Panel",    piecesPerGarment: 1 },
            { componentName: "Back Body Panel",     piecesPerGarment: 1 },
            { componentName: "Sleeves (Left & Right)", piecesPerGarment: 2 },
            { componentName: "Collar & Stand",      piecesPerGarment: 1 },
            { componentName: "Sleeve Cuffs",        piecesPerGarment: 2 },
          ],
          skipDuplicates: true,
        },
      },
    },
  });

  console.log("✅ Recipe A seeded:", blouse.name);

  // ─────────────────────────────────────────────
  // SEED RECIPE B: Crop Top (REC-CT02)
  // ─────────────────────────────────────────────
  const cropTop = await prisma.recipe.upsert({
    where: { recipeCode: "REC-CT02" },
    update: {},
    create: {
      recipeCode: "REC-CT02",
      name: "Crop Top",
      category: "Crop Top",
      stdFabricYards: 1.1,
      wastageCap: 8.0,
      components: {
        createMany: {
          data: [
            { componentName: "Front Chest Panel",   piecesPerGarment: 1 },
            { componentName: "Back Support Panel",  piecesPerGarment: 1 },
            { componentName: "Neck Binding Strip",  piecesPerGarment: 1 },
            { componentName: "Hem Elastic Casing",  piecesPerGarment: 1 },
            { componentName: "Side Strap Accents",  piecesPerGarment: 2 },
          ],
          skipDuplicates: true,
        },
      },
    },
  });

  console.log("✅ Recipe B seeded:", cropTop.name);
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
