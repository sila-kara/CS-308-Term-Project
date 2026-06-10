<template>
  <div class="info-page">
    <h1>Help Center</h1>
    <p class="lead">Find answers to the most common questions about BookWorld.</p>

    <div class="faq-list">
      <details v-for="item in faqs" :key="item.q" class="faq-item">
        <summary>{{ item.q }}</summary>
        <p>{{ item.a }}</p>
      </details>
    </div>

    <section class="contact-card">
      <h2>Couldn't find an answer?</h2>
      <p>Our support team is happy to help. Send us an email and we'll get back to you within 1 business day.</p>
      <a class="email-btn" href="mailto:bookworld.store.cs308@gmail.com">
        Email us — bookworld.store.cs308@gmail.com
      </a>
    </section>
  </div>
</template>

<script setup>
const faqs = [
  {
    q: "How do I place an order?",
    a: "Browse our catalogue, add books to your cart, and proceed to checkout. You'll need a BookWorld account to complete your purchase. Payment is processed securely via our mock payment system."
  },
  {
    q: "How long does delivery take?",
    a: "Domestic orders (Turkey) typically arrive within 2–4 business days. Orders over 250 TL qualify for free shipping. International delivery takes 5–21 business days depending on the destination."
  },
  {
    q: "Is my order eligible for free shipping?",
    a: "Yes! All domestic orders with a subtotal of 250 TL or more qualify for free shipping. Orders below this threshold are charged a flat rate of 29.99 TL."
  },
  {
    q: "Can I track my order?",
    a: "Absolutely. Once logged in, go to My Account → Orders to view all your orders and their current delivery status. You will also receive a confirmation email with your invoice after placing an order."
  },
  {
    q: "How do I return a book?",
    a: "You may request a return within 30 days of receiving your order. Email us at bookworld.store.cs308@gmail.com with your order number and reason. Books must be in their original, unread condition."
  },
  {
    q: "When will I receive my refund?",
    a: "Refunds are processed within 5–7 business days after we receive and inspect the returned item. The amount will be credited back to your original payment method."
  },
  {
    q: "Can I add a book to my wishlist without buying it?",
    a: "Yes. Click the heart icon on any product card to add it to your wishlist. You must be logged in to save items. Access your wishlist from the navigation bar at any time."
  },
  {
    q: "How do I leave a review?",
    a: "Open any book's detail page and scroll to the Customer Reviews section. Select a star rating and optionally write a comment, then submit. Reviews are published after a product manager approves them."
  },
  {
    q: "I forgot my password. What should I do?",
    a: "You can reset your password directly on the website. Click \"Forgot password?\" on the login page, enter your email address, and we'll send you a reset link. The link expires in 1 hour."
  },
  {
    q: "Are bundle discounts applied automatically?",
    a: "Yes. Visit the Top Deals page to browse available bundles. Click 'Add all to cart' and the discounted prices are applied automatically to each item in the bundle."
  },
];
</script>

<style scoped>
.info-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px 64px;
  color: #0f172a;
}

h1 {
  font-size: 1.9rem;
  margin: 0 0 8px;
}

.lead {
  color: #475569;
  margin: 0 0 32px;
  font-size: 1rem;
}

.faq-list {
  display: grid;
  gap: 10px;
  margin-bottom: 32px;
}

.faq-item {
  background: #fff;
  border: 1px solid #dbe5f1;
  border-radius: 10px;
  padding: 0;
  overflow: hidden;
}

.faq-item summary {
  padding: 16px 20px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
}

.faq-item summary::-webkit-details-marker { display: none; }

.faq-item summary::after {
  content: "+";
  font-size: 1.2rem;
  color: #64748b;
  flex-shrink: 0;
  margin-left: 12px;
}

.faq-item[open] summary::after {
  content: "−";
}

.faq-item p {
  margin: 0;
  padding: 0 20px 16px;
  font-size: 0.88rem;
  color: #475569;
  line-height: 1.6;
  border-top: 1px solid #f1f5f9;
}

.contact-card {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 28px;
  text-align: center;
}

.contact-card h2 {
  margin: 0 0 8px;
  font-size: 1.1rem;
}

.contact-card p {
  margin: 0 0 18px;
  color: #475569;
  font-size: 0.9rem;
}

.email-btn {
  display: inline-block;
  background: #1d4ed8;
  color: #fff;
  text-decoration: none;
  padding: 12px 22px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.88rem;
  transition: background 0.15s;
}

.email-btn:hover {
  background: #1e40af;
}
</style>
