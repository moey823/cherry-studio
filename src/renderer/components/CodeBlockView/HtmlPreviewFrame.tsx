/* eslint-disable @eslint-react/dom/no-missing-iframe-sandbox -- sandbox is always supplied via the (defaulted) prop; the rule can't statically resolve the dynamic value. */
import { memo, type Ref } from 'react'

export const HTML_PREVIEW_DEFAULT_BASE_URL = 'about:srcdoc'
// Generated HTML may execute its own inline scripts, but it receives an opaque
// origin and no form/navigation permission. Keeping `allow-same-origin` out is
// essential because the parent renderer exposes privileged application APIs.
export const HTML_PREVIEW_IFRAME_SANDBOX = 'allow-scripts'

// Generated artifacts are offline by default. Inline CSS/JS and data/blob
// assets work, while fetch/XHR, remote images, frames, forms and navigation are
// blocked. This prevents model-generated HTML from silently exfiltrating data.
export const HTML_PREVIEW_DEFAULT_CSP =
  "default-src 'none'; script-src 'unsafe-inline' data: blob:; style-src 'unsafe-inline'; img-src data: blob:; media-src data: blob:; font-src data:; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'"

// Fully-restricted sandbox for previewing untrusted on-disk files. An empty `sandbox`
// applies every restriction — no scripts, no forms, opaque origin — while still rendering
// static HTML/CSS. Running NO scripts is the deliberate choice and adds defense in depth
// beyond the main window's normal same-origin enforcement. Pair with
// {@link HTML_PREVIEW_RESTRICTED_CSP}. Use this —
// never the artifact sandbox above — for any file whose contents we don't control.
export const HTML_PREVIEW_RESTRICTED_SANDBOX = ''

// Strict CSP for untrusted local-file previews, injected as a `<meta http-equiv>` tag.
// `default-src 'none'` blocks scripts and every network connection; only passive local
// resources (data/blob/file) are allowed, so a preview cannot phone home or exfiltrate
// content. Defense-in-depth behind the sandbox.
export const HTML_PREVIEW_RESTRICTED_CSP =
  "default-src 'none'; img-src data: blob: file:; media-src data: blob: file:; style-src 'unsafe-inline' file:; font-src data: file:"

interface HtmlPreviewFrameProps {
  html: string
  title: string
  baseUrl?: string
  emptyText?: string
  /** iframe `sandbox` value. Defaults to an offline, opaque-origin artifact sandbox. */
  sandbox?: string
  /** Content-Security-Policy injected as a `<meta http-equiv>` tag. */
  csp?: string
  iframeRef?: Ref<HTMLIFrameElement>
}

const escapeHtmlAttribute = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function injectHeadElement(html: string, element: string): string {
  const headMatch = html.match(/<head(?:\s[^>]*)?>/i)
  if (headMatch?.index !== undefined) {
    const insertAt = headMatch.index + headMatch[0].length
    return `${html.slice(0, insertAt)}${element}${html.slice(insertAt)}`
  }

  const htmlMatch = html.match(/<html(?:\s[^>]*)?>/i)
  if (htmlMatch?.index !== undefined) {
    const insertAt = htmlMatch.index + htmlMatch[0].length
    return `${html.slice(0, insertAt)}<head>${element}</head>${html.slice(insertAt)}`
  }

  const doctypeMatch = html.match(/<!doctype\s+html[^>]*>/i)
  if (doctypeMatch?.index !== undefined) {
    const insertAt = doctypeMatch.index + doctypeMatch[0].length
    return `${html.slice(0, insertAt)}<head>${element}</head>${html.slice(insertAt)}`
  }

  return `<head>${element}</head>${html}`
}

export function injectHtmlPreviewBase(html: string, baseUrl = HTML_PREVIEW_DEFAULT_BASE_URL): string {
  if (!html.trim() || /<base(?:\s|>|\/)/i.test(html)) return html
  return injectHeadElement(html, `<base href="${escapeHtmlAttribute(baseUrl)}">`)
}

export function injectHtmlPreviewCsp(html: string, csp: string): string {
  if (!html.trim()) return html
  return injectHeadElement(html, `<meta http-equiv="Content-Security-Policy" content="${escapeHtmlAttribute(csp)}">`)
}

export const HtmlPreviewFrame = memo<HtmlPreviewFrameProps>(
  ({
    html,
    title,
    baseUrl = HTML_PREVIEW_DEFAULT_BASE_URL,
    emptyText,
    sandbox = HTML_PREVIEW_IFRAME_SANDBOX,
    csp = HTML_PREVIEW_DEFAULT_CSP,
    iframeRef
  }) => {
    const withBase = injectHtmlPreviewBase(html, baseUrl)
    const srcDoc = csp ? injectHtmlPreviewCsp(withBase, csp) : withBase
    return (
      <div className="h-full w-full overflow-hidden bg-background">
        {html.trim() ? (
          <iframe
            ref={iframeRef}
            srcDoc={srcDoc}
            title={title}
            sandbox={sandbox}
            className="h-full w-full border-0 bg-background"
          />
        ) : emptyText ? (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">
            <p>{emptyText}</p>
          </div>
        ) : null}
      </div>
    )
  }
)

export default HtmlPreviewFrame
