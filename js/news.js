/* Aggregates market news from outside sources — the "AI News" style feed.
   Because the site is static (GitHub Pages, no server), aggregation happens
   in the visitor's browser: we pull public RSS feeds through rss2json.com's
   free RSS→JSON proxy (no key needed for light traffic; for production
   traffic, sign up for a free key at rss2json.com and add it below).

   To change which outlets appear, edit FEEDS. To swap the proxy for your
   own key: add `&api_key=YOUR_KEY` to buildProxyUrl(). */

const FEEDS = [
  { name: 'CafeF', url: 'https://cafef.vn/thi-truong-chung-khoan.rss' },
  { name: 'VnExpress Kinh doanh', url: 'https://vnexpress.net/rss/kinh-doanh.rss' },
  { name: 'Vietstock', url: 'https://vietstock.vn/830/chung-khoan.rss' },
];

// Shown only if every live feed fails (offline demo / first load before deploy).
const FALLBACK_NEWS = [
  { source: 'CafeF', title: 'Khối ngoại trở lại mua ròng trên HOSE trong tuần giao dịch gần nhất', desc: 'Dòng tiền khối ngoại ghi nhận tín hiệu tích cực sau nhiều tuần bán ròng liên tiếp, tập trung ở nhóm ngân hàng và bán lẻ.', link: 'https://cafef.vn/thi-truong-chung-khoan.chn', date: '' },
  { source: 'VnExpress Kinh doanh', title: 'VN-Index tiệm cận vùng đỉnh cũ khi thanh khoản cải thiện', desc: 'Thị trường chứng khoán trong nước duy trì đà tăng nhờ nhóm cổ phiếu vốn hoá lớn, thanh khoản bình quân phiên cải thiện rõ rệt.', link: 'https://vnexpress.net/kinh-doanh', date: '' },
  { source: 'Vietstock', title: 'Nhóm cổ phiếu ngân hàng dẫn dắt thị trường phiên đầu tuần', desc: 'Sắc xanh lan toả ở nhóm ngân hàng, kéo các chỉ số chính tăng điểm ngay từ đầu phiên giao dịch.', link: 'https://vietstock.vn/', date: '' },
];

function buildProxyUrl(feedUrl) {
  return `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
}

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  return (tmp.textContent || tmp.innerText || '').trim();
}

function truncate(text, max) {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

async function fetchFeed(feed) {
  const res = await fetch(buildProxyUrl(feed.url));
  const data = await res.json();
  if (data.status !== 'ok') throw new Error('feed error: ' + feed.name);
  return data.items.map(item => ({
    source: feed.name,
    title: item.title,
    desc: truncate(stripHtml(item.description || item.content || ''), 150),
    link: item.link,
    date: item.pubDate,
  }));
}

function newsCardHTML(item) {
  const dateStr = item.date ? new Date(item.date).toLocaleDateString('vi-VN') : '';
  return `
    <a class="news-card" href="${item.link}" target="_blank" rel="noopener noreferrer">
      <div class="news-source"><span>${item.source}</span><span>${dateStr}</span></div>
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
      <span class="btn-ghost" style="font-size:13px;">Đọc bài gốc →</span>
    </a>`;
}

async function loadNews(containerId, limit) {
  const el = document.getElementById(containerId);
  if (!el) return;
  try {
    const results = await Promise.allSettled(FEEDS.map(fetchFeed));
    let items = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value);

    if (items.length === 0) throw new Error('Tất cả nguồn tin đều lỗi');

    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (limit) items = items.slice(0, limit);

    el.innerHTML = items.map(newsCardHTML).join('');
  } catch (err) {
    console.warn('Dùng tin tức mẫu (fallback) vì:', err.message);
    const items = limit ? FALLBACK_NEWS.slice(0, limit) : FALLBACK_NEWS;
    el.innerHTML = items.map(newsCardHTML).join('') +
      `<p class="news-empty" style="grid-column:1/-1;">Đang hiển thị tin mẫu — tin thật sẽ tự cập nhật khi trang chạy trên GitHub Pages với kết nối internet ổn định.</p>`;
  }
}
