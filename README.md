# Vivi 網站

Vivi 頌缽聲音療癒品牌網站。Astro 產生靜態網頁，TinaCMS 提供小編後台，不使用資料庫。

- **部署說明**：[docs/DEPLOY.md](docs/DEPLOY.md)
- **小編使用手冊**：[docs/EDITOR-GUIDE.md](docs/EDITOR-GUIDE.md)

## 快速開始

```bash
npm ci
npm run dev
```

- 網站：http://localhost:4321
- 後台：http://localhost:4321/admin/index.html

## 指令

| 指令 | 用途 |
|---|---|
| `npm run dev` | 本機開發（網站加本機後台） |
| `npm run build` | 正式建置，含小編後台（需要 Tina Cloud 環境變數），輸出在 `dist/` |
| `npm run build:static` | 純靜態建置，不需要任何帳號，輸出在 `dist/`（請刪掉 `dist/admin/`） |
