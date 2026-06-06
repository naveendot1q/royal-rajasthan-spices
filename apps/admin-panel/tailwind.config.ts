import type { Config } from "tailwindcss";
import baseConfig from "@rrs/config/tailwind";
const config: Config = {
  ...baseConfig,
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
};
export default config;
