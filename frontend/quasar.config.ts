import { defineConfig } from "#q-app";

export default defineConfig(ctx => {
  const apiProxyTarget =
    process.env.VITE_API_PROXY_TARGET ?? "http://127.0.0.1:8383";

  return {
    productName: "Oh My Cash",
    productDescription: "Finanzas personales claras y bajo control",
    boot: ["theme", "i18n"],
    css: ["app.scss"],
    extras: ["material-icons"],
    build: {
      typescript: {
        strict: true,
        vueShim: true
      },
      vueRouterMode: "history",
      vitePlugins: [
        [
          "@intlify/unplugin-vue-i18n/vite",
          {
            ssr: ctx.mode.ssr || ctx.mode.ssg,
            include: [ctx.appPaths.resolve.app("src/i18n")]
          }
        ]
      ]
    },
    devServer: {
      open: true,
      port: 8384,
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true
        },
        "/health": {
          target: apiProxyTarget,
          changeOrigin: true
        }
      }
    },
    framework: {
      config: {},
      lang: "es",
      plugins: ["Notify"]
    },
    animations: ["fadeIn", "fadeOut"],
    pwa: {
      workboxMode: "GenerateSW",
      injectPWAMetaTags: true,
      extendPWAGenerateSWOptions(options) {
        options.navigateFallback = "index.html";
        options.navigateFallbackDenylist = [/^\/api\//, /^\/health\//];
      }
    }
  };
});
