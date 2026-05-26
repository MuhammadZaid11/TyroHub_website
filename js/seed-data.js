export const seedProducts = [
  {
    id: "lenovo-legion-5",
    title: "Lenovo Legion 5i Pro Gaming",
    description: "The ultimate gaming and rendering powerhouse. Features a blazing-fast Intel core processor and NVIDIA Ampere graphics, combined with Legion Coldfront thermals and a premium QHD 165Hz IPS screen. Perfect for AAA gaming and heavy 3D rendering projects.",
    category: "gaming",
    price: 215000,
    salePrice: 195000,
    stock: 8,
    specifications: [
      "Intel Core i7-12700H",
      "NVIDIA RTX 3070 8GB GDDR6",
      "16GB DDR5 Dual Channel",
      "1TB PCIe Gen4 NVMe SSD",
      "16.0\" QHD 165Hz G-Sync Display"
    ],
    imageUrls: ["/images/gaming_laptop.png"],
    featured: true,
    createdAt: new Date()
  },
  {
    id: "thinkpad-x1-carbon",
    title: "ThinkPad X1 Carbon Gen 10",
    description: "The gold standard for corporate mobility. Made of carbon fiber for military-grade durability while weighing only 1.12kg. Features a gorgeous 2.8K OLED display, professional keyboard, robust port selections, and long battery life. Refurbished to pristine Grade-A condition.",
    category: "refurbished",
    price: 165000,
    salePrice: 145000,
    stock: 12,
    specifications: [
      "Intel Core i7-1265U (vPro)",
      "Intel Iris Xe Graphics",
      "16GB LPDDR5 5200MHz",
      "512GB NVMe PCIe SSD",
      "14.0\" 2.8K (2880x1800) OLED"
    ],
    imageUrls: ["/images/business_laptop.png"],
    featured: true,
    createdAt: new Date()
  },
  {
    id: "dell-xps-15-dev",
    title: "Dell XPS 15 Developer Edition",
    description: "Configured specifically for code compilers, virtual machine environments, and data science workflows. The stunning near-borderless InfinityEdge display gives maximum screen estate, while the high TDP processor handles heavy docker containers with ease.",
    category: "developer",
    price: 240000,
    salePrice: 210000,
    stock: 5,
    specifications: [
      "Intel Core i9-12900HK",
      "NVIDIA RTX 3050 Ti 4GB",
      "32GB DDR5 4800MHz",
      "1TB PCIe NVMe SSD",
      "15.6\" 3.5K OLED Touchscreen"
    ],
    imageUrls: ["/images/coding_laptop.png"],
    featured: true,
    createdAt: new Date()
  },
  {
    id: "hp-pavilion-slim",
    title: "HP Pavilion Slim 14 Student",
    description: "The ideal companion for university students and content writers. Thin, lightweight aluminum build with an efficient AMD processor that stays silent and cool, offering up to 10 hours of video playback. Includes clean sound by B&O.",
    category: "student",
    price: 85000,
    salePrice: 75000,
    stock: 15,
    specifications: [
      "AMD Ryzen 5 7530U",
      "AMD Radeon Graphics",
      "8GB DDR4 3200MHz",
      "512GB NVMe M.2 SSD",
      "14.0\" Full HD IPS Touch"
    ],
    imageUrls: ["/images/student_laptop.png"],
    featured: true,
    createdAt: new Date()
  },
  {
    id: "macbook-pro-m2",
    title: "MacBook Pro 14 M2 Pro",
    description: "Unrivaled efficiency and battery performance. Slices through mobile app compile times, video scrubbing, and neural networking scripts without spinning up its fans. Pristine refurbished cosmetic state with 100% capacity Apple battery.",
    category: "developer",
    price: 310000,
    salePrice: 280000,
    stock: 3,
    specifications: [
      "Apple M2 Pro (10-core CPU)",
      "16-core Apple Neural GPU",
      "16GB Unified Memory",
      "512GB Ultra-Fast SSD",
      "14.2\" Liquid Retina XDR screen"
    ],
    imageUrls: ["/images/coding_laptop.png"], // Reuse developer laptop assets
    featured: true,
    createdAt: new Date()
  },
  {
    id: "premium-tech-hub-accessories",
    title: "TyroHub 5-in-1 Tech Organizer Bundle",
    description: "Streamline your developer desk. Bundle contains a premium leather desk mat, custom mechanical keycaps, a high-speed multi-port USB-C Hub, mouse bungees, and custom cable sleeves. Elevate your workspace.",
    category: "accessories",
    price: 15000,
    salePrice: 12000,
    stock: 25,
    specifications: [
      "Full Leather Desk Mat (80x40cm)",
      "5-in-1 aluminum USB-C Hub (4K HDMI)",
      "Premium Coiled Keyboard Cable",
      "High-density desktop organization tray"
    ],
    imageUrls: ["/images/tech_accessories.png"],
    featured: true,
    createdAt: new Date()
  }
];
