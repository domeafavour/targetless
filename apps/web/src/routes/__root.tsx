import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import appCss from "@targetless/ui/globals.css?url";
import Header from "../components/Header";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

const IS_DEV = import.meta.env.DEV;

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Targetless",
      },
      {
        name: "theme-color",
        content: "#000000",
      },
      {
        name: "mobile-web-app-capable",
        content: "yes",
      },
      {
        name: "apple-mobile-web-app-capable",
        content: "yes",
      },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "black",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "manifest",
        href: "./manifest.json",
      },
      {
        rel: "apple-touch-icon",
        href: "./logo192.png",
      },
    ],
    scripts: [
      {
        type: "module",
        children: `
          if ('serviceWorker' in navigator && !${IS_DEV}) {
            window.addEventListener('load', () => {
              // Use relative path - Vite will handle base URL injection
              const swPath = './sw.js';
              navigator.serviceWorker.register(swPath)
                .then(registration => {
                  console.log('Service Worker registered:', registration.scope);
                  // Check for updates every 10 minutes
                  setInterval(() => registration.update(), 600000);
                })
                .catch(error => console.error('Service Worker registration failed:', error));
            });
          }
        `,
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <Header />
        {children}
        {import.meta.env.DEV && (
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        )}
        <Scripts />
      </body>
    </html>
  );
}
