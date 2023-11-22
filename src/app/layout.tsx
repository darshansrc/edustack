import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Edustack",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style
          id="holderStyle"
          dangerouslySetInnerHTML={{
            __html: `
      /* https://github.com/ant-design/ant-design/issues/16037#issuecomment-483140458 */
      /* Not only antd, but also any other style if you want to use ssr. */
      *, *::before, *::after {
        transition: none!important;
      }
    `,
          }}
        />

        <style id="holderStyle">
          /* Not only antd, but also any other style if you want to use ssr. */
          *, *::before, *::after {`transition: none!important;`}
        </style>
        <link
          rel="stylesheet"
          href="https://unpkg.com/antd@3.16.2/dist/antd.min.css"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
