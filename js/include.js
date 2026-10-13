/* Loads the shared header/footer into every page and wires up small nav behaviours.
   Requires the page to be served over http(s) — e.g. GitHub Pages, or locally via
   `python3 -m http.server` — fetch() of local files does not work from file:// */

async function includePartial(selector, url) {
  const host = document.querySelector(selector);
  if (!host) return;
  try {
    const res = await fetch(url);
    host.innerHTML = await res.text();
  } catch (err) {
    console.error('Không tải được thành phần dùng chung:', url, err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await includePartial('#site-header', 'components/header.html');
  initTicker();
  await includePartial('#site-footer', 'components/footer.html');

  // highlight current nav link
  const page = document.body.dataset.page;
  if (page) {
    const link = document.querySelector(`[data-nav="${page}"]`);
    if (link) link.classList.add('active');
  }

  // mobile menu toggle
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => links.classList.remove('open'))
    );
  }

  // footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  document.dispatchEvent(new CustomEvent('partials:ready'));
});


/* Bảng giá chạy ngang: widget Ticker Tape miễn phí của TradingView.
   Script phải được tạo bằng JS (không chạy được nếu chèn qua innerHTML).
   Muốn đổi/thêm mã: sửa mảng symbols bên dưới theo dạng "SÀN:MÃ" (vd HOSE:VNM). */
function initTicker() {
  const host = document.getElementById('tv-ticker');
  if (!host) return;
  host.innerHTML = '<div class="tradingview-widget-container"><div class="tradingview-widget-container__widget"></div></div>';
  const s = document.createElement('script');
  s.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
  s.async = true;
  s.text = JSON.stringify({
    symbols: [
      { proName: 'HOSE:VNINDEX', title: 'VN-Index' },
      { proName: 'HOSE:VN30', title: 'VN30' },
      { proName: 'HNX:HNXINDEX', title: 'HNX-Index' },
      { proName: 'HOSE:VCB', title: 'VCB' },
      { proName: 'HOSE:FPT', title: 'FPT' },
      { proName: 'HOSE:HPG', title: 'HPG' },
      { proName: 'HOSE:VNM', title: 'VNM' },
      { proName: 'HOSE:SSI', title: 'SSI' }
    ],
    showSymbolLogo: false,
    colorTheme: 'dark',
    isTransparent: true,
    displayMode: 'adaptive',
    locale: 'vi_VN'
  });
  host.querySelector('.tradingview-widget-container').appendChild(s);
}
