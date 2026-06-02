export interface Mod {
  id: number;
  title: string;
  description: string;
  short_description: string;
  game: "fs22" | "fs25";
  version: string;
  author: string;
  tags: string[];
  icon_url: string;
  gallery: string[];
  is_paid: boolean;
  price: number;
  category: string;
  file_size_mb: number;
  downloads: number;
  views: number;
  shares: number;
  featured: boolean;
  unlocked?: boolean;
  unlock_code?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "banned";
  downloads: number;
  unlocks: number;
  created_at: string;
}

export interface Activity {
  id: number;
  type: "download" | "unlock" | "register" | "upload" | "ban" | "feature" | "delete";
  message: string;
  user: string;
  timestamp: string;
}


export interface Stats {
  total_mods: number;
  total_downloads: number;
  total_users: number;
  total_unlocks: number;
  total_views: number;
  total_shares: number;
  active_users: number;
  free_mods: number;
  paid_mods: number;
}

const IMG = (id: number) => `https://picsum.photos/seed/fsmod${id}/800/500`;

export const MODS: Mod[] = [
  {
    id: 1,
    title: "John Deere 8R Series Tractor Pack",
    description: "The ultimate John Deere 8R series pack for Farming Simulator. Includes the 8R 230, 8R 310, and 8R 410 with fully customizable options including wheel configurations, engine tuning, GPS systems, and front loader attachments. Each model features realistic engine sounds recorded from actual JD 8R tractors, detailed interior with working gauges, and accurate PTO animations. Compatible with all standard implements and trailers.\n\nFeatures:\n- 3 tractor models (8R 230, 8R 310, 8R 410)\n- 12 wheel configurations\n- Realistic engine sounds\n- Working GPS guidance system\n- Front loader ready\n- Full color customization",
    short_description: "Premium John Deere 8R pack with 3 models and full customization",
    game: "fs25",
    version: "2.1.0",
    author: "AgriModding",
    tags: ["tractor", "john-deere", "premium"],
    icon_url: IMG(1),
    gallery: [IMG(11), IMG(12), IMG(13), IMG(14)],
    is_paid: true,
    price: 4.99,
    category: "vehicles",
    file_size_mb: 156.2,
    downloads: 28450,
    views: 89200,
    shares: 3420,
    featured: true,
    unlock_code: "JD8R-XKWM-2F",
    created_at: "2025-11-15T10:00:00Z",
    updated_at: "2026-03-20T14:30:00Z",
  },
  {
    id: 2,
    title: "Midwest Harvest Map",
    description: "A massive 4x map inspired by the heartland of America. Features 120 fields ranging from small family plots to massive commercial operations, 3 towns with sell points, grain elevators, and livestock markets. Includes custom terrain textures, seasonal foliage changes, and dynamic weather patterns.\n\nMap Highlights:\n- 120 farmable fields\n- 3 towns with full infrastructure\n- Rail network with functioning trains\n- Custom terrain and foliage\n- Optimized for multiplayer",
    short_description: "Massive 4x American heartland map with 120 fields",
    game: "fs25",
    version: "1.3.0",
    author: "MapMaster_US",
    tags: ["map", "american", "4x"],
    icon_url: IMG(2),
    gallery: [IMG(21), IMG(22), IMG(23)],
    is_paid: false,
    price: 0,
    category: "maps",
    file_size_mb: 892.5,
    downloads: 67800,
    views: 156300,
    shares: 8900,
    featured: true,
    created_at: "2025-09-01T08:00:00Z",
    updated_at: "2026-04-10T16:00:00Z",
  },
  {
    id: 3,
    title: "Case IH Axial-Flow 9250 Harvester",
    description: "High-detail Case IH Axial-Flow 9250 combine harvester with working header animations, realistic threshing sounds, and grain tank fill visualization. Features multiple header options and a detailed cabin interior.",
    short_description: "Detailed Case IH 9250 combine with realistic animations",
    game: "fs22",
    version: "1.5.2",
    author: "HarvestKing",
    tags: ["harvester", "case-ih", "combine"],
    icon_url: IMG(3),
    gallery: [IMG(31), IMG(32)],
    is_paid: false,
    price: 0,
    category: "harvesters",
    file_size_mb: 234.8,
    downloads: 45200,
    views: 112000,
    shares: 5600,
    featured: true,
    created_at: "2025-06-20T12:00:00Z",
    updated_at: "2026-01-15T09:00:00Z",
  },
  {
    id: 4,
    title: "Precision Seeder Pack",
    description: "Collection of 6 precision seeders from top manufacturers. Each seeder features accurate seed placement mechanics, variable rate seeding, and GPS section control. Perfect for realistic farming operations.",
    short_description: "6 precision seeders with GPS section control",
    game: "fs25",
    version: "1.0.0",
    author: "FarmTech_Pro",
    tags: ["seeder", "implements", "precision"],
    icon_url: IMG(4),
    gallery: [IMG(41), IMG(42)],
    is_paid: true,
    price: 2.99,
    category: "implements",
    file_size_mb: 89.3,
    downloads: 12300,
    views: 34500,
    shares: 1200,
    featured: false,
    unlock_code: "SEED-PACK-7X",
    created_at: "2026-01-10T14:00:00Z",
    updated_at: "2026-04-05T11:00:00Z",
  },
  {
    id: 5,
    title: "Bavarian Alps Map",
    description: "Experience farming in the stunning Bavarian Alps. This medium-sized map features steep hillside fields, traditional Alpine farmsteads, and breathtaking mountain scenery. Includes custom foliage, terrain textures, and ambient sounds.",
    short_description: "Alpine farming map with mountain scenery",
    game: "fs22",
    version: "2.0.1",
    author: "AlpenModder",
    tags: ["map", "european", "mountains"],
    icon_url: IMG(5),
    gallery: [IMG(51), IMG(52)],
    is_paid: false,
    price: 0,
    category: "maps",
    file_size_mb: 567.1,
    downloads: 38900,
    views: 87600,
    shares: 4300,
    featured: false,
    created_at: "2025-03-15T10:00:00Z",
    updated_at: "2025-12-20T08:00:00Z",
  },
  {
    id: 6,
    title: "Livestock Pro - Animal Management",
    description: "Complete animal management overhaul. Adds realistic animal AI behaviors, detailed health systems, breeding mechanics, and custom animal shelters. Supports cows, sheep, pigs, chickens, and horses.",
    short_description: "Complete animal management and breeding overhaul",
    game: "fs25",
    version: "1.2.0",
    author: "LivestockLabs",
    tags: ["animals", "gameplay", "management"],
    icon_url: IMG(6),
    gallery: [IMG(61)],
    is_paid: true,
    price: 3.49,
    category: "animals",
    file_size_mb: 45.6,
    downloads: 19800,
    views: 52100,
    shares: 2800,
    featured: false,
    unlock_code: "LIVE-STCK-9Z",
    created_at: "2025-12-01T09:00:00Z",
    updated_at: "2026-03-01T15:00:00Z",
  },
  {
    id: 7,
    title: "Fendt 1050 Vario",
    description: "The flagship Fendt 1050 Vario with 517hp engine, Variogrip tire pressure system, and fully animated Vario transmission. Interior features a working terminal display and realistic control layout.",
    short_description: "Flagship Fendt 1050 with Vario transmission",
    game: "fs25",
    version: "1.1.0",
    author: "GermanMods",
    tags: ["tractor", "fendt", "high-hp"],
    icon_url: IMG(7),
    gallery: [IMG(71), IMG(72)],
    is_paid: false,
    price: 0,
    category: "vehicles",
    file_size_mb: 178.4,
    downloads: 52100,
    views: 134500,
    shares: 6700,
    featured: true,
    created_at: "2025-10-05T11:00:00Z",
    updated_at: "2026-02-14T13:00:00Z",
  },
  {
    id: 8,
    title: "Grain Storage Complex",
    description: "A complete grain storage facility with multiple silo types, grain dryers, conveyor systems, and truck loading bays. All buildings are placeable and can be customized in size and color.",
    short_description: "Placeable grain storage with silos and conveyors",
    game: "fs22",
    version: "1.0.3",
    author: "BuilderBob_FS",
    tags: ["placeable", "storage", "grain"],
    icon_url: IMG(8),
    gallery: [IMG(81)],
    is_paid: false,
    price: 0,
    category: "placeables",
    file_size_mb: 34.2,
    downloads: 31200,
    views: 67800,
    shares: 2100,
    featured: false,
    created_at: "2025-07-22T16:00:00Z",
    updated_at: "2025-11-30T10:00:00Z",
  },
  {
    id: 9,
    title: "Seasons Reloaded",
    description: "Enhanced seasonal cycle mod with dynamic crop growth, weather events, economic fluctuations tied to seasons, and visual environment changes. A must-have for realistic gameplay.",
    short_description: "Enhanced seasonal cycle with dynamic crop growth",
    game: "fs25",
    version: "3.0.0",
    author: "RealFarm_Team",
    tags: ["gameplay", "seasons", "realism"],
    icon_url: IMG(9),
    gallery: [IMG(91), IMG(92)],
    is_paid: true,
    price: 5.99,
    category: "gameplay",
    file_size_mb: 12.8,
    downloads: 72400,
    views: 198000,
    shares: 11200,
    featured: false,
    unlock_code: "SEAS-RLOD-4K",
    created_at: "2025-08-10T08:00:00Z",
    updated_at: "2026-05-01T12:00:00Z",
  },
  {
    id: 10,
    title: "Krone BiG X 1180 Forage Harvester",
    description: "The massive Krone BiG X 1180 forage harvester with 1156hp engine, multiple header options, and realistic chopping mechanics. Includes the cargo trailer addon.",
    short_description: "Massive Krone forage harvester with 1156hp",
    game: "fs22",
    version: "1.4.0",
    author: "HarvestKing",
    tags: ["harvester", "krone", "forage"],
    icon_url: IMG(10),
    gallery: [IMG(101), IMG(102)],
    is_paid: false,
    price: 0,
    category: "harvesters",
    file_size_mb: 198.7,
    downloads: 29800,
    views: 76400,
    shares: 3800,
    featured: false,
    created_at: "2025-04-18T14:00:00Z",
    updated_at: "2025-10-25T09:00:00Z",
  },
  {
    id: 11,
    title: "Auto Drive Course Manager",
    description: "Advanced auto-drive system with route planning, field detection, and convoy support. Create custom routes between fields, sell points, and storage facilities.",
    short_description: "AI route planning with convoy support",
    game: "fs25",
    version: "2.3.1",
    author: "AutoFarm_AI",
    tags: ["gameplay", "automation", "ai"],
    icon_url: IMG(15),
    gallery: [IMG(111)],
    is_paid: false,
    price: 0,
    category: "gameplay",
    file_size_mb: 8.4,
    downloads: 95600,
    views: 223000,
    shares: 15400,
    featured: false,
    created_at: "2025-05-30T10:00:00Z",
    updated_at: "2026-04-20T16:00:00Z",
  },
  {
    id: 12,
    title: "New Holland CR10.90 Revelation",
    description: "The New Holland CR10.90 Revelation combine with 652hp engine, 14500L grain tank, and advanced crop handling. Features Terra Trac undercarriage and IntelliView IV terminal.",
    short_description: "NH CR10.90 combine with Terra Trac system",
    game: "fs25",
    version: "1.0.0",
    author: "BlueForce_FS",
    tags: ["harvester", "new-holland", "combine"],
    icon_url: IMG(16),
    gallery: [IMG(121), IMG(122)],
    is_paid: true,
    price: 3.99,
    category: "harvesters",
    file_size_mb: 267.3,
    downloads: 8900,
    views: 24500,
    shares: 890,
    featured: false,
    unlock_code: "NHCR-10RV-5B",
    created_at: "2026-02-28T09:00:00Z",
    updated_at: "2026-05-15T14:00:00Z",
  },
];

export const USERS: User[] = [
  { id: 1, name: "Admin", email: "admin@fsmodshub.com", role: "admin", status: "active", downloads: 24, unlocks: 5, created_at: "2025-01-01T00:00:00Z" },
  { id: 2, name: "John Farmer", email: "john@example.com", role: "user", status: "active", downloads: 18, unlocks: 3, created_at: "2025-03-15T10:00:00Z" },
  { id: 3, name: "Sarah Fields", email: "sarah.fields@gmail.com", role: "user", status: "active", downloads: 42, unlocks: 7, created_at: "2025-04-02T14:20:00Z" },
  { id: 4, name: "Mike Harvest", email: "mike.h@outlook.com", role: "user", status: "active", downloads: 9, unlocks: 1, created_at: "2025-06-18T09:00:00Z" },
  { id: 5, name: "AgriModding", email: "contact@agrimodding.com", role: "user", status: "active", downloads: 3, unlocks: 0, created_at: "2025-07-10T11:30:00Z" },
  { id: 6, name: "SpamBot_99", email: "spammer@fakeemail.net", role: "user", status: "banned", downloads: 0, unlocks: 0, created_at: "2025-09-22T03:14:00Z" },
  { id: 7, name: "MapMaster_US", email: "maps@mapmaster.us", role: "user", status: "active", downloads: 56, unlocks: 4, created_at: "2025-05-28T16:00:00Z" },
  { id: 8, name: "TractorFan2000", email: "tractorfan@mail.de", role: "user", status: "active", downloads: 31, unlocks: 2, created_at: "2025-08-04T07:45:00Z" },
  { id: 9, name: "xXModHackerXx", email: "hacker@tempmail.org", role: "user", status: "banned", downloads: 0, unlocks: 0, created_at: "2025-11-11T22:10:00Z" },
  { id: 10, name: "Elena Crops", email: "elena.c@farmnet.eu", role: "user", status: "active", downloads: 27, unlocks: 5, created_at: "2025-10-19T13:00:00Z" },
  { id: 11, name: "HarvestKing", email: "king@harvestmods.com", role: "user", status: "active", downloads: 14, unlocks: 0, created_at: "2025-02-14T10:00:00Z" },
  { id: 12, name: "GermanMods", email: "info@germanmods.de", role: "user", status: "active", downloads: 8, unlocks: 0, created_at: "2025-04-20T15:30:00Z" },
];

export const ACTIVITY: Activity[] = [
  { id: 1, type: "download", message: "Downloaded John Deere 8R Series Tractor Pack", user: "Sarah Fields", timestamp: "2026-05-30T15:42:00Z" },
  { id: 2, type: "register", message: "New user registered", user: "FreshFarmer_01", timestamp: "2026-05-30T15:30:00Z" },
  { id: 3, type: "unlock", message: "Unlocked Seasons Reloaded with code", user: "Elena Crops", timestamp: "2026-05-30T14:58:00Z" },
  { id: 4, type: "download", message: "Downloaded Midwest Harvest Map", user: "TractorFan2000", timestamp: "2026-05-30T14:20:00Z" },
  { id: 5, type: "feature", message: "Fendt 1050 Vario marked as featured", user: "Admin", timestamp: "2026-05-30T13:45:00Z" },
  { id: 6, type: "ban", message: "User xXModHackerXx banned for TOS violation", user: "Admin", timestamp: "2026-05-30T12:10:00Z" },
  { id: 7, type: "upload", message: "New mod uploaded: Auto Drive Course Manager v2.3.1", user: "AutoFarm_AI", timestamp: "2026-05-30T11:00:00Z" },
  { id: 8, type: "download", message: "Downloaded Bavarian Alps Map", user: "John Farmer", timestamp: "2026-05-30T10:30:00Z" },
  { id: 9, type: "unlock", message: "Unlocked Precision Seeder Pack with code", user: "Mike Harvest", timestamp: "2026-05-30T09:15:00Z" },
  { id: 10, type: "delete", message: "Removed mod: Broken Tractor v0.1 (rule violation)", user: "Admin", timestamp: "2026-05-29T22:00:00Z" },
  { id: 11, type: "register", message: "New user registered", user: "CropQueen_88", timestamp: "2026-05-29T20:45:00Z" },
  { id: 12, type: "download", message: "Downloaded Krone BiG X 1180 Forage Harvester", user: "MapMaster_US", timestamp: "2026-05-29T18:30:00Z" },
];

export const STATS: Stats = {
  total_mods: MODS.length,
  total_downloads: MODS.reduce((s, m) => s + m.downloads, 0),
  total_users: 14832,
  total_unlocks: 3241,
  total_views: MODS.reduce((s, m) => s + m.views, 0),
  total_shares: MODS.reduce((s, m) => s + m.shares, 0),
  active_users: 2847,
  free_mods: MODS.filter(m => !m.is_paid).length,
  paid_mods: MODS.filter(m => m.is_paid).length,
};
