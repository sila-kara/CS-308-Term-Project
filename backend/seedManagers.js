// Run with: npm run seed:managers
require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./models/User");

function requiredEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`${name} is required in backend/.env`);
  }
  return value.trim();
}

async function upsertManager({ name, email, password, role }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.findOneAndUpdate(
    { email },
    {
      name,
      email,
      password: hashedPassword,
      role,
    },
    { upsert: true, returnDocument: "after", runValidators: true }
  );

  console.log(`Ready: ${user.email} (${user.role})`);
}

async function seedManagers() {
  await mongoose.connect(requiredEnv("MONGO_URI"));

  await upsertManager({
    name: "Product Manager",
    email: requiredEnv("PRODUCT_MANAGER_EMAIL"),
    password: requiredEnv("PRODUCT_MANAGER_PASSWORD"),
    role: "product_manager",
  });

  await upsertManager({
    name: "Sales Manager",
    email: requiredEnv("SALES_MANAGER_EMAIL"),
    password: requiredEnv("SALES_MANAGER_PASSWORD"),
    role: "sales_manager",
  });

  await mongoose.disconnect();
  console.log("Manager accounts are ready.");
}

seedManagers().catch(async (err) => {
  console.error(err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
