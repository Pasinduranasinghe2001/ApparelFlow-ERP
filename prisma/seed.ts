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

  // ─────────────────────────────────────────────
  // SEED RECIPE C: Denim Trucker Jacket (REC-DJ03)
  // ─────────────────────────────────────────────
  const denimJacket = await prisma.recipe.upsert({
    where: { recipeCode: "REC-DJ03" },
    update: {},
    create: {
      recipeCode: "REC-DJ03",
      name: "Denim Trucker Jacket",
      category: "Outerwear",
      stdFabricYards: 2.6,
      wastageCap: 6.0,
      components: {
        createMany: {
          data: [
            { componentName: "Front Body Panels (L & R)", piecesPerGarment: 2 },
            { componentName: "Back Main Yoke & Panel",    piecesPerGarment: 2 },
            { componentName: "Sleeves (Left & Right)",   piecesPerGarment: 2 },
            { componentName: "Chest Pockets & Flaps",     piecesPerGarment: 4 },
            { componentName: "Collar & Stand Assembly",  piecesPerGarment: 1 },
            { componentName: "Button Waistband Band",    piecesPerGarment: 1 },
          ],
          skipDuplicates: true,
        },
      },
    },
  });
  console.log("✅ Recipe C seeded:", denimJacket.name);

  // ─────────────────────────────────────────────
  // SEED RECIPE D: Classic Polo Shirt (REC-PT04)
  // ─────────────────────────────────────────────
  const poloShirt = await prisma.recipe.upsert({
    where: { recipeCode: "REC-PT04" },
    update: {},
    create: {
      recipeCode: "REC-PT04",
      name: "Classic Polo Shirt",
      category: "Knitwear",
      stdFabricYards: 1.4,
      wastageCap: 4.5,
      components: {
        createMany: {
          data: [
            { componentName: "Front Body Panel",         piecesPerGarment: 1 },
            { componentName: "Back Body Panel",          piecesPerGarment: 1 },
            { componentName: "Ribbed Flat Knit Collar",  piecesPerGarment: 1 },
            { componentName: "Short Sleeves (L & R)",    piecesPerGarment: 2 },
            { componentName: "Sleeve Ribbed Cuffs",      piecesPerGarment: 2 },
            { componentName: "Front Placket Strip",      piecesPerGarment: 2 },
          ],
          skipDuplicates: true,
        },
      },
    },
  });
  console.log("✅ Recipe D seeded:", poloShirt.name);

  // ─────────────────────────────────────────────
  // SEED RECIPE E: Fleece Hooded Sweatshirt (REC-HD05)
  // ─────────────────────────────────────────────
  const hoodie = await prisma.recipe.upsert({
    where: { recipeCode: "REC-HD05" },
    update: {},
    create: {
      recipeCode: "REC-HD05",
      name: "Fleece Hooded Sweatshirt",
      category: "Hoodies",
      stdFabricYards: 2.2,
      wastageCap: 5.5,
      components: {
        createMany: {
          data: [
            { componentName: "Front Body Panel",         piecesPerGarment: 1 },
            { componentName: "Back Body Panel",          piecesPerGarment: 1 },
            { componentName: "Kangaroo Front Pocket",    piecesPerGarment: 1 },
            { componentName: "Double-Layer Hood Panels", piecesPerGarment: 2 },
            { componentName: "Raglan Sleeves (L & R)",   piecesPerGarment: 2 },
            { componentName: "Ribbed Hem & Wrist Cuffs", piecesPerGarment: 3 },
          ],
          skipDuplicates: true,
        },
      },
    },
  });
  console.log("✅ Recipe E seeded:", hoodie.name);

  // ─────────────────────────────────────────────
  // SEED RECIPE F: Tailored Chino Trousers (REC-TR06)
  // ─────────────────────────────────────────────
  const chino = await prisma.recipe.upsert({
    where: { recipeCode: "REC-TR06" },
    update: {},
    create: {
      recipeCode: "REC-TR06",
      name: "Tailored Chino Trousers",
      category: "Bottoms",
      stdFabricYards: 1.9,
      wastageCap: 5.0,
      components: {
        createMany: {
          data: [
            { componentName: "Front Leg Panels (L & R)", piecesPerGarment: 2 },
            { componentName: "Back Leg Panels (L & R)",  piecesPerGarment: 2 },
            { componentName: "Side Slash Pocket Bags",   piecesPerGarment: 2 },
            { componentName: "Rear Welt Pocket Linings", piecesPerGarment: 2 },
            { componentName: "Contoured Waistband Band", piecesPerGarment: 1 },
            { componentName: "Zipper Fly Shield",        piecesPerGarment: 1 },
          ],
          skipDuplicates: true,
        },
      },
    },
  });
  console.log("✅ Recipe F seeded:", chino.name);

  // ─────────────────────────────────────────────
  // SEED RECIPE G: Summer Sundress (REC-SD07)
  // ─────────────────────────────────────────────
  const sundress = await prisma.recipe.upsert({
    where: { recipeCode: "REC-SD07" },
    update: {},
    create: {
      recipeCode: "REC-SD07",
      name: "Summer Sundress",
      category: "Dress",
      stdFabricYards: 2.0,
      wastageCap: 6.0,
      components: {
        createMany: {
          data: [
            { componentName: "Front Bodice Panel",      piecesPerGarment: 1 },
            { componentName: "Back Bodice Panel",       piecesPerGarment: 1 },
            { componentName: "A-Line Skirt Panels",     piecesPerGarment: 2 },
            { componentName: "Spaghetti Straps",        piecesPerGarment: 2 },
            { componentName: "Waist Tie Belt",          piecesPerGarment: 1 },
            { componentName: "Facing / Lining Strips",  piecesPerGarment: 2 },
          ],
          skipDuplicates: true,
        },
      },
    },
  });
  console.log("✅ Recipe G seeded:", sundress.name);

  // ─────────────────────────────────────────────
  // SEED RECIPE H: Athletic Jogger Pants (REC-JP08)
  // ─────────────────────────────────────────────
  const jogger = await prisma.recipe.upsert({
    where: { recipeCode: "REC-JP08" },
    update: {},
    create: {
      recipeCode: "REC-JP08",
      name: "Athletic Jogger Pants",
      category: "Activewear",
      stdFabricYards: 1.7,
      wastageCap: 4.0,
      components: {
        createMany: {
          data: [
            { componentName: "Front Leg Panels (L & R)", piecesPerGarment: 2 },
            { componentName: "Back Leg Panels (L & R)",  piecesPerGarment: 2 },
            { componentName: "Elastic Waistband",        piecesPerGarment: 1 },
            { componentName: "Side Zip Pockets",         piecesPerGarment: 2 },
            { componentName: "Ankle Cuff Ribbing",       piecesPerGarment: 2 },
          ],
          skipDuplicates: true,
        },
      },
    },
  });
  console.log("✅ Recipe H seeded:", jogger.name);

  // ─────────────────────────────────────────────
  // SEED RECIPE I: Formal Dress Shirt (REC-FS09)
  // ─────────────────────────────────────────────
  const dressShirt = await prisma.recipe.upsert({
    where: { recipeCode: "REC-FS09" },
    update: {},
    create: {
      recipeCode: "REC-FS09",
      name: "Formal Dress Shirt",
      category: "Shirt",
      stdFabricYards: 2.0,
      wastageCap: 4.5,
      components: {
        createMany: {
          data: [
            { componentName: "Front Body (L & R)",       piecesPerGarment: 2 },
            { componentName: "Back Body Panel",          piecesPerGarment: 1 },
            { componentName: "Back Yoke Piece",          piecesPerGarment: 1 },
            { componentName: "Long Sleeves (L & R)",     piecesPerGarment: 2 },
            { componentName: "French Cuffs",             piecesPerGarment: 2 },
            { componentName: "Collar & Band",            piecesPerGarment: 2 },
            { componentName: "Front Button Placket",     piecesPerGarment: 1 },
          ],
          skipDuplicates: true,
        },
      },
    },
  });
  console.log("✅ Recipe I seeded:", dressShirt.name);

  // ─────────────────────────────────────────────
  // SEED RECIPE J: Kids School Uniform Shirt (REC-KU10)
  // ─────────────────────────────────────────────
  const kidsUniform = await prisma.recipe.upsert({
    where: { recipeCode: "REC-KU10" },
    update: {},
    create: {
      recipeCode: "REC-KU10",
      name: "Kids School Uniform Shirt",
      category: "School Uniform",
      stdFabricYards: 1.2,
      wastageCap: 7.0,
      components: {
        createMany: {
          data: [
            { componentName: "Front Body Panel",        piecesPerGarment: 1 },
            { componentName: "Back Body Panel",          piecesPerGarment: 1 },
            { componentName: "Short Sleeves (L & R)",    piecesPerGarment: 2 },
            { componentName: "Peter Pan Collar",         piecesPerGarment: 2 },
            { componentName: "Chest Pocket",             piecesPerGarment: 1 },
          ],
          skipDuplicates: true,
        },
      },
    },
  });
  console.log("✅ Recipe J seeded:", kidsUniform.name);

  console.log("🎉 Seeding complete with 10 recipes!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
