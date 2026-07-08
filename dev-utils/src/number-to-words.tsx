import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const SCALES = ["", "thousand", "million", "billion", "trillion"];

function under1000(n: number): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  if (h) parts.push(`${ONES[h]} hundred`);
  const r = n % 100;
  if (r < 20) { if (r) parts.push(ONES[r]); }
  else {
    const t = Math.floor(r / 10);
    const o = r % 10;
    parts.push(`${TENS[t]}${o ? `-${ONES[o]}` : ""}`);
  }
  return parts.join(" ");
}

function numberToWords(n: number): string {
  if (n === 0) return "zero";
  if (n < 0) return `negative ${numberToWords(-n)}`;

  let num = Math.floor(n);
  let i = 0;
  const parts: string[] = [];
  while (num > 0) {
    const chunk = num % 1000;
    if (chunk) {
      const words = under1000(chunk);
      parts.unshift(`${words}${SCALES[i] ? ` ${SCALES[i]}` : ""}`);
    }
    num = Math.floor(num / 1000);
    i++;
  }
  return parts.join(" ").trim();
}

export default function NumberToWords() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter a number");
      return;
    }
    const num = parseFloat(input);
    if (isNaN(num) || num > 999999999999999 || !Number.isInteger(num)) {
      setError("Enter a whole number up to 999,999,999,999,999");
      return;
    }
    setError("");
    setOutput(`${input} = ${numberToWords(num)}`);
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
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextField id="input" title="Number" placeholder="1234" value={input} onChange={setInput} />
      {output && <Form.TextField id="output" title="Result" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
