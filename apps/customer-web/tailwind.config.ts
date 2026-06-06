import type { Config } from "tailwindcss";
import baseConfig from "@rrs/config/tailwind";

const config: Config = {
  ...baseConfig,
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  plugins: [require("@tailwindcss/typography")],
};

export default config;
