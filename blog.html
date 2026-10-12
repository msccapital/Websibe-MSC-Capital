/* Reads data/posts.json and renders post cards.
   To publish a new post: open data/posts.json and add a new object at the top
   of the array (slug, title, excerpt, date, author, tag, cover, video, content[]).
   Leave "video" empty ("") for a text-only post, or paste a YouTube embed URL
   (https://www.youtube.com/embed/VIDEO_ID) to attach a clip, the way 24hmoney
   or Bò và Gấu do. */

function formatDateVN(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function postThumbHTML(post) {
  if (post.video) {
    const id = post.video.split('/embed/')[1];
    const imgSrc = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
    return `<div class="post-thumb">
      ${imgSrc ? `<img src="${imgSrc}" alt="${post.title}" loading="lazy">` : ''}
      <div class="play">
        <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" stroke="#edf3ee" stroke-width="1.4"/><path d="M10 8l6 4-6 4V8z" fill="#edf3ee"/></svg>
      </div>
    </div>`;
  }
  return `<div class="post-thumb">${post.cover ? `<img src="${post.cover}" alt="${post.title}" loading="lazy">` : ''}</div>`;
}

function slugifyVN(s) {
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function toEmbedUrl(url) {
  if (!url || url.includes('/embed/')) return url || '';
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

async function fetchPosts() {
  const res = await fetch('data/posts.json');
  const data = await res.json();
  const list = Array.isArray(data) ? data : (data.posts || []);
  return list.map(p => ({
    ...p,
    slug: p.slug || slugifyVN(p.title || ''),
    video: toEmbedUrl(p.video || ''),
    cover: (p.cover || '').replace(/^\/+/, ''),
    images: (p.images || []).map(src => String(src).replace(/^\/+/, '')),
    content: Array.isArray(p.content)
      ? p.content
      : String(p.content || '').split(/\n\s*\n/).map(x => x.trim().replace(/\n/g, '<br>')).filter(Boolean),
  })).sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function loadBlog(containerId, limit) {
  const el = document.getElementById(containerId);
  if (!el) return;
  try {
    const posts = await fetchPosts();
    const slice = limit ? posts.slice(0, limit) : posts;
    el.innerHTML = slice.map(p => `
      <a class="post-card" href="bai-viet.html?slug=${p.slug}">
        ${postThumbHTML(p)}
        <div class="post-body">
          <span class="post-tag">${p.tag}</span>
          <h3>${p.title}</h3>
          <p>${p.excerpt}</p>
          <div class="post-meta"><span>${formatDateVN(p.date)}</span><span>${p.author}</span></div>
        </div>
      </a>
    `).join('');
  } catch (err) {
    el.innerHTML = `<p class="news-empty">Không tải được bài viết. Kiểm tra lại data/posts.json.</p>`;
    console.error(err);
  }
}

async function loadSinglePost() {
  const el = document.getElementById('post-detail');
  if (!el) return;
  const slug = new URLSearchParams(location.search).get('slug');
  const posts = await fetchPosts();
  const post = posts.find(p => p.slug === slug) || posts[0];
  if (!post) { el.innerHTML = '<p>Không tìm thấy bài viết.</p>'; return; }

  document.title = `${post.title} — Blog MSC Capital`;

  el.innerHTML = `
    <span class="post-tag">${post.tag}</span>
    <h1 style="margin-top:14px;">${post.title}</h1>
    <div class="post-meta" style="margin-bottom:28px;"><span>${formatDateVN(post.date)}</span><span>${post.author}</span></div>
    ${post.video ? `<div style="aspect-ratio:16/9; border:1px solid var(--line); margin-bottom:28px;">
        <iframe width="100%" height="100%" src="${post.video}" title="${post.title}" frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>` : (post.cover ? `<img src="${post.cover}" alt="${post.title}" style="margin-bottom:28px; border:1px solid var(--line);">` : '')}
    <div class="post-content">
      ${post.content.map(p => `<p style="max-width:70ch; font-size:16.5px; color:var(--text);">${p}</p>`).join('')}
      ${(post.images || []).map(src => `<img src="${src}" alt="" loading="lazy" style="margin:22px 0; border:1px solid var(--line);">`).join('')}
    </div>
  `;

  // related posts
  const relEl = document.getElementById('related-posts');
  if (relEl) {
    const others = posts.filter(p => p.slug !== post.slug).slice(0, 3);
    relEl.innerHTML = others.map(p => `
      <a class="post-card" href="bai-viet.html?slug=${p.slug}">
        ${postThumbHTML(p)}
        <div class="post-body">
          <span class="post-tag">${p.tag}</span>
          <h3>${p.title}</h3>
          <div class="post-meta"><span>${formatDateVN(p.date)}</span></div>
        </div>
      </a>
    `).join('');
  }
}
