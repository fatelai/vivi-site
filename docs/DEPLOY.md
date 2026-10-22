# Vivi 網站部署說明

這份文件說明怎麼在任何環境建置和部署這個網站。小編的操作方式請看 [EDITOR-GUIDE.md（小編使用手冊）](EDITOR-GUIDE.md)。

---

## 1. 專案概要

| 項目 | 內容 |
|---|---|
| 網站類型 | 靜態網站（單頁），不需要資料庫、不需要伺服器程式 |
| 網站產生器 | [Astro](https://astro.build) |
| 小編後台 | [TinaCMS](https://tina.io)，內容存在 Git repo 的檔案裡，登入由 Tina Cloud 負責 |
| 前端 | React 19（整頁是一個 React 元件，讓後台可以即時預覽） |
| 預約 | 所有「預約」按鈕連到後台設定的 LINE 網址，網站本身不收資料 |
| 預設部署 | GitHub Pages（已附 GitHub Actions 設定） |

### 資料夾結構

```
content/site/site.json        網站所有文字內容（小編在後台改的就是這個檔案）
public/uploads/               網站圖片（小編上傳的圖片也會放這裡）
src/components/Site.tsx       網頁版面
src/pages/index.astro         網頁外框（<head>、字型）
src/styles/global.css         網站樣式
tina/config.ts                後台欄位設定
.github/workflows/deploy.yml  GitHub Pages 自動部署
```

---

## 2. 需要的環境

- **Node.js 24**（開發時用 24.15 測試過）
- npm（隨 Node.js 安裝）

```bash
npm ci
```

> 第一次安裝或沒有 `package-lock.json` 時改用 `npm install`。

---

## 3. 本機開發

```bash
npm run dev
```

| 網址 | 用途 |
|---|---|
| http://localhost:4321 | 網站 |
| http://localhost:4321/admin/index.html | 後台（本機模式，不用登入；按「Save」會直接改 `content/site/site.json`） |

本機模式改完內容後，要自己 commit 並推到 GitHub，網站才會更新。

---

## 4. 環境變數

| 變數 | 必填 | 用途 | 範例 |
|---|---|---|---|
| `TINA_PUBLIC_CLIENT_ID` | 要後台時必填 | Tina Cloud 專案的 Client ID | `a1b2c3d4-...` |
| `TINA_TOKEN` | 要後台時必填 | Tina Cloud 的唯讀 Token（只在建置時使用，不會出現在網頁上） | `abc123...` |
| `BASE_PATH` | 網站放在子路徑時必填 | 子路徑名稱，**不含斜線** | `vivi-site` |
| `TINA_PUBLIC_BASE_PATH` | 網站放在子路徑時必填 | 跟 `BASE_PATH` 填一樣的值（給後台用） | `vivi-site` |
| `GITHUB_BRANCH` | 選填 | 內容所在的分支，預設 `main` | `main` |

- 網站放在網域根目錄（例如 `https://vivi-sound.com/`）時，**不要設** `BASE_PATH` 和 `TINA_PUBLIC_BASE_PATH`。
- 網站放在子路徑（例如 `https://帳號.github.io/vivi-site/`）時，兩個都要設。
- `TINA_PUBLIC_` 開頭的變數會被寫進後台網頁裡，不要放任何密碼；`TINA_TOKEN` 不會。

---

## 5. 建置

### A. 正式版（含小編後台，需要 Tina Cloud）

```bash
npm run build
```

- 需要先設好 `TINA_PUBLIC_CLIENT_ID` 和 `TINA_TOKEN`。
- 輸出在 **`dist/`**，整個資料夾就是網站，放到任何靜態主機都可以。
- 後台在 `網站網址/admin/`。

### B. 純靜態版（不要後台，或還沒申請 Tina Cloud）

```bash
npm run build:static
```

- 不需要任何帳號和環境變數。
- 輸出在 `dist/`。**請刪掉 `dist/admin/`**，那是本機開發用的後台，放上線不能用。
- 在 Windows 上，建置完成後可能會出現 `Assertion failed ... UV_HANDLE_CLOSING` 並回傳錯誤代碼。只要前面有 `Complete!`，`dist/` 就是完整的，可以忽略。

---

## 6. 部署方式

### 方式一：GitHub Pages（已設定好）

1. 在 GitHub 建立一個**公開**的 repo（免費的 GitHub Pages 需要公開 repo），把整個專案推到 `main` 分支。
2. repo「**Settings → Pages → Build and deployment → Source**」選 **GitHub Actions**。
3. repo「**Settings → Secrets and variables → Actions**」：
   - **Variables** 分頁新增 `TINA_CLIENT_ID`（值是 Tina Cloud 的 Client ID）
   - **Secrets** 分頁新增 `TINA_TOKEN`
4. 到「**Actions → Deploy to GitHub Pages → Run workflow**」手動執行一次，之後每次推到 `main`（包含小編在後台存檔）都會自動部署。
5. 網址：`https://帳號.github.io/repo名稱/`

> workflow 會自動用 repo 名稱當子路徑，不用另外設 `BASE_PATH`。
> 綁自己的網域時，要把 `.github/workflows/deploy.yml` 裡的 `BASE_PATH` 和 `TINA_PUBLIC_BASE_PATH` 兩行刪掉。

### 方式二：其他靜態主機（Netlify、Vercel、Cloudflare Pages 等）

在主機後台匯入 repo，設定：

| 設定 | 值 |
|---|---|
| Build command | `npm run build` |
| Output / Publish directory | `dist` |
| Node 版本 | 24 |
| 環境變數 | `TINA_PUBLIC_CLIENT_ID`、`TINA_TOKEN`（放在網域根目錄時不用設 `BASE_PATH`） |

這些主機都會在 repo 有新 commit 時自動重新部署，小編存檔後網站會自己更新。

### 方式三：自己的主機或手動上傳

在任何有 Node.js 的電腦執行建置（見第 5 節），把 `dist/` 裡的所有檔案上傳到主機的網站目錄。

> 手動上傳的話，小編在後台存檔後網站**不會**自動更新，要重新建置、重新上傳。要自動更新，請用方式一或方式二。

---

## 7. 設定 Tina Cloud（小編後台）

1. 到 https://app.tina.io 註冊，選免費方案。
2. 「Create Project」→ 連結 GitHub → 選這個 repo。
3. 專案設定：
   - **Site URL**：填正式網址，例如 `https://帳號.github.io/vivi-site/`。本機測試也可以加 `http://localhost:4321`
   - **Branch**：`main`
4. 「Overview」複製 **Client ID**；「Tokens」建立一個 **Content (Read-only)** Token。
5. 把這兩個值填進部署環境（見第 4、6 節），重新部署。
6. 「Collaborators」用 Email 邀請小編。小編會收到邀請信，用自己的 Email 建立登入。

> Tina Cloud 免費方案的使用者人數有上限，開發者本人也算一位，請以 Tina Cloud 的方案說明為準。

---

## 8. LINE 預約連結

網站上所有「預約」按鈕（導覽列、首頁大圖、課程卡片、近期場次、預約區塊）都連到同一個網址，另開分頁。

- 目前的預設值是 `https://line.me/R/ti/p/@vivi`，**這是假的範例**，上線前請換掉。
- 修改方式：後台「**報名連結**」，或直接改 `content/site/site.json` 的 `signup.url`。

---

## 9. 不用後台直接改內容

所有文字都在 `content/site/site.json`，圖片在 `public/uploads/`。

- 換圖片：把新圖放進 `public/uploads/`，再把 `site.json` 裡對應的路徑改成 `/uploads/新檔名.jpg`。路徑一律以 `/uploads/` 開頭，子路徑會自動加上。
- 文字裡的換行：只有標示「按 Enter 換行」的欄位（首頁大標題、介紹文字）會顯示換行，JSON 裡寫成 `\n`。

---

## 10. 交接給客戶

1. **GitHub**：repo「Settings → Transfer ownership」轉到客戶帳號。GitHub Pages 網址會變成客戶帳號的網址。
2. **Tina Cloud**：客戶用自己的帳號建立專案連到 repo（第 7 節），把部署環境的 `TINA_CLIENT_ID`、`TINA_TOKEN` 換成新的，並更新 Site URL。
3. **LINE 預約連結**：換成客戶自己的 LINE 網址。

Token 只放在部署環境的 Secrets，不在程式碼裡，轉移 repo 不會帶出開發者的資料。

---

## 11. 常見問題

**圖片或樣式跑掉、一片空白**
網站放在子路徑但沒設 `BASE_PATH`，或放在根目錄卻設了 `BASE_PATH`。參考第 4 節。

**後台登入後一直轉圈或回到登入頁**
檢查 Tina Cloud 專案的 Site URL 是否和實際網址一致（包含子路徑和最後的 `/`），以及 `TINA_PUBLIC_BASE_PATH` 是否有設。

**`npm run build` 出現 Tina Cloud 相關錯誤**
`TINA_PUBLIC_CLIENT_ID` 或 `TINA_TOKEN` 沒設或錯誤，或 Tina Cloud 專案還沒完成索引（剛建立的專案要等幾分鐘）。不需要後台的話改用 `npm run build:static`。

**小編存檔了，網站卻沒更新**
GitHub Pages：到 repo 的「Actions」看部署有沒有失敗。其他主機：看主機後台的部署紀錄。正常情況下約 1～2 分鐘會更新。

**為什麼用 React 19**
在 Windows 上用 React 18 建置時，網頁裡會混進看不見的錯誤字元（NUL）。React 19 沒有這個問題，請不要降版。
