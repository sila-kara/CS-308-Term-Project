<template>
  <div class="info-page">
    <h1>Returns &amp; Refunds</h1>
    <p class="lead">We want you to be completely satisfied with your purchase.</p>

    <section class="card empty-state">
      <div class="icon">📦</div>
      <h2>No returns or refunds yet</h2>
      <p>You have no active return requests. If you received a damaged or incorrect item, please contact us within 14 days of delivery.</p>
    </section>

    <section class="card">
      <h2>Return Policy</h2>
      <ul>
        <li><strong>14-day window:</strong> You may request a return within 14 days of receiving your order.</li>
        <li><strong>Eligible items:</strong> Books must be in their original, unread condition with no visible damage.</li>
        <li><strong>Damaged or incorrect items:</strong> We will cover the return shipping cost and issue a full refund.</li>
        <li><strong>Change of mind:</strong> Return shipping is the buyer's responsibility. A 10% restocking fee may apply.</li>
        <li><strong>Refund timeline:</strong> Refunds are processed within 5–7 business days after we receive the return.</li>
      </ul>
    </section>

    <section class="card">
      <h2>How to Start a Return</h2>
      <ol>
        <li>Email us at <a href="mailto:bookworld.store.cs308@gmail.com">bookworld.store.cs308@gmail.com</a> with your order number and reason for return.</li>
        <li>We'll respond within 1 business day with return instructions.</li>
        <li>Pack the book securely and ship it to the address provided.</li>
        <li>Once received and inspected, your refund will be issued.</li>
      </ol>
    </section>

    <p class="contact">Need help? Email us at <a href="mailto:bookworld.store.cs308@gmail.com">bookworld.store.cs308@gmail.com</a></p>
  </div>
</template>

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

.card {
  background: #fff;
  border: 1px solid #dbe5f1;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}

.card h2 {
  margin: 0 0 14px;
  font-size: 1.1rem;
}

.empty-state {
  text-align: center;
  padding: 40px 24px;
}

.icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.empty-state h2 {
  margin-bottom: 8px;
}

.empty-state p {
  color: #64748b;
  font-size: 0.92rem;
  margin: 0;
}

ul, ol {
  margin: 0;
  padding-left: 20px;
  display: grid;
  gap: 10px;
  font-size: 0.9rem;
  color: #334155;
}

a {
  color: #2563eb;
}

.contact {
  margin-top: 24px;
  font-size: 0.9rem;
  color: #475569;
}
</style>
