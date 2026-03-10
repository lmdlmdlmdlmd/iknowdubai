import "./globals.css";
import PostHogProvider from "./posthog-provider";

export const metadata = {
  title: "The Dubai Opinionist Test | Are You Qualified?",
  description:
    "Find out if you're actually qualified to have an opinion about Dubai. Take the test and prove it.",
  metadataBase: new URL("https://iknowdubai.lol"),
  openGraph: {
    title: "The Dubai Opinionist Test",
    description:
      "Are you qualified to have an opinion about Dubai? Take the test.",
    url: "https://iknowdubai.lol",
    siteName: "I Know Dubai",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Dubai Opinionist Test",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Dubai Opinionist Test",
    description:
      "Are you qualified to have an opinion about Dubai? Take the test.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
