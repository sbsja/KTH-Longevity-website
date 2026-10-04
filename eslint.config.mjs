import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Three.js objects (cameras, materials, uniforms) are imperative by design.
    // The scene mutates them in frame callbacks on purpose.
    files: ["src/components/scene/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
    },
  },
  {
    // Covers are static SVG served from /public; the site is a static export with unoptimized images.
    rules: { "@next/next/no-img-element": "off" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "e2e/**/*.js"]),
]);

export default eslintConfig;
