<template>
  <div class="about-page">
    <div class="hero">
      <img
        src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80"
        alt="Library shelves filled with books"
        class="hero-img"
      />
      <div class="hero-overlay">
        <h1>About BookWorld</h1>
        <p>Where every story finds its reader.</p>
      </div>
    </div>

    <div class="content">
      <section class="card story">
        <h2>Our Story</h2>
        <p>
          BookWorld was founded with a simple belief: that the right book at the right moment can change a person's life.
          What started as a small university project has grown into a platform dedicated to connecting readers with the stories, ideas, and knowledge they are looking for.
        </p>
        <p>
          We carefully curate our catalogue across fiction, science, history, technology, philosophy, biography, and romance —
          because great reading doesn't stay in one genre. Whether you're after a Nobel Prize-winning novel or the definitive
          textbook on algorithms, you'll find it here.
        </p>
      </section>

      <section class="card team">
        <h2>The Team</h2>
        <div class="university-badge">
          <div class="badge-text">
            <span class="uni">Sabancı University</span>
            <span class="course">CS308 — Software Engineering</span>
          </div>
        </div>
        <p>
          BookWorld is a term project developed by a team of six undergraduate students at Sabancı University
          for the CS308 Software Engineering course. The project was built with a Vue 3 frontend and a Node.js / Express / MongoDB backend,
          following agile development practices throughout the semester.
        </p>
        <p>
          This platform was designed and implemented entirely by students as a demonstration of full-stack
          web application development — from database design and REST API architecture to responsive UI and user experience.
        </p>
      </section>

      <section class="card mission">
        <h2>What We Believe</h2>
        <div class="values">
          <div class="value-item">
            <span class="val-icon">📖</span>
            <div>
              <strong>Reading is for everyone</strong>
              <p>We offer books across every genre and interest at fair prices, with free shipping on orders over 250 TL.</p>
            </div>
          </div>
          <div class="value-item">
            <span class="val-icon">🔍</span>
            <div>
              <strong>Discovery matters</strong>
              <p>Our curated deals, category filters, and bestseller shelf are designed to help you find your next favourite book.</p>
            </div>
          </div>
          <div class="value-item">
            <span class="val-icon">⭐</span>
            <div>
              <strong>Community reviews</strong>
              <p>Real readers, real ratings. Every review is moderated before publication so you can trust what you read.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="contact-card">
        <h2>Get in Touch</h2>
        <p>Have a question or feedback? We'd love to hear from you.</p>
        <a href="mailto:bookworld.store.cs308@gmail.com" class="email-btn">
          bookworld.store.cs308@gmail.com
        </a>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  color: #0f172a;
}

.hero {
  position: relative;
  height: 340px;
  overflow: hidden;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 40%;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.75) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
}

.hero-overlay h1 {
  color: #fff;
  font-size: 2.4rem;
  margin: 0 0 8px;
  letter-spacing: -0.02em;
}

.hero-overlay p {
  color: #cbd5e1;
  font-size: 1.1rem;
  margin: 0;
}

.content {
  max-width: 820px;
  margin: 0 auto;
  padding: 40px 20px 64px;
}

.card {
  background: #fff;
  border: 1px solid #dbe5f1;
  border-radius: 12px;
  padding: 28px;
  margin-bottom: 20px;
}

.card h2 {
  margin: 0 0 14px;
  font-size: 1.15rem;
}

.card p {
  margin: 0 0 12px;
  font-size: 0.92rem;
  color: #334155;
  line-height: 1.7;
}

.card p:last-child { margin-bottom: 0; }

.university-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 10px 16px;
  margin-bottom: 16px;
}

.badge-text {
  display: flex;
  flex-direction: column;
}

.uni {
  font-weight: 700;
  font-size: 0.92rem;
  color: #1d4ed8;
}

.course {
  font-size: 0.8rem;
  color: #475569;
}

.values {
  display: grid;
  gap: 18px;
}

.value-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.val-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.value-item strong {
  display: block;
  margin-bottom: 4px;
  font-size: 0.92rem;
}

.value-item p {
  margin: 0;
  font-size: 0.87rem;
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
  color: #475569;
  margin: 0 0 16px;
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

@media (max-width: 600px) {
  .hero { height: 240px; }
  .hero-overlay h1 { font-size: 1.7rem; }
}
</style>
