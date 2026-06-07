# 🎲 OpenLuck

**基于以太坊区块哈希的公开透明抽奖系统**

任何人可独立验证结果，无需信任本网站。

---

## 抽奖原理

1. 选定一个**未来**以太坊区块号，公告给所有参与者
2. 等待该区块被网络打包确认
3. 取出该区块的 256 位哈希（由全网验证者共同决定，无人可预测）
4. 以哈希为种子，迭代 SHA-256 生成中奖号码，跳过重复
5. 任何人可用附带的 Python 代码独立还原结果

## 项目结构

```
OpenLuck/
├── index.html              # 主页：发起抽奖
├── history.html            # 历史记录查询
├── functions/
│   └── api/
│       └── lottery.js      # Cloudflare Pages Function（KV 存储）
├── wrangler.toml           # Cloudflare 配置
└── README.md
```

---

## 部署到 Cloudflare Pages

### 1. 创建 GitHub 仓库

```bash
git init
git add .
git commit -m "init OpenLuck"
gh repo create OpenLuck --public --source=. --push
```

### 2. 安装 Wrangler

```bash
npm install -g wrangler
wrangler login
```

### 3. 创建 KV 命名空间

```bash
# 生产环境
wrangler kv:namespace create OPENLUCK_KV

# 本地预览（可选）
wrangler kv:namespace create OPENLUCK_KV --preview
```

将输出的 `id` 和 `preview_id` 填入 `wrangler.toml`：

```toml
[[kv_namespaces]]
binding    = "OPENLUCK_KV"
id         = "你的KV命名空间ID"
preview_id = "你的预览KV命名空间ID"
```

### 4. 连接 GitHub → Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Workers & Pages → Create application → Pages → Connect to Git
3. 选择 `OpenLuck` 仓库
4. Framework preset: 选 **None**（纯静态站）
5. Build command: 留空
6. Build output directory: `/`（或 `.`）
7. 在 **Settings → Functions → KV namespace bindings** 中绑定：
   - Variable name: `OPENLUCK_KV`
   - KV namespace: 选择刚创建的命名空间

### 5. 本地预览

```bash
wrangler pages dev . --kv OPENLUCK_KV
```

---

## 验证中奖结果（Python）

```python
import hashlib, requests

BLOCK_NUMBER = 21000000  # 替换为实际区块号
TOTAL        = 100       # 总参与人数
COUNT        = 3         # 中奖人数

r = requests.post("https://cloudflare-eth.com", json={
    "jsonrpc": "2.0",
    "method":  "eth_getBlockByNumber",
    "params":  [hex(BLOCK_NUMBER), False],
    "id": 1
})
block_hash = r.json()["result"]["hash"][2:]

winners, selected, rnd = [], set(), 0
while len(winners) < COUNT:
    seed = f"{block_hash}{rnd:04x}".encode()
    h    = hashlib.sha256(seed).hexdigest()
    num  = int(h[:16], 16) % TOTAL + 1
    if num not in selected:
        selected.add(num)
        winners.append(num)
    rnd += 1

print("区块哈希:", block_hash)
print("中奖号码:", sorted(winners))
```

可在以下平台直接运行：[Google Colab](https://colab.research.google.com) · [Replit](https://replit.com) · [OnlinePython](https://www.online-python.com)

---

## ETH 区块哈希公共节点（免费无需注册）

| 节点 | 地址 |
|------|------|
| Cloudflare ETH | `https://cloudflare-eth.com` |
| Llama RPC | `https://eth.llamarpc.com` |
| Ankr | `https://rpc.ankr.com/eth` |

---

## License

MIT
