<template>
  <footer class="footer">
    <div class="footer-top">
      <div class="footer-top-inner">
        <button type="button" class="back-to-top" @click="scrollToTop">
          ↑ Back to top
        </button>
      </div>
    </div>

    <div class="footer-main">
      <div class="footer-container">
        <div class="footer-col">
          <h4>Get to Know Us</h4>
          <a href="#">About BookWorld</a>
          <a href="#">Careers</a>
          <a href="#">Press Releases</a>
        </div>

        <div class="footer-col">
          <h4>Customer Service</h4>
          <a href="#">Help Center</a>
          <a href="#">Returns & Refunds</a>
          <a href="#">Shipping Info</a>
          <a href="#">Order Tracking</a>
        </div>

        <div class="footer-col">
          <h4>Categories</h4>
          <a href="#">Fiction</a>
          <a href="#">Science</a>
          <a href="#">History</a>
          <a href="#">Technology</a>
        </div>

        <div class="footer-col">
          <h4>Connect With Us</h4>
          <a href="#">Facebook</a>
          <a href="#">Twitter</a>
          <a href="#">Instagram</a>
          <a href="#">Newsletter</a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-container footer-bottom-container">
        <div class="footer-logo">BookWorld</div>
        <p>
          &copy; 2026 BookWorld. All rights reserved. CS308 Software Engineering
          Project.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>

<style scoped>
.footer {
  margin-top: 72px;
}

.footer-top {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 14px 20px;
}

.footer-top-inner {
  max-width: 1320px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.back-to-top {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: auto;
  padding: 8px 18px;
  border-radius: 999px;
  background: #ffffff;
  color: #334155;
  border: 1px solid #cbd5e1;
  font-size: 0.8rem;
  letter-spacing: 0.02em;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s,
    color 0.2s;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
}

.back-to-top:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
}

.footer-main {
  background: linear-gradient(120deg, #0f172a 0%, #1e293b 55%, #172554 100%);
  padding: 56px 22px;
}

.footer-container {
  max-width: 1320px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 40px;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-col h4 {
  color: white;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  margin: 0 0 6px 0;
}

.footer-col a {
  color: #cbd5e1;
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s;
}

.footer-col a:hover {
  color: white;
  text-decoration: underline;
}

.footer-bottom {
  background: #020617;
  padding: 28px 20px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-bottom-container {
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.footer-logo {
  color: white;
  font-size: 1.14rem;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.footer-bottom p {
  color: #999;
  font-size: 0.8rem;
  margin: 0;
}

@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    gap: 30px;
  }
}
</style>