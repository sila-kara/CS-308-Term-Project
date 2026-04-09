// Run with: node seed.js
// Seeds the Product collection from the frontend static data.
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const rawProducts = [
  { name: "Crime and Punishment", model: "Hardcover", serialNumber: "ISBN-9780140449136", description: "Dostoevsky's masterpiece exploring guilt, morality, and redemption through the story of Raskolnikov.", category: "Fiction", quantity: 15, price: 85.00, warranty: "Exchange guarantee", distributor: "Fyodor Dostoevsky", rating: 4.8, ratingCount: 2340 },
  { name: "1984", model: "Paperback", serialNumber: "ISBN-9780451524935", description: "A dystopian novel about totalitarianism, surveillance, and the struggle for individual freedom.", category: "Fiction", quantity: 23, price: 65.00, warranty: "Exchange guarantee", distributor: "George Orwell", rating: 4.9, ratingCount: 5120 },
  { name: "The Little Prince", model: "Illustrated Edition", serialNumber: "ISBN-9780156012195", description: "A poetic tale about a young prince who travels the universe learning about life and love.", category: "Fiction", quantity: 30, price: 55.00, warranty: "Exchange guarantee", distributor: "Antoine de Saint-Exupéry", rating: 4.7, ratingCount: 4890 },
  { name: "Sapiens", model: "Paperback", serialNumber: "ISBN-9780062316097", description: "A brief history of humankind from the Stone Age to the 21st century.", category: "History", quantity: 18, price: 95.00, warranty: "Exchange guarantee", distributor: "Yuval Noah Harari", rating: 4.6, ratingCount: 6720 },
  { name: "A Brief History of Time", model: "Paperback", serialNumber: "ISBN-9780553380163", description: "Stephen Hawking explores the cosmos, black holes, and the nature of time for general readers.", category: "Science", quantity: 12, price: 75.00, warranty: "Exchange guarantee", distributor: "Stephen Hawking", rating: 4.7, ratingCount: 3210 },
  { name: "The Art of War", model: "Hardcover", serialNumber: "ISBN-9781599869773", description: "Sun Tzu's ancient Chinese military treatise remains relevant across business, strategy, and life.", category: "Philosophy", quantity: 25, price: 45.00, warranty: "Exchange guarantee", distributor: "Sun Tzu", rating: 4.5, ratingCount: 4100 },
  { name: "Clean Code", model: "Paperback", serialNumber: "ISBN-9780132350884", description: "Robert C. Martin shares best practices for writing readable, maintainable software.", category: "Technology", quantity: 10, price: 120.00, warranty: "Exchange guarantee", distributor: "Robert C. Martin", rating: 4.8, ratingCount: 2890 },
  { name: "Meditations", model: "Paperback", serialNumber: "ISBN-9780140449334", description: "Personal writings of Marcus Aurelius, Roman Emperor, exploring Stoic philosophy.", category: "Philosophy", quantity: 20, price: 60.00, warranty: "Exchange guarantee", distributor: "Marcus Aurelius", rating: 4.9, ratingCount: 5670 },
  { name: "The Pragmatic Programmer", model: "Hardcover", serialNumber: "ISBN-9780135957059", description: "Tips and techniques for programmers to sharpen skills and build better software.", category: "Technology", quantity: 8, price: 130.00, warranty: "Exchange guarantee", distributor: "David Thomas & Andrew Hunt", rating: 4.7, ratingCount: 1980 },
  { name: "Atomic Habits", model: "Hardcover", serialNumber: "ISBN-9780735211292", description: "James Clear's guide to building good habits and breaking bad ones through tiny changes.", category: "Self-Help", quantity: 35, price: 90.00, warranty: "Exchange guarantee", distributor: "James Clear", rating: 4.8, ratingCount: 9870 },
];

function openLibraryCover(serialNumber) {
  const isbn = serialNumber.replace(/^ISBN-/, "");
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  await Product.deleteMany({});
  console.log("Cleared existing products");

  const docs = rawProducts.map((p) => ({ ...p, image: openLibraryCover(p.serialNumber) }));
  await Product.insertMany(docs);
  console.log(`Seeded ${docs.length} products`);

  await mongoose.disconnect();
  console.log("Done");
}

seed().catch((err) => { console.error(err); process.exit(1); });
