/**
 * OpenLuck — Shared i18n module (zh / en / ja)
 * Loaded by index.html and history.html
 *
 * Language resolution: manual (localStorage) > browser lang > timezone > CF country > en
 * Manual selection always wins. Unsupported browser langs fallback to en.
 * No IP collection or storage.
 */
(function () {
  'use strict';

  const SUPPORTED = ['zh', 'en', 'ja'];
  const STORAGE_KEY = 'openluck_lang';

  /* ═══════════════════════════════════════════════════
     DICTIONARY
  ═══════════════════════════════════════════════════ */
  const DICT = {

    /* ── Common / Header ─────────────────────────── */
    siteName:              { zh:'OpenLuck',              en:'OpenLuck',              ja:'OpenLuck' },
    siteDesc:              { zh:'基于以太坊区块哈希 · 公开透明抽奖 · 完全可独立验证', en:'Ethereum block-hash lottery — transparent, verifiable, trustless', ja:'イーサリアムブロックハッシュ抽選 — 透明・検証可能・信頼不要' },
    navHistory:            { zh:'📋 历史记录',           en:'📋 History',            ja:'📋 履歴' },
    navGitHub:             { zh:'⭐ GitHub',             en:'⭐ GitHub',             ja:'⭐ GitHub' },
    navNewLottery:         { zh:'🎲 发起抽奖',           en:'🎲 New Lottery',        ja:'🎲 抽選する' },

    /* ── Footer ──────────────────────────────────── */
    footerTagline:         { zh:'OpenLuck · 以太坊区块哈希随机数 · 完全开源可验证', en:'OpenLuck · Ethereum block-hash RNG · fully open-source & verifiable', ja:'OpenLuck · イーサリアムブロックハッシュRNG · 完全オープンソース & 検証可能' },
    footerCredits:         { zh:'Vibed by @Xyinkl in 2 hours · 感谢 ffmpeg.bmmmd.com 的 UI，很喜欢所以借鉴了一下', en:'Vibed by @Xyinkl in 2 hours · Thanks to ffmpeg.bmmmd.com for the UI inspiration', ja:'Vibed by @Xyinkl in 2 hours · ffmpeg.bmmmd.com のUIに感謝' },
    footerHistory:         { zh:'历史记录',              en:'History',               ja:'履歴' },

    /* ── Language Selector ───────────────────────── */
    langLabel:             { zh:'语言',                  en:'Language',              ja:'言語' },

    /* ── Connection Status ───────────────────────── */
    connBlock:             { zh:'当前区块：',            en:'Current block: ',       ja:'現在のブロック: ' },
    connConnecting:        { zh:'连接中…',               en:'Connecting…',           ja:'接続中…' },
    connFailed:            { zh:'连接失败，重试中…',      en:'Connection failed, retrying…', ja:'接続失敗、再試行中…' },
    connViewBlock:         { zh:'🔍 查看当前区块',        en:'🔍 View block',         ja:'🔍 ブロックを見る' },

    /* ── Config Box ──────────────────────────────── */
    cfgTitle:              { zh:'1/7 · 配置抽奖',        en:'1/7 · Configure',      ja:'1/7 · 抽選設定' },
    cfgTargetLabel:        { zh:'目标区块号（须大于当前区块）', en:'Target block (must be higher than current)', ja:'目標ブロック番号（現在より大きい必要があります）' },
    cfgTargetPlaceholder:  { zh:'例：21000000',          en:'e.g. 21000000',        ja:'例：21000000' },
    cfgTotalLabel:         { zh:'总参与人数',            en:'Total participants',    ja:'総参加人数' },
    cfgTotalPlaceholder:   { zh:'例：100',               en:'e.g. 100',             ja:'例：100' },
    cfgWinLabel:           { zh:'中奖人数',              en:'Winners',               ja:'当選人数' },
    cfgWinPlaceholder:     { zh:'例：3',                 en:'e.g. 3',               ja:'例：3' },
    cfgTitleLabel:         { zh:'抽奖标题（可选）',       en:'Lottery title (optional)', ja:'抽選タイトル（任意）' },
    cfgTitlePlaceholder:   { zh:'例：2025 年会抽奖',      en:'e.g. 2025 Annual Draw', ja:'例：2025 年次抽選会' },
    cfgStartBtn:           { zh:'🎲 开始抽奖',            en:'🎲 Start Lottery',      ja:'🎲 抽選開始' },
    cfgResetBtn:           { zh:'重置',                  en:'Reset',                 ja:'リセット' },

    /* ── Quick Block Buttons ─────────────────────── */
    quickBlock:            { zh:'+{n}',                  en:'+{n}',                  ja:'+{n}' },

    /* ── ETA ─────────────────────────────────────── */
    etaPassed:             { zh:'⚠ 该区块已过去',         en:'⚠ Block already passed', ja:'⚠ ブロック通過済み' },
    etaIn:                 { zh:'约 {d} 后到达',          en:'~{d} until arrival',    ja:'約 {d} 後に到着' },
    etaHours:              { zh:'{h}时{m}分',            en:'{h}h {m}m',            ja:'{h}時間{m}分' },
    etaMins:               { zh:'{m}分{s}秒',            en:'{m}m {s}s',            ja:'{m}分{s}秒' },
    etaSecs:               { zh:'{s}秒',                 en:'{s}s',                  ja:'{s}秒' },

    /* ── Countdown Box ───────────────────────────── */
    cdTitle:               { zh:'等待区块',              en:'Awaiting Block',        ja:'ブロック待機中' },
    cdSummary:             { zh:'共 {total} 人抽 {count} 人', en:'{total} participants, {count} winners', ja:'{total}人から{count}人抽選' },
    cdEstimate:            { zh:'开奖大约还要——',         en:'Drawing in approximately —', ja:'抽選まで約 —' },
    cdTargetBlock:         { zh:'目标区块',              en:'Target Block',          ja:'目標ブロック' },
    cdBlocksLeft:          { zh:'剩余约 {n} 个区块',      en:'~{n} blocks remaining', ja:'残り約 {n} ブロック' },
    cdArrived:             { zh:'已到达！',               en:'Arrived!',              ja:'到着！' },
    cdCancelBtn:           { zh:'✕ 取消本轮抽奖',         en:'✕ Cancel Draw',         ja:'✕ 抽選キャンセル' },
    cdShareBtn:            { zh:'🔗 分享开奖页面',         en:'🔗 Share Draw Page',    ja:'🔗 抽選ページを共有' },
    cdCancelHint:          { zh:'取消后可重新发起抽奖。',  en:'You can start a new draw after cancelling.', ja:'キャンセル後、新しい抽選を開始できます。' },
    cdShareHint:           { zh:'抽奖等待期间可以分享链接，所有人实时同步等待开奖，结果完全一致。', en:'Share the link while waiting — everyone syncs in real time with identical results.', ja:'待機中にリンクを共有すると、全員がリアルタイムで同期し、結果は完全に同一です。' },

    /* ── Results Box ─────────────────────────────── */
    rsTitle:               { zh:'抽奖结果',              en:'Results',               ja:'抽選結果' },
    rsBlock:               { zh:'区块',                  en:'Block',                 ja:'ブロック' },
    rsTotal:               { zh:'总人数',                en:'Total',                 ja:'総人数' },
    rsWinnersLabel:        { zh:'中奖 {n} 人',           en:'{n} winner(s)',         ja:'当選 {n} 人' },
    rsHashLabel:           { zh:'区块哈希：',             en:'Block Hash:',           ja:'ブロックハッシュ:' },
    rsWinnersTitle:        { zh:'🏆 中奖号码',            en:'🏆 Winning Numbers',    ja:'🏆 当選番号' },
    rsCopyBtn:             { zh:'📋 复制结果',            en:'📋 Copy Result',        ja:'📋 結果をコピー' },
    rsAgainBtn:            { zh:'再抽一次',              en:'Draw Again',            ja:'もう一度抽選' },

    /* ── Console / Log ───────────────────────────── */
    logTitle:              { zh:'2/7 · Console',         en:'2/7 · Console',         ja:'2/7 · コンソール' },
    logHint:               { zh:'// 操作日志',            en:'// Activity log',       ja:'// 操作ログ' },

    /* ── Why Sidebar ─────────────────────────────── */
    whyTitle:              { zh:'3/7 · 为什么这个抽奖绝对公平', en:'3/7 · Why This Lottery Is Fair', ja:'3/7 · この抽選が公平な理由' },
    whyIntro:              { zh:'本站将抽奖的随机性交给了区块链共识网络——以太坊，任何人都无法干预最终结果，可回溯，可验算，绝无作弊可能。', en:'This site delegates randomness to the Ethereum consensus network. No one can influence the final outcome — traceable, verifiable, and impossible to cheat.', ja:'このサイトはランダム性をイーサリアムのコンセンサスネットワークに委ねています。誰も最終結果に介入できず、追跡可能・検証可能で、不正は不可能です。' },
    whyUnpredictableTitle: { zh:'无法预测',              en:'Unpredictable',         ja:'予測不可能' },
    whyUnpredictableText:  { zh:'以太坊每 ~12 秒产生一个新区块，哈希值在诞生前完全未知，由全球超百万个独立验证者共同决定', en:'Ethereum produces a block every ~12 seconds — the hash is completely unknown until creation, determined by over a million independent validators worldwide', ja:'イーサリアムは約12秒ごとに新しいブロックを生成し、ハッシュ値は生成されるまで完全に未知で、世界中の100万人以上の独立したバリデーターによって決定されます' },
    whyImmutableTitle:     { zh:'不可篡改',              en:'Immutable',             ja:'改ざん不可' },
    whyImmutableText:      { zh:'哈希值一旦确认上链便永久固化，任何人均可通过 Etherscan 等权威第三方浏览器公开查验', en:'Once confirmed on-chain, the hash is permanently immutable — anyone can publicly verify it via Etherscan or other trusted explorers', ja:'オンチェーンで確認されると、ハッシュは永久に不変です — Etherscanなどの信頼できるエクスプローラーで誰でも公開検証できます' },
    whyTrustlessTitle:     { zh:'无需信任',              en:'Trustless',             ja:'信頼不要' },
    whyTrustlessText:      { zh:'采用全公开抽奖算法，复制代码即可在本地 100% 独立还原并验证中奖结果', en:'Uses a fully open lottery algorithm — copy the code and independently reproduce & verify results 100% locally', ja:'完全公開の抽選アルゴリズムを使用 — コードをコピーしてローカルで100%独立して結果を再現・検証できます' },

    /* ── Guide Steps ─────────────────────────────── */
    guideTitle:            { zh:'4/7 · 操作指南：如何使用？', en:'4/7 · Guide: How to Use', ja:'4/7 · ガイド：使用方法' },
    guideStep1Label:       { zh:'锁定名单',              en:'Lock the list',         ja:'リストを確定' },
    guideStep1Text:        { zh:'确定总参与人数 N，为每位参与者分配唯一编号（1…N），并全员公示', en:'Decide total participants N, assign each a unique number (1…N), and publish the full list', ja:'総参加人数Nを決定し、各参加者に一意の番号（1…N）を割り当て、全リストを公開します' },
    guideStep2Label:       { zh:'选定、等待',            en:'Select & Wait',         ja:'選択と待機' },
    guideStep2Text:        { zh:'公告一个未来的以太坊区块高度，作为本次抽奖的唯一合法信源，等待该区块被以太坊网络打包确认', en:'Announce a future Ethereum block height as the sole legitimate randomness source, then wait for it to be confirmed by the network', ja:'将来のイーサリアムブロック高を唯一の正当なランダムソースとして発表し、ネットワークに確認されるのを待ちます' },
    guideStep3Label:       { zh:'获取哈希',              en:'Fetch Hash',            ja:'ハッシュを取得' },
    guideStep3Text:        { zh:'在 Etherscan 上查询该区块，获取其 64 位十六进制的 Block Hash', en:'Look up the block on Etherscan and copy its 64-character hex Block Hash', ja:'Etherscanでブロックを検索し、64文字の16進数ブロックハッシュをコピーします' },
    guideStep4Label:       { zh:'算法开奖',              en:'Run the Draw',          ja:'抽選実行' },
    guideStep4Text:        { zh:'将哈希值输入公开的开奖程序，得出不可争议的中奖号码', en:'Feed the hash into the public drawing program to produce indisputable winning numbers', ja:'ハッシュを公開抽選プログラムに入力し、議論の余地のない当選番号を生成します' },

    /* ── Algorithm Section ───────────────────────── */
    algoTitle:             { zh:'5/7 · 算法解析',        en:'5/7 · Algorithm',       ja:'5/7 · アルゴリズム' },
    algoStep1Text:         { zh:'拼接 区块哈希 与 当前轮次（从 0000 开始递增的十六进制数）', en:'Concatenate Block Hash with current round (hex, starting from 0000)', ja:'ブロックハッシュと現在のラウンド（0000から始まる16進数）を連結' },
    algoStep2Text:         { zh:'对种子进行一次 SHA-256 加密，得到全新的 64 位字符', en:'Hash the seed with SHA-256, producing a fresh 64-character hex string', ja:'シードをSHA-256でハッシュし、新しい64文字の16進文字列を生成' },
    algoStep3Text:         { zh:'截取前 16 位转为十进制，对总人数 N 取模并加 1，得出当前轮次中奖号码', en:'Take the first 16 hex chars, convert to decimal, modulo N, add 1 to get the winning number', ja:'最初の16文字を10進数に変換し、Nで割った余りに1を加えて当選番号を取得' },
    algoStep4Text:         { zh:'若号码已中奖则跳过，Round + 1 继续迭代，直至抽满全部名额', en:'If the number is already selected, skip it — increment Round by 1 and iterate until all winners are drawn', ja:'既に当選済みの番号はスキップし、Roundを+1して全当選者が決まるまで繰り返します' },
    algoStep1Title:        { zh:'构建种子',              en:'Build Seed',            ja:'シード構築' },
    algoStep2Title:        { zh:'哈希加密',              en:'Hash',                  ja:'ハッシュ暗号化' },
    algoStep3Title:        { zh:'计算号码',              en:'Compute Number',        ja:'番号計算' },
    algoStep4Title:        { zh:'去重机制',              en:'Deduplication',         ja:'重複排除' },

    /* ── Block Explorer Section ──────────────────── */
    explorerTitle:         { zh:'6/7 · 区块链浏览器',     en:'6/7 · Block Explorer',  ja:'6/7 · ブロックエクスプローラー' },
    explorerIntro:         { zh:'🔍 直观查看最新区块',      en:'🔍 View latest blocks', ja:'🔍 最新ブロックを表示' },
    explorerEtherscanName: { zh:'▸ Etherscan 最新区块',    en:'▸ Etherscan Latest Blocks', ja:'▸ Etherscan 最新ブロック' },
    explorerOklinkName:    { zh:'▸ OKLink ETH 最新区块',   en:'▸ OKLink ETH Latest Blocks', ja:'▸ OKLink ETH 最新ブロック' },

    /* ── Verification Section ────────────────────── */
    verifyTitle:           { zh:'7/7 · 抽奖代码，欢迎独立验证', en:'7/7 · Verification Code — Verify Independently', ja:'7/7 · 検証コード — 独立検証可能' },
    verifyIntro:           { zh:'相同的哈希输入，永远得出完全一致的结果。复制以下代码到任意 Python 环境独立验证：', en:'The same hash input always yields identical results. Copy the code below to any Python environment for independent verification:', ja:'同じハッシュ入力は常に同一の結果を生成します。以下のコードを任意のPython環境にコピーして独立検証してください：' },
    verifyCopyBtn:         { zh:'📋 复制',                en:'📋 Copy',               ja:'📋 コピー' },
    verifyCopied:          { zh:'✓ 已复制',               en:'✓ Copied',              ja:'✓ コピー済み' },

    /* ── Python Code Block ───────────────────────── */
    pyHashFormat: {zh:'64 位十六进制字符，可带 0x 前缀',en:'64 hexadecimal characters, with optional 0x prefix',ja:'64桁の16進数、0xプレフィックスは任意'},
    pyComment1:            { zh:'# ── 验证中奖结果 ──',    en:'# ── Verify Results ──', ja:'# ── 結果検証 ──' },
    pyComment2:            { zh:'# 在 Etherscan 搜索区块', en:'# Search block on Etherscan', ja:'# Etherscanでブロックを検索' },
    pyComment3:            { zh:'# 复制页面上的 Block Hash，粘贴到下方变量中。', en:'# Copy the Block Hash from the page and paste into the variable below.', ja:'# ページからブロックハッシュをコピーし、下の変数に貼り付けてください。' },
    pyVarHashComment:      { zh:'在此粘贴区块哈希值',      en:'paste block hash here', ja:'ブロックハッシュをここに貼り付け' },
    pyVarTtlComment:       { zh:'抽奖总参与人数',          en:'total participants',    ja:'総参加人数' },
    pyVarCntComment:       { zh:'需要抽取的中奖人数',       en:'number of winners to draw', ja:'抽選する当選人数' },
    pyLinePreprocess:      { zh:'# 预处理：去除前后空格，转小写，并剔除可能包含的 0x 前缀', en:'# Preprocess: trim, lowercase, and strip optional 0x prefix', ja:'# 前処理：トリム、小文字化、オプションの0xプレフィックスを除去' },
    pyLineCoreLoop:        { zh:'# 核心计算循环',          en:'# Core computation loop', ja:'# コア計算ループ' },
    pyLineConcat:          { zh:'# 拼接哈希与轮次（补齐4位十六进制，例如 0000, 0001）', en:'# Concatenate hash with round (zero-padded 4-digit hex, e.g. 0000, 0001)', ja:'# ハッシュとラウンドを連結（4桁の16進数でゼロ埋め、例: 0000, 0001）' },
    pyLineSha:             { zh:'# 计算 SHA-256 哈希',     en:'# Compute SHA-256 hash', ja:'# SHA-256ハッシュを計算' },
    pyLineMod:             { zh:'# 取前16位转为整数，取模得出 1~TOTAL 之间的编号', en:'# Take first 16 hex chars as integer, modulo to get 1~TOTAL', ja:'# 最初の16文字を整数に変換し、剰余で1~TOTALの番号を取得' },
    pyLineDedup:           { zh:'# 去重判定',              en:'# Dedup check',         ja:'# 重複チェック' },
    pyLinePrintSep:        { zh:'print("=" * 30)',        en:'print("=" * 30)',        ja:'print("=" * 30)' },
    pyLineParamHash:       { zh:'print(f"入参区块哈希: {block_hash}")', en:'print(f"Input block hash: {block_hash}")', ja:'print(f"入力ブロックハッシュ: {block_hash}")' },
    pyLineWinners:         { zh:'print(f"最终中奖号码: {sorted(winners)}")', en:'print(f"Final winning numbers: {sorted(winners)}")', ja:'print(f"最終当選番号: {sorted(winners)}")' },

    /* ── Screen Nav Arrows ───────────────────────── */
    navArrowPrinciple:     { zh:'原理',                  en:'How it works',          ja:'仕組み' },
    navArrowBack:          { zh:'返回',                  en:'Back',                  ja:'戻る' },

    /* ── Dynamic Log Messages ────────────────────── */
    logStartup:            { zh:'🎲 OpenLuck 启动，连接以太坊…', en:'🎲 OpenLuck starting, connecting to Ethereum…', ja:'🎲 OpenLuck起動中、イーサリアムに接続…' },
    logConnected:          { zh:'✅ 已连接，当前 #{n}',     en:'✅ Connected, current #{n}', ja:'✅ 接続完了、現在 #{n}' },
    logConnFail:           { zh:'⚠ 连接失败，15 秒后重试', en:'⚠ Connection failed, retrying in 15s', ja:'⚠ 接続失敗、15秒後に再試行' },
    logBlockNotLoaded:     { zh:'❌ 区块未加载',           en:'❌ Block not loaded',   ja:'❌ ブロック未読込' },
    logTargetTooLow:       { zh:'❌ 目标区块须大于 #{n}',   en:'❌ Target block must be > #{n}', ja:'❌ 目標ブロックは #{n} より大きい必要があります' },
    logTotalRange:         { zh:'❌ 总人数须在 2~1000 之间', en:'❌ Total must be 2–1000', ja:'❌ 総人数は2〜1000の間である必要があります' },
    logCountRange:         { zh:'❌ 中奖人数须在 1~{max}', en:'❌ Winners must be 1–{max}', ja:'❌ 当選人数は1〜{max}の間である必要があります' },
    logWinRatio:           { zh:'❌ 中奖比例不能超过 80%',  en:'❌ Win ratio cannot exceed 80%', ja:'❌ 当選率は80%を超えてはいけません' },
    logLotteryCreated:     { zh:'🎲 「{title}」已创建，目标 #{target}，{total} 人抽 {count} 人', en:'🎲 "{title}" created, target #{target}, {total} participants, {count} winners', ja:'🎲 「{title}」作成完了、目標 #{target}、{total}人から{count}人抽選' },
    logWaitingBlock:       { zh:'⏳ 等待区块 #{n}…',        en:'⏳ Awaiting block #{n}…', ja:'⏳ ブロック #{n} を待機中…' },
    logBlocksLeft:         { zh:'⏳ #{n}，还剩 {left} 块',  en:'⏳ #{n}, {left} blocks left', ja:'⏳ #{n}、残り {left} ブロック' },
    logBlockConfirmed:     { zh:'✅ 区块 #{n} 已确认！',     en:'✅ Block #{n} confirmed!', ja:'✅ ブロック #{n} 確認！' },
    logHash:               { zh:'🔑 哈希：0x{h}…',         en:'🔑 Hash: 0x{h}…',       ja:'🔑 ハッシュ: 0x{h}…' },
    logWinners:            { zh:'🏆 中奖：{w}',            en:'🏆 Winners: {w}',        ja:'🏆 当選: {w}' },
    logFinished:           { zh:'🎉 完成！中奖：{w}',       en:'🎉 Done! Winners: {w}',  ja:'🎉 完了！当選: {w}' },
    logSaved:              { zh:'💾 已保存到服务器',        en:'💾 Saved to server',     ja:'💾 サーバーに保存' },
    logSavedLocal:         { zh:'💾 已保存到本地',          en:'💾 Saved locally',       ja:'💾 ローカルに保存' },
    logCopied:             { zh:'📋 已复制到剪贴板',         en:'📋 Copied to clipboard', ja:'📋 クリップボードにコピー' },
    logReset:              { zh:'🔄 已重置',               en:'🔄 Reset',               ja:'🔄 リセット' },
    logCancelled:          { zh:'🚫 已取消本轮抽奖',         en:'🚫 Draw cancelled',      ja:'🚫 抽選キャンセル' },
    logRestore:            { zh:'🔄 恢复进程「{title}」，目标 #{target}', en:'🔄 Resuming "{title}", target #{target}', ja:'🔄 「{title}」を再開、目標 #{target}' },
    logShareLink:          { zh:'🔗 通过分享链接加入「{title}」，目标 #{target}', en:'🔗 Joined shared draw "{title}", target #{target}', ja:'🔗 共有抽選「{title}」に参加、目標 #{target}' },
    logRpcError:           { zh:'⚠ {msg}',                en:'⚠ {msg}',               ja:'⚠ {msg}' },
    logDrawError:          { zh:'❌ {msg}',                en:'❌ {msg}',               ja:'❌ {msg}' },
    logBlockDataEmpty:     { zh:'区块数据为空',            en:'Block data empty',      ja:'ブロックデータが空です' },
    logAllRpcFailed:       { zh:'所有 RPC 节点均无法连接',  en:'All RPC nodes unreachable', ja:'すべてのRPCノードに接続できません' },
    logShareCopied:        { zh:'✅ 已复制链接',            en:'✅ Link copied',         ja:'✅ リンクをコピー' },

    /* ── Copy Result Text ────────────────────────── */
    copyResultHeader:      { zh:'【OpenLuck 抽奖结果】',    en:'[OpenLuck Draw Result]', ja:'【OpenLuck 抽選結果】' },
    copyResultTitle:       { zh:'标题：{t}',               en:'Title: {t}',            ja:'タイトル: {t}' },
    copyResultBlock:       { zh:'区块：#{b}',              en:'Block: #{b}',           ja:'ブロック: #{b}' },
    copyResultHash:        { zh:'哈希：{h}',               en:'Hash: {h}',             ja:'ハッシュ: {h}' },
    copyResultTotal:       { zh:'总人数：{t}  中奖 {c} 人', en:'Total: {t}  Winners: {c}', ja:'総人数: {t}  当選: {c}人' },
    copyResultNumbers:     { zh:'中奖号码：{w}',            en:'Winning numbers: {w}',  ja:'当選番号: {w}' },
    copyResultTime:        { zh:'时间：{t}',               en:'Time: {t}',             ja:'時間: {t}' },
    copyResultVerify:      { zh:'验证：https://github.com/Xyinkl/OpenLuck', en:'Verify: https://github.com/Xyinkl/OpenLuck', ja:'検証: https://github.com/Xyinkl/OpenLuck' },

    /* ── Untitled Lottery ────────────────────────── */
    untitledLottery:       { zh:'未命名抽奖',              en:'Untitled Draw',         ja:'無題の抽選' },
    anonymousLottery:      { zh:'匿名抽奖',                en:'Anonymous Draw',        ja:'匿名抽選' },

    /* ── history.html ────────────────────────────── */
    histPageTitle:         { zh:'OpenLuck — 历史记录',     en:'OpenLuck — History',    ja:'OpenLuck — 履歴' },
    histDesc:              { zh:'历史抽奖记录 — 完全公开可验证', en:'Lottery history — fully public & verifiable', ja:'抽選履歴 — 完全公開・検証可能' },
    histTabServer:         { zh:'🌐 服务器记录',           en:'🌐 Server Records',     ja:'🌐 サーバー記録' },
    histTabLocal:          { zh:'💾 本地记录',             en:'💾 Local Records',      ja:'💾 ローカル記録' },
    histStatsTitle:        { zh:'抽奖统计',                en:'Statistics',            ja:'抽選統計' },
    histStatTotal:         { zh:'总抽奖次数',              en:'Total Draws',           ja:'総抽選回数' },
    histStatParticipants:  { zh:'参与总人次',              en:'Total Participants',    ja:'延べ参加人数' },
    histStatLatest:        { zh:'最近一次',                en:'Latest',                ja:'最新' },
    histSearchPlaceholder: { zh:'搜索标题 / 区块号 / 哈希…', en:'Search title / block / hash…', ja:'タイトル / ブロック / ハッシュ検索…' },
    histClearBtn:          { zh:'清空',                   en:'Clear',                 ja:'クリア' },
    histRefreshBtn:        { zh:'刷新',                   en:'Refresh',               ja:'更新' },
    histExportBtn:         { zh:'导出',                   en:'Export',                ja:'エクスポート' },
    histLoading:           { zh:'加载中…',                 en:'Loading…',              ja:'読み込み中…' },
    histEmptyNone:         { zh:'还没有任何抽奖记录。去发起第一次抽奖吧！', en:'No lottery records yet. Start your first draw!', ja:'抽選記録はまだありません。最初の抽選を始めましょう！' },
    histEmptyNoMatch:      { zh:'没有匹配的记录。',         en:'No matching records.',  ja:'一致する記録がありません。' },
    histEmptyGoDraw:       { zh:'→ 发起抽奖',              en:'→ Start a draw',        ja:'→ 抽選を始める' },
    histServerDown1:       { zh:'服务器暂时无法连接。',      en:'Server temporarily unavailable.', ja:'サーバーに一時的に接続できません。' },
    histServerDown2:       { zh:'已切换到本地记录（共 {n} 条）。', en:'Switched to local records ({n} total).', ja:'ローカル記録に切り替えました（全 {n} 件）。' },
    histCardDone:          { zh:'已完成',                  en:'Completed',             ja:'完了' },
    histCardBlock:         { zh:'区块号',                  en:'Block',                 ja:'ブロック番号' },
    histCardTotal:         { zh:'总人数',                  en:'Total',                 ja:'総人数' },
    histCardWinners:       { zh:'中奖人数',                en:'Winners',               ja:'当選人数' },
    histCardVerifyBlock:   { zh:'🔍 验证区块 Hash',         en:'🔍 Verify Block Hash',  ja:'🔍 ブロックハッシュ検証' },
    histCardCopyResult:    { zh:'📋 复制结果',             en:'📋 Copy Result',        ja:'📋 結果をコピー' },
    histCardVerifyAlgo:    { zh:'⚙ 验证算法',             en:'⚙ Verify Algorithm',   ja:'⚙ アルゴリズム検証' },
    histPagePrev:          { zh:'◀ 上一页',               en:'◀ Prev',                ja:'◀ 前へ' },
    histPageNext:          { zh:'下一页 ▶',               en:'Next ▶',                ja:'次へ ▶' },
    histFooterTagline:     { zh:'OpenLuck · 历史抽奖记录',  en:'OpenLuck · Lottery History', ja:'OpenLuck · 抽選履歴' },
    histNavNewDraw:        { zh:'发起抽奖',                en:'New Draw',              ja:'抽選する' },
    histCopyHeader:        { zh:'【OpenLuck 抽奖结果】',    en:'[OpenLuck Draw Result]', ja:'【OpenLuck 抽選結果】' },
    histCopyTitle:         { zh:'标题：{t}',               en:'Title: {t}',            ja:'タイトル: {t}' },
    histCopyBlock:         { zh:'区块：#{b}',              en:'Block: #{b}',           ja:'ブロック: #{b}' },
    histCopyHash:          { zh:'哈希：{h}',               en:'Hash: {h}',             ja:'ハッシュ: {h}' },
    histCopyTotal:         { zh:'总人数：{t}  中奖 {c} 人', en:'Total: {t}  Winners: {c}', ja:'総人数: {t}  当選: {c}人' },
    histCopyNumbers:       { zh:'中奖号码：{w}',            en:'Winning numbers: {w}',  ja:'当選番号: {w}' },
    histCopyTime:          { zh:'时间：{t}',               en:'Time: {t}',             ja:'時間: {t}' },
    histCopyEtherscan:     { zh:'Etherscan：https://etherscan.io/block/{b}', en:'Etherscan: https://etherscan.io/block/{b}', ja:'Etherscan: https://etherscan.io/block/{b}' },
    histCopyVerify:        { zh:'验证代码：https://github.com/Xyinkl/OpenLuck', en:'Verification code: https://github.com/Xyinkl/OpenLuck', ja:'検証コード: https://github.com/Xyinkl/OpenLuck' },
    histCopyAlert:         { zh:'已复制到剪贴板',           en:'Copied to clipboard',   ja:'クリップボードにコピーしました' },
    histVerifierTitle:     { zh:'# OpenLuck 验证代码',      en:'# OpenLuck verification code', ja:'# OpenLuck 検証コード' },
    histVerifierWinners:   { zh:'print("中奖号码:", sorted(winners))', en:'print("Winning numbers:", sorted(winners))', ja:'print("当選番号:", sorted(winners))' },
    histVerifierExpected:  { zh:'print("预期结果:", {w})',  en:'print("Expected:", {w})', ja:'print("期待値:", {w})' },
    histVerifierPass:      { zh:'print("验证通过:", sorted(winners) == sorted({w}))', en:'print("Pass:", sorted(winners) == sorted({w}))', ja:'print("検証成功:", sorted(winners) == sorted({w}))' },
    histVerifierAlert:     { zh:'验证代码已复制到剪贴板！请粘贴到在线 Python 平台运行。即将打开 OnlinePython…', en:'Verification code copied! Paste into an online Python platform. Opening OnlinePython…', ja:'検証コードをコピーしました！オンラインPythonプラットフォームに貼り付けてください。OnlinePythonを開きます…' },
    histExportPrefix:      { zh:'openluck_history_',       en:'openluck_history_',     ja:'openluck_history_' },
    histExpandAll:         { zh:'▼ 展开全部',              en:'▼ Show all',            ja:'▼ すべて表示' },
    histCollapse:          { zh:'▲ 收起',                  en:'▲ Collapse',            ja:'▲ 折りたたむ' },

    /* ── Document Meta ───────────────────────────── */
    pageTitleIndex:        { zh:'OpenLuck — 区块链公开抽奖', en:'OpenLuck — Blockchain Public Lottery', ja:'OpenLuck — ブロックチェーン公開抽選' },
    pageTitleHistory:      { zh:'OpenLuck — 历史记录',     en:'OpenLuck — History',    ja:'OpenLuck — 履歴' },
    metaDescIndex:         { zh:'基于以太坊区块哈希的公开透明抽奖系统，完全可独立验证，绝无作弊可能。', en:'A transparent Ethereum block-hash lottery system — fully independently verifiable, impossible to cheat.', ja:'イーサリアムブロックハッシュを使用した透明な抽選システム — 完全に独立検証可能で、不正は不可能です。' },
    metaDescHistory:       { zh:'OpenLuck 历史抽奖记录 — 完全公开可验证。', en:'OpenLuck lottery history — fully public and verifiable.', ja:'OpenLuck 抽選履歴 — 完全公開・検証可能。' },
  };

  /* ═══════════════════════════════════════════════════
     CORE FUNCTIONS
  ═══════════════════════════════════════════════════ */

  /**
   * Translate a key with optional template replacements.
   * @param {string} key
   * @param {object} [params] — e.g. { n: 5, title: 'foo' }
   * @param {string} [lang] — override language
   * @returns {string}
   */
  function t(key, params, lang) {
    const l = lang || _currentLang;
    const entry = DICT[key];
    if (!entry) {
      console.warn('[i18n] Missing key:', key);
      return key;
    }
    let text = entry[l] || entry['en'] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replaceAll('{' + k + '}', String(v));
      }
    }
    return text;
  }

  /**
   * Format a duration string using i18n conventions.
   * @param {number} totalSeconds
   * @param {string} [lang]
   * @returns {string}
   */
  function fmtDur(totalSeconds, lang) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return t('etaHours', { h, m }, lang);
    if (m > 0) return t('etaMins', { m, s }, lang);
    return t('etaSecs', { s }, lang);
  }

  /* ═══════════════════════════════════════════════════
     LANGUAGE RESOLUTION
  ═══════════════════════════════════════════════════ */

  let _currentLang = 'en';
  let _resolved = false;
  let manualChoice = null;

  function getStoredLang() {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  }

  function setStoredLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
  }

  /**
   * Map a raw browser language to a supported lang code.
   */
  function mapBrowserLang(raw) {
    if (!raw) return null;
    const l = raw.toLowerCase().split('-')[0];
    if (SUPPORTED.includes(l)) return l;
    // Handle zh-* variants
    if (raw.toLowerCase().startsWith('zh')) return 'zh';
    if (raw.toLowerCase().startsWith('ja')) return 'ja';
    return null;
  }

  /**
   * Heuristic: map timezone to likely language.
   */
  function mapTimezone() {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (/^Asia\/(Shanghai|Taipei|Hong_Kong|Macau|Singapore|Urumqi|Chongqing|Harbin|Kashgar)/.test(tz)) return 'zh';
      if (/^Asia\/Tokyo/.test(tz)) return 'ja';
    } catch {}
    return null;
  }

  /**
   * Fetch coarse country/timezone from /api/locale (no IP stored).
   */
  async function fetchLocaleFromAPI() {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1500);
      let data;
      try {
        const r = await fetch('/api/locale', {signal:controller.signal,cache:'no-store'});
        if (!r.ok) return null;
        data = await r.json();
      } finally { clearTimeout(timer); }
      // Map country code to language
      const cc = (data.country || '').toUpperCase();
      if (['CN', 'TW', 'HK', 'MO', 'SG'].includes(cc)) return 'zh';
      if (cc === 'JP') return 'ja';
      // Fallback: try timezone
      if (data.timezone) {
        if (/^Asia\/(Shanghai|Taipei|Hong_Kong|Macau|Singapore)/.test(data.timezone)) return 'zh';
        if (/^Asia\/Tokyo/.test(data.timezone)) return 'ja';
      }
    } catch {}
    return null;
  }

  /**
   * Resolve language: manual > browser > timezone > CF country > en.
   * Returns the resolved lang code. Async-safe — if CF country hasn't arrived,
   * returns the best sync resolution. Call again after CF arrives.
   */
  async function resolveLanguage() {
    // 1. Manual selection always wins
    const stored = manualChoice || getStoredLang();
    if (stored && SUPPORTED.includes(stored)) {
      _currentLang = stored;
      _resolved = true;
      return _currentLang;
    }

    // 2. Browser language
    const browserLang = (navigator.languages?.length ? navigator.languages : [navigator.language]).map(mapBrowserLang).find(Boolean);
    if (browserLang) {
      _currentLang = browserLang;
      _resolved = true;
      return _currentLang;
    }

    // 3. Timezone heuristic
    const tzLang = mapTimezone();
    if (tzLang) {
      _currentLang = tzLang;
      _resolved = true;
      return _currentLang;
    }

    // 4. Cloudflare country (async)
    const cfLang = await fetchLocaleFromAPI();
    if (manualChoice) return _currentLang;
    if (cfLang) {
      _currentLang = cfLang;
      _resolved = true;
      return _currentLang;
    }

    // 5. Fallback
    _currentLang = 'en';
    _resolved = true;
    return 'en';
  }

  /**
   * Set language manually. Persists to localStorage. No draw reruns.
   */
  function setLanguage(lang) {
    if (!SUPPORTED.includes(lang)) {
      console.warn('[i18n] Unsupported language:', lang, '— falling back to en');
      lang = 'en';
    }
    manualChoice = lang;
    setStoredLang(lang);
    if (lang === _currentLang && _resolved) return;
    _currentLang = lang;
    _resolved = true;
    applyTranslations();
  }

  /**
   * Apply translations to all [data-i18n] elements.
   * Uses innerHTML for elements with plain-text i18n content.
   * For elements with children (like buttons with emoji), uses textContent.
   */
  function applyTranslations() {
    // Update document lang attribute
    document.documentElement.lang = _currentLang === 'zh' ? 'zh-CN' : _currentLang === 'ja' ? 'ja' : 'en';

    // Update document title
    const titleKey = document.documentElement.getAttribute('data-i18n-title');
    if (titleKey) document.title = t(titleKey);

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    const descKey = metaDesc?.getAttribute('data-i18n-content');
    if (metaDesc && descKey) metaDesc.setAttribute('content', t(descKey));

    // Apply [data-i18n] attributes
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      if (key === 'footerCredits') {
        const translated=t(key), domain='ffmpeg.bmmmd.com', parts=translated.split(domain);
        const link=document.createElement('a');link.href='https://ffmpeg.bmmmd.com/';link.target='_blank';link.rel='noopener';link.textContent=domain;
        el.replaceChildren(document.createTextNode(parts[0]),link,document.createTextNode(parts.slice(1).join(domain)));
      } else { el.textContent=t(key)+(el.tagName==='EM'?(_currentLang==='en'?': ':'：'):''); }

    });

    // Apply [data-i18n-placeholder]
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });

    // Apply [data-i18n-title]
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = t(el.getAttribute('data-i18n-title'));
    });

    // Fire a custom event so page-specific code can update dynamic content
    window.dispatchEvent(new CustomEvent('i18n-changed', { detail: { lang: _currentLang } }));
  }

  /* ═══════════════════════════════════════════════════
     PUBLIC API
  ═══════════════════════════════════════════════════ */

  window.I18N = {
    t,
    fmtDur,
    resolveLanguage,
    setLanguage,
    applyTranslations,
    getLang: () => _currentLang,
    getSupported: () => [...SUPPORTED],
    isResolved: () => _resolved,
    DICT, // exposed for tests
  };
})();