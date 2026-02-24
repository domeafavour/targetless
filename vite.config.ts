import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/targetless/" : "/",
  plugins: [
    devtools(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      router: { basepath: "/targetless" },
      spa: {
        enabled: true,
        prerender: {
          crawlLinks: true,
        },
      },
      prerender: {
        // Enable prerendering
        enabled: true,

        // // Enable if you need pages to be at `/page/index.html` instead of `/page.html`
        autoSubfolderIndex: true,

        // // If disabled, only the root path or the paths defined in the pages config will be prerendered
        autoStaticPathsDiscovery: true,

        // // How many prerender jobs to run at once
        // concurrency: 14,

        // // Whether to extract links from the HTML and prerender them also
        crawlLinks: true,

        // // Number of times to retry a failed prerender job
        // retryCount: 2,

        // // Delay between retries in milliseconds
        // retryDelay: 1000,

        // // Maximum number of redirects to follow during prerendering
        // maxRedirects: 5,

        // Fail if an error occurs during prerendering
        failOnError: true,

        // // Callback when page is successfully rendered
        // onSuccess: ({ page }) => {
        //   console.log(`Rendered ${page.path}!`);
        // },
      },
    }),
    viteReact(),
  ],
});

export default config;
