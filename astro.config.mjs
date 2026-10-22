import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// GitHub Pages 網址是 https://帳號.github.io/repo名稱/，所以網站要放在子路徑底下。
// BASE_PATH 由 GitHub Actions 設定（見 .github/workflows/deploy.yml），本機開發時不設。
const basePath = process.env.BASE_PATH;

export default defineConfig({
  base: basePath ? `/${basePath}` : undefined,
  integrations: [react()],
});
