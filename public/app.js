const $ = s => document.querySelector(s);
const icons = () => window.lucide?.createIcons();
const sample = {
  title: 'Your Everyday Companion — Natural Canvas Tote Bag',
  description: 'Meet your new grab-and-go favorite. This natural cotton canvas tote brings a little simplicity to your everyday — from a morning market run to a book-filled afternoon at your favorite café.\n\nAt 38 × 42 cm, there’s room for the things that matter, without the extra bulk. Gently used and free of stains, it’s ready for its next chapter. A simple, lovely carry for whatever the day brings.',
  tags: ['canvas tote bag', 'everyday bag', 'cotton tote', 'market bag', 'natural canvas', 'minimalist bag', 'secondhand find', 'reusable tote']
};
let platform = 'Etsy', mode = 'demo', photos = [{ src: '/tote-studio.png', name: 'Sample tote', sample: true }], tags = [...sample.tags], activePhoto = 0, busy = false, editingId = null;
let drafts = [];
try { const stored = JSON.parse(localStorage.getItem('snaplist-drafts') || '[]'); if (Array.isArray(stored)) drafts = stored.filter(x => x && typeof x.id === 'string' && typeof x.title === 'string' && typeof x.description === 'string' && Array.isArray(x.tags) && x.tags.every(t => typeof t === 'string')); mode = localStorage.getItem('snaplist-mode') === 'local' ? 'local' : 'demo'; } catch { /* Private browser storage may be unavailable. */ }
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toast.timer); toast.timer = setTimeout(() => $('#toast').classList.remove('visible'), 4200); }
function escapeHTML(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function safeImage(value) { return typeof value === 'string' && (value === '/tote-studio.png' || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) ? value : '/tote-studio.png'; }
function renderTags() {
  $('#tags').replaceChildren();
  tags.forEach((tag, index) => { const span = document.createElement('span'); span.className = 'tag'; span.textContent = tag; const button = document.createElement('button'); button.textContent = '×'; button.setAttribute('aria-label', `Remove ${tag}`); button.onclick = () => { tags.splice(index, 1); renderTags(); }; span.append(button); $('#tags').append(span); });
  $('#tag-count').textContent = `${tags.length} tags`;
}
function titleCount() { const max = platform === 'Etsy' ? 140 : 80; $('#title-count').textContent = `${$('#listing-title').value.length} / ${max}`; $('#title-count').style.color = $('#listing-title').value.length > max ? '#b37550' : ''; }
function setListing(listing) { $('#listing-title').value = listing.title; $('#listing-description').value = listing.description; tags = [...listing.tags]; renderTags(); titleCount(); }
function setPlatform(value) { platform = value; document.querySelectorAll('.platform').forEach(b => { b.classList.toggle('active', b.dataset.platform === platform); b.setAttribute('aria-pressed', b.dataset.platform === platform); }); $('#marketplace-label').textContent = `MADE FOR ${platform.toUpperCase()}`; titleCount(); }
function renderPhotos() {
  const zone = $('#drop-zone');
  if (!photos.length) { zone.classList.add('empty'); zone.innerHTML = '<i data-lucide="image-plus"></i><span>Drop your next best seller here</span><button class="save-button" id="empty-upload">Choose photos</button>'; $('#empty-upload').onclick = () => $('#file-input').click(); }
  else { zone.classList.remove('empty'); activePhoto = Math.min(activePhoto, photos.length - 1); const photo = photos[activePhoto]; zone.innerHTML = `<img id="main-photo" src="${safeImage(photo.src)}" alt="${escapeHTML(photo.name)}">${photo.sample ? '<span class="sample-label"><span></span>SAMPLE PRODUCT</span>' : ''}<button id="remove-photo" class="photo-remove" aria-label="Remove photo"><i data-lucide="x"></i></button><span class="photo-counter"><i data-lucide="image"></i>${photos.length} / 4 photos</span>`; $('#remove-photo').onclick = () => { photos.splice(activePhoto, 1); renderPhotos(); }; }
  $('#photo-strip').innerHTML = photos.length > 1 ? photos.map((p, i) => `<button data-index="${i}" aria-label="View photo ${i + 1}"><img src="${safeImage(p.src)}" alt="Product thumbnail ${i + 1}"></button>`).join('') : '';
  $('#photo-strip').querySelectorAll('button').forEach(b => b.onclick = () => { activePhoto = Number(b.dataset.index); renderPhotos(); }); icons();
}
async function addPhotos(files) {
  const incoming = Array.from(files);
  if (!incoming.length) return;
  if (busy) { toast('Wait for the current listing to finish.'); return; }
  const existing = photos.filter(p => !p.sample);
  if (incoming.length + existing.length > 4) { toast('A little less is more: choose up to four photos.'); return; }
  if (incoming.some(f => !['image/jpeg', 'image/png', 'image/webp'].includes(f.type) || f.size > 5 * 1024 * 1024)) { toast('Choose JPG, PNG, or WebP files under 5 MB.'); return; }
  try {
    const loaded = await Promise.all(incoming.map(file => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => { const image = new Image(); image.onload = () => resolve({ src: reader.result, name: file.name, sample: false }); image.onerror = reject; image.src = reader.result; }; reader.onerror = reject; reader.readAsDataURL(file); })));
    if (photos.some(p => p.sample)) $('#notes').value = '';
    photos = [...existing, ...loaded]; activePhoto = existing.length; editingId = null; renderPhotos();
    setListing({ title: '', description: '', tags: [] }); $('#source-label').textContent = 'READY TO GENERATE';
    if (mode === 'demo') toast('Photos added. Demo mode uses sample copy, not image analysis.');
  } catch { toast('We couldn’t read that image. Try another file.'); }
}
$('#upload-button').onclick = () => $('#file-input').click();
$('#file-input').onchange = async event => { await addPhotos(event.target.files); event.target.value = ''; };
const dropZone = $('#drop-zone');
for (const type of ['dragover', 'dragenter']) dropZone.addEventListener(type, e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
for (const type of ['dragleave', 'drop']) dropZone.addEventListener(type, e => { e.preventDefault(); dropZone.classList.remove('drag-over'); if (type === 'drop') addPhotos(e.dataTransfer.files); });
document.querySelectorAll('.platform').forEach(button => button.onclick = () => setPlatform(button.dataset.platform));
$('#listing-title').oninput = titleCount;
function addTag() { const value = $('#tag-input').value.trim(); if (!value) return; if (tags.length >= 13) return toast('Keep it focused: up to 13 search tags.'); if (tags.some(t => t.toLowerCase() === value.toLowerCase())) return toast('That tag is already in your listing.'); tags.push(value); $('#tag-input').value = ''; renderTags(); }
$('#add-tag').onclick = addTag;
$('#tag-input').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } };
function demoListing() {
  if (!photos.every(p => p.sample)) return { title: 'Your product name — add your key detail', description: 'This is a demo placeholder, not an analysis of your uploaded photos. Switch to your local model in Model & settings to turn these images into an actual product listing.\n\nSeller notes:\n' + ($('#notes').value.trim() || 'Add materials, measurements, and condition before publishing.'), tags: ['add your keywords', 'review before selling'] };
  const result = structuredClone(sample);
  if (platform !== 'Etsy') result.title = 'Natural Cotton Canvas Tote Bag · 38 × 42 cm · Gently Used';
  const tone = $('#tone').value;
  if (tone === 'Clean & professional') result.description = 'Natural cotton canvas tote bag measuring 38 × 42 cm. A simple everyday carry for errands, books, and other daily essentials.\n\nGently used with no stains, as noted by the seller. Please review the photos and contact the seller with any questions before purchasing.';
  if (tone === 'Playful & bold') result.description = 'Big plans. Little errands. One trusty tote. This natural cotton canvas bag is ready for your daily adventures, from the market to that café you’ve been meaning to try.\n\nMeasuring 38 × 42 cm and gently used with no stains, it’s looking for a new partner in everyday carry. Your next chapter starts here.';
  if (tone === 'Short & straightforward') result.description = 'Natural cotton canvas tote. Measures 38 × 42 cm.\n\nGently used, no stains. A simple everyday carry. Review photos and ask the seller about any details before buying.';
  if ($('#notes').value.trim() !== 'Natural cotton canvas tote, 38 × 42 cm. Gently used, no stains. A lovely everyday carry.') { result.description = 'Demo copy for the sample tote. This text is not generated by AI.\n\nSeller notes:\n' + ($('#notes').value.trim() || 'Add your product details before publishing.'); }
  return result;
}
$('#generate').onclick = async () => {
  if (busy) return;
  if (!photos.length) return toast('Add at least one product photo first.');
  busy = true; const button = $('#generate'); button.disabled = true; button.innerHTML = '<i data-lucide="loader-circle" class="loading-icon"></i><span>' + (mode === 'demo' ? 'Preparing your sample…' : 'Your local model is working…') + '</span>'; icons();
  try {
    let listing;
    if (mode === 'demo') { await new Promise(r => setTimeout(r, 1000)); listing = demoListing(); }
    else {
      const images = await Promise.all(photos.map(async p => { if (!p.sample) return p.src; const blob = await (await fetch(p.src)).blob(); return await new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(blob); }); }));
      const response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ images, platform, tone: $('#tone').value, notes: $('#notes').value }), signal: AbortSignal.timeout(190000) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error || 'Something went wrong. Try again.'); listing = body;
    }
    setListing(listing); $('#source-label').textContent = mode === 'demo' ? 'DEMO · NOT AI GENERATED' : `LOCAL · ${listing.model.toUpperCase()}`;
    toast(mode === 'demo' ? 'Your demo draft is ready. Make it yours.' : 'Fresh from your local model. Review it, then make it yours.');
  } catch (error) { toast(error.name === 'TimeoutError' ? 'The model took too long. Try fewer photos or a smaller model.' : error.message); }
  finally { busy = false; button.disabled = false; button.innerHTML = '<i data-lucide="sparkles"></i><span>Generate listing</span><i data-lucide="arrow-right"></i>'; icons(); }
};
function listingText() { return `${$('#listing-title').value}\n\n${$('#listing-description').value}\n\nTags: ${tags.join(', ')}`; }
async function copy(text) { try { await navigator.clipboard.writeText(text); toast('Copied. Your next sale is one paste away.'); } catch { toast('Clipboard unavailable. Select the listing text and copy manually.'); } }
$('#copy-all').onclick = () => copy(listingText()); $('#copy-description').onclick = () => copy($('#listing-description').value);
$('#download').onclick = () => { const blob = new Blob([listingText()], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'snaplist-' + platform.toLowerCase() + '-listing.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Your listing, ready to take with you.'); };
async function thumbnail() { if (!photos.length) return null; if (photos[0].sample) return photos[0].src; return await new Promise(resolve => { const img = new Image(); img.onload = () => { const canvas = document.createElement('canvas'); const scale = Math.min(1, 500 / Math.max(img.width, img.height)); canvas.width = Math.max(1, img.width * scale); canvas.height = Math.max(1, img.height * scale); canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL('image/jpeg', .75)); }; img.onerror = () => resolve(null); img.src = photos[0].src; }); }
function persist(next) { try { localStorage.setItem('snaplist-drafts', JSON.stringify(next)); drafts = next; $('#saved-count').textContent = drafts.length; return true; } catch { toast('Browser storage is full or unavailable. Download your listing instead.'); return false; } }
$('#save-listing').onclick = async () => { if (!$('#listing-title').value.trim()) return toast('Give your listing a title before saving.'); const draft = { id: editingId || crypto.randomUUID(), title: $('#listing-title').value, description: $('#listing-description').value, tags: [...tags], platform, notes: $('#notes').value, tone: $('#tone').value, image: await thumbnail(), source: $('#source-label').textContent, date: new Date().toISOString() }; const next = [draft, ...drafts.filter(d => d.id !== draft.id)]; if (persist(next)) { editingId = draft.id; toast('Draft saved. It’s waiting in My listings.'); } };
function switchView(view) { $('#create-view').hidden = view !== 'create'; $('#library-view').hidden = view !== 'library'; $('#breadcrumb-name').textContent = view === 'create' ? 'Create a listing' : 'My listings'; document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === view)); if (view === 'library') renderLibrary(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
document.querySelectorAll('[data-view]').forEach(button => button.onclick = () => switchView(button.dataset.view));
function renderLibrary() {
  $('#library-grid').innerHTML = drafts.length ? drafts.map(d => `<article class="library-card"><img src="${safeImage(d.image)}" alt="Saved product photo"><div><small>${escapeHTML(d.platform)} · ${new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</small><h3>${escapeHTML(d.title)}</h3><div class="card-actions"><button data-open="${escapeHTML(d.id)}"><i data-lucide="pencil-line"></i>Edit draft</button><button data-delete="${escapeHTML(d.id)}" aria-label="Delete ${escapeHTML(d.title)}"><i data-lucide="trash-2"></i></button></div></div></article>`).join('') : '<div class="empty-library"><i data-lucide="layers-2"></i><h3>A fresh start. A world of possibilities.</h3><p>Save your first draft and it’ll be right here, ready when you are.</p></div>';
  document.querySelectorAll('[data-open]').forEach(b => b.onclick = () => { const d = drafts.find(d => d.id === b.dataset.open); editingId = d.id; setPlatform(d.platform); setListing(d); $('#notes').value = d.notes || ''; $('#tone').value = d.tone || 'Warm & friendly'; photos = d.image ? [{ src: safeImage(d.image), name: 'Saved product', sample: d.image === '/tote-studio.png' }] : []; activePhoto = 0; renderPhotos(); $('#source-label').textContent = d.source || 'SAVED DRAFT'; switchView('create'); });
  document.querySelectorAll('[data-delete]').forEach(b => b.onclick = () => { if (confirm('Delete this draft from this browser?')) { if (persist(drafts.filter(d => d.id !== b.dataset.delete))) { if (editingId === b.dataset.delete) editingId = null; renderLibrary(); toast('Draft deleted.'); } } }); icons();
}
$('#new-listing').onclick = () => { editingId = null; photos = []; activePhoto = 0; renderPhotos(); $('#notes').value = ''; setListing({title:'', description:'', tags:[]}); $('#source-label').textContent = 'NEW DRAFT'; switchView('create'); };
function updateMode() { $('#generation-note').textContent = mode === 'demo' ? 'Demo mode · try it out, no model needed' : 'Local inference · your photos stay on your server'; }
async function openSettings() { $(`input[name="mode"][value="${mode}"]`).checked = true; $('#settings-dialog').returnValue = ''; $('#settings-dialog').showModal(); $('#connection-status').textContent = 'Checking Ollama…'; try { const status = await (await fetch('/api/status')).json(); $('#connection-status').textContent = status.ready ? `${status.model} is installed and ready on the server.` : status.connected ? `Ollama is running. Pull ${status.model} to get started.` : `Ollama is not connected. Demo mode works without it.`; } catch { $('#connection-status').textContent = 'Could not check the model connection.'; } }
for (const id of ['settings-button', 'avatar', 'how-it-works']) $('#' + id).onclick = openSettings;
$('#settings-dialog').addEventListener('close', () => { if ($('#settings-dialog').returnValue !== 'save') return; mode = $('input[name="mode"]:checked').value; try { localStorage.setItem('snaplist-mode', mode); } catch {} updateMode(); toast(mode === 'demo' ? 'Demo mode is on. No AI model is used.' : 'Local model selected. Make sure Ollama is running.'); });
setListing(sample); setPlatform(platform); renderPhotos(); updateMode(); $('#saved-count').textContent = drafts.length; icons();
