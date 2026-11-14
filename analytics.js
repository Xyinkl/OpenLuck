/* Aggregate usage only: never read form values, configuration, images or result data. */
(() => {
  const config = document.currentScript.dataset;
  const project = config.project;
  const hosts = project === 'badgelab' ? ['badge.vtx.space','bl.vtx.space'] : ['openluck.vtx.space','ol.vtx.space'];
  const allowed = hosts.includes(location.hostname);
  const actions = {
    'download':'profile-download-click','export-txt':'config-export-click','import-txt':'config-import-click',
    'rec-trigger':'recognition-open','rec-apply':'recognition-apply-click',
    'mode-toggle-overlay':'layout-toggle','reset-confirm':'layout-reset',
    'search-mode-jump':'search-jump','search-mode-filter':'search-filter',
    'feedback-open':'feedback-open','startBtn':'draw-start-click','shareBtn':'draw-share-click',
    'copyCodeBtn':'verification-copy-click','tab-server':'history-server','tab-local':'history-local',
    'langZh':'language-zh','langEn':'language-en','langJa':'language-ja'
  };
  const known = new Set([...Object.values(actions), 'language-zh','language-en','language-ja',
    'recommend-agentskit','recommend-openluck','history-export-click','result-copy-click']);
  window.vtxAnalyticsBeforeSend = (type, payload) => {
    if (!allowed || navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true || type !== 'event') return false;
    if (payload.name && !known.has(payload.name)) return false;
    let referrer = '';
    try { referrer = payload.referrer ? new URL(payload.referrer).origin : ''; } catch {}
    // Fixed paths/titles prevent shared configuration hashes and lottery identifiers leaking.
    return {website:payload.website, hostname:location.hostname, language:payload.language,
      screen:payload.screen, url:(location.pathname === '/history' || location.pathname === '/history.html') ? '/history' : '/',
      title:project === 'badgelab' ? 'BadgeLab' : 'OpenLuck', referrer, tag:project,
      ...(payload.name ? {name:payload.name, data:{project}} : {})};
  };
  document.addEventListener('click', event => {
    if (!allowed) return;
    const el = event.target.closest?.('button,a,[role="button"],.source-tab');
    if (!el || el.disabled) return;
    let name = actions[el.id];
    if (el.matches('.lang-btn') && ['zh','en','ja'].includes(el.dataset.lang)) name = 'language-'+el.dataset.lang;
    if (el.dataset.i18n === 'histExportBtn') name = 'history-export-click';
    if (el.dataset.i18n === 'rsCopyBtn' || el.dataset.i18n === 'histCardCopyResult') name = 'result-copy-click';
    if (el.closest('.project-recommendations') && el.tagName === 'A') {
      if (el.hostname === 'agentskit.org') name = 'recommend-agentskit';
      if (el.hostname === 'openluck.vtx.space') name = 'recommend-openluck';
    }
    if (!name) return;
    try { Promise.resolve(window.umami?.track(name)).catch(() => {}); } catch {}
  }, true);
  // Load third-party analytics asynchronously, so network trouble cannot hold up the tool.
  if (allowed && navigator.doNotTrack !== '1' && navigator.globalPrivacyControl !== true) {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://cloud.umami.is/script.js';
    for (const [key, value] of Object.entries(config)) if (key !== 'project') script.dataset[key] = value;
    document.head.append(script);
  }
})();
