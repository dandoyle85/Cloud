// app.js
const log = (...args) => {
  console.log("[PowerHouse]", ...args);
  const panel = document.getElementById("debugLog");
  if (panel) panel.textContent += `[${new Date().toLocaleTimeString()}] ${args.join(" ")}\n`;
};

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("debugToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      document.getElementById("debugPanel").classList.toggle("show");
    });
  }
});
