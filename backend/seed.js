// Run with: node seed.js
require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Product = require("./models/Product");
const Category = require("./models/Category");
const User = require("./models/User");
const Order = require("./models/Order");
const { encrypt } = require("./utils/encrypt");

const DEMO_CUSTOMER_EMAIL = process.env.DEMO_CUSTOMER_EMAIL || "alice.demo@bookworld.test";
const DEMO_CUSTOMER_PASSWORD = process.env.DEMO_CUSTOMER_PASSWORD || "DemoPass123!";
const DEMO_CUSTOMER_NAME = process.env.DEMO_CUSTOMER_NAME || "Alice Demo";
const DEMO_CUSTOMER_TAX_ID = process.env.DEMO_CUSTOMER_TAX_ID || "1234567890";
const DEMO_CUSTOMER_ADDRESS = process.env.DEMO_CUSTOMER_ADDRESS || "12 Demo Street, Istanbul";

const rawProducts = [
  // === FICTION ===
  { name: "Crime and Punishment", model: "Hardcover", serialNumber: "ISBN-9780140449136", description: "Dostoevsky's masterpiece exploring guilt, morality, and redemption through the story of Raskolnikov.", category: "Fiction", quantity: 15, price: 85.00, warranty: "Exchange guarantee", distributor: "Fyodor Dostoevsky", rating: 4.8, ratingCount: 2340 },
  { name: "1984", model: "Paperback", serialNumber: "ISBN-9780451524935", description: "A dystopian novel about totalitarianism, surveillance, and the struggle for individual freedom.", category: "Fiction", quantity: 23, price: 65.00, warranty: "Exchange guarantee", distributor: "George Orwell", rating: 4.9, ratingCount: 5120 },
  { name: "The Little Prince", model: "Illustrated Edition", serialNumber: "ISBN-9780156012195", description: "A poetic tale about a young prince who travels the universe learning about life and love.", category: "Fiction", quantity: 30, price: 55.00, warranty: "Exchange guarantee", distributor: "Antoine de Saint-Exupéry", rating: 4.7, ratingCount: 4890 },
  { name: "To Kill a Mockingbird", model: "Paperback", serialNumber: "ISBN-9780061120084", description: "Harper Lee's Pulitzer Prize-winning novel about racial injustice in the American South.", category: "Fiction", quantity: 18, price: 72.00, warranty: "Exchange guarantee", distributor: "Harper Lee", rating: 4.8, ratingCount: 4530 },
  { name: "The Great Gatsby", model: "Hardcover", serialNumber: "ISBN-9780743273565", description: "F. Scott Fitzgerald's portrait of the Jazz Age and the American Dream's corruption.", category: "Fiction", quantity: 30, price: 58.00, warranty: "Exchange guarantee", distributor: "F. Scott Fitzgerald", rating: 4.5, ratingCount: 3200 },
  { name: "Pride and Prejudice", model: "Paperback", serialNumber: "ISBN-9780141439518", description: "Jane Austen's beloved novel of manners, marriage, and misunderstandings in Georgian England.", category: "Fiction", quantity: 22, price: 48.00, warranty: "Exchange guarantee", distributor: "Jane Austen", rating: 4.7, ratingCount: 6100 },
  { name: "Brave New World", model: "Paperback", serialNumber: "ISBN-9780060850524", description: "Aldous Huxley's vision of a future society controlled by technology, conditioning, and pleasure.", category: "Fiction", quantity: 14, price: 62.00, warranty: "Exchange guarantee", distributor: "Aldous Huxley", rating: 4.6, ratingCount: 2870 },
  { name: "The Catcher in the Rye", model: "Paperback", serialNumber: "ISBN-9780316769488", description: "J.D. Salinger's classic novel of teenage alienation and loss of innocence in 1950s New York.", category: "Fiction", quantity: 0, price: 55.00, warranty: "Exchange guarantee", distributor: "J.D. Salinger", rating: 4.3, ratingCount: 1980 },

  // === SCIENCE ===
  { name: "Sapiens: A Brief History of Humankind", model: "Hardcover", serialNumber: "ISBN-9780062316097", description: "Yuval Noah Harari's sweeping narrative of how Homo sapiens came to dominate the planet.", category: "Science", quantity: 8, price: 120.00, warranty: "Exchange guarantee", distributor: "Yuval Noah Harari", rating: 4.7, ratingCount: 4890 },
  { name: "Cosmos", model: "Hardcover", serialNumber: "ISBN-9780345539434", description: "Carl Sagan's legendary exploration of the universe, from the Big Bang to the search for extraterrestrial life.", category: "Science", quantity: 12, price: 95.00, warranty: "Exchange guarantee", distributor: "Carl Sagan", rating: 4.8, ratingCount: 3430 },
  { name: "A Brief History of Time", model: "Paperback", serialNumber: "ISBN-9780553380163", description: "Stephen Hawking's groundbreaking book on cosmology, black holes, and the nature of time.", category: "Science", quantity: 20, price: 78.00, warranty: "Exchange guarantee", distributor: "Stephen Hawking", rating: 4.6, ratingCount: 5670 },
  { name: "The Selfish Gene", model: "40th Anniversary Edition", serialNumber: "ISBN-9780198788607", description: "Richard Dawkins' revolutionary look at evolution from the gene's point of view.", category: "Science", quantity: 7, price: 88.00, warranty: "Exchange guarantee", distributor: "Richard Dawkins", rating: 4.5, ratingCount: 1560 },
  { name: "The Origin of Species", model: "150th Anniversary Edition", serialNumber: "ISBN-9780451529060", description: "Charles Darwin's foundational work that introduced the theory of evolution by natural selection.", category: "Science", quantity: 10, price: 68.00, warranty: "Exchange guarantee", distributor: "Charles Darwin", rating: 4.4, ratingCount: 890 },
  { name: "Astrophysics for People in a Hurry", model: "Hardcover", serialNumber: "ISBN-9780393609394", description: "Neil deGrasse Tyson's concise guide to the universe for the busy reader.", category: "Science", quantity: 35, price: 82.00, warranty: "Exchange guarantee", distributor: "Neil deGrasse Tyson", rating: 4.6, ratingCount: 3210 },

  // === HISTORY ===
  { name: "Guns, Germs, and Steel", model: "Revised Edition", serialNumber: "ISBN-9780393354324", description: "Jared Diamond's Pulitzer Prize-winning analysis of why certain civilizations conquered others.", category: "History", quantity: 16, price: 98.00, warranty: "Exchange guarantee", distributor: "Jared Diamond", rating: 4.5, ratingCount: 2780 },
  { name: "The Art of War", model: "Deluxe Edition", serialNumber: "ISBN-9781590302255", description: "Sun Tzu's ancient Chinese military treatise, still relevant for strategy and leadership today.", category: "History", quantity: 50, price: 35.00, warranty: "Exchange guarantee", distributor: "Sun Tzu", rating: 4.7, ratingCount: 7650 },
  { name: "A People's History of the United States", model: "Paperback", serialNumber: "ISBN-9780062397348", description: "Howard Zinn's alternative perspective on American history, told from the viewpoint of ordinary people.", category: "History", quantity: 9, price: 92.00, warranty: "Exchange guarantee", distributor: "Howard Zinn", rating: 4.6, ratingCount: 1890 },
  { name: "The Diary of a Young Girl", model: "Definitive Edition", serialNumber: "ISBN-9780553296983", description: "Anne Frank's deeply moving diary written while hiding from the Nazis during World War II.", category: "History", quantity: 28, price: 42.00, warranty: "Exchange guarantee", distributor: "Anne Frank", rating: 4.8, ratingCount: 6430 },
  { name: "The Rise and Fall of the Third Reich", model: "Hardcover", serialNumber: "ISBN-9781451642599", description: "William Shirer's comprehensive account of Nazi Germany from its origins to its collapse.", category: "History", quantity: 4, price: 145.00, warranty: "Exchange guarantee", distributor: "William L. Shirer", rating: 4.7, ratingCount: 1230 },
  { name: "Meditations", model: "Penguin Classics", serialNumber: "ISBN-9780140449334", description: "Marcus Aurelius' personal writings on Stoic philosophy, leadership, and self-discipline.", category: "History", quantity: 40, price: 38.00, warranty: "Exchange guarantee", distributor: "Marcus Aurelius", rating: 4.8, ratingCount: 4560 },

  // === TECHNOLOGY ===
  { name: "Clean Code", model: "1st Edition", serialNumber: "ISBN-9780132350884", description: "Robert C. Martin's handbook of agile software craftsmanship. A must-read for every developer.", category: "Technology", quantity: 5, price: 200.00, warranty: "Exchange guarantee", distributor: "Robert C. Martin", rating: 4.5, ratingCount: 3980 },
  { name: "Python Crash Course", model: "3rd Edition", serialNumber: "ISBN-9781718502703", description: "A hands-on, project-based introduction to Python programming for beginners.", category: "Technology", quantity: 1, price: 150.00, warranty: "Exchange guarantee", distributor: "Eric Matthes", rating: 4.7, ratingCount: 2450, image: "https://covers.openlibrary.org/b/isbn/9781593279288-L.jpg" },
  { name: "The Pragmatic Programmer", model: "20th Anniversary Edition", serialNumber: "ISBN-9780135957059", description: "A timeless guide to becoming a better developer, covering everything from career tips to coding techniques.", category: "Technology", quantity: 11, price: 185.00, warranty: "Exchange guarantee", distributor: "David Thomas & Andrew Hunt", rating: 4.7, ratingCount: 1670 },
  { name: "Introduction to Algorithms", model: "4th Edition", serialNumber: "ISBN-9780262046305", description: "The definitive textbook on algorithms, widely used in universities around the world.", category: "Technology", quantity: 6, price: 320.00, warranty: "Exchange guarantee", distributor: "Thomas H. Cormen", rating: 4.4, ratingCount: 980 },
  { name: "Design Patterns", model: "Hardcover", serialNumber: "ISBN-9780201633610", description: "The classic Gang of Four book on reusable object-oriented software design patterns.", category: "Technology", quantity: 3, price: 240.00, warranty: "Exchange guarantee", distributor: "Erich Gamma et al.", rating: 4.3, ratingCount: 1120 },
  { name: "JavaScript: The Good Parts", model: "Paperback", serialNumber: "ISBN-9780596517748", description: "Douglas Crockford's essential guide to the best features of JavaScript.", category: "Technology", quantity: 19, price: 110.00, warranty: "Exchange guarantee", distributor: "Douglas Crockford", rating: 4.2, ratingCount: 2340 },

  // === PHILOSOPHY ===
  { name: "Thus Spoke Zarathustra", model: "Penguin Classics", serialNumber: "ISBN-9780140441185", description: "Friedrich Nietzsche's philosophical novel about the Übermensch and the death of God.", category: "Philosophy", quantity: 13, price: 56.00, warranty: "Exchange guarantee", distributor: "Friedrich Nietzsche", rating: 4.4, ratingCount: 1890 },
  { name: "The Republic", model: "Oxford World's Classics", serialNumber: "ISBN-9780199535763", description: "Plato's foundational work on justice, the ideal state, and the nature of reality.", category: "Philosophy", quantity: 25, price: 44.00, warranty: "Exchange guarantee", distributor: "Plato", rating: 4.5, ratingCount: 2340, image: "https://covers.openlibrary.org/b/isbn/9780140455113-L.jpg" },
  { name: "Being and Nothingness", model: "Paperback", serialNumber: "ISBN-9780671867805", description: "Jean-Paul Sartre's major philosophical work laying out the foundations of existentialism.", category: "Philosophy", quantity: 0, price: 98.00, warranty: "Exchange guarantee", distributor: "Jean-Paul Sartre", rating: 4.1, ratingCount: 670 },
  { name: "The Art of Happiness", model: "10th Anniversary Edition", serialNumber: "ISBN-9781594488894", description: "The Dalai Lama's guide to finding inner peace and lasting happiness in everyday life.", category: "Philosophy", quantity: 33, price: 52.00, warranty: "Exchange guarantee", distributor: "Dalai Lama & Howard Cutler", rating: 4.6, ratingCount: 3450 },
  { name: "The Art of War", model: "Classic Edition", serialNumber: "ISBN-9781599869773", description: "Sun Tzu's ancient Chinese military treatise remains relevant across business, strategy, and life.", category: "Philosophy", quantity: 25, price: 45.00, warranty: "Exchange guarantee", distributor: "Sun Tzu", rating: 4.5, ratingCount: 4100 },

  // === BIOGRAPHY ===
  { name: "Steve Jobs", model: "Hardcover", serialNumber: "ISBN-9781451648539", description: "Walter Isaacson's authorized biography of Apple's visionary co-founder.", category: "Biography", quantity: 17, price: 115.00, warranty: "Exchange guarantee", distributor: "Walter Isaacson", rating: 4.6, ratingCount: 4120 },
  { name: "Becoming", model: "Paperback", serialNumber: "ISBN-9781524763138", description: "Michelle Obama's deeply personal memoir about her life from the South Side of Chicago to the White House.", category: "Biography", quantity: 21, price: 88.00, warranty: "Exchange guarantee", distributor: "Michelle Obama", rating: 4.8, ratingCount: 6780 },
  { name: "Einstein: His Life and Universe", model: "Paperback", serialNumber: "ISBN-9780743264747", description: "Walter Isaacson's compelling portrait of the most brilliant mind of the 20th century.", category: "Biography", quantity: 14, price: 96.00, warranty: "Exchange guarantee", distributor: "Walter Isaacson", rating: 4.5, ratingCount: 1890 },
  { name: "Long Walk to Freedom", model: "Paperback", serialNumber: "ISBN-9780316548182", description: "Nelson Mandela's autobiography chronicling his journey from prisoner to president of South Africa.", category: "Biography", quantity: 0, price: 78.00, warranty: "Exchange guarantee", distributor: "Nelson Mandela", rating: 4.8, ratingCount: 3210 },

  // === HARRY POTTER SERIES ===
  { name: "Harry Potter and the Philosopher's Stone", model: "Paperback", serialNumber: "ISBN-9780439708180", description: "The first book in J.K. Rowling's legendary series. Harry discovers he is a wizard and begins his journey at Hogwarts School of Witchcraft and Wizardry.", category: "Fiction", quantity: 50, price: 75.00, warranty: "Exchange guarantee", distributor: "J.K. Rowling", rating: 4.9, ratingCount: 6200 },
  { name: "Harry Potter and the Chamber of Secrets", model: "Paperback", serialNumber: "ISBN-9780439064873", description: "Harry returns for his second year at Hogwarts, where a mysterious force is petrifying students and a sinister message warns that the Chamber of Secrets has been opened.", category: "Fiction", quantity: 45, price: 75.00, warranty: "Exchange guarantee", distributor: "J.K. Rowling", rating: 4.8, ratingCount: 5300 },
  { name: "Harry Potter and the Prisoner of Azkaban", model: "Paperback", serialNumber: "ISBN-9780439136365", description: "In his third year, Harry learns about the escaped prisoner Sirius Black and uncovers shocking truths about his parents' past.", category: "Fiction", quantity: 40, price: 80.00, warranty: "Exchange guarantee", distributor: "J.K. Rowling", rating: 4.9, ratingCount: 5500 },
  { name: "Harry Potter and the Goblet of Fire", model: "Paperback", serialNumber: "ISBN-9780439139601", description: "Harry is mysteriously entered into the dangerous Triwizard Tournament in his fourth year, marking the dark return of Lord Voldemort.", category: "Fiction", quantity: 38, price: 90.00, warranty: "Exchange guarantee", distributor: "J.K. Rowling", rating: 4.9, ratingCount: 5200 },
  { name: "Harry Potter and the Order of the Phoenix", model: "Paperback", serialNumber: "ISBN-9780439358071", description: "Harry forms Dumbledore's Army as the Ministry of Magic refuses to believe Voldemort has returned in this fifth installment.", category: "Fiction", quantity: 35, price: 95.00, warranty: "Exchange guarantee", distributor: "J.K. Rowling", rating: 4.8, ratingCount: 4800 },
  { name: "Harry Potter and the Half-Blood Prince", model: "Paperback", serialNumber: "ISBN-9780439784542", description: "Dumbledore and Harry investigate Voldemort's past while Hogwarts faces its darkest year yet in the penultimate book.", category: "Fiction", quantity: 35, price: 95.00, warranty: "Exchange guarantee", distributor: "J.K. Rowling", rating: 4.9, ratingCount: 4700 },
  { name: "Harry Potter and the Deathly Hallows", model: "Paperback", serialNumber: "ISBN-9780545010221", description: "The epic conclusion to the Harry Potter series. Harry, Ron, and Hermione set out to destroy the Horcruxes and end Voldemort's reign once and for all.", category: "Fiction", quantity: 40, price: 100.00, warranty: "Exchange guarantee", distributor: "J.K. Rowling", rating: 4.9, ratingCount: 5900 },

  // === BRIDGERTON SERIES ===
  { name: "The Duke and I", model: "Paperback", serialNumber: "ISBN-9780380816858", description: "Daphne Bridgerton and the Duke of Hastings enter a fake courtship that leads to an unexpected love story in Regency-era London.", category: "Romance", quantity: 40, price: 65.00, warranty: "Exchange guarantee", distributor: "Julia Quinn", rating: 4.6, ratingCount: 3900, image: "https://covers.openlibrary.org/b/id/13710227-L.jpg" },
  { name: "The Viscount Who Loved Me", model: "Paperback", serialNumber: "ISBN-9780380817596", description: "Anthony Bridgerton sets out to find a practical bride, but falls for the spirited Kate Sharma instead. Book 2 in the Bridgerton series.", category: "Romance", quantity: 38, price: 65.00, warranty: "Exchange guarantee", distributor: "Julia Quinn", rating: 4.7, ratingCount: 3500, image: "https://covers.openlibrary.org/b/id/12780438-L.jpg" },
  { name: "An Offer From a Gentleman", model: "Paperback", serialNumber: "ISBN-9780380817619", description: "A Cinderella-inspired love story featuring Benedict Bridgerton and the mysterious woman he dances with at a masquerade ball.", category: "Romance", quantity: 35, price: 65.00, warranty: "Exchange guarantee", distributor: "Julia Quinn", rating: 4.5, ratingCount: 2900, image: "https://covers.openlibrary.org/b/id/14852412-L.jpg" },
  { name: "Romancing Mister Bridgerton", model: "Paperback", serialNumber: "ISBN-9780380817633", description: "Colin Bridgerton finally sees Penelope Featherington in a new light in this fan-favorite fourth book of the series.", category: "Romance", quantity: 42, price: 65.00, warranty: "Exchange guarantee", distributor: "Julia Quinn", rating: 4.8, ratingCount: 4300, image: "https://covers.openlibrary.org/b/id/14801816-L.jpg" },

  // === SELF-HELP ===
  { name: "Atomic Habits", model: "Hardcover", serialNumber: "ISBN-9780735211292", description: "James Clear's proven framework for building good habits and breaking bad ones.", category: "Self-Help", quantity: 60, price: 95.00, warranty: "Exchange guarantee", distributor: "James Clear", rating: 4.8, ratingCount: 12400 },
  { name: "Thinking, Fast and Slow", model: "Paperback", serialNumber: "ISBN-9780374533557", description: "Daniel Kahneman's exploration of the two systems that drive how we think and make decisions.", category: "Self-Help", quantity: 18, price: 82.00, warranty: "Exchange guarantee", distributor: "Daniel Kahneman", rating: 4.6, ratingCount: 5430 },
  { name: "The 7 Habits of Highly Effective People", model: "30th Anniversary Edition", serialNumber: "ISBN-9781982137274", description: "Stephen Covey's timeless principles for personal and professional effectiveness.", category: "Self-Help", quantity: 25, price: 76.00, warranty: "Exchange guarantee", distributor: "Stephen R. Covey", rating: 4.6, ratingCount: 8900 },
  { name: "How to Win Friends and Influence People", model: "Updated Edition", serialNumber: "ISBN-9780671027032", description: "Dale Carnegie's classic guide to better communication and relationship building.", category: "Self-Help", quantity: 32, price: 58.00, warranty: "Exchange guarantee", distributor: "Dale Carnegie", rating: 4.7, ratingCount: 9870 },
];

const demoScenarioProducts = {
  productA: "The Catcher in the Rye",
  productB: "Python Crash Course",
  productC: "Clean Code",
  productE: "Atomic Habits",
  productF: "Romancing Mister Bridgerton",
  productG: "1984",
  productH: "Sapiens: A Brief History of Humankind",
};

const demoProductSettings = [
  { name: demoScenarioProducts.productA, quantity: 0, cost: 20 },
  { name: demoScenarioProducts.productB, quantity: 1, cost: 60 },
  { name: demoScenarioProducts.productC, quantity: 5, cost: 80 },
  { name: demoScenarioProducts.productE, quantity: 60, cost: 38 },
  { name: demoScenarioProducts.productF, quantity: 42, cost: 26 },
  { name: demoScenarioProducts.productG, quantity: 23, cost: 28 },
  { name: demoScenarioProducts.productH, quantity: 8, cost: 55 },
];
const demoCustomers = [
  {
    name: DEMO_CUSTOMER_NAME,
    email: DEMO_CUSTOMER_EMAIL,
    taxId: DEMO_CUSTOMER_TAX_ID,
    address: DEMO_CUSTOMER_ADDRESS,
  },
  {
    name: "Bob Demo",
    email: "bob.demo@bookworld.test",
    taxId: "2345678901",
    address: "45 Sample Avenue, Ankara",
  },
  {
    name: "Carol Demo",
    email: "carol.demo@bookworld.test",
    taxId: "3456789012",
    address: "78 Harbor Road, Izmir",
  },
];

const SHIPPING_FEE = 29.99;
const FREE_SHIPPING_THRESHOLD = 250;
const TAX_RATE = 0.1;

function openLibraryCover(serialNumber) {
  const isbn = serialNumber.replace(/^ISBN-/, "");
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function calculateOrderTotals(items) {
  const subtotal = roundMoney(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = roundMoney(subtotal * TAX_RATE);
  const total = roundMoney(subtotal + shipping + tax);
  return { subtotal, shipping, tax, total };
}

async function ensureCategory(categoryMap, name) {
  if (categoryMap[name]) return categoryMap[name];
  const cat = await Category.findOneAndUpdate(
    { name },
    { name },
    { upsert: true, new: true }
  );
  categoryMap[name] = cat._id;
  return cat._id;
}

async function seedDemoProducts() {
  let updated = 0;

  for (const setting of demoProductSettings) {
    const product = await Product.findOne({ name: setting.name });
    if (!product) {
      console.warn(`Demo product not found: ${setting.name}`);
      continue;
    }

    product.quantity = setting.quantity;
    product.cost = setting.cost;
    product.isDeleted = false;
    product.discountRate = 0;
    product.discountedPrice = null;
    product.discountStartDate = null;
    product.discountEndDate = null;
    await product.save();
    updated += 1;
  }

  console.log(`Demo scenario products prepared: ${updated}`);
}
async function upsertDemoCustomers() {
  const password = await bcrypt.hash(DEMO_CUSTOMER_PASSWORD, 10);
  const customerIds = {};

  for (const customer of demoCustomers) {
    const user = await User.findOneAndUpdate(
      { email: customer.email },
      {
        name: customer.name,
        email: customer.email,
        password,
        role: "customer",
        taxId: encrypt(customer.taxId),
        address: customer.address,
      },
      { upsert: true, new: true, runValidators: true }
    );
    customerIds[customer.email] = user._id;
  }

  console.log(`Ready ${demoCustomers.length} demo customer accounts`);
  return customerIds;
}

async function seedDemoOrders(customerIds) {
  const productByName = {};
  for (const productName of Object.values(demoScenarioProducts)) {
    const doc = await Product.findOne({ name: productName });
    if (doc) productByName[productName] = doc;
  }

  await Order.deleteMany({
    invoiceNumber: {
      $in: [
        /^SEED-DEMO-INV-/,
        "INV-20260610-0001",
        "INV-20260610-0002",
        "INV-20260610-0003",
        "INV-20260610-0004",
      ],
    },
  });

  const now = Date.now();
  const daysAgo = (days) => new Date(now - days * 24 * 60 * 60 * 1000);

  const demoOrders = [
    {
      invoiceNumber: "INV-20260610-0001",
      customerEmail: DEMO_CUSTOMER_EMAIL,
      status: "delivered",
      createdAt: daysAgo(45),
      deliveredAt: daysAgo(40),
      deliveryAddress: "12 Demo Street, Istanbul",
      items: [{ productName: demoScenarioProducts.productE, quantity: 1 }],
    },
    {
      invoiceNumber: "INV-20260610-0002",
      customerEmail: DEMO_CUSTOMER_EMAIL,
      status: "delivered",
      createdAt: daysAgo(8),
      deliveredAt: daysAgo(6),
      deliveryAddress: "12 Demo Street, Istanbul",
      items: [{ productName: demoScenarioProducts.productF, quantity: 1 }],
    },
    {
      invoiceNumber: "INV-20260610-0003",
      customerEmail: DEMO_CUSTOMER_EMAIL,
      status: "processing",
      createdAt: daysAgo(1),
      deliveryAddress: "12 Demo Street, Istanbul",
      items: [{ productName: demoScenarioProducts.productG, quantity: 1 }],
    },
    {
      invoiceNumber: "INV-20260610-0004",
      customerEmail: DEMO_CUSTOMER_EMAIL,
      status: "in-transit",
      createdAt: daysAgo(1),
      deliveryAddress: "12 Demo Street, Istanbul",
      items: [{ productName: demoScenarioProducts.productH, quantity: 1 }],
    },
  ];

  let inserted = 0;
  let skipped = 0;

  for (const orderSeed of demoOrders) {
    const exists = await Order.findOne({ invoiceNumber: orderSeed.invoiceNumber });
    if (exists) {
      skipped += 1;
      continue;
    }

    const userId = customerIds[orderSeed.customerEmail];
    if (!userId) {
      console.warn(`Skipping ${orderSeed.invoiceNumber}: demo customer not found`);
      continue;
    }

    const orderItems = [];
    for (const item of orderSeed.items) {
      const product = productByName[item.productName];
      if (!product) {
        console.warn(`Skipping ${orderSeed.invoiceNumber}: ${item.productName} not found`);
        orderItems.length = 0;
        break;
      }
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        cost: product.cost || 0,
        quantity: item.quantity,
      });
    }

    if (!orderItems.length) continue;

    const totals = calculateOrderTotals(orderItems);
    await Order.create({
      userId,
      items: orderItems,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.total,
      paymentMethod: "Mock Visa",
      cardLast4: "4242",
      deliveryAddress: orderSeed.deliveryAddress,
      status: orderSeed.status,
      invoiceNumber: orderSeed.invoiceNumber,
      createdAt: orderSeed.createdAt || new Date(),
      updatedAt: orderSeed.deliveredAt || orderSeed.createdAt || new Date(),
      deliveredAt: orderSeed.deliveredAt || null,
    });
    inserted += 1;
  }

  console.log(`Demo orders: inserted ${inserted}, skipped ${skipped} (already exist)`);
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Upsert categories
  const categoryNames = [...new Set(rawProducts.map((p) => p.category))];
  const categoryMap = {};
  for (const name of categoryNames) {
    const cat = await Category.findOneAndUpdate(
      { name },
      { name },
      { upsert: true, new: true }
    );
    categoryMap[name] = cat._id;
  }
  console.log(`Upserted ${categoryNames.length} categories`);

  // Clear and re-seed products
  await Product.deleteMany({});
  console.log("Cleared existing products");

  const docs = rawProducts.map((p) => ({
    ...p,
    category: categoryMap[p.category],
    image: p.image || openLibraryCover(p.serialNumber),
  }));

  await Product.insertMany(docs);
  console.log(`Seeded ${docs.length} products`);

  await seedDemoProducts();
  const customerIds = await upsertDemoCustomers();
  await seedDemoOrders(customerIds);

  await mongoose.disconnect();
  console.log("Done");
}

seed().catch((err) => { console.error(err); process.exit(1); });
