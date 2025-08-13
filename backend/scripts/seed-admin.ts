import { readdirSync } from "fs";

import { scrypt } from "@noble/hashes/scrypt";
import { randomBytes } from "@noble/hashes/utils";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "../drizzle/schema";
import { user } from "../drizzle/schema/user";

// Hash password using the same method as AuthService
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16); // Generate a random 16-byte salt
  const hash = scrypt(password, salt, { N: 2 ** 14, r: 8, p: 1, dkLen: 64 });

  // Combine salt and hash for storage
  const combined = new Uint8Array(salt.length + hash.length);
  combined.set(salt);
  combined.set(hash, salt.length);

  return Buffer.from(combined).toString("base64");
}

async function seedAdminUser() {
  try {
    console.log("🔍 Looking for database file...");

    // For local development, connect to the SQLite database directly
    // Dynamic import to avoid issues with better-sqlite3 types
    const { default: Database } = await import("better-sqlite3");

    // Find the actual database file (it has a hash-based name)
    const dbDir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/";
    const files = readdirSync(dbDir);
    const dbFile = files.find(
      (f) => f.endsWith(".sqlite") && f !== "local-db.sqlite",
    );

    if (!dbFile) {
      throw new Error(
        "Could not find database file. Make sure to run the dev server first to initialize the database.",
      );
    }

    const sqlite = new Database(dbDir + dbFile);
    const db = drizzle(sqlite, { schema });

    console.log("🌱 Starting admin user seeding...");

    // First, let's check if the user table exists
    try {
      const tableCheck = sqlite
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='user'",
        )
        .get();
      if (!tableCheck) {
        throw new Error(
          "User table does not exist. Make sure to run database migrations first: 'yarn db:migrate:apply'",
        );
      }
      console.log("✅ User table exists");
    } catch (error) {
      throw new Error(`Failed to check if user table exists: ${error}`);
    }

    // Check if admin user already exists
    console.log("🔍 Checking if admin user already exists...");
    const existingAdmin = await db
      .select()
      .from(user)
      .where(eq(user.email, "admin@raco.com"))
      .get();

    if (existingAdmin) {
      console.log("✅ Admin user already exists with email: admin@raco.com");
      console.log(`   User ID: ${existingAdmin.id}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Status: ${existingAdmin.status}`);
      return;
    }

    // Hash the password
    console.log("🔐 Hashing password...");
    const passwordHash = await hashPassword("admin123");

    // Create admin user
    console.log("👤 Creating admin user...");
    const adminUser = await db
      .insert(user)
      .values({
        email: "admin@raco.com",
        passwordHash,
        fullName: "Administrator",
        phone: "+1234567890",
        role: "admin",
        status: "active",
      })
      .returning();

    console.log("✅ Admin user created successfully!");
    console.log(`   Email: ${adminUser[0].email}`);
    console.log(`   Full Name: ${adminUser[0].fullName}`);
    console.log(`   Role: ${adminUser[0].role}`);
    console.log(`   Status: ${adminUser[0].status}`);
    console.log(`   User ID: ${adminUser[0].id}`);
    console.log("");
    console.log("🔑 Login credentials:");
    console.log("   Email: admin@raco.com");
    console.log("   Password: admin123");
    console.log("");
    console.log(
      "🚀 You can now login using these credentials in the API or Swagger UI!",
    );

    sqlite.close();
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
    process.exit(1);
  }
}

// Check if running directly (improved condition)
if (
  import.meta.url.startsWith("file:") &&
  process.argv[1] &&
  import.meta.url.includes(process.argv[1].replace(/\\/g, "/"))
) {
  seedAdminUser().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
} else {
  // If we can't detect if this is the main module, just run it anyway for seeding purposes
  console.log("🚀 Running seed script...");
  seedAdminUser().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
}

export { seedAdminUser };
