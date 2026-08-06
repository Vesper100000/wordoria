import type { Metadata } from "next";
import "./globals.css";

const gitHubPagesBasePath = process.env.GITHUB_PAGES === "true" ? process.env.GITHUB_PAGES_BASE_PATH ?? "" : "";
const withBasePath = (path: string) => `${gitHubPagesBasePath}${path}`;

export const metadata: Metadata = {
  title: "Wordoria - A Visual Lexicon",
  description: "Master advanced English vocabulary through exceptional photography and deliberate practice.",
  icons: { icon: withBasePath("/favicon.svg"), shortcut: withBasePath("/favicon.svg") },
  openGraph: {
    title: "Wordoria - Words, seen differently.",
    description: "A visual lexicon for ambitious English learners.",
    images: ["https://vesper100000.github.io/wordoria/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wordoria - Words, seen differently.",
    description: "A visual lexicon for ambitious English learners.",
    images: ["https://vesper100000.github.io/wordoria/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
