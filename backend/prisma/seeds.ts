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

  {
    sku: "AGENT-LAPTOP-001",
    name: "ASUS Vivobook 15",
    description: "Balanced everyday laptop for work, study, and browsing",
    price: 54999,
    stock: 8,
    category: "Laptops",
    rating: 4.4,
    reviewCount: 1870,
    brand: "ASUS",
    attributes: { processor: "Intel Core i5", ram: "16GB", storage: "512GB SSD", display: "15.6-inch FHD" },
  },

  {
    sku: "AGENT-LAPTOP-002",
    name: "Apple MacBook Air M2",
    description: "Thin and quiet laptop with long battery life",
    price: 89999,
    stock: 6,
    category: "Laptops",
    rating: 4.8,
    reviewCount: 4210,
    brand: "Apple",
    attributes: { processor: "Apple M2", ram: "8GB", storage: "256GB SSD", display: "13.6-inch Retina" },
  },

  {
    sku: "AGENT-MONITOR-001",
    name: "LG 24-inch Full HD Monitor",
    description: "Clear IPS monitor for productivity and home offices",
    price: 10999,
    stock: 14,
    category: "Monitors",
    rating: 4.5,
    reviewCount: 2390,
    brand: "LG",
    attributes: { size: "24-inch", resolution: "1920x1080", panel: "IPS", refreshRate: "75Hz", ports: ["HDMI", "VGA"] },
  },

  {
    sku: "AGENT-MONITOR-002",
    name: "Acer 27-inch Gaming Monitor",
    description: "Fast QHD gaming monitor with smooth motion",
    price: 22999,
    stock: 9,
    category: "Monitors",
    rating: 4.6,
    reviewCount: 1120,
    brand: "Acer",
    attributes: { size: "27-inch", resolution: "2560x1440", panel: "IPS", refreshRate: "165Hz", adaptiveSync: true },
  },

  {
    sku: "AGENT-SSD-002",
    name: "WD 1TB Portable SSD",
    description: "Compact external SSD for fast backups and file transfers",
    price: 6999,
    stock: 16,
    category: "Storage",
    rating: 4.6,
    reviewCount: 1740,
    brand: "Western Digital",
    attributes: { capacity: "1TB", interface: "USB-C", readSpeed: "1050MB/s", portable: true },
  },

  {
    sku: "AGENT-ROUTER-001",
    name: "TP-Link Wi-Fi 6 Router",
    description: "Reliable dual-band router for fast home connectivity",
    price: 3299,
    stock: 24,
    category: "Networking",
    rating: 4.4,
    reviewCount: 2860,
    brand: "TP-Link",
    attributes: { wifi: "Wi-Fi 6", bands: "Dual-band", speed: "3000Mbps", ports: 4, mesh: true },
  },

  {
    sku: "AGENT-EARBUDS-001",
    name: "OnePlus Buds 3",
    description: "Wireless earbuds with active noise cancellation",
    price: 5499,
    stock: 20,
    category: "Audio",
    rating: 4.5,
    reviewCount: 3180,
    brand: "OnePlus",
    attributes: { wireless: true, noiseCancellation: true, battery: "44 hours", waterResistance: "IP55" },
  },

  {
    sku: "AGENT-SPEAKER-001",
    name: "JBL Portable Bluetooth Speaker",
    description: "Compact speaker with powerful sound for indoor and outdoor use",
    price: 2999,
    stock: 18,
    category: "Audio",
    rating: 4.6,
    reviewCount: 3520,
    brand: "JBL",
    attributes: { wireless: true, battery: "12 hours", waterResistance: "IP67", microphone: true },
  },

  {
    sku: "AGENT-KEYBOARD-002",
    name: "Logitech Wireless Keyboard",
    description: "Quiet full-size keyboard with comfortable low-profile keys",
    price: 1799,
    stock: 21,
    category: "Accessories",
    rating: 4.3,
    reviewCount: 940,
    brand: "Logitech",
    attributes: { wireless: true, connection: "Bluetooth", layout: "Full Size", battery: "24 months" },
  },

  {
    sku: "AGENT-DOCK-001",
    name: "Dell USB-C Docking Station",
    description: "Professional dock for displays, charging, and peripherals",
    price: 8999,
    stock: 7,
    category: "Accessories",
    rating: 4.2,
    reviewCount: 610,
    brand: "Dell",
    attributes: { connection: "USB-C", displays: 2, powerDelivery: "90W", ethernet: true },
  },

  {
    sku: "AGENT-CHAIR-001",
    name: "Ergonomic Office Chair",
    description: "Adjustable mesh chair designed for long work sessions",
    price: 11999,
    stock: 10,
    category: "Workspace",
    rating: 4.3,
    reviewCount: 780,
    brand: "Green Soul",
    attributes: { material: "Mesh", adjustable: true, lumbarSupport: true, armrests: "3D" },
  },

  {
    sku: "AGENT-WEBCAM-002",
    name: "Elgato Facecam",
    description: "Premium webcam for streaming, meetings, and content creation",
    price: 13999,
    stock: 5,
    category: "Electronics",
    rating: 4.7,
    reviewCount: 430,
    brand: "Elgato",
    attributes: { resolution: "1080p", frameRate: "60fps", autofocus: false, connection: "USB-C" },
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