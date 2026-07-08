import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] = a[i - 1] === b[j - 1]
        ? dp[i - 1]![j - 1]!
        : 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!);
    }
  }
  return dp[m]![n]!;
}

function similarity(a: string, b: string): number {
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 1 : 1 - dist / maxLen;
}

export default function LevenshteinTool() {
  const [str1, setStr1] = useState("");
  const [str2, setStr2] = useState("");
  const [output, setOutput] = useState("");

  const calculate = useCallback(() => {
    if (!str1.trim() || !str2.trim()) {
      showToast(Toast.Style.Failure, "Please enter both strings");
      return;
    }
    const dist = levenshtein(str1, str2);
    const sim = similarity(str1, str2);
    setOutput(
      [
        `Distance: ${dist}`,
        `Similarity: ${(sim * 100).toFixed(1)}%`,
        `Longer string: ${Math.max(str1.length, str2.length)} chars`,
      ].join("\n")
    );
  }, [str1, str2]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Calculate" icon={Icon.ArrowRight} onAction={calculate} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextField id="str1" title="String 1" placeholder="kitten" value={str1} onChange={setStr1} />
      <Form.TextField id="str2" title="String 2" placeholder="sitting" value={str2} onChange={setStr2} />
      {output && <Form.TextArea id="output" title="Result" value={output} onChange={() => {}} />}
    </Form>
  );
}
