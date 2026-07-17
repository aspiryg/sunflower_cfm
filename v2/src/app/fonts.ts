import { Poppins, Cairo } from "next/font/google";

// Latin UI font (parity with v1's Poppins).
export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-latin",
  display: "swap",
});

// Arabic UI font — net-new in v2 for first-class AR typography.
export const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});
