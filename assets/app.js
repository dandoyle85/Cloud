// app.js

function log(message, data) {
  const logBox = document.getElementById('debugLog');
  const time = new Date().toLocaleTimeString();
  const entry = `[${time}] ${message} ${data ? JSON.stringify(data, null, 2) : ''}\n`;
  console.log(message, data || '');
  if (logBox) logBox.textContent += entry;
}

// Example fetch wrapper for niches
async function fetchNiches() {
  try {
    const res = await fetch('/api/niches');
    const data = await res.json();
    log('Fetched niches', data);
    return data;
  } catch (err) {
    log('Error fetching niches', { error: err.message });
    return [];
  }
}
