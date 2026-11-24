const CANONICAL_ORIGIN = 'https://openluck.vtx.space';

const PAGE_META = {
  index: {
    zh: {
      htmlLang: 'zh-CN',
      locale: 'zh_CN',
      title: 'OpenLuck — 区块链公开抽奖｜以太坊区块哈希可验证抽奖工具',
      description: '基于以太坊区块哈希的公开透明抽奖工具（Provably Fair）。开源 SHA-256 算法，支持任意 Python 环境独立验算，公平不可篡改，绝无暗箱操作。',
    },
    en: {
      htmlLang: 'en',
      locale: 'en_US',
      title: 'OpenLuck — Provably Fair Ethereum Block-Hash Public Lottery',
      description: 'Open-source, provably fair public lottery powered by Ethereum block hashes and SHA-256. Independently verifiable in Python or on Etherscan — impossible to rig.',
    },
    ja: {
      htmlLang: 'ja',
      locale: 'ja_JP',
      title: 'OpenLuck — イーサリアム公開抽選｜ブロックハッシュ検証可能ツール',
      description: 'イーサリアムのブロックハッシュと公開 SHA-256 アルゴリズムを使った透明・検証可能な公開抽選ツール。Python で誰でも独立検証でき、不正は不可能です。',
    },
  },
  history: {
    zh: {
      htmlLang: 'zh-CN',
      locale: 'zh_CN',
      title: 'OpenLuck — 公开历史抽奖记录与区块哈希验算',
      description: '查看 OpenLuck 所有公开以太坊区块哈希抽奖历史记录，支持按标题、区块号或哈希检索，并一键复制 Python 代码独立验算。',
    },
    en: {
      htmlLang: 'en',
      locale: 'en_US',
      title: 'OpenLuck — Public Ethereum Lottery History & Verification',
      description: 'Browse all public OpenLuck Ethereum block-hash lottery draws, search by title, block height, or hash, and verify every winning number independently in Python.',
    },
    ja: {
      htmlLang: 'ja',
      locale: 'ja_JP',
      title: 'OpenLuck — 公開抽選履歴とブロックハッシュ検証',
      description: 'OpenLuck のイーサリアム公開抽選履歴一覧。タイトル・ブロック番号・ハッシュで検索し、Python コードで当選番号を独立検証できます。',
    },
  },
};

function buildJsonLd(pageKey, meta, canonicalUrl) {
  if (pageKey === 'history') {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: meta.title,
      description: meta.description,
      url: canonicalUrl,
      inLanguage: ['zh-CN', 'en', 'ja'],
      isPartOf: {
        '@type': 'WebApplication',
        name: 'OpenLuck',
        url: `${CANONICAL_ORIGIN}/`,
      },
      author: { '@type': 'Organization', name: 'VTx.SPACE', url: 'https://vtx.space/' },
    };
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'OpenLuck',
    alternateName: ['OpenLuck Blockchain Lottery', '以太坊区块哈希抽奖工具'],
    url: canonicalUrl,
    description: meta.description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    inLanguage: ['zh-CN', 'en', 'ja'],
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    keywords: 'Ethereum block hash lottery, provably fair giveaway, blockchain RNG, 区块链抽奖, 以太坊抽奖, 公开抽奖工具, イーサリアム抽選',
    sameAs: ['https://github.com/Xyinkl/OpenLuck'],
    author: { '@type': 'Organization', name: 'VTx.SPACE', url: 'https://vtx.space/' },
  };
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Never redirect or rewrite API endpoints
  if (path.startsWith('/api/')) {
    return next();
  }

  // 1. 301 redirect short domain ol.vtx.space -> openluck.vtx.space
  if ((request.method === 'GET' || request.method === 'HEAD') && url.hostname === 'ol.vtx.space') {
    const destPath = path === '/index.html' ? '/' : path === '/history.html' ? '/history' : path;
    return new Response(null, {
      status: 301,
      headers: {
        Location: `${CANONICAL_ORIGIN}${destPath}${url.search}`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  // 2. Canonicalize .html paths on openluck.vtx.space
  if ((request.method === 'GET' || request.method === 'HEAD') && url.hostname === 'openluck.vtx.space') {
    if (path === '/index.html') {
      return new Response(null, {
        status: 301,
        headers: { Location: `${CANONICAL_ORIGIN}/${url.search}`, 'Cache-Control': 'public, max-age=3600' },
      });
    }
    if (path === '/history.html') {
      return new Response(null, {
        status: 301,
        headers: { Location: `${CANONICAL_ORIGIN}/history${url.search}`, 'Cache-Control': 'public, max-age=3600' },
      });
    }
  }

  const response = await next();

  // 3. Prevent indexing of *.pages.dev preview/default hosts
  if (url.hostname.endsWith('.pages.dev')) {
    const headers = new Headers(response.headers);
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }

  // 4. Deterministic server-side SEO localization for HTML pages (/ and /history)
  const ct = (response.headers.get('content-type') || '').toLowerCase();
  if (!response.ok || !ct.includes('text/html') || (path !== '/' && path !== '/history')) {
    return response;
  }

  const pageKey = path === '/history' ? 'history' : 'index';
  const basePath = pageKey === 'history' ? '/history' : '/';
  const rawLang = url.searchParams.get('lang');
  const explicitLang = rawLang === 'zh' || rawLang === 'en' || rawLang === 'ja' ? rawLang : null;
  const lang = explicitLang || 'zh';
  const meta = PAGE_META[pageKey][lang];
  const canonicalUrl = explicitLang ? `${CANONICAL_ORIGIN}${basePath}?lang=${explicitLang}` : `${CANONICAL_ORIGIN}${basePath}`;
  const altLocales = ['zh_CN', 'en_US', 'ja_JP'].filter((l) => l !== meta.locale);
  const altLocaleTags = altLocales.map((l) => `<meta property="og:locale:alternate" content="${l}">`).join('');
  const jsonLd = JSON.stringify(buildJsonLd(pageKey, meta, canonicalUrl)).replace(/</g, '\\u003c');

  const rewriter = new HTMLRewriter()
    .on('html', { element(el) { el.setAttribute('lang', meta.htmlLang); } })
    .on('title', { element(el) { el.setInnerContent(meta.title); } })
    .on('meta[name="description"]', { element(el) { el.setAttribute('content', meta.description); } })
    .on('link[rel="canonical"]', { element(el) { el.setAttribute('href', canonicalUrl); } })
    .on('meta[property="og:title"]', { element(el) { el.setAttribute('content', meta.title); } })
    .on('meta[property="og:description"]', { element(el) { el.setAttribute('content', meta.description); } })
    .on('meta[property="og:url"]', { element(el) { el.setAttribute('content', canonicalUrl); } })
    .on('meta[property="og:locale"]', { element(el) { el.setAttribute('content', meta.locale); } })
    .on('meta[property="og:locale:alternate"]', { element(el) { el.remove(); } })
    .on('meta[name="twitter:title"]', { element(el) { el.setAttribute('content', meta.title); } })
    .on('meta[name="twitter:description"]', { element(el) { el.setAttribute('content', meta.description); } })
    .on('head', {
      element(el) {
        el.append(`${altLocaleTags}<script type="application/ld+json">${jsonLd}</script>`, { html: true });
      },
    });

  const headers = new Headers(response.headers);
  headers.set('Content-Language', meta.htmlLang);
  headers.delete('etag');
  headers.delete('content-length');
  return rewriter.transform(new Response(response.body, { status: response.status, headers }));
}
