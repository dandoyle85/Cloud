const els = {
  siteSelect: document.getElementById('siteSelect'),
  seed: document.getElementById('seed'),
  expandBtn: document.getElementById('expandBtn'),
  kwBody: document.getElementById('kwBody')
};
let allKeywords = [];

// Load sites into dropdown
async function loadSites() {
  try {
    const res = await fetch('/api/sites');
    const data = await res.json();

    if (!data || !data.length) {
      els.siteSelect.innerHTML = `
        <option value="">-- No sites yet --</option>
        <option value="add-new">➕ Add New Site</option>
      `;
      log('No sites found, showing add option only');
    } else {
      els.siteSelect.innerHTML = `
        <option value="">-- Select a site --</option>
        ${data.map(s => `<option value="${s.id}">${s.site_name}</option>`).join('')}
        <option value="add-new">➕ Add New Site</option>
      `;
      log('Sites loaded', data);
    }
  } catch (e) {
    log('Error loading sites', { error: e.message });
    els.siteSelect.innerHTML = `
      <option value="">-- Error loading sites --</option>
      <option value="add-new">➕ Add New Site</option>
    `;
  }
}

// Redirect if "Add New Site" chosen
els.siteSelect.addEventListener('change', () => {
  if (els.siteSelect.value === 'add-new') {
    window.location.href = '/sites.html';
  }
});

async function expandKeywords() {
  const site_id = els.siteSelect.value;
  const seed = els.seed.value.trim();
  if (!site_id || !seed || site_id === 'add-new') {
    alert('Please select a valid site and enter seed');
    return;
  }
  log('Expanding seed', { site_id, seed });
  const r = await fetch('/api/keywords', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ site_id, seed })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    alert(data.error || 'Expand failed');
    log('Expand failed', data);
    return;
  }
  allKeywords = data.keywords || [];
  renderTable();
}

function renderTable() {
  if (!allKeywords.length) {
    els.kwBody.innerHTML = '<tr><td colspan=3>No keywords</td></tr>';
    return;
  }
  els.kwBody.innerHTML = allKeywords.map(k => rowHtml(k)).join('');
}

function rowHtml(k) {
  const badgeClass = `badge-src badge-${k.source || 'unknown'}`;
  const score = scoreKeyword(k.keyword, k.source);
  return `<tr><td>${escapeHtml(k.keyword)}</td><td><span class="${badgeClass}">${k.source}</span></td><td>${score}</td></tr>`;
}

function scoreKeyword(keyword, source) {
  let score = 0;
  const kw = keyword.toLowerCase();
  if (['google','youtube','reddit'].includes(source)) score += 3;
  if (['modifier','paa_try','related_try'].includes(source)) score += 2;
  if (source === 'fallback') score += 1;
  if (/best|cheap|review|software|guide|2025/.test(kw)) score += 2;
  const flames = Math.min(5, Math.max(1, Math.round(score / 2)));
  return '🔥'.repeat(flames);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
  );
}

els.expandBtn.addEventListener('click', expandKeywords);
loadSites();
