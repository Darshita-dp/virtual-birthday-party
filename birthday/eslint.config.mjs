// @ts-check
import js from "@eslint/js";
import next from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/.turbo/**",
      "**/next-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // TypeScript and the bundlers already catch undefined identifiers; ESLint's
      // no-undef is redundant (and unaware of TS types / Node globals) in a TS monorepo.
      "no-undef": "off",
    },
  },
  {
    // Next.js rules, scoped to the web app so the framework detects its plugin.
    files: ["apps/web/**/*.{ts,tsx,js,jsx}"],
    plugins: { "@next/next": next },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
    },
  },
);
