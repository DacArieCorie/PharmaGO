import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  const passwordHash = await hash("password123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@pharmago.africa" },
    update: {},
    create: {
      email: "admin@pharmago.africa",
      passwordHash,
      name: "Admin PharmaGO",
      role: Role.ADMIN,
      phone: "+225 07 00 00 00 01",
    },
  });

  const pharmacyUser = await prisma.user.upsert({
    where: { email: "pharmacie.centrale@pharmago.africa" },
    update: {},
    create: {
      email: "pharmacie.centrale@pharmago.africa",
      passwordHash,
      name: "Pharmacie Centrale",
      role: Role.PHARMACY,
      phone: "+225 07 00 00 00 02",
      pharmacy: {
        create: {
          name: "Pharmacie Centrale",
          address: "Boulevard de la République",
          city: "Abidjan",
          phone: "+225 27 20 00 00 00",
          openingHours: "08h00 - 21h00",
        },
      },
    },
    include: { pharmacy: true },
  });

  const pharmacy = pharmacyUser.pharmacy ?? (await prisma.pharmacy.findUnique({ where: { userId: pharmacyUser.id } }))!;

  const existingProducts = await prisma.product.count({ where: { pharmacyId: pharmacy.id } });
  let products: { id: string }[] = [];
  if (existingProducts === 0) {
    products = await Promise.all(
      [
        { name: "Paracétamol 500mg", price: 500, stock: 200, category: "Antalgique" },
        { name: "Amoxicilline 1g", price: 2500, stock: 80, category: "Antibiotique", isPrescriptionRequired: true },
        { name: "Sirop toux adulte", price: 1800, stock: 60, category: "Sirop" },
        { name: "Gel hydroalcoolique 250ml", price: 1200, stock: 150, category: "Hygiène" },
      ].map((p) => prisma.product.create({ data: { ...p, pharmacyId: pharmacy.id } }))
    );
  }

  const courierUser = await prisma.user.upsert({
    where: { email: "livreur.koffi@pharmago.africa" },
    update: {},
    create: {
      email: "livreur.koffi@pharmago.africa",
      passwordHash,
      name: "Koffi Yao",
      role: Role.COURIER,
      phone: "+225 07 00 00 00 03",
      courier: { create: { zone: "Abidjan - Cocody" } },
    },
  });

  const clientUser = await prisma.user.upsert({
    where: { email: "client.demo@pharmago.africa" },
    update: {},
    create: {
      email: "client.demo@pharmago.africa",
      passwordHash,
      name: "Awa Diabaté",
      role: Role.CLIENT,
      phone: "+225 07 00 00 00 04",
      addresses: {
        create: { label: "Domicile", street: "Rue des Jardins, Cocody", city: "Abidjan" },
      },
    },
  });

  console.log("Seed terminé.");
  console.log({ admin: admin.email, pharmacy: pharmacyUser.email, courier: courierUser.email, client: clientUser.email });
  console.log("Mot de passe pour tous les comptes de démo : password123");
  console.log(`Produits créés: ${products.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
