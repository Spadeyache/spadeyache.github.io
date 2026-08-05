(function () {
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
  const tabList = document.querySelector('[role="tablist"]');
  const indicator = document.querySelector('.tab-indicator');

  function positionIndicator(tab) {
    const y = tab.offsetTop + tab.offsetHeight - indicator.offsetHeight;
    tabList.style.setProperty('--indicator-y', `${y}px`);
  }

  function activateTab(tab, moveFocus) {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.id !== tab.getAttribute('aria-controls');
    });

    positionIndicator(tab);
    if (moveFocus) tab.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab, false));
    tab.addEventListener('keydown', (event) => {
      let nextIndex;

      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;

      if (nextIndex !== undefined) {
        event.preventDefault();
        activateTab(tabs[nextIndex], true);
      }
    });
  });

  positionIndicator(tabs.find((tab) => tab.getAttribute('aria-selected') === 'true'));
  window.addEventListener('resize', () => {
    positionIndicator(tabs.find((tab) => tab.getAttribute('aria-selected') === 'true'));
  });
})();
