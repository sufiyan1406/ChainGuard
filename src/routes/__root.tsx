import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AppProviders } from "@/components/Providers";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PayoutToast } from "@/components/PayoutToast";
import { IntroSequence } from "@/components/motion/IntroSequence";
import appCss from "../styles.css?url";

const APP_NAME = "ChainGuard";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "Parametric flood micro-insurance on Arbitrum Sepolia. Bind cover, watch live risk, settle on the parameter.",
      },
      { name: "theme-color", content: "#141210" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Anton&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap",
      },
    ],
    scripts: [
      {
        type: "text/javascript",
        children: `
          function googleTranslateElementInit() {
            new google.translate.TranslateElement({
              pageLanguage: 'en',
              includedLanguages: 'en,hi,bn,te,mr,ta,ur,gu,kn,ml,or,pa,as,sa,ne,ks',
              autoDisplay: false
            }, 'google_translate_element');
          }
        `,
      },
      {
        type: "text/javascript",
        src: "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit",
      }
    ],
  }),
  notFoundComponent: () => (
    <div className="container py-24 text-center font-mono">
      <p className="text-4xl font-bold text-ink">404</p>
      <p className="mt-2 text-ink-muted">Route Not Found</p>
    </div>
  ),
  component: RootLayout,
});

function RootLayout() {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-paper text-ink">
        <div id="google_translate_element"></div>
        <PreviewHostBridge />
        <IntroSequence />
        <AuthProvider>
          <AppProviders>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <div className="flex-1">
                <Outlet />
              </div>
              <SiteFooter />
            </div>
            <PayoutToast />
          </AppProviders>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
