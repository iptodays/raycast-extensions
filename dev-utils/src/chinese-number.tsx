import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const CN_NUM = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const CN_UNIT = ["", "十", "百", "千", "万", "亿", "兆"];
const CN_BIG = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
const CN_BIG_UNIT = ["", "拾", "佰", "仟", "万", "亿", "兆"];

function numberToChinese(num: number, big: boolean): string {
  if (num === 0) return big ? "零" : "零";
  const digits = String(Math.floor(num)).split("").reverse().map(Number);
  const nums = big ? CN_BIG : CN_NUM;
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i++) {
    const d = digits[i]!;
    if (d === 0) {
      if (parts.length && parts[parts.length - 1] !== nums[0]) parts.push(nums[0]!);
      continue;
    }
    const unit = CN_UNIT[i] || "";
    parts.push(unit + nums[d]!);
  }
  return parts.reverse().join("").replace(/^一十/, "十");
}

function chineseToNumber(text: string): number {
  const map: Record<string, number> = { 零: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9,
    十: 10, 百: 100, 千: 1000, 万: 10000, 亿: 100000000 };
  let total = 0;
  let section = 0;
  for (const ch of text) {
    const val = map[ch] ?? 0;
    if (val >= 10) { section = (section || 1) * val; total += section; section = 0; }
    else { section = val; }
  }
  return total + section;
}

export default function ChineseNumber() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [direction, setDirection] = useState<"num2cn" | "cn2num">("num2cn");
  const [big, setBig] = useState(false);
  const [error, setError] = useState("");

  const convert = useCallback(() => {
    if (!input.trim()) { setError("请输入数值或中文数字"); return; }
    setError("");
    if (direction === "num2cn") {
      const num = parseFloat(input);
      if (isNaN(num)) { setError("请输入有效的数字"); return; }
      setOutput(numberToChinese(num, big));
    } else {
      const num = chineseToNumber(input);
      if (isNaN(num)) { setError("请输入有效的中文数字"); return; }
      setOutput(String(num));
    }
  }, [input, direction, big]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="转换" icon={Icon.ArrowRight} onAction={convert} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.Dropdown id="direction" title="方向" value={direction} onChange={(v) => setDirection(v as "num2cn" | "cn2num")}>
        <Form.Dropdown.Item value="num2cn" title="数字 → 中文" />
        <Form.Dropdown.Item value="cn2num" title="中文 → 数字" />
      </Form.Dropdown>
      {direction === "num2cn" && (
        <Form.Checkbox id="big" label="大写 (壹贰叁)" value={big} onChange={setBig} />
      )}
      <Form.TextField id="input" title="输入" placeholder="12345 或 一万二千三百四十五" value={input} onChange={setInput} />
      {output && <Form.TextField id="output" title="输出" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
