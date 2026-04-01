<template>
  <div class="app">
    <Navbar />
    <main class="main-content">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";
</script>

<style>
* {
  box-sizing: border-box;
}

html,
body,
#app {
  margin: 0;
  padding: 0;
  min-height: 100%;
}

body {
  font-family:
    Inter,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    sans-serif;
  background:
    radial-gradient(circle at top, #f8fbff 0%, #eef3f9 34%, #f5f7fb 100%);
  color: #0f172a;
}

a {
  color: inherit;
}

button,
input,
select {
  font: inherit;
}

.main-content {
  min-height: calc(100vh - 240px);
  padding-bottom: 28px;
}

:root {
  --card-bg: #ffffff;
  --card-border: #e2e8f0;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --brand: #2563eb;
  --brand-dark: #1d4ed8;
  --success: #059669;
  --warning: #d97706;
  --danger: #dc2626;
  --shadow-sm: 0 8px 20px rgba(15, 23, 42, 0.06);
  --shadow-md: 0 14px 36px rgba(15, 23, 42, 0.1);
}
</style>
