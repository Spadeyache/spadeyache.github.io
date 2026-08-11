(function () {
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
  const tabList = document.querySelector('[role="tablist"]');
  const indicator = document.querySelector('.tab-indicator');

  function positionIndicator(tab) {
    if (!tab || !tabList || !indicator) return;
    const y = tab.offsetTop + tab.offsetHeight - indicator.offsetHeight;
    tabList.style.setProperty('--indicator-y', `${y}px`);
  }

  function activateTab(tab, moveFocus) {
    if (!tab) return;

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

  const heroMedia = document.querySelector('[data-scroll-media]');
  const mediaMotion = heroMedia && heroMedia.querySelector('.media-motion');
  const mediaPerson = heroMedia && heroMedia.querySelector('.media-person');
  const mediaRobot = heroMedia && heroMedia.querySelector('.media-robot');
  const desktopMedia = window.matchMedia('(min-width: 1200px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let mediaFrame;

  function mix(from, to, progress) {
    return from + ((to - from) * progress);
  }

  function setMediaTile(tile, x, y, width, height) {
    tile.style.left = '0';
    tile.style.top = '0';
    tile.style.width = `${width}px`;
    tile.style.height = `${height}px`;
    tile.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  function resetScrollMedia() {
    if (!mediaMotion || !mediaPerson || !mediaRobot) return;
    mediaMotion.removeAttribute('style');
    mediaPerson.removeAttribute('style');
    mediaRobot.removeAttribute('style');
  }

  function updateScrollMedia() {
    mediaFrame = undefined;
    if (!heroMedia || !mediaMotion || !mediaPerson || !mediaRobot) return;

    if (!desktopMedia.matches || reducedMotion.matches) {
      resetScrollMedia();
      return;
    }

    const viewportWidth = window.innerWidth;
    const readingWidth = Math.min(680, viewportWidth - 96);
    const initialHeight = 310;
    const initialGap = 12;
    const initialTileWidth = (readingWidth - initialGap) / 2;
    const sideSpace = (viewportWidth - readingWidth) / 2;
    const targetWidth = Math.min(300, Math.max(220, sideSpace - 48));
    const targetHeight = Math.min(430, Math.max(370, window.innerHeight - 290));
    const targetGap = 12;
    const targetTileHeight = (targetHeight - targetGap) / 2;
    const copyRight = (viewportWidth + readingWidth) / 2;
    const targetLeft = Math.min(copyRight + 24, viewportWidth - targetWidth - 24);
    const targetCenter = targetLeft + (targetWidth / 2);
    const targetX = targetCenter - (viewportWidth / 2);
    const topbarHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topbar-height')) || 188;
    const sectionTop = heroMedia.parentElement ? heroMedia.parentElement.offsetTop : heroMedia.offsetTop;
    const stickyStart = Math.max(0, sectionTop - topbarHeight - 18);
    const progress = Math.min(1, Math.max(0, (window.scrollY - stickyStart) / 360));

    const motionWidth = mix(readingWidth, targetWidth, progress);
    const motionHeight = mix(initialHeight, targetHeight, progress);
    const motionX = mix(0, targetX, progress);

    mediaMotion.style.width = `${motionWidth}px`;
    mediaMotion.style.height = `${motionHeight}px`;
    mediaMotion.style.transform = `translate3d(calc(-50% + ${motionX}px), 0, 0)`;

    setMediaTile(
      mediaPerson,
      0,
      0,
      mix(initialTileWidth, targetWidth, progress),
      mix(initialHeight, targetTileHeight, progress)
    );
    setMediaTile(
      mediaRobot,
      mix(initialTileWidth + initialGap, 0, progress),
      mix(0, targetTileHeight + targetGap, progress),
      mix(initialTileWidth, targetWidth, progress),
      mix(initialHeight, targetTileHeight, progress)
    );
  }

  function requestMediaUpdate() {
    if (mediaFrame) return;
    mediaFrame = window.requestAnimationFrame(updateScrollMedia);
  }

  window.addEventListener('scroll', requestMediaUpdate, { passive: true });
  window.addEventListener('resize', () => {
    positionIndicator(tabs.find((tab) => tab.getAttribute('aria-selected') === 'true'));
    requestMediaUpdate();
  });
  desktopMedia.addEventListener('change', requestMediaUpdate);
  reducedMotion.addEventListener('change', requestMediaUpdate);
  requestMediaUpdate();
})();
