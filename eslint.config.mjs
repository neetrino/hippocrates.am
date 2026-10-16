import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/.next-e2e*/**",
      "**/src/generated/**",
      "**/coverage/**",
    ],
  },
  {
    files: ["apps/api/**/*.ts"],
    extends: [tseslint.configs.recommended],
  },
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    extends: [nextCoreWebVitals, nextTypescript],
  },
);
