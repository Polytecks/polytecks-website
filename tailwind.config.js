import { Jost } from "next/font/google";

const jost = Jost({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-jost" });

export default {
  theme: {
    extend: {
      fontFamily: {
        sans: [jost.style.fontFamily, "sans-serif"],
      },
    },
  },
};