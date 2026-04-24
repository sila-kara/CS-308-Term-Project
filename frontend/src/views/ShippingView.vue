<template>
  <div class="info-page">
    <h1>Shipping Information</h1>
    <p class="lead">We deliver across Turkey and internationally. Here's everything you need to know.</p>

    <section class="card">
      <h2>Domestic Shipping (Turkey)</h2>
      <table>
        <thead>
          <tr><th>Order Total</th><th>Delivery Time</th><th>Shipping Fee</th></tr>
        </thead>
        <tbody>
          <tr><td>250 TL and above</td><td>2–4 business days</td><td class="free">Free</td></tr>
          <tr><td>Under 250 TL</td><td>2–4 business days</td><td>29.99 TL</td></tr>
          <tr><td>Express (any amount)</td><td>Next business day</td><td>49.99 TL</td></tr>
        </tbody>
      </table>
    </section>

    <section class="card">
      <h2>International Shipping</h2>
      <table>
        <thead>
          <tr><th>Region</th><th>Delivery Time</th><th>Shipping Fee</th></tr>
        </thead>
        <tbody>
          <tr><td>Europe</td><td>5–10 business days</td><td>149.99 TL</td></tr>
          <tr><td>USA &amp; Canada</td><td>7–14 business days</td><td>199.99 TL</td></tr>
          <tr><td>Rest of World</td><td>10–21 business days</td><td>249.99 TL</td></tr>
        </tbody>
      </table>
    </section>

    <section class="card">
      <h2>Important Notes</h2>
      <ul>
        <li>Orders are processed within 1 business day of payment confirmation.</li>
        <li>Delivery times are estimates and may vary during peak periods.</li>
        <li>You will receive a tracking number by email once your order is dispatched.</li>
        <li>International orders may be subject to local customs duties and taxes.</li>
      </ul>
    </section>

    <p class="contact">Questions? Email us at <a href="mailto:bookworld.store.cs308@gmail.com">bookworld.store.cs308@gmail.com</a></p>
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
  margin: 0 0 16px;
  font-size: 1.1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th {
  text-align: left;
  padding: 10px 12px;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #475569;
}

td {
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
}

.free {
  color: #16a34a;
  font-weight: 700;
}

ul {
  margin: 0;
  padding-left: 20px;
  display: grid;
  gap: 8px;
  font-size: 0.9rem;
  color: #334155;
}

.contact {
  margin-top: 24px;
  font-size: 0.9rem;
  color: #475569;
}

.contact a {
  color: #2563eb;
}
</style>
