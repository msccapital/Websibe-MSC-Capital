/* Tổng hợp tin tức thị trường từ các báo khác (kiểu "AI News").
   Trang web là tĩnh (GitHub Pages, không có máy chủ), nên việc lấy tin diễn ra ngay trong
   trình duyệt của người xem:
     Cách 1: rss2json.com (đổi RSS -> JSON).
     Cách 2: allorigins.win (lấy RSS thô rồi tự đọc) — chạy khi cách 1 lỗi.
   Tin lấy thành công được lưu trong trình duyệt; nếu lần sau cả hai cách đều lỗi thì hiện
   lại tin đã lưu thay vì tin mẫu. Nếu vẫn không hiện, mở F12 > Console để xem lý do.

   Đổi nguồn tin: sửa mảng FEEDS. */

const FEEDS = [
  { name: 'CafeF', url: 'https://cafef.vn/thi-truong-chung-khoan.rss' },
  { name: 'VnExpress Kinh doanh', url: 'https://vnexpress.net/rss/kinh-doanh.rss' },
  { name: 'Vietstock', url: 'https://vietstock.vn/830/chung-khoan.rss' },
];

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
  const img = item.image
    ? `<div style="aspect-ratio:16/9; overflow:hidden; margin:-22px -22px 6px; border-bottom:1px solid var(--line); background:var(--panel-alt);">
         <img src="${newsEsc(item.image)}" alt="" loading="lazy" referrerpolicy="no-referrer"
              style="width:100%; height:100%; object-fit:cover;" onerror="this.parentElement.style.display='none'">
       </div>` : '';
  return `
    <a class="news-card" href="${newsEsc(item.link || '#')}" target="_blank" rel="noopener noreferrer">
      ${img}
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
  try { localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ t: Date.now(), items: items.slice(0, 40) })); } catch (e) {}
}

async function loadNews(containerId, limit) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const note = (txt) => `<p class="news-empty" style="grid-column:1/-1;">${txt}</p>`;

  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  let items = results.filter(r => r.status === 'fulfilled').flatMap(r => r.value).filter(x => x.title && x.link);

  if (items.length) {
    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    writeNewsCache(items);
    if (limit) items = items.slice(0, limit);
    el.innerHTML = items.map(newsCardHTML).join('');
    return;
  }

  const cached = readNewsCache();
  if (cached) {
    const when = new Date(cached.t).toLocaleString('vi-VN');
    const list = limit ? cached.items.slice(0, limit) : cached.items;
    el.innerHTML = list.map(newsCardHTML).join('') +
      note(`Chưa kết nối được nguồn tin. Đang hiển thị tin đã lưu lúc ${newsEsc(when)}. Bấm "Tải lại tin tức" để thử lại.`);
    return;
  }

  const sample = limit ? FALLBACK_NEWS.slice(0, limit) : FALLBACK_NEWS;
  el.innerHTML = sample.map(newsCardHTML).join('') +
    note('Chưa kết nối được nguồn tin nên đang hiển thị tin mẫu. Bấm "Tải lại tin tức" để thử lại.');
}
