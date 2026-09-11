/* ============================================================
   MSC CAPITAL — LOGIC HIỂN THỊ CHUNG
   Không cần sửa file này để đăng bài — chỉ sửa js/data.js
   ============================================================ */

function mscFormatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function mscInitials(title) {
  return title.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function mscThumbHTML(post) {
  const badge = post.youtubeId ? '<span class="play-badge">▶ Có video</span>' : "";
  return `
    <div class="post-thumb">
      ${badge}
      <span class="thumb-label">${mscInitials(post.title)}</span>
    </div>`;
}

function mscPostCardHTML(post, opts = {}) {
  const featured = opts.featured ? " featured-post" : "";
  return `
    <a class="post-card${featured}" href="bai-viet.html?slug=${encodeURIComponent(post.slug)}">
      ${mscThumbHTML(post)}
      <div>
        <div class="post-meta">${post.category}</div>
        <h3 class="post-card-title">${post.title}</h3>
        <p class="post-excerpt">${post.excerpt}</p>
        <div class="post-date">${mscFormatDate(post.date)}</div>
      </div>
    </a>`;
}

function mscPromoCardHTML(promo) {
  return `
    <article class="promo-card">
      <div class="promo-tag">${promo.tag}</div>
      <h3>${promo.title}</h3>
      <p>${promo.description}</p>
      <a class="btn btn-primary" style="background:var(--brass);color:var(--ink);" href="${promo.ctaLink}">${promo.ctaText}</a>
    </article>`;
}

// Mobile nav toggle — attach after header partial is injected
function mscBindNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

document.addEventListener("DOMContentLoaded", mscBindNavToggle);
