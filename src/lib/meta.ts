import * as React from "react";

const DEFAULT_TITLE = "Dash Hour: skip the bank queue";
const DEFAULT_DESCRIPTION =
  "A prototype of Dash Hour, a hackathon app for taking a bank queue ticket before you arrive. Rebuilt from the original 2016 sketches for web and mobile.";

export type PageMeta = {
  /** Shown as "<title> · Dash Hour"; the default title when left out. */
  title?: string;
  description?: string;
  /** Ask search engines not to index the page (the 404). */
  noindex?: boolean;
};

/** Sets the document title, description and robots tag for the current page. */
export function usePageMeta({ title, description, noindex = false }: PageMeta) {
  React.useEffect(() => {
    document.title = title ? `${title} · Dash Hour` : DEFAULT_TITLE;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description ?? DEFAULT_DESCRIPTION);
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (noindex) {
      if (!robots) {
        robots = document.createElement("meta");
        robots.name = "robots";
        document.head.append(robots);
      }
      robots.content = "noindex";
    } else {
      robots?.remove();
    }
  }, [title, description, noindex]);
}
