import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function parseUA(ua: string): string {
  const info: string[] = [];
  let uaStr = ua;

  // Browser
  const edgeM = ua.match(/Edg\/([\d.]+)/);
  const chromeM = ua.match(/Chrome\/([\d.]+)/);
  const firefoxM = ua.match(/Firefox\/([\d.]+)/);
  const safariM = ua.match(/Safari\/([\d.]+)/) && !ua.includes("Chrome");

  if (edgeM) info.push(`Browser: Edge ${edgeM[1]}`);
  else if (ua.includes("OPR/")) info.push(`Browser: Opera ${ua.match(/OPR\/([\d.]+)/)![1]}`);
  else if (chromeM) info.push(`Browser: Chrome ${chromeM[1]}`);
  else if (firefoxM) info.push(`Browser: Firefox ${firefoxM[1]}`);
  else if (safariM) info.push(`Browser: Safari ${ua.match(/Version\/([\d.]+)/)?.[1] || "?"}`);
  else info.push("Browser: Unknown");

  // OS
  if (ua.includes("Windows NT 10")) info.push("OS: Windows 10/11");
  else if (ua.includes("Windows NT 6.3")) info.push("OS: Windows 8.1");
  else if (ua.includes("Windows NT 6.1")) info.push("OS: Windows 7");
  else if (ua.includes("Mac OS X")) {
    const ver = ua.match(/Mac OS X (\d+[._]\d+[._]?\d*)/);
    info.push(`OS: macOS ${ver?.[1]?.replace(/_/g, ".") || ""}`);
  } else if (ua.includes("iPhone")) info.push("OS: iOS (iPhone)");
  else if (ua.includes("iPad")) info.push("OS: iOS (iPad)");
  else if (ua.includes("Android")) {
    const ver = ua.match(/Android\s([\d.]+)/);
    info.push(`OS: Android ${ver?.[1] || ""}`);
  } else if (ua.includes("Linux")) info.push("OS: Linux");
  else info.push("OS: Unknown");

  // Architecture
  if (ua.includes("x86_64") || ua.includes("Win64")) info.push("Arch: x86_64 (64-bit)");
  else if (ua.includes("arm")) info.push("Arch: ARM");

  // Engine
  if (ua.includes("AppleWebKit") && !ua.includes("Chrome")) info.push("Engine: WebKit");
  else if (ua.includes("AppleWebKit")) info.push("Engine: Blink (Chromium)");
  else if (ua.includes("Gecko")) info.push("Engine: Gecko (Firefox)");

  // Raw length
  info.push(`UA Length: ${ua.length} chars`);

  return info.join("\n");
}

export default function UserAgentParser() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const parse = useCallback(() => {
    if (!input.trim()) {
      showToast(Toast.Style.Failure, "Please enter a User-Agent string");
      return;
    }
    setOutput(parseUA(input));
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
          <Action title="Parse UA" icon={Icon.MagnifyingGlass} onAction={parse} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="input"
        title="User-Agent String"
        placeholder="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)..."
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Parsed" value={output} onChange={() => {}} />}
    </Form>
  );
}
