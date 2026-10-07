(() => {
  const notes = window.NOTES || [];
  const site = window.SITE || {};
  const root = document.body.dataset.root || '';
  const kindLabel = { hard: 'Hardcoded', learned: 'Learned' };

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
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
  if (count) count.textContent = `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`;

  // Notes page: list and filters.
  const list = document.querySelector('[data-note-list]');
  if (list) {
    const render = (filter) => {
      list.replaceChildren(...notes
        .filter((note) => filter === 'all' || note.kind === filter)
        .map((note) => {
          const row = el(note.href ? 'a' : 'div', 'note-row');
          if (note.href) row.href = root + note.href;

          const title = el('span', 'title');
          const square = el('span', `square ${note.kind}`);
          square.setAttribute('role', 'img');
          square.setAttribute('aria-label', kindLabel[note.kind] || '');
          title.append(square, note.title);

          const body = el('span', 'body');
          body.append(title, el('span', 'project', note.project));

          const go = el('span', note.href ? 'go' : 'go soon', note.href ? '→' : 'Writing');
          if (note.href) go.setAttribute('aria-hidden', 'true');

          row.append(el('span', 'date', note.date), body, go);
          const item = el('li');
          item.append(row);
          return item;
        }));
    };

    const buttons = Array.from(document.querySelectorAll('[data-filter]'));
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
        render(button.dataset.filter);
      });
    });
    render('all');
  }

  // Note page: discuss link and next note.
  const discuss = document.querySelector('[data-discuss]');
  if (discuss && site.xUrl) {
    discuss.href = site.xUrl;
  } else if (discuss) {
    discuss.append(el('span', 'todo', ' [X LINK]'));
  }

  const next = document.querySelector('[data-next-note]');
  if (next) {
    const here = notes.findIndex((note) => note.href === next.dataset.nextNote);
    const following = notes.slice(here + 1).concat(notes.slice(0, here))
      .find((note) => note.href);
    if (here >= 0 && following) {
      next.href = root + following.href;
      next.textContent = `Next: ${following.title} →`;
    } else {
      next.remove();
    }
  }
})();
