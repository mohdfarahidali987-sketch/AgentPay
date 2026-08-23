import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const products = [
  {
    name: "Logitech Wireless Mouse",
    description: "Ergonomic wireless mouse for everyday productivity",
    price: 799,
    stock: 25,
    category: "Accessories",
    rating: 4.5,
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with blue switches",
    price: 2499,
    stock: 15,
    category: "Accessories",
    rating: 4.6,
  },
  {
    name: "USB-C Hub",
    description: "7-in-1 USB-C hub with HDMI and USB 3.0",
    price: 1299,
    stock: 30,
    category: "Accessories",
    rating: 4.3,
  },
  {
    name: "1TB NVMe SSD",
    description: "High-speed 1TB NVMe solid state drive",
    price: 5499,
    stock: 10,
    category: "Storage",
    rating: 4.7,
  },
  {
    name: "Laptop Stand",
    description: "Adjustable aluminium laptop stand",
    price: 1499,
    stock: 20,
    category: "Accessories",
    rating: 4.4,
  },
  {
    name: "Wireless Headphones",
    description: "Noise cancelling wireless headphones",
    price: 3999,
    stock: 12,
    category: "Audio",
    rating: 4.6,
  },
  {
    name: "Webcam 1080p",
    description: "Full HD webcam for meetings and streaming",
    price: 2199,
    stock: 18,
    category: "Electronics",
    rating: 4.2,
  },
  {
    name: "Portable Power Bank",
    description: "20000mAh fast charging power bank",
    price: 1799,
    stock: 22,
    category: "Electronics",
    rating: 4.5,
  },
];

async function main() {
  console.log("🌱 Seeding products...");

  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: products,
  });

  console.log(`✅ ${products.length} products created`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });