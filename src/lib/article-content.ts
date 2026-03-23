function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isSafeUrl(url: string) {
  return /^https?:\/\//i.test(url) || url.startsWith("/");
}

function normalizeImageMarkdown(input: string) {
  const tokens: string[] = [];
  const content = input.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_match, altRaw: string, urlRaw: string) => {
    const url = urlRaw.trim();
    if (!isSafeUrl(url)) {
      return "";
    }

    const alt = escapeHtml((altRaw || "").trim());
    const safeUrl = escapeHtml(url);
    const token = `__IMG_TOKEN_${tokens.length}__`;
    tokens.push(
      `<p><img src="${safeUrl}" alt="${alt}" class="my-4 w-full rounded border object-contain" /></p>`
    );
    return token;
  });

  return { content, tokens };
}

export function renderArticleContent(raw: string | null | undefined) {
  const input = (raw || "").trim();
  if (!input) {
    return "";
  }

  const { content, tokens } = normalizeImageMarkdown(input);
  let html = escapeHtml(content)
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br />")}</p>`)
    .join("");

  tokens.forEach((tokenHtml, index) => {
    html = html.replace(`__IMG_TOKEN_${index}__`, `</p>${tokenHtml}<p>`);
  });

  html = html
    .replace(/<p><\/p>/g, "")
    .replace(/<p><br \/><\/p>/g, "")
    .replace(/<p>\s*<\/p>/g, "");

  return html;
}
