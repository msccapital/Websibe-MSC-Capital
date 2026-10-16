/* Tổng hợp tin tức thị trường từ các báo khác (kiểu "AI News").
   Thứ tự lấy tin:
     Cách A (gần real-time): Cloudflare Worker — dán link vào NEWS_API_URL bên dưới. Trang tự làm mới mỗi phút.
     Cách 0: đọc file data/news.json — do GitHub Actions tự cập nhật mỗi giờ
                     (.github/workflows/update-news.yml + scripts/fetch_news.py).
     Cách 1: rss2json.com (đổi RSS -> JSON), chạy trong trình duyệt khi chưa có file trên.
     Cách 2: allorigins.win (lấy RSS thô rồi tự đọc) — chạy khi cách 1 lỗi.
   Tin lấy thành công được lưu trong trình duyệt; nếu lần sau cả hai cách đều lỗi thì hiện
   lại tin đã lưu thay vì tin mẫu. Nếu vẫn không hiện, mở F12 > Console để xem lý do.

   Đổi nguồn tin: sửa mảng FEEDS. */

const FEEDS = [
  { name: 'CafeF', url: 'https://cafef.vn/thi-truong-chung-khoan.rss' },
  { name: 'VnExpress Kinh doanh', url: 'https://vnexpress.net/rss/kinh-doanh.rss' },
  { name: 'Vietstock', url: 'https://vietstock.vn/830/chung-khoan.rss' },
];

// Dán link Cloudflare Worker vào đây, ví dụ 'https://msc-news.ten-ban.workers.dev'. Để trống nếu chưa dùng.
const NEWS_API_URL = 'https://msc-news.msccapitall.workers.dev';
const NEWS_REFRESH_MS = 60 * 1000;     // tự làm mới tin mỗi 60 giây khi đang mở trang

const NEWS_CACHE_KEY = 'msc_news_cache_v1';

// Chỉ hiện khi chưa từng lấy được tin thật (lần đầu và mạng lỗi).
const FALLBACK_NEWS = [
  { source: 'CafeF', title: 'Khối ngoại trở lại mua ròng trên HOSE trong tuần giao dịch gần nhất', desc: 'Dòng tiền khối ngoại ghi nhận tín hiệu tích cực sau nhiều tuần bán ròng liên tiếp, tập trung ở nhóm ngân hàng và bán lẻ.', link: 'https://cafef.vn/thi-truong-chung-khoan.chn', date: '', image: '' },
  { source: 'VnExpress Kinh doanh', title: 'VN-Index tiệm cận vùng đỉnh cũ khi thanh khoản cải thiện', desc: 'Thị trường chứng khoán trong nước duy trì đà tăng nhờ nhóm cổ phiếu vốn hoá lớn, thanh khoản bình quân phiên cải thiện rõ rệt.', link: 'https://vnexpress.net/kinh-doanh', date: '', image: '' },
  { source: 'Vietstock', title: 'Nhóm cổ phiếu ngân hàng dẫn dắt thị trường phiên đầu tuần', desc: 'Sắc xanh lan toả ở nhóm ngân hàng, kéo các chỉ số chính tăng điểm ngay từ đầu phiên giao dịch.', link: 'https://vietstock.vn/', date: '', image: '' },
];

/* ---------- tiện ích ---------- */
function newsEsc(t) {
  return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function stripHtml(html) {                       // bỏ thẻ HTML + giải mã ký tự đặc biệt (&amp; ...)
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}
function truncate(text, max) {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
}
function safeHttp(url) {                         // chỉ nhận đường dẫn http(s)
  url = String(url || '').trim();
  if (url.startsWith('//')) url = 'https:' + url;
  url = url.replace(/^http:\/\//i, 'https://');
  return /^https:\/\//i.test(url) ? url : '';
}
function firstImgSrc(html) {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  const img = doc.querySelector('img');
  return img ? (img.getAttribute('src') || img.getAttribute('data-src') || '') : '';
}

/* ---------- Cách A: Cloudflare Worker (gần real-time) ---------- */
async function fetchApiNews() {
  const res = await fetch(NEWS_API_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error('Worker HTTP ' + res.status);
  const data = await res.json();
  const items = (data.items || []).filter(x => x && x.title && x.link);
  if (!items.length) throw new Error('Worker không trả về tin: ' + JSON.stringify(data.sources || []));
  return items.map(x => ({
    source: x.source || '', title: x.title, desc: x.desc || '',
    link: safeHttp(x.link), date: x.date || '', image: safeHttp(x.image || ''),
  })).filter(x => x.link);
}

/* ---------- Cách 0: file data/news.json do GitHub Actions cập nhật ---------- */
async function fetchLocalNews() {
  const res = await fetch('data/news.json?t=' + Date.now(), { cache: 'no-store' });
  if (!res.ok) throw new Error('data/news.json HTTP ' + res.status);
  const data = await res.json();
  const items = (data.items || []).filter(x => x && x.title && x.link);
  if (!items.length) throw new Error('data/news.json chưa có tin');
  return items.map(x => ({
    source: x.source || '', title: x.title, desc: x.desc || '',
    link: safeHttp(x.link), date: x.date || '', image: safeHttp(x.image || ''),
  })).filter(x => x.link);
}

/* ---------- Cách 1: rss2json ---------- */
async function fetchViaRss2Json(feed) {
  const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feed.url));
  if (!res.ok) throw new Error('rss2json HTTP ' + res.status);
  const data = await res.json();
  if (data.status !== 'ok') throw new Error('rss2json: ' + (data.message || data.status));
  return data.items.map(item => {
    let img = item.thumbnail || '';
    if (!img && item.enclosure && item.enclosure.link &&
        /image|\.(jpe?g|png|webp|gif)/i.test((item.enclosure.type || '') + item.enclosure.link)) img = item.enclosure.link;
    if (!img) img = firstImgSrc((item.description || '') + (item.content || ''));
    return {
      source: feed.name,
      title: stripHtml(item.title),
      desc: truncate(stripHtml(item.description || item.content || ''), 150),
      link: safeHttp(item.link),
      date: item.pubDate || '',
      image: safeHttp(img),
    };
  });
}

/* ---------- Cách 2: allorigins + tự đọc RSS ---------- */
async function fetchViaAllOrigins(feed) {
  const res = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(feed.url));
  if (!res.ok) throw new Error('allorigins HTTP ' + res.status);
  const xml = new DOMParser().parseFromString(await res.text(), 'text/xml');
  if (xml.querySelector('parsererror')) throw new Error('allorigins: RSS không đọc được');
  const items = [...xml.querySelectorAll('item')];
  if (!items.length) throw new Error('allorigins: không có bài');
  return items.map(it => {
    const text = (tag) => { const n = it.getElementsByTagName(tag)[0]; return n ? n.textContent : ''; };
    const desc = text('description');
    let img = '';
    const enc = it.getElementsByTagName('enclosure')[0];
    if (enc && /image/i.test(enc.getAttribute('type') || '')) img = enc.getAttribute('url') || '';
    if (!img) { const mc = it.getElementsByTagName('media:content')[0]; if (mc) img = mc.getAttribute('url') || ''; }
    if (!img) img = firstImgSrc(desc);
    return {
      source: feed.name,
      title: stripHtml(text('title')),
      desc: truncate(stripHtml(desc), 150),
      link: safeHttp(text('link')),
      date: text('pubDate'),
      image: safeHttp(img),
    };
  });
}

async function fetchFeed(feed) {
  try {
    return await fetchViaRss2Json(feed);
  } catch (e1) {
    console.warn('[Tin tức]', feed.name, '— cách 1 lỗi:', e1.message, '→ thử cách 2');
    try {
      return await fetchViaAllOrigins(feed);
    } catch (e2) {
      console.warn('[Tin tức]', feed.name, '— cách 2 cũng lỗi:', e2.message);
      throw e2;
    }
  }
}

/* ---------- hiển thị ---------- */
function newsCardHTML(item) {
  const d = item.date ? new Date(item.date) : null;
  const dateStr = d && !isNaN(d) ? d.toLocaleDateString('vi-VN') : '';
  const cover = `<div style="aspect-ratio:16/9; position:relative; overflow:hidden; margin:-22px -22px 6px; border-bottom:1px solid var(--line);
                  background:linear-gradient(135deg, var(--green-900), var(--panel-alt)); display:flex; align-items:center; justify-content:center;">
       <span style="font-family:var(--font-display); font-weight:800; font-size:17px; letter-spacing:.08em; color:var(--green-200); text-transform:uppercase; padding:0 16px; text-align:center;">${newsEsc(item.source)}</span>
       ${item.image ? `<img src="${newsEsc(item.image)}" alt="" loading="lazy" referrerpolicy="no-referrer"
            style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover;" onerror="this.remove()">` : ''}
     </div>`;
  return `
    <a class="news-card" href="${newsEsc(item.link || '#')}" target="_blank" rel="noopener noreferrer">
      ${cover}
      <div class="news-source"><span>${newsEsc(item.source)}</span><span>${newsEsc(dateStr)}</span></div>
      <h3>${newsEsc(item.title)}</h3>
      <p>${newsEsc(item.desc)}</p>
      <span class="btn-ghost" style="font-size:13px;">Đọc bài gốc →</span>
    </a>`;
}

function readNewsCache() {
  try { const c = JSON.parse(localStorage.getItem(NEWS_CACHE_KEY) || 'null'); return c && Array.isArray(c.items) && c.items.length ? c : null; }
  catch (e) { return null; }
}
function writeNewsCache(items) {
  try { localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ t: Date.now(), items: items.slice(0, 300) })); } catch (e) {}
}

function sortNews(items) {
  return items.slice().sort((a, b) => (new Date(b.date) || 0) - (new Date(a.date) || 0));
}

/* Trả về { items, mode } — mode: 'live' | 'cache' | 'sample' */
async function getNews() {
  let items = [];
  if (NEWS_API_URL) {
    try { items = await fetchApiNews(); }
    catch (e) { console.warn('[Tin tức] Worker lỗi:', e.message); }
  }
  if (!items.length) {
    try { items = await fetchLocalNews(); }
    catch (e) { console.warn('[Tin tức] Chưa đọc được data/news.json:', e.message); }
  }
  if (!items.length) {
    const results = await Promise.allSettled(FEEDS.map(fetchFeed));
    items = results.filter(r => r.status === 'fulfilled').flatMap(r => r.value).filter(x => x.title && x.link);
  }
  if (items.length) {
    items = sortNews(items);
    writeNewsCache(items);
    return { items, mode: 'live' };
  }
  const cached = readNewsCache();
  if (cached) return { items: cached.items, mode: 'cache', cachedAt: cached.t };
  return { items: FALLBACK_NEWS, mode: 'sample' };
}

const NEWS_PAGE_SIZE = 24;     // mỗi lần hiện thêm bao nhiêu tin trên trang Tin tức

function newsSig(items) { return items.length + '|' + items.slice(0, 5).map(x => x.link).join('|'); }

function paintNews(el) {                                   // vẽ trang Tin tức đầy đủ: bộ lọc báo + danh sách + nút "Xem thêm"
  const st = el._news;
  const filtered = st.filter === 'all' ? st.items : st.items.filter(x => x.source === st.filter);
  const shown = filtered.slice(0, st.shown);
  const counts = {};
  st.items.forEach(x => { counts[x.source] = (counts[x.source] || 0) + 1; });
  const chip = (key, label, n) =>
    `<button type="button" data-news-filter="${newsEsc(key)}" class="btn btn-sm ${st.filter === key ? 'btn-primary' : 'btn-outline'}" style="padding:7px 14px;">${newsEsc(label)} <span class="mono" style="opacity:.7;">${n}</span></button>`;
  const bar = `<div style="grid-column:1/-1; display:flex; flex-wrap:wrap; gap:8px; margin-bottom:6px;">` +
    chip('all', 'Tất cả', st.items.length) + Object.keys(counts).map(k => chip(k, k, counts[k])).join('') + `</div>`;
  const more = filtered.length > shown.length
    ? `<div style="grid-column:1/-1; text-align:center; margin-top:8px;"><button type="button" class="btn btn-outline" data-news-more>Xem thêm tin (còn ${filtered.length - shown.length})</button></div>` : '';
  el.innerHTML = bar + shown.map(newsCardHTML).join('') + more + st.note;
}

function onNewsClick(e) {
  const el = e.currentTarget, st = el._news;
  if (!st) return;
  const f = e.target.closest('[data-news-filter]');
  if (f) { st.filter = f.dataset.newsFilter; st.shown = NEWS_PAGE_SIZE; paintNews(el); return; }
  if (e.target.closest('[data-news-more]')) { st.shown += NEWS_PAGE_SIZE; paintNews(el); }
}

function renderNews(el, res, limit) {
  const note = (txt) => `<p class="news-empty" style="grid-column:1/-1;">${txt}</p>`;
  let extra = '';
  if (res.mode === 'live') {
    const t = new Date().toLocaleTimeString('vi-VN');
    extra = note(`Tin tự động làm mới mỗi phút · cập nhật lúc <span class="news-updated">${newsEsc(t)}</span>`);
  } else if (res.mode === 'cache') {
    extra = note(`Chưa kết nối được nguồn tin. Đang hiển thị tin đã lưu lúc ${newsEsc(new Date(res.cachedAt).toLocaleString('vi-VN'))}. Bấm "Tải lại tin tức" để thử lại.`);
  } else {
    extra = note('Chưa kết nối được nguồn tin nên đang hiển thị tin mẫu. Bấm "Tải lại tin tức" để thử lại.');
  }

  if (limit) {                                             // khung nhỏ (trang chủ): chỉ vài tin mới nhất
    const list = res.items.slice(0, limit);
    el.dataset.sig = res.mode === 'live' ? newsSig(list) : '';
    el.innerHTML = list.map(newsCardHTML).join('') + extra;
    return;
  }
  const prev = el._news;                                   // trang Tin tức: hiện toàn bộ, giữ nguyên bộ lọc đang chọn
  el._news = {
    items: res.items,
    filter: prev && res.items.some(x => x.source === prev.filter) ? prev.filter : 'all',
    shown: prev ? prev.shown : NEWS_PAGE_SIZE,
    note: extra,
    sig: res.mode === 'live' ? newsSig(res.items) : '',
  };
  if (!el._newsBound) { el._newsBound = true; el.addEventListener('click', onNewsClick); }
  paintNews(el);
}

window.__newsTimers = window.__newsTimers || {};

async function refreshNews(containerId, limit) {
  const el = document.getElementById(containerId);
  if (!el || document.hidden) return;
  try {
    const res = await getNews();
    if (res.mode !== 'live') return;                      // lỗi tạm thời: giữ nguyên những gì đang hiện
    const sig = newsSig(limit ? res.items.slice(0, limit) : res.items);
    const current = limit ? el.dataset.sig : (el._news && el._news.sig);
    if (sig !== current) renderNews(el, res, limit);      // chỉ vẽ lại khi có tin mới
    else {
      const u = el.querySelector('.news-updated');
      if (u) u.textContent = new Date().toLocaleTimeString('vi-VN');
    }
  } catch (e) { console.warn('[Tin tức] Làm mới lỗi:', e.message); }
}

async function loadNews(containerId, limit) {
  const el = document.getElementById(containerId);
  if (!el) return;
  renderNews(el, await getNews(), limit);
  if (!window.__newsTimers[containerId]) {
    window.__newsTimers[containerId] = setInterval(() => refreshNews(containerId, limit), NEWS_REFRESH_MS);
  }
}
