export interface Product {
  id: string;
  name: string;
  category: string;
  priority: number;
  image: string;
  images: string[];
  description: string;
  features: string[];
  specs: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
}

export const categories: Category[] = [
  { id: "pressure-fryer", name: "Pressure Fryers" },
  { id: "open-fryer", name: "Open Fryers" },
  { id: "combi-oven", name: "Combi Ovens" },
  { id: "holding-equipment", name: "Holding Equipment" }
];

export const productsData: Product[] = [
  // --- Pressure Fryers (2 items) ---
  {
    id: "nsrco-pf-1800",
    name: "NSRCO Pressure Fryer 1800",
    category: "pressure-fryer",
    priority: 1,
    image: "/images/nsrco-pf-1800.webp",
    images: ["/images/nsrco-pf-1800.webp", "/images/nsrco-pf-1800.webp", "/images/nsrco-pf-1800.webp"],
    description: "Round cooking well with 21 liter cooking oil capacity operates between 12-14 psi gauge pressure at temperatures up to 375°F.",
    features: [
      "Fast and productive – specifically designed for high volume production, cooks up to 40 pieces of fresh bone-in chicken per load in as little as 10 minutes*.",
      "Unique Pressure Activated Cover Locking Mechanism – quick closing and opening single action sealing including a pressure-activated cover locking mechanism for safety and ease of use.",
      "Digital controls for accurate timing and temperature.",
      "Stainless steel pot construction for easy cleaning and long life."
    ],
    specs: { "Oil Capacity": "21 Liters", "Power": "380 V", "Watts": "9 kW", "Temp Range": "50-200°C" }
  },
  {
    id: "nsrco-pf-1800-hp",
    name: "NSRCO Pressure Fryer HP",
    category: "pressure-fryer",
    priority: 2,
    image: "/images/pressure-fryer.webp",
    images: ["/images/pressure-fryer.webp", "/images/pressure-fryer.webp", "/images/pressure-fryer.webp"],
    description: "High-performance fryer designed for safety, efficiency, and space savings, featuring a pressure-sealed lid, advanced heating systems, onboard filtration, and durable stainless-steel construction.",
    features: [
      "Frying under pressure seals in flavor, reduces cook time and temperature.",
      "Allows cooking smaller batches on demand with the same quality and consistency.",
      "High-efficiency heating elements producing extremely fast temperature recovery.",
      "Quick recovery between batches for continuous high-throughput cooking."
    ],
    specs: { "Oil Capacity": "24 Liters", "Power": "13.5 kW", "Temp Range": "50-200°C", "Type": "Electric / Gas" }
  },
  
  // --- Open Fryers (3 items) ---
  {
    id: "of-100",
    name: "Rack Fryer",
    category: "open-fryer",
    priority: 5,
    image: "/images/open-fryer.webp",
    images: ["/images/open-fryer.webp", "/images/open-fryer.webp", "/images/open-fryer.webp"],
    description: "Reliable open fryer for general purpose commercial high-volume frying needs.",
    features: [
      "Holds 6-head chicken or (6.5 kg) of food per load.",
      "Fast recovery in electric and gas units.",
      "Gas units: Reliable draft-induced heat transfer technology with solid-state ignition.",
      "Accepts standard half-racks to minimize product handling and double output.",
      "Counter-balance lid lift for safe and easy loading/unloading.",
      "Fully insulated, heavy-duty stainless steel fry pot."
    ],
    specs: { "Oil Capacity": "24 Liters", "Power": "380 V", "Watts": "9 kW", "Type": "Electric / Gas" }
  },
  {
    id: "of-bras-nf1",
    name: "Open Fryer NF1",
    category: "open-fryer",
    priority: 6,
    image: "/images/open-fryer-bras-nf1.webp",
    images: ["/images/open-fryer-bras-nf1.webp", "/images/open-fryer-bras-nf1.webp", "/images/open-fryer-bras-nf1.webp"],
    description: "Reliable open fryer for general purpose commercial frying needs with high efficiency.",
    features: [
      "Cooks 4-head chicken or (4.25 kg) of food per load.",
      "Fast recovery in electric and gas units.",
      "Fully insulated, heavy-duty stainless steel fry pot."
    ],
    specs: { "Oil Capacity": "26 Liters", "Power": "380 V", "Watts": "18 kW", "Type": "Electric / Gas" }
  },
  {
    id: "of-bras-nf2",
    name: "Open Fryer NF2",
    category: "open-fryer",
    priority: 7,
    image: "/images/open-fryer-bras-nf2.webp",
    images: ["/images/open-fryer-bras-nf2.webp", "/images/open-fryer-bras-nf2.webp", "/images/open-fryer-bras-nf2.webp"],
    description: "Reliable open fryer for general purpose commercial frying needs, engineered for power savings.",
    features: [
      "Cooks 4-head chicken or (4.25 kg) of food per load.",
      "Fast recovery in electric and gas units.",
      "Fully insulated, heavy-duty stainless steel fry pot."
    ],
    specs: { "Oil Capacity": "26 Liters", "Power": "380 V", "Watts": "9 kW", "Type": "Electric / Gas" }
  },

  // --- Vacuum Tumblers (1 item) ---
  {
    id: "massage-tumbler-1",
    name: "Vacuum Massage Tumblers Machine",
    category: "massage-tumblers",
    priority: 9,
    image: "/images/marinate-vacum-tumbler.webp",
    images: ["/images/marinate-vacum-tumbler.webp", "/images/marinate-vacum-tumbler.webp", "/images/marinate-vacum-tumbler.webp"],
    description: "Vacuum Massage Tumblers Machine from NSRCO Machinery is made of stainless steel. This machine is for shortening pickling time while upgrading product freshness, increasing water content in pickles, maintaining tenderness and then improving product quality.",
    features: [
      "Complete stainless steel structure for maximum durability and sanitization.",
      "Hygienic design, extremely easy to clean.",
      "Easy to operate, minimal maintenance, and supports continuous 24-hour operation.",
      "Auto clean setup for simple cleaning cycles."
    ],
    specs: { "Capacity": "250 L, 200 L, 150 L", "Power": "380 V", "Watts": "700 W" }
  },

  // --- Holding Equipment (1 item) ---
  {
    id: "he-100",
    name: "Holding Cabinet HE-100",
    category: "others",
    priority: 13,
    image: "/images/holding-equipment.webp",
    images: ["/images/holding-equipment.webp", "/images/holding-equipment.webp", "/images/holding-equipment.webp"],
    description: "Under-counter holding cabinet to keep food hot at point of service.",
    features: [
      "Adjustable humidity to prevent food drying.",
      "Clear digital temperature display.",
      "Pass-through design option for convenient loading.",
      "Fully insulated shell to preserve thermal energy."
    ],
    specs: { "Capacity": "5 Pans", "Power": "1 kW", "Temp Range": "65-90°C" }
  }
];
