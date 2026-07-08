import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function htmlToMarkdown(html: string): string {
  let md = html;
  // Headings
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, (_, t) => `\n# ${stripTags(t)}\n`);
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, (_, t) => `\n## ${stripTags(t)}\n`);
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, (_, t) => `\n### ${stripTags(t)}\n`);
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, (_, t) => `\n#### ${stripTags(t)}\n`);
  // Bold / Italic
  md = md.replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi, "**$2**");
  md = md.replace(/<(em|i)[^>]*>(.*?)<\/(em|i)>/gi, "*$2*");
  // Code
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");
  // Links
  md = md.replace(/<a[^>]*href=["'](.*?)["'][^>]*>(.*?)<\/a>/gi, "[$2]($1)");
  // Images
  md = md.replace(/<img[^>]*src=["'](.*?)["'][^>]*alt=["'](.*?)["'][^>]*\/?>/gi, "![$2]($1)");
  // Paragraphs
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, "\n$1\n");
  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, "\n");
  // Lists
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");
  md = md.replace(/<ul[^>]*>/gi, "\n");
  md = md.replace(/<\/ul>/gi, "\n");
  md = md.replace(/<ol[^>]*>/gi, "\n");
  md = md.replace(/<\/ol>/gi, "\n");
  // Blockquote
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, (_, t) => `> ${t.trim()}`);
  // Pre
  md = md.replace(/<pre[^>]*>(.*?)<\/pre>/gi, (_, t) => `\n\`\`\`\n${stripTags(t)}\n\`\`\`\n`);
  // Horizontal rule
  md = md.replace(/<hr\s*\/?>/gi, "\n---\n");
  // Clean remaining tags
  md = md.replace(/<[^>]+>/g, "");
  // Clean up whitespace
  md = md.replace(/&nbsp;/g, " ");
  md = md.replace(/&amp;/g, "&");
  md = md.replace(/&lt;/g, "<");
  md = md.replace(/&gt;/g, ">");
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/\n{3,}/g, "\n\n");

  return md.trim();
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&[^;]+;/g, (m) => {
    if (m === "&amp;") return "&";
    if (m === "&lt;") return "<";
    if (m === "&gt;") return ">";
    if (m === "&quot;") return '"';
    if (m === "&#39;" || m === "&#x27;") return "'";
    if (m === "&nbsp;") return " ";
    return "";
  });
}

export default function HtmlToMarkdown() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter HTML");
      return;
    }
    setError("");
    setOutput(htmlToMarkdown(input));
  }, [input]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Convert" icon={Icon.ArrowRight} onAction={convert} />
          {output && <Action title="Copy Markdown" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="input"
        title="HTML"
        placeholder="<h1>Hello</h1><p>This is <b>bold</b> text.</p>"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Markdown" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
