const BASE = window.location.origin;
const els = {
  siteId: document.getElementById('siteId'),
  scaling: document.getElementById('scaling'),
  seed: document.getElementById('seed'),
  expandBtn: document.getElementById('expandBtn'),
  listBtn: document.getElementById('listBtn'),
  lastRun: document.getElementById('lastRun'),
  kwBody: document.getElementById('kwBody'),
  checkAll: document.getElementById('checkAll'),
  exportCsv: document.getElementById('exportCsv'),
  copyPrompt: document.getElementById('copyPrompt')
};

let currentKeywords = []; // array of {id, site_id, keyword, titles?, source?}
let lastSourceMap = {};   // keyword -> source

els.expandBtn.addEventListener('click', async () => {
  const site_id = els.siteId.value.trim();
  const seed = els.seed.value.trim();
  if (!site_id || !seed) return toast('Enter site_id and seed', 'warn');

  setLoading(true, 'Expanding seed and saving...');
  const r = await fetch(`${BASE}/api/keywords`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ site_id, seed })
  });
  const data = await r.json().catch(()=>({}));
  setLoading(false);

  if (!r.ok) return toast(data.error || 'Failed expanding', 'err');

  // after save, list again
  await listKeywords();
  els.lastRun.textContent = `Last saved ${new Date().toLocaleString()}`;
});

els.listBtn.addEventListener('click', listKeywords);
els.exportCsv.addEventListener('click', () => exportCSV(currentKeywords));
els.copyPrompt.addEventListener('click', copyPrompt);
els.checkAll.addEventListener('change', e => {
  document.querySelectorAll('tbody input[type="checkbox"]').forEach(cb => cb.checked = e.target.checked);
});

async function listKeywords() {
  const site_id = els.siteId.value.trim();
  if (!site_id) return toast('Enter site_id first','warn');
  setLoading(true, 'Loading keywords...');
  const r = await fetch(`${BASE}/api/keywords?site_id=${encodeURIComponent(site_id)}`);
  const j = await r.json().catch(()=>({keywords:[]}));
  setLoading(false);
  currentKeywords = (j.keywords || j) || [];
  renderTable(currentKeywords);
}

function renderTable(rows) {
  if (!rows.length) {
    els.kwBody.innerHTML = `<tr class="muted-row"><td colspan="6">No keywords yet. Try seed above.</td></tr>`;
    return;
  }
  const html = rows.map(row => {
    const kw = row.keyword || '';
    const source = row.source?.origin || inferSourceFromKeyword(kw);
    const score = scoreKeyword(kw);
    const fires = '🔥'.repeat(Math.max(1, Math.min(5, Math.round(score/2))));
    const titles = suggestTitles(kw);
    const titlesHtml = titles.map(t => `<span class="pill" data-id="${row.id}" data-title="${escapeHtml(t)}">${escapeHtml(t)}</span>`).join('');
    return `<tr>
      <td><input type="checkbox" data-id="${row.id}"></td>
      <td><div>${escapeHtml(kw)}</div><div class="src">${source}</div></td>
      <td>${source}</td>
      <td class="score"><span class="fire">${fires}</span> <small>${score}/10</small></td>
      <td><div class="title-pills">${titlesHtml}</div></td>
      <td>
        <button class="ghost" data-action="save" data-id="${row.id}">Save</button>
      </td>
    </tr>`;
  }).join('');
  els.kwBody.innerHTML = html;

  // add listeners to pills & save buttons
  els.kwBody.querySelectorAll('.title-pills .pill').forEach(p => {
    p.addEventListener('click', async e => {
      const id = e.target.getAttribute('data-id');
      const title = e.target.getAttribute('data-title');
      await patchKeyword(id, { titles: [title] });
      toast('Title saved to keyword');
    });
  });
  els.kwBody.querySelectorAll('button[data-action="save"]').forEach(btn => {
    btn.addEventListener('click', async e => {
      const id = e.target.getAttribute('data-id');
      await patchKeyword(id, {});
      toast('Keyword saved');
    });
  });
}

async function patchKeyword(id, payload) {
  // PATCH /api/keywords/[id]  with body payload (e.g., {titles:[...]})
  const r = await fetch(`${BASE}/api/keywords/${id}`, {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload || {})
  });
  if (!r.ok) {
    const t = await r.text();
    console.warn('Patch failed', t);
  }
}

function scoreKeyword(k) {
  let s = 0;
  const len = k.length;
  s += (len < 18) ? 2 : (len < 35 ? 3 : 4);   // favor long-tail
  if (/\b(best|review|software|pricing|2025|top)\b/i.test(k)) s += 3;
  if (/\bhow to|guide|tips|ideas|examples\b/i.test(k)) s += 2;
  if (/\blocal|near me|chicago|guide\b/i.test(k)) s += 1;
  s = Math.max(1, Math.min(10, s));
  return s;
}

function suggestTitles(k) {
  return [
    `10 ${titleCase(k)} Ideas That Work`,
    `${titleCase(k)}: Complete Beginner’s Guide`,
    `${titleCase(k)} in 2025: What Actually Works`
  ];
}

function inferSourceFromKeyword(k){ return 'Mixed'; }
function titleCase(s){ return s.replace(/\w\S*/g, t=>t[0].toUpperCase()+t.slice(1)); }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

function exportCSV(rows){
  if (!rows.length) return toast('Nothing to export','warn');
  const headers = ['keyword','score'];
  const lines = [headers.join(',')];
  rows.forEach(r => {
    lines.push(`"${(r.keyword||'').replace(/"/g,'""')}",${scoreKeyword(r.keyword||'')}`);
  });
  const blob = new Blob([lines.join('\n')], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `keywords_${Date.now()}.csv`;
  a.click();
}

function copyPrompt(){
  const seed = els.seed.value.trim() || 'YOUR SEED';
  const prompt = `You are a keyword strategist. Expand the seed "${seed}" into 20 long-tail, low-competition keywords and provide for each: keyword, intent (informational|commercial|transactional), and an SEO-friendly blog title. Return JSON ONLY with fields: keyword, intent, title.`;
  navigator.clipboard.writeText(prompt);
  toast('Copied ChatGPT prompt');
}

function setLoading(state, msg){
  if (state) {
    els.expandBtn.disabled = true;
    els.listBtn.disabled = true;
    els.expandBtn.textContent = 'Working...';
    if (msg) toast(msg);
  } else {
    els.expandBtn.disabled = false;
    els.listBtn.disabled = false;
    els.expandBtn.textContent = 'Expand + Save';
  }
}

function toast(msg, type='ok'){
  const el = document.createElement('div');
  el.textContent = msg;
  el.className = `toast ${type}`;
  document.body.appendChild(el);
  setTimeout(()=> el.classList.add('show'), 10);
  setTimeout(()=> { el.classList.remove('show'); el.remove(); }, 2400);
}

// simple toast styles
const style = document.createElement('style');
style.textContent = `.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#272727;color:#fff;border:1px solid #3a3a3a;padding:10px 14px;border-radius:10px;opacity:0;transition:.2s;z-index:9999}
.toast.show{opacity:1}
.toast.ok{border-color:#22c55e}
.toast.warn{border-color:#f59e0b}
.toast.err{border-color:#ef4444}`;
document.head.appendChild(style);
