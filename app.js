(() => {
  "use strict";

  const state = { articles: [], byId: new Map() };
  const $ = (id) => document.getElementById(id);

  const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  function articleLink(id, label) {
    const article = state.byId.get(id);
    if (!article) return escapeHTML(label || id);
    return `<a href="#article/${encodeURIComponent(id)}">${escapeHTML(label || article.title)}</a>`;
  }

  function renderParagraph(text) {
    // JSON paragraphs may use [[article-id]] to create an internal article link.
    const safe = escapeHTML(text || "");
    return safe.replace(/\[\[([a-z0-9-]+)\]\]/gi, (_, id) => {
      const article = state.byId.get(id);
      return article ? articleLink(id) : escapeHTML(id);
    });
  }

  function setView(view) {
    ["home-view", "article-view", "category-view", "search-view"].forEach(id => $(id).hidden = id !== view);
  }

  function renderArticleList(items, target) {
    if (!items.length) {
      target.innerHTML = '<li class="empty-state">No articles have been added here yet.</li>';
      return;
    }
    target.innerHTML = items.map(article => `
      <li class="article-list-item">
        <strong>${articleLink(article.id)}</strong>
        <p>${escapeHTML(article.summary || "")}</p>
      </li>`).join("");
  }

  function categories() {
    const map = new Map();
    state.articles.forEach(article => map.set(article.category, (map.get(article.category) || 0) + 1));
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }

  function renderHome() {
    const featured = state.articles.slice(0, 3);
    $("featured-list").innerHTML = featured.map(article => `
      <div class="article-card">
        <div class="card-category">${escapeHTML(article.category)}</div>
        <h3>${articleLink(article.id)}</h3>
        <p>${escapeHTML(article.summary || "")}</p>
      </div>`).join("") || '<div class="empty-state">No articles yet. Add entries to data/articles.json.</div>';

    const cats = categories();
    $("category-nav").innerHTML = cats.map(([name, count]) =>
      `<a class="category-link" href="#category/${encodeURIComponent(name)}">${escapeHTML(name)} (${count})</a>`
    ).join("") || '<span class="muted">No categories yet.</span>';

    $("category-grid").innerHTML = cats.map(([name, count]) =>
      `<a class="category-card" href="#category/${encodeURIComponent(name)}"><span>${escapeHTML(name)}</span><span>${count} ${count === 1 ? "article" : "articles"} →</span></a>`
    ).join("") || '<div class="empty-state">Categories will appear as articles are added.</div>';

    const sorted = [...state.articles].sort((a, b) => (b.updated || "").localeCompare(a.updated || ""));
    $("recent-list").innerHTML = sorted.slice(0, 6).map(article =>
      `<li><span>${articleLink(article.id)}</span><time>${escapeHTML(article.updated || "")}</time></li>`
    ).join("") || '<li class="empty-state">No recent additions.</li>';

    renderArticleList([...state.articles].sort((a, b) => a.title.localeCompare(b.title)), $("all-articles-list"));
  }

  function renderArticle(id) {
    const article = state.byId.get(id);
    if (!article) return renderNotFound(id);
    setView("article-view");
    $("crumb-current").textContent = article.title.toUpperCase();
    $("article-category").textContent = article.category || "UNCATEGORIZED";
    $("article-title").textContent = article.title;
    $("article-summary").textContent = article.summary || "";
    $("article-updated").textContent = `Last updated: ${article.updated || "Unknown"}`;
    $("article-tags").textContent = (article.tags || []).join(" · ");

    const sections = article.sections || [];
    $("article-body").innerHTML = sections.map((section, index) => {
      const headingId = `section-${index}`;
      return `<section><h2 id="${headingId}">${escapeHTML(section.heading || "Untitled section")}</h2>
        ${(section.paragraphs || []).map(p => `<p>${renderParagraph(p)}</p>`).join("")}</section>`;
    }).join("") || '<p>This article has no content yet.</p>';

    $("toc").innerHTML = sections.map((section, index) =>
      `<li><a href="#section-${index}">${escapeHTML(section.heading || "Untitled section")}</a></li>`
    ).join("") || "<li>No sections</li>";

    const related = (article.related || []).map(id => state.byId.get(id)).filter(Boolean);
    $("related-list").innerHTML = related.map(item => `<li>${articleLink(item.id)}</li>`).join("") || "<li>No related articles yet.</li>";
    window.scrollTo(0, 0);
  }

  
function rendercategory(name) {
  const items = state.articles.filter(a => a.category.toLowerCase() === name.toLowerCase());

  if (name.toLowerCase() === "history") {
    items.sort((a, b) => {
      const getStartYear = (article) => {
        const match = article.title.match(/\((\d+)\s*[–—-]/);
        return match ? Number(match[1]) : Infinity;
      };

      return getStartYear(a) - getStartYear(b);
    });
  } else {
    items.sort((a, b) => a.title.localeCompare(b.title));
  }

  setView("category-view");
  $("crumb-current").textContent = name.toUpperCase();
  $("category-title").textContent = name;
  $("category-description").textContent = `${items.length} ${items.length === 1 ? "article" : "articles"} in this category.`;
  renderArticleList(items, $("category-articles"));
  window.scrollTo(0, 0);
}


  function renderSearch(query) {
    const q = query.trim().toLowerCase();
    const items = state.articles.filter(a => [
      a.title, a.category, a.summary, ...(a.tags || []),
      ...(a.sections || []).flatMap(s => [s.heading, ...(s.paragraphs || [])])
    ].join(" ").toLowerCase().includes(q));
    setView("search-view");
    $("crumb-current").textContent = "SEARCH";
    $("search-summary").textContent = `${items.length} result${items.length === 1 ? "" : "s"} for “${query}”.`;
    renderArticleList(items, $("search-results"));
    window.scrollTo(0, 0);
  }

  function renderNotFound(id) {
    setView("article-view");
    $("crumb-current").textContent = "NOT FOUND";
    $("article-category").textContent = "MISSING RECORD";
    $("article-title").textContent = "Article not found";
    $("article-summary").textContent = `There is no article with the identifier “${id}”.`;
    $("article-updated").textContent = "";
    $("article-tags").textContent = "";
    $("article-body").innerHTML = '<p>The requested record may have been moved, renamed, or not yet written.</p><p><a href="./">Return to the main page</a>.</p>';
    $("toc").innerHTML = "";
    $("related-list").innerHTML = "";
  }

  function route() {
    const hash = decodeURIComponent(location.hash.slice(1));
    // Section anchors belong to the currently rendered article; do not reroute to the homepage.
    if (hash.startsWith("section-")) return;
    if (!hash) {
      setView("home-view");
      $("crumb-current").textContent = "MAIN PAGE";
      return;
    }
    const [type, ...rest] = hash.split("/");
    const value = rest.join("/");
    if (type === "article") renderArticle(value);
    else if (type === "category") renderCategory(value);
    else if (type === "search") {
      $("search").value = value;
      renderSearch(value);
    } else {
      setView("home-view");
    }
  }

  async function init() {
    try {
      const response = await fetch("data/articles.json");
      if (!response.ok) throw new Error(`Could not load articles.json (${response.status})`);
      state.articles = await response.json();
      if (!Array.isArray(state.articles)) throw new Error("articles.json must contain an array.");
      state.byId = new Map(state.articles.map(article => [article.id, article]));
      renderHome();
      route();
    } catch (error) {
      $("notice").hidden = false;
      $("notice").textContent = `The archive could not load its article data. Run this site through a local web server (not file://). ${error.message}`;
      console.error(error);
    }
  }

  $("search").addEventListener("keydown", event => {
    if (event.key === "Enter" && event.currentTarget.value.trim()) {
      location.hash = `search/${encodeURIComponent(event.currentTarget.value.trim())}`;
    }
  });
  $("search").addEventListener("input", event => {
    if (!event.currentTarget.value.trim() && location.hash.startsWith("#search/")) location.hash = "";
  });
  $("menu-toggle").addEventListener("click", () => {
    const open = $("sidebar").classList.toggle("open");
    $("menu-toggle").setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("keydown", event => {
    if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      event.preventDefault(); $("search").focus();
    }
    if (event.key === "Escape") $("search").blur();
  });
  window.addEventListener("hashchange", route);
  init();
})();
