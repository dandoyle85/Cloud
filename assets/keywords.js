// keywords.js

async function loadSeedSuggestions() {
  try {
    const res = await fetch('/api/niches');
    const data = await res.json();
    const dropdown = document.getElementById('seedSuggestions');

    if (data && data.niches && data.niches.length) {
      dropdown.innerHTML = `
        <option value="">-- Suggested Seeds --</option>
        ${data.niches.slice(0,10).map(n => {
          const text = typeof n === 'string' ? n : (n.title || '');
          return `<option value="${text}">${text}</option>`;
        }).join('')}
      `;
      log('Seed suggestions loaded', data.niches.slice(0,10));
    }
  } catch (e) {
    log('Error loading seed suggestions', { error: e.message });
  }
}

document.getElementById('seedSuggestions').addEventListener('change', e => {
  if (e.target.value) {
    document.getElementById('seed').value = e.target.value;
  }
});

// Load suggestions on page start
loadSeedSuggestions();
