import {
  Link,
  Links,
  LiveReload,
  LoaderFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch
} from "remix"
import type { LinksFunction } from "remix"

import globalStylesUrl from "~/styles/global.css"
import darkStylesUrl from "~/styles/dark.css"

export default function App() {
  return (
    <Document>
      <Layout>
        <Outlet />
      </Layout>
    </Document>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)
  return (
    <Document title="Error!">
      <Layout>
        <div>
          <h1>An error occurred</h1>
          <p>{error.message || <i>No additional information was provided.</i>}</p>
          <hr />
          <p>
            The developer has been notified and will look into this issue.
            {/* Hash: { TODO } */}
          </p>
        </div>
      </Layout>
    </Document>
  )
}

export function CatchBoundary() {
  let caught = useCatch()

  let message
  switch (caught.status) {
    case 401:
      message = (
        <p>
          Oops! Looks like you tried to visit a page that you do not have access
          to.
        </p>
      )
      break
    case 404:
      message = (
        <p>Oops! Looks like you tried to visit a page that does not exist.</p>
      )
      break

    default:
      throw new Error(caught.data || caught.statusText)
  }

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <Layout>
        <h1>
          {caught.status}: {caught.statusText}
        </h1>
        {message}
      </Layout>
    </Document>
  )
}
export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: globalStylesUrl },
    {
      rel: "stylesheet",
      href: darkStylesUrl,
      media: "(prefers-color-scheme: dark)"
    }
  ]
}

function Document({
  children,
  title
}: {
  children: React.ReactNode
  title?: string
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mona">
      <header className="mona__header">
        <div className="container mona__header-content">
          <Link to="/" className="mona__header-home-link">
            <h2>Mona</h2>
          </Link>
          <nav aria-label="Main navigation" className="mona__header-nav">
            <ul>
              <li>
                <Link to="/monitors">monitors</Link>
              </li>
              <li>
                <a href="https://github.com/yuktec/mona" target="_blank">sauce</a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <div className="mona__main">
        <div className="container mona__main-content">{children}</div>
      </div>
      <footer className="mona__footer">
        <div className="container mona__footer-content">
          <p><a href="https://github.com/yuktec/mona/blob/master/LICENSE" target="_blank">&copy; yuktec/mona</a></p>
        </div>
      </footer>
    </div>
  )
}
