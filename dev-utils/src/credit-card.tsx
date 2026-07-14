import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const BRAND_PATTERNS: [RegExp, string][] = [
  [/^4\d{12}(\d{3})?$/, "Visa"],
  [/^5[1-5]\d{14}$/, "MasterCard"],
  [/^3[47]\d{13}$/, "American Express"],
  [/^6(?:011|5\d{2})\d{12}$/, "Discover"],
  [/^3(?:0[0-5]|[68]\d)\d{11}$/, "Diners Club"],
  [/^(?:2131|1800|35\d{3})\d{11}$/, "JCB"],
  [/^62\d{14}$/, "UnionPay"],
];

function luhnCheck(num: string): boolean {
  let sum = 0;
  let alternate = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i]!, 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

function detectBrand(num: string): string {
  for (const [re, brand] of BRAND_PATTERNS) {
    if (re.test(num)) return brand;
  }
  return "Unknown";
}

export default function CreditCardValidator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const validate = useCallback(() => {
    const cleaned = input.replace(/\s|-/g, "");
    if (!cleaned) {
      setError("Please enter a card number");
      return;
    }
    if (!/^\d{13,19}$/.test(cleaned)) {
      setError("Card number must be 13–19 digits");
      return;
    }

    const brand = detectBrand(cleaned);
    const valid = luhnCheck(cleaned);

    setError("");
    setOutput(
      [
        `Number:   ${cleaned}`,
        `Brand:    ${brand}`,
        `Length:   ${cleaned.length} digits`,
        `Luhn:     ${valid ? "✓ PASS" : "✗ FAIL"}`,
        `Status:   ${valid ? "✓ Valid card number" : "✗ Invalid card number"}`,
      ].join("\n"),
    );
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
          <Action title="Validate" icon={Icon.CheckCircle} onAction={validate} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextField id="input" title="Card Number" placeholder="4111111111111111" value={input} onChange={setInput} />
      {output && <Form.TextArea id="output" title="Result" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
