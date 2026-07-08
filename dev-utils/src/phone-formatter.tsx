import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function PhoneFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [country, setCountry] = useState<"us" | "cn" | "uk" | "jp" | "intl">("us");
  const [error, setError] = useState("");

  const format = useCallback(() => {
    const digits = input.replace(/\D/g, "");
    if (digits.length < 7) { setError("Need at least 7 digits"); return; }
    setError("");

    switch (country) {
      case "us":
        if (digits.length === 10) setOutput(`(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`);
        else if (digits.length === 11 && digits.startsWith("1")) setOutput(`+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`);
        else setOutput(digits);
        break;
      case "cn":
        if (digits.length === 11) setOutput(`${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`);
        else if (digits.length === 12 && digits.startsWith("86")) setOutput(`+86 ${digits.slice(2, 5)} ${digits.slice(5, 9)} ${digits.slice(9)}`);
        else setOutput(digits);
        break;
      case "uk":
        if (digits.length === 10) setOutput(`${digits.slice(0, 4)} ${digits.slice(4)}`);
        else if (digits.length === 11) setOutput(`${digits.slice(0, 5)} ${digits.slice(5)}`);
        else setOutput(digits);
        break;
      case "jp":
        if (digits.length === 10) setOutput(`${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`);
        else if (digits.length === 11) setOutput(`${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`);
        else setOutput(digits);
        break;
      case "intl":
        setOutput(`+${digits}`);
        break;
    }
  }, [input, country]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Format" icon={Icon.ArrowRight} onAction={format} />
          {output && <Action title="Copy Formatted" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.Dropdown id="country" title="Country" value={country} onChange={(v) => setCountry(v as typeof country)}>
        <Form.Dropdown.Item value="us" title="US / Canada" />
        <Form.Dropdown.Item value="cn" title="China" />
        <Form.Dropdown.Item value="uk" title="UK" />
        <Form.Dropdown.Item value="jp" title="Japan" />
        <Form.Dropdown.Item value="intl" title="International" />
      </Form.Dropdown>
      <Form.TextField id="input" title="Phone Number" placeholder="1234567890" value={input} onChange={setInput} />
      {output && <Form.TextField id="output" title="Formatted" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
