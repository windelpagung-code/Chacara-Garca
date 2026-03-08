import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@chacaragarcia.com" },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: {
        name: "Administrador",
        email: "admin@chacaragarcia.com",
        password: hashedPassword,
        role: "master",
      },
    });
    console.log("Admin user created: admin@chacaragarcia.com / admin123");
  } else {
    console.log("Admin user already exists.");
  }

  const defaultSettings = [
    { key: "whatsapp_number", value: "5500000000000" },
    { key: "chacara_name", value: "Chácara Garcia" },
    { key: "chacara_description", value: "O lugar perfeito para o seu evento" },
    { key: "chacara_address", value: "Endereço da Chácara" },
    { key: "maps_embed_url", value: "" },
    { key: "instagram_url", value: "" },
    { key: "facebook_url", value: "" },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log("Default settings created.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
