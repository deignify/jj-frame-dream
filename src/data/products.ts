export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  material: string;
  size: string;
  color: string;
  description: string;
  features: string[];
  careInstructions: string[];
  inStock: boolean;
  featured: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Classic Oak Photo Frame",
    price: 49.99,
    originalPrice: 59.99,
    image: "/frame-1.jpg",
    category: "wooden",
    material: "Solid Oak Wood",
    size: "8x10 inches",
    color: "Natural Oak",
    description: "Handcrafted from premium solid oak, this timeless frame brings warmth and elegance to your cherished memories. Each piece features unique wood grain patterns that make it truly one of a kind.",
    features: [
      "100% solid oak construction",
      "UV-protective glass",
      "Easel back and wall mount ready",
      "Acid-free matting included"
    ],
    careInstructions: [
      "Dust with a soft, dry cloth",
      "Avoid direct sunlight to preserve wood finish",
      "Do not use water or cleaning solutions on wood"
    ],
    inStock: true,
    featured: true
  },
  {
    id: "2",
    name: "Minimalist Black Metal Frame",
    price: 39.99,
    image: "/frame-2.jpg",
    category: "metal",
    material: "Powder-Coated Steel",
    size: "11x14 inches",
    color: "Matte Black",
    description: "Sleek and sophisticated, our minimalist metal frame complements any modern interior. The clean lines and matte finish create a gallery-worthy display for your photos.",
    features: [
      "Durable powder-coated steel",
      "Shatter-resistant acrylic glazing",
      "Floating design effect",
      "Hardware included"
    ],
    careInstructions: [
      "Wipe with damp cloth if needed",
      "Dry immediately to prevent water spots",
      "Handle with care to avoid scratches"
    ],
    inStock: true,
    featured: true
  },
  {
    id: "3",
    name: "Baroque Gold Ornate Frame",
    price: 89.99,
    originalPrice: 109.99,
    image: "/frame-3.jpg",
    category: "ornate",
    material: "Composite with Gold Leaf",
    size: "16x20 inches",
    color: "Antique Gold",
    description: "Make a statement with this stunning baroque-inspired frame. Hand-finished with genuine gold leaf accents, it transforms any photo into a masterpiece worthy of royalty.",
    features: [
      "Hand-applied gold leaf finish",
      "Intricate baroque detailing",
      "Museum-quality glass",
      "Velvet backing"
    ],
    careInstructions: [
      "Dust gently with soft brush",
      "Avoid touching gold leaf areas",
      "Store in dry environment"
    ],
    inStock: true,
    featured: true
  },
  {
    id: "4",
    name: "Rustic Whitewash Frame",
    price: 44.99,
    image: "/frame-4.jpg",
    category: "wooden",
    material: "Reclaimed Pine",
    size: "5x7 inches",
    color: "Whitewash",
    description: "Bring farmhouse charm to your space with this beautifully distressed whitewash frame. Made from reclaimed pine, each frame tells its own story.",
    features: [
      "Eco-friendly reclaimed wood",
      "Hand-distressed finish",
      "Rustic character marks",
      "Table and wall display ready"
    ],
    careInstructions: [
      "Light dusting only",
      "Distressed finish may vary",
      "Keep away from moisture"
    ],
    inStock: true,
    featured: true
  },
  {
    id: "5",
    name: "Floating Acrylic Display",
    price: 54.99,
    image: "/frame-5.jpg",
    category: "modern",
    material: "Crystal Clear Acrylic",
    size: "8x10 inches",
    color: "Clear",
    description: "Let your photos float in space with our contemporary acrylic display. The crystal-clear design puts all focus on your memories while adding a touch of modern sophistication.",
    features: [
      "Premium grade acrylic",
      "Magnetic closure system",
      "Double-sided display option",
      "Elegant wooden base included"
    ],
    careInstructions: [
      "Clean with acrylic-safe cleaner",
      "Use microfiber cloth only",
      "Avoid abrasive materials"
    ],
    inStock: true,
    featured: true
  },
  {
    id: "6",
    name: "Gallery Collage Frame",
    price: 79.99,
    originalPrice: 99.99,
    image: "/frame-6.jpg",
    category: "collage",
    material: "Engineered Wood",
    size: "24x36 inches",
    color: "Matte Black",
    description: "Create your own gallery wall with this stunning multi-photo collage frame. Perfect for showcasing family memories, travel adventures, or milestone moments all in one beautiful display.",
    features: [
      "Holds 12 photos in various sizes",
      "Pre-arranged artistic layout",
      "Lightweight for easy hanging",
      "Includes mounting hardware"
    ],
    careInstructions: [
      "Dust regularly with soft cloth",
      "Check wall mounting periodically",
      "Replace photos through back panel"
    ],
    inStock: true,
    featured: true
  }
];

export const categories = [
  { id: "all", name: "All Frames" },
  { id: "wooden", name: "Wooden Frames" },
  { id: "metal", name: "Metal Frames" },
  { id: "ornate", name: "Ornate Frames" },
  { id: "modern", name: "Modern Frames" },
  { id: "collage", name: "Collage Frames" }
];

export const sizes = ["5x7 inches", "8x10 inches", "11x14 inches", "16x20 inches", "24x36 inches"];
export const materials = ["Solid Oak Wood", "Powder-Coated Steel", "Composite with Gold Leaf", "Reclaimed Pine", "Crystal Clear Acrylic", "Engineered Wood"];
