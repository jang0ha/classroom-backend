import express from "express";
import { eq } from "drizzle-orm";
import { db } from "./db/index.js";
import { demoUsers } from "./db/schema/index.js";

const app = express();
const PORT = 8000;

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Classroom API is running" });
});

async function main() {
  try {
    console.log("Performing CRUD operations...");

    // CREATE
    const [newUser] = await db
      .insert(demoUsers)
      .values({ name: "Admin User", email: "admin@example.com" })
      .returning();

    if (!newUser) throw new Error("Failed to create user");
    console.log("✅ CREATE: New user created:", newUser);

    // READ
    const foundUser = await db
      .select()
      .from(demoUsers)
      .where(eq(demoUsers.id, newUser.id));
    console.log("✅ READ: Found user:", foundUser[0]);

    // UPDATE
    const [updatedUser] = await db
      .update(demoUsers)
      .set({ name: "Super Admin" })
      .where(eq(demoUsers.id, newUser.id))
      .returning();

    if (!updatedUser) throw new Error("Failed to update user");
    console.log("✅ UPDATE: User updated:", updatedUser);

    // DELETE
    await db.delete(demoUsers).where(eq(demoUsers.id, newUser.id));
    console.log("✅ DELETE: User deleted.");

    console.log("\nCRUD operations completed successfully.");
  } catch (error) {
    console.error("❌ Error performing CRUD operations:", error);
    process.exit(1);
  }
}

main();

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
