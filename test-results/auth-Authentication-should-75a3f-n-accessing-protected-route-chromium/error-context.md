# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]: "[plugin:vite:import-analysis]"
    - generic [ref=e6]: Failed to resolve import "@radix-ui/react-toast" from "src/components/ui/toast.tsx". Does the file exist?
  - generic [ref=e8] [cursor=pointer]: /home/tan/work/try-vite/src/components/ui/toast.tsx:2:33
  - generic [ref=e9]: "16 | } 17 | import * as React from \"react\"; 18 | import * as ToastPrimitives from \"@radix-ui/react-toast\"; | ^ 19 | import { cva } from \"class-variance-authority\"; 20 | import { X } from \"lucide-react\";"
  - generic [ref=e10]:
    - text: "at TransformPluginContext._formatLog (file:"
    - generic [ref=e11] [cursor=pointer]: ///home/tan/work/try-vite/node_modules/.pnpm/vite@6.3.6_@types+node@24.5.2_jiti@2.5.1_lightningcss@1.30.1_tsx@4.20.5/node_modules/vite/dist/node/chunks/dep-Bu492Fnd.js:42517:41
    - text: ") at TransformPluginContext.error (file:"
    - generic [ref=e12] [cursor=pointer]: ///home/tan/work/try-vite/node_modules/.pnpm/vite@6.3.6_@types+node@24.5.2_jiti@2.5.1_lightningcss@1.30.1_tsx@4.20.5/node_modules/vite/dist/node/chunks/dep-Bu492Fnd.js:42514:16
    - text: ") at normalizeUrl (file:"
    - generic [ref=e13] [cursor=pointer]: ///home/tan/work/try-vite/node_modules/.pnpm/vite@6.3.6_@types+node@24.5.2_jiti@2.5.1_lightningcss@1.30.1_tsx@4.20.5/node_modules/vite/dist/node/chunks/dep-Bu492Fnd.js:40493:23
    - text: ) at process.processTicksAndRejections (node:internal
    - generic [ref=e14] [cursor=pointer]: /process/task_queues:105:5
    - text: ") at async file:"
    - generic [ref=e15] [cursor=pointer]: ///home/tan/work/try-vite/node_modules/.pnpm/vite@6.3.6_@types+node@24.5.2_jiti@2.5.1_lightningcss@1.30.1_tsx@4.20.5/node_modules/vite/dist/node/chunks/dep-Bu492Fnd.js:40612:37
    - text: "at async Promise.all (index 4) at async TransformPluginContext.transform (file:"
    - generic [ref=e16] [cursor=pointer]: ///home/tan/work/try-vite/node_modules/.pnpm/vite@6.3.6_@types+node@24.5.2_jiti@2.5.1_lightningcss@1.30.1_tsx@4.20.5/node_modules/vite/dist/node/chunks/dep-Bu492Fnd.js:40539:7
    - text: ") at async EnvironmentPluginContainer.transform (file:"
    - generic [ref=e17] [cursor=pointer]: ///home/tan/work/try-vite/node_modules/.pnpm/vite@6.3.6_@types+node@24.5.2_jiti@2.5.1_lightningcss@1.30.1_tsx@4.20.5/node_modules/vite/dist/node/chunks/dep-Bu492Fnd.js:42312:18
    - text: ") at async loadAndTransform (file:"
    - generic [ref=e18] [cursor=pointer]: ///home/tan/work/try-vite/node_modules/.pnpm/vite@6.3.6_@types+node@24.5.2_jiti@2.5.1_lightningcss@1.30.1_tsx@4.20.5/node_modules/vite/dist/node/chunks/dep-Bu492Fnd.js:35738:27
    - text: ") at async viteTransformMiddleware (file:"
    - generic [ref=e19] [cursor=pointer]: ///home/tan/work/try-vite/node_modules/.pnpm/vite@6.3.6_@types+node@24.5.2_jiti@2.5.1_lightningcss@1.30.1_tsx@4.20.5/node_modules/vite/dist/node/chunks/dep-Bu492Fnd.js:37253:24
  - generic [ref=e20]:
    - text: Click outside, press
    - generic [ref=e21]: Esc
    - text: key, or fix the code to dismiss.
    - text: You can also disable this overlay by setting
    - code [ref=e22]: server.hmr.overlay
    - text: to
    - code [ref=e23]: "false"
    - text: in
    - code [ref=e24]: vite.config.ts
    - text: .
```