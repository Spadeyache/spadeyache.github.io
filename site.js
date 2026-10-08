(() => {
  // Notes live in notes/<slug>/note.md. notes/notes.json sets their order.
  const kindLabel = { hardcoded: 'Hardcoded', learned: 'Learned' };

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Paths inside a note are relative to its folder.
  const resolve = (slug, path) => (/^(https?:|\/|#|mailto:)/.test(path) ? path : `notes/${slug}/${path}`);

  // Front matter: "key: value" lines, with [a, b] lists and true/false.
  const parseFrontMatter = (text) => {
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    const meta = {};
    if (!match) return { meta, body: text };
    match[1].split(/\r?\n/).forEach((line) => {
      const pair = line.match(/^(\w+):\s*(.*)$/);
      if (!pair) return;
      let value = pair[2].trim();
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map((v) => v.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      } else if (value === 'true' || value === 'false') {
        value = value === 'true';
      } else {
        value = value.replace(/^["']|["']$/g, '');
      }
      meta[pair[1]] = value;
    });
    return { meta, body: text.slice(match[0].length) };
  };

  const inline = (text, slug) => escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => `<a href="${resolve(slug, href)}">${label}</a>`);

  const media = (slug, src, alt, caption) => {
    const url = escapeHtml(resolve(slug, src));
    const tag = /\.(mp4|webm|mov)$/i.test(src)
      ? `<video controls playsinline preload="none" aria-label="${escapeHtml(alt)}"><source src="${url}"></video>`
      : `<img src="${url}" alt="${escapeHtml(alt)}" loading="lazy">`;
    return `<figure>${tag}${caption ? `<figcaption>${inline(caption, slug)}</figcaption>` : ''}</figure>`;
  };

  // Small Markdown subset: ## headings, paragraphs, - lists, images/videos,
  // **bold**, *italic*, `code`, [links](url). "## Still hardcoded" is boxed.
  const renderMarkdown = (body, slug) => {
    const sections = [{ heading: null, blocks: [] }];
    body.trim().split(/\n\s*\n/).forEach((block) => {
      block = block.trim();
      const heading = block.match(/^#{2,3}\s+(.+)$/);
      const image = block.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);
      if (heading) {
        sections.push({ heading: heading[1], blocks: [] });
      } else if (image) {
        sections[sections.length - 1].blocks.push(media(slug, image[2], image[1], image[3]));
      } else if (/^[-*]\s/.test(block)) {
        const items = block.split(/\n(?=[-*]\s)/).map((item) => `<li>${inline(item.replace(/^[-*]\s+/, ''), slug)}</li>`);
        sections[sections.length - 1].blocks.push(`<ul>${items.join('')}</ul>`);
      } else if (block) {
        const todo = /^\[[^\]]+\]$/.test(block) ? ' class="todo"' : '';
        sections[sections.length - 1].blocks.push(`<p${todo}>${inline(block, slug)}</p>`);
      }
    });
    return sections.map(({ heading, blocks }) => {
      const html = (heading ? `<h2 class="label">${escapeHtml(heading)}</h2>` : '') + blocks.join('');
      return heading && heading.toLowerCase() === 'still hardcoded' ? `<div class="still-hardcoded">${html}</div>` : html;
    }).join('');
  };

  const loadNotes = async () => {
    const slugs = await (await fetch('notes/notes.json')).json();
    return Promise.all(slugs.map(async (slug) => {
      const text = await (await fetch(`notes/${slug}/note.md`)).text();
      return { slug, ...parseFrontMatter(text) };
    }));
  };

  const square = (kind) => {
    const node = el('span', `square ${kind}`);
    node.setAttribute('role', 'img');
    node.setAttribute('aria-label', kindLabel[kind] || '');
    return node;
  };

  const notesFailed = (target) => {
    target.replaceChildren(el('p', 'todo', 'Notes could not load. To preview locally, run "python3 -m http.server" in the site folder and open http://localhost:8000.'));
  };

  // Home: timeline rows, one open at a time.
  const rows = Array.from(document.querySelectorAll('.timeline button'));
  rows.forEach((button) => {
    button.addEventListener('click', () => {
      const opening = button.getAttribute('aria-expanded') !== 'true';
      rows.forEach((other) => {
        const isThis = other === button && opening;
        other.setAttribute('aria-expanded', String(isThis));
        other.querySelector('.sign').textContent = isThis ? '−' : '+';
        document.getElementById(other.getAttribute('aria-controls')).hidden = !isThis;
      });
    });
  });

  // Home: note count.
  const count = document.querySelector('[data-note-count]');
  if (count) {
    fetch('notes/notes.json')
      .then((r) => r.json())
      .then((slugs) => { count.textContent = `${slugs.length} ${slugs.length === 1 ? 'note' : 'notes'}`; })
      .catch(() => {});
  }

  const noteHref = ({ slug, meta }) => meta.link || `note.html?n=${encodeURIComponent(slug)}`;

  const noteTitle = (note, tag, className) => {
    const title = el(tag, className);
    let text = note.meta.title || note.slug;
    if (!note.meta.draft) {
      text = el('a', '', text);
      text.href = noteHref(note);
    }
    title.append(square(note.meta.kind), text);
    return title;
  };

  // Investigation: title, one-line summary, link. Drafts show "Writing".
  const investigation = (note) => {
    const item = el('article', `investigation${note.meta.draft ? ' draft' : ''}`);
    item.append(noteTitle(note, 'h3', 'title'));
    if (note.meta.summary) item.append(el('p', 'summary', note.meta.summary));
    if (note.meta.draft) {
      item.append(el('p', 'status', 'Writing'));
    } else {
      const more = el('a', '', note.meta.link ? 'Watch ↗' : 'Read the note →');
      more.href = noteHref(note);
      const line = el('p', 'more');
      line.append(more);
      item.append(line);
    }
    return item;
  };

  // Build post: one line. External links get ↗.
  const buildRow = (note) => {
    const item = el('li', note.meta.draft ? 'draft' : '');
    item.append(noteTitle(note, 'span', 'title'));
    const status = note.meta.draft ? 'Writing' : note.meta.link ? '↗' : '→';
    const go = el('span', 'status', status);
    if (!note.meta.draft) go.setAttribute('aria-hidden', 'true');
    item.append(go);
    return item;
  };

  // Notes page: pinned notes are investigations; the rest are build posts.
  const groups = Array.from(document.querySelectorAll('[data-note-group]'));
  if (groups.length) {
    loadNotes().then((notes) => {
      groups.forEach((group) => {
        const research = group.dataset.noteGroup === 'research';
        const shown = notes.filter(({ meta }) => Boolean(meta.pinned) === research);
        group.querySelector('[data-note-list]').replaceChildren(...shown.map(research ? investigation : buildRow));
        group.hidden = shown.length === 0;
      });
    }).catch(() => notesFailed(groups[0]));
  }

  // Note page: render note.md for ?n=<slug>.
  const article = document.querySelector('[data-note]');
  if (article) {
    const slug = new URLSearchParams(location.search).get('n') || '';
    loadNotes().then((notes) => {
      const index = notes.findIndex((note) => note.slug === slug);
      if (index < 0) {
        article.querySelector('[data-note-body]').replaceChildren(el('p', '', 'This note does not exist.'));
        return;
      }
      const { meta, body } = notes[index];
      document.title = `${meta.title} — Kent Nakai`;

      const tag = article.querySelector('[data-note-tag]');
      tag.replaceChildren(square(meta.kind), `${kindLabel[meta.kind] || ''} adaptability`);
      article.querySelector('[data-note-project]').textContent = meta.project || '';
      article.querySelector('[data-note-date]').textContent = meta.date || '';
      article.querySelector('[data-note-title]').textContent = meta.title || slug;

      const keywords = article.querySelector('[data-note-keywords]');
      if (Array.isArray(meta.keywords) && meta.keywords.length) {
        keywords.textContent = meta.keywords.join(' · ');
      } else {
        keywords.remove();
      }

      const lead = meta.video || meta.image;
      article.querySelector('[data-note-body]').innerHTML =
        (lead ? media(slug, lead, meta.title, meta.caption) : '') + renderMarkdown(body, slug);
      const leadVideo = article.querySelector('[data-note-body] > figure:first-child video');
      if (leadVideo && meta.poster) leadVideo.poster = resolve(slug, meta.poster);

      const discuss = article.querySelector('[data-discuss]');
      if (meta.x) {
        discuss.href = meta.x;
      } else {
        discuss.append(el('span', 'todo', ' [X LINK]'));
      }

      const next = article.querySelector('[data-next-note]');
      const following = notes.slice(index + 1).concat(notes.slice(0, index)).find((note) => !note.meta.draft && !note.meta.link);
      if (following) {
        next.href = `note.html?n=${encodeURIComponent(following.slug)}`;
        next.textContent = `Next: ${following.meta.title} →`;
      } else {
        next.remove();
      }
    }).catch(() => notesFailed(article.querySelector('[data-note-body]')));
  }
})();
