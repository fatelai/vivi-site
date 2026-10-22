import { defineConfig } from "tinacms";

// Tina Cloud 的設定值放在環境變數（GitHub repo 的 Secrets），不寫進程式碼
const branch = process.env.GITHUB_BRANCH || process.env.GITHUB_REF_NAME || "main";

const text = (name: string, label: string, extra: object = {}) => ({ type: "string", name, label, ...extra });
const textarea = (name: string, label: string) => text(name, label, { ui: { component: "textarea" } });
const image = (name: string, label: string) => ({ type: "image", name, label });
const color = (name: string, label: string) => text(name, label, { ui: { component: "color", colorFormat: "hex" } });
const sectionHead = [text("eyebrow", "小標（英文）"), text("heading", "標題（按 Enter 換行）", { ui: { component: "textarea" } })];
const list = (name: string, label: string, fields: object[], itemLabel: (item: any) => string) => ({
  type: "object", name, label, list: true, ui: { itemProps: (item: any) => ({ label: itemLabel(item) }) }, fields,
});

export default defineConfig({
  branch,
  // 後台網頁只看得到 TINA_PUBLIC_ 開頭的環境變數；Token 只在建置時使用，不會出現在網頁上
  clientId: process.env.TINA_PUBLIC_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
    // GitHub Pages 的子路徑（repo 名稱），與 astro.config.mjs 相同
    basePath: process.env.TINA_PUBLIC_BASE_PATH || undefined,
  },
  media: { tina: { mediaRoot: "uploads", publicFolder: "public" } },

  schema: {
    collections: [
      {
        name: "site",
        label: "網站內容",
        path: "content/site",
        format: "json",
        ui: {
          // 只有一頁，不允許新增或刪除
          allowedActions: { create: false, delete: false },
          router: () => "/",
        },
        fields: [
          {
            type: "object", name: "seo", label: "網頁標題與描述（Google 搜尋用）",
            fields: [text("title", "網頁標題"), textarea("description", "網頁描述")],
          },
          {
            type: "object", name: "brand", label: "Logo 文字",
            fields: [text("name", "主要文字"), text("suffix", "副文字（英文）")],
          },
          {
            type: "object", name: "hero", label: "首頁大圖區",
            fields: [
              text("eyebrow", "小標（英文）"),
              textarea("title", "大標題（按 Enter 換行）"),
              textarea("subtitle", "介紹文字"),
              image("image", "拱形照片"),
              text("primaryLabel", "預約按鈕文字"),
              text("secondaryLabel", "聆聽按鈕文字"),
            ],
          },
          {
            type: "object", name: "quote", label: "一句話",
            fields: [textarea("text", "引言（按 Enter 換行）"), text("author", "署名")],
          },
          {
            type: "object", name: "about", label: "關於 Vivi",
            fields: [
              ...sectionHead,
              image("image", "大照片"),
              image("image2", "小照片（拱形）"),
              text("paragraphs", "介紹段落", { list: true, ui: { component: "textarea" } }),
              list("timeline", "歷程", [text("year", "時間"), text("text", "內容")], (i) => `${i?.year ?? ""} ${i?.text ?? ""}`),
            ],
          },
          {
            type: "object", name: "classes", label: "課程介紹",
            fields: [
              ...sectionHead,
              text("intro", "說明文字"),
              list("items", "課程", [
                text("title", "課程名稱"),
                textarea("description", "課程說明"),
                text("duration", "時長"),
                text("tag", "方式／人數（例如：每月一場、預約制）"),
                text("price", "費用"),
                text("linkLabel", "連結文字（例如：看近期場次）"),
                image("image", "課程圖片"),
              ], (i) => i?.title),
              textarea("note", "補充說明（例如：主題工作坊）"),
            ],
          },
          {
            type: "object", name: "journey", label: "一場音療的流程",
            fields: [
              ...sectionHead,
              list("steps", "步驟", [text("title", "名稱"), textarea("text", "說明")], (i) => i?.title),
            ],
          },
          {
            type: "object", name: "schedule", label: "近期場次",
            fields: [
              ...sectionHead,
              text("note", "說明文字"),
              list("items", "場次", [
                text("date", "日期（例如：11/23）"),
                text("time", "時間（例如：週日 14:00–15:30）"),
                text("title", "名稱"),
                text("note", "類型與地點（例如：團體頌缽音療 · 大安區）"),
              ], (i) => `${i?.date ?? ""} ${i?.title ?? ""}`),
            ],
          },
          {
            type: "object", name: "videos", label: "影片",
            fields: [
              ...sectionHead,
              text("intro", "說明文字"),
              list("items", "影片", [
                text("title", "影片標題"),
                text("url", "影片網址（YouTube 或 Instagram 貼文／Reels 網址）"),
              ], (i) => i?.title || i?.url),
            ],
          },
          {
            type: "object", name: "testimonials", label: "學員回饋",
            fields: [
              ...sectionHead,
              list("items", "回饋", [textarea("quote", "回饋內容"), text("author", "學員")], (i) => i?.author),
            ],
          },
          {
            type: "object", name: "gallery", label: "照片帶",
            fields: [list("images", "照片", [image("src", "照片"), text("alt", "照片說明（給看不到圖的人）")], (i) => i?.alt)],
          },
          {
            type: "object", name: "cta", label: "預約區塊",
            fields: [text("heading", "標題"), text("text", "說明"), text("button", "按鈕文字")],
          },
          {
            type: "object", name: "signup", label: "報名連結",
            fields: [text("url", "LINE 預約連結（所有預約按鈕都會連到這裡）")],
          },
          {
            type: "object", name: "theme", label: "網站配色",
            fields: [
              color("button", "強調色（按鈕、小標、編號、預約區塊；按鈕上的字是深色，請選亮一點的顏色）"),
              color("background", "主背景色（建議深色）"),
              color("section", "區塊背景色（比主背景稍亮一點）"),
            ],
          },
          {
            type: "object", name: "contact", label: "頁尾與聯絡方式",
            fields: [
              text("tagline", "頁尾標語"),
              text("address", "上課地址"),
              text("email", "Email（沒有就留空）"),
              text("phone", "電話（沒有就留空）"),
              text("line", "LINE ID"),
              list("socials", "社群連結", [text("label", "名稱（例如：Instagram）"), text("handle", "顯示文字（例如：@vivi.huang_）"), text("url", "網址")], (i) => i?.label),
              text("copyright", "版權文字"),
            ],
          },
        ],
      },
    ],
  },
});
