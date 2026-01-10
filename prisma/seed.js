// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

function normalize(name) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

async function main() {
  const defaultCategories = [
    // EXPENSES
    { name: "Makanan", type: "Expenses" },
    { name: "Transportasi", type: "Expenses" },
    { name: "Belanja", type: "Expenses" },
    { name: "Hiburan", type: "Expenses" },
    { name: "Tagihan", type: "Expenses" },
    { name: "Pendidikan", type: "Expenses" },
    { name: "Kesehatan", type: "Expenses" },
    { name: "Hadiah / Donasi", type: "Expenses" },
    { name: "Lainnya", type: "Expenses" },

    // INCOME
    { name: "Gaji", type: "Income" },
    { name: "Bonus", type: "Income" },
    { name: "Investasi", type: "Income" },
    { name: "Hadiah", type: "Income" },
    { name: "Lainnya", type: "Income" },
  ];

  for (const category of defaultCategories) {
    const slug = normalize(category.name);

    const exists = await prisma.category.findFirst({
      where: {
        slug,
        type: category.type,
        owner_id: null,
      },
    });

    if (!exists) {
      await prisma.category.create({
        data: {
          name: category.name,
          slug,
          type: category.type,
          is_global: true,
          owner_id: null,
        },
      });
    }
  }

  console.log("✅ Default categories seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
