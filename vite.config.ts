import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(rootDir, "src"),
      },
    },
    server: {
      host: true,
      port: 5173,
      // 配置了真实后端地址时启用代理（.env 中设置 VITE_PROXY_TARGET）
      proxy: env.VITE_PROXY_TARGET
        ? {
            "/api": {
              target: env.VITE_PROXY_TARGET,
              changeOrigin: true,
            },
          }
        : undefined,
    },
    preview: {
      port: 4173,
    },
    build: {
      target: "es2020",
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
      // 按需加载与分包策略：
      // 1. 函数式 manualChunks 按包名精确归类，仅收集实际被引用的模块，保留 tree-shaking
      // 2. 稳定的第三方库独立成 chunk，利用浏览器长期缓存
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return undefined;
            const segments = id.split("node_modules/")[1]?.split("/") ?? [];
            const pkg = segments[0]?.startsWith("@")
              ? `${segments[0]}/${segments[1] ?? ""}`
              : segments[0];
            if (!pkg) return undefined;
            if (
              pkg === "antd" ||
              pkg.startsWith("@ant-design/") ||
              pkg.startsWith("rc-") ||
              pkg.startsWith("@rc-component/")
            ) {
              return "antd-vendor";
            }
            if (
              pkg === "react" ||
              pkg === "react-dom" ||
              pkg === "react-router" ||
              pkg === "react-router-dom" ||
              pkg === "@remix-run/router" ||
              pkg === "scheduler"
            ) {
              return "react-vendor";
            }
            if (pkg === "zustand" || pkg === "dayjs") return "utils-vendor";
            return undefined;
          },
          entryFileNames: "assets/js/[name]-[hash].js",
          chunkFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
        },
      },
    },
  };
});
