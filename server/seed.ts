// Seed default college prep categories
import { db } from "./db";
import { categories } from "@shared/schema";
import { eq } from "drizzle-orm";
import { fileURLToPath } from 'url';

const defaultCategories = [
  {
    name: "College Applications",
    description: "Application submissions, essays, and deadlines",
    color: "chart-1",
    icon: "FileText",
    sortOrder: 1,
  },
  {
    name: "Financial Aid & FAFSA",
    description: "Financial aid forms, scholarships, and FAFSA submission",
    color: "chart-2",
    icon: "DollarSign",
    sortOrder: 2,
  },
  {
    name: "Housing & Registration",
    description: "Dorm selection, course registration, and orientation",
    color: "chart-3",
    icon: "Home",
    sortOrder: 3,
  },
  {
    name: "Testing & Transcripts",
    description: "SAT/ACT scores, transcripts, and test prep",
    color: "chart-4",
    icon: "GraduationCap",
    sortOrder: 4,
  },
  {
    name: "Health & Documentation",
    description: "Immunizations, insurance, and medical records",
    color: "chart-5",
    icon: "Heart",
    sortOrder: 5,
  },
  {
    name: "Move-In Preparation",
    description: "Packing, shopping, and logistics for move-in",
    color: "primary",
    icon: "Package",
    sortOrder: 6,
  },
];

export async function seedCategories() {
  try {
    console.log("Seeding categories...");
    
    for (const category of defaultCategories) {
      // Check if category already exists by name
      const existing = await db.select().from(categories).where(eq(categories.name, category.name));
      
      if (existing.length === 0) {
        await db.insert(categories).values(category);
        console.log(`Created category: ${category.name}`);
      } else {
        console.log(`Category already exists: ${category.name}`);
      }
    }
    
    console.log("Categories seeded successfully");
  } catch (error) {
    console.error("Error seeding categories:", error);
    throw error;
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedCategories()
    .then(() => {
      console.log("Seed completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
}
