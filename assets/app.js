// app.js

// Safe logger
const log = (...args) => console.log("[PowerHouse]", ...args);

// Auto-run on page load
document.addEventListener("DOMContentLoaded", () => {
  if (typeof fetchNiches === "function") {
    fetchNiches();
  }
});
