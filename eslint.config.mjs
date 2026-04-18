import nextConfig from "eslint-config-next/core-web-vitals";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...nextConfig,
  {
    ignores: ["coverage/**"],
  },
  {
    rules: {
      "react-hooks/exhaustive-deps": "off",
    },
  },
];

export default config;
