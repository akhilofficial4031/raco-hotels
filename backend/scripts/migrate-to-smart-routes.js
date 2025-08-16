#!/usr/bin/env node

/**
 * Migration script to convert existing route definitions to use the new smart routes system
 *
 * Usage: node backend/scripts/migrate-to-smart-routes.js
 *
 * This script will:
 * 1. Update imports in *.definition.ts files
 * 2. Replace createPublicRoute/createAuthenticatedRoute with createRoute
 * 3. Add comments explaining the new system
 */

const fs = require("fs");
const path = require("path");

const definitionsDir = path.join(__dirname, "../src/definitions");

function migrateDefinitionFile(filePath) {
  console.log(`Migrating ${filePath}...`);

  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // Update imports
  if (
    content.includes("createPublicRoute") ||
    content.includes("createAuthenticatedRoute")
  ) {
    // Replace import statement
    content = content.replace(
      /import\s*{\s*([^}]*(?:createPublicRoute|createAuthenticatedRoute)[^}]*)\s*}\s*from\s*["']\.\.\/lib\/openapi["']/g,
      (match, imports) => {
        // Keep other imports but replace route creation functions
        const otherImports = imports
          .split(",")
          .map((imp) => imp.trim())
          .filter(
            (imp) =>
              !imp.includes("createPublicRoute") &&
              !imp.includes("createAuthenticatedRoute"),
          )
          .join(", ");

        const newImports = otherImports
          ? `createRoute, ${otherImports}`
          : "createRoute";
        return `import { ${newImports} } from "../lib/route-wrapper"`;
      },
    );

    // Replace function calls
    content = content.replace(/createPublicRoute\(/g, "createRoute(");
    content = content.replace(/createAuthenticatedRoute\(/g, "createRoute(");

    // Add comment if not already present
    if (!content.includes("All routes now use createRoute()")) {
      content = content.replace(
        /export const (\w+RouteDefinitions) = {/,
        `export const $1 = {
  // All routes now use createRoute() - it automatically determines public vs authenticated
  // based on PUBLIC_ROUTES configuration in config/routes.ts`,
      );
    }

    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Migrated ${path.basename(filePath)}`);
  } else {
    console.log(`⚪ No changes needed for ${path.basename(filePath)}`);
  }
}

function migrateRouteFile(filePath) {
  console.log(`Migrating route file ${filePath}...`);

  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // Check if it needs migration (has manual permission checks)
  if (
    content.includes("assertPermission") &&
    content.includes("isPublicRoute")
  ) {
    console.log(
      `⚠️  ${path.basename(filePath)} contains manual permission checks.`,
    );
    console.log(
      `   Please manually update to use smartPermissionHandler from ../middleware/smart-auth`,
    );
    console.log(`   See the guide in backend/src/docs/SMART_ROUTES_GUIDE.md`);
  } else if (content.includes("globalAuthMiddleware")) {
    // Simple replacement for middleware
    content = content.replace(
      /import.*globalAuthMiddleware.*from.*["']\.\.\/middleware\/public-routes["']/,
      'import { smartAuthMiddleware } from "../middleware/smart-auth"',
    );
    content = content.replace(
      /globalAuthMiddleware\(\)/g,
      "smartAuthMiddleware()",
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated middleware in ${path.basename(filePath)}`);
  }
}

// Main migration
console.log("🚀 Starting smart routes migration...\n");

// Migrate definition files
if (fs.existsSync(definitionsDir)) {
  const files = fs
    .readdirSync(definitionsDir)
    .filter((file) => file.endsWith(".definition.ts"))
    .map((file) => path.join(definitionsDir, file));

  console.log("📋 Migrating definition files...");
  files.forEach(migrateDefinitionFile);
}

// Migrate route files
const routesDir = path.join(__dirname, "../src/routes");
if (fs.existsSync(routesDir)) {
  const files = fs
    .readdirSync(routesDir)
    .filter((file) => file.endsWith(".route.ts"))
    .map((file) => path.join(routesDir, file));

  console.log("\n🛣️  Checking route files...");
  files.forEach(migrateRouteFile);
}

console.log("\n✨ Migration complete!");
console.log("\n📚 Next steps:");
console.log(
  "1. Update your PUBLIC_ROUTES array in backend/src/config/routes.ts",
);
console.log("2. Test your routes to ensure they work correctly");
console.log("3. Read the full guide: backend/src/docs/SMART_ROUTES_GUIDE.md");
console.log("\n🎉 Enjoy the simplified route management!");
