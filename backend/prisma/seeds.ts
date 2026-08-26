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
    sku: "AGENT-MOUSE-001",
    name: "Logitech Wireless Mouse",
    description:
      "Ergonomic wireless mouse for everyday productivity",
    price: 799,
    stock: 25,
    category: "Accessories",
    rating: 4.5,
    reviewCount: 1250,
    brand: "Logitech",
    attributes: {
      wireless: true,
      connection: "2.4GHz",
      color: "Black",
      ergonomic: true,
    },
  },

  {
    sku: "AGENT-KEYBOARD-001",
    name: "Mechanical Keyboard",
    description:
      "RGB mechanical keyboard with blue switches",
    price: 2499,
    stock: 15,
    category: "Accessories",
    rating: 4.6,
    reviewCount: 980,
    brand: "Redragon",
    attributes: {
      type: "Mechanical",
      switches: "Blue",
      rgb: true,
      connection: "USB",
      layout: "Full Size",
    },
  },

  {
    sku: "AGENT-HUB-001",
    name: "USB-C Hub",
    description:
      "7-in-1 USB-C hub with HDMI and USB 3.0",
    price: 1299,
    stock: 30,
    category: "Accessories",
    rating: 4.3,
    reviewCount: 640,
    brand: "Anker",
    attributes: {
      ports: 7,
      connection: "USB-C",
      hdmi: true,
      usb3: true,
      color: "Grey",
    },
  },

  {
    sku: "AGENT-SSD-001",
    name: "1TB NVMe SSD",
    description:
      "High-speed 1TB NVMe solid state drive",
    price: 5499,
    stock: 10,
    category: "Storage",
    rating: 4.7,
    reviewCount: 3200,
    brand: "Samsung",
    attributes: {
      capacity: "1TB",
      interface: "NVMe",
      formFactor: "M.2",
      readSpeed: "3500MB/s",
      writeSpeed: "3300MB/s",
    },
  },

  {
    sku: "AGENT-STAND-001",
    name: "Laptop Stand",
    description:
      "Adjustable aluminium laptop stand",
    price: 1499,
    stock: 20,
    category: "Accessories",
    rating: 4.4,
    reviewCount: 870,
    brand: "Portronics",
    attributes: {
      material: "Aluminium",
      adjustable: true,
      foldable: true,
      color: "Silver",
    },
  },

  {
    sku: "AGENT-HEADPHONES-001",
    name: "Wireless Headphones",
    description:
      "Noise cancelling wireless headphones",
    price: 3999,
    stock: 12,
    category: "Audio",
    rating: 4.6,
    reviewCount: 2100,
    brand: "Sony",
    attributes: {
      wireless: true,
      noiseCancellation: true,
      connection: "Bluetooth",
      microphone: true,
      color: "Black",
    },
  },

  {
    sku: "AGENT-WEBCAM-001",
    name: "Webcam 1080p",
    description:
      "Full HD webcam for meetings and streaming",
    price: 2199,
    stock: 18,
    category: "Electronics",
    rating: 4.2,
    reviewCount: 560,
    brand: "Logitech",
    attributes: {
      resolution: "1080p",
      microphone: true,
      autofocus: true,
      connection: "USB",
    },
  },

  {
    sku: "AGENT-POWERBANK-001",
    name: "Portable Power Bank",
    description:
      "20000mAh fast charging power bank",
    price: 1799,
    stock: 22,
    category: "Electronics",
    rating: 4.5,
    reviewCount: 1450,
    brand: "Ambrane",
    attributes: {
      capacity: "20000mAh",
      fastCharging: true,
      usbPorts: 2,
      usbC: true,
    },
  },
];
async function main() {
  console.log("🌱 Updating products...");

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        sku: product.sku,
      },

      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        rating: product.rating,
        reviewCount: product.reviewCount,
        brand: product.brand,
        attributes: product.attributes,
      },

      create: {
        sku: product.sku,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        rating: product.rating,
        reviewCount: product.reviewCount,
        brand: product.brand,
        attributes: product.attributes,
      },
    });
  }

  console.log(
    `✅ ${products.length} products processed`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });