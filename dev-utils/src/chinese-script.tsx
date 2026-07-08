import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const S2T: Record<string, string> = {
  国: "國", 学: "學", 习: "習", 书: "書", 电: "電", 话: "話", 长: "長", 张: "張", 马: "馬",
  门: "門", 问: "問", 开: "開", 关: "關", 东: "東", 车: "車", 亚: "亞", 识: "識", 让: "讓",
  认: "認", 计: "計", 记: "記", 议: "議", 论: "論", 说: "說", 读: "讀", 谁: "誰", 谢: "謝",
  语: "語", 误: "誤", 调: "調", 谈: "談", 证: "證", 译: "譯", 试: "試", 课: "課", 该: "該",
  详: "詳", 变: "變", 只: "隻", 体: "體", 价: "價", 亿: "億", 元: "圓", 儿: "兒", 党: "黨",
  风: "風", 飞: "飛", 馆: "館", 饿: "餓", 饮: "飲", 饺: "餃",
  发: "發", 头: "頭", 难: "難", 华: "華", 万: "萬", 严: "嚴", 丽: "麗", 两: "兩",
  个: "個", 么: "麼", 后: "後", 会: "會", 从: "從", 对: "對", 动: "動", 号: "號",
  处: "處", 复: "復", 声: "聲", 应: "應", 实: "實", 广: "廣", 厂: "廠", 历: "曆",
  压: "壓", 还: "還", 进: "進", 远: "遠", 连: "連", 选: "選", 过: "過", 达: "達",
  尔: "爾", 当: "當", 岁: "歲", 师: "師", 业: "業", 乐: "樂", 产: "産", 义: "義",
  区: "區", 医: "醫", 旧: "舊", 龙: "龍", 龟: "龜", 鸟: "鳥", 鱼: "魚",
  "无": "無", "为": "為", "专": "專", "与": "與", "来": "來", "时": "時", "现": "現",
  "见": "見", "觉": "覺", "数": "數", "爱": "愛", "亲": "親", "办": "辦", "务": "務",
};

const T2S: Record<string, string> = {};
for (const [k, v] of Object.entries(S2T)) T2S[v] = k;

export default function ChineseScript() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [direction, setDirection] = useState<"s2t" | "t2s">("s2t");

  const convert = useCallback(() => {
    const map = direction === "s2t" ? S2T : T2S;
    setOutput([...input].map((ch) => map[ch] || ch).join(""));
  }, [input, direction]);

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
      <Form.Dropdown id="direction" title="方向" value={direction} onChange={(v) => setDirection(v as "s2t" | "t2s")}>
        <Form.Dropdown.Item value="s2t" title="简体 → 繁體" />
        <Form.Dropdown.Item value="t2s" title="繁體 → 简体" />
      </Form.Dropdown>
      <Form.TextArea id="input" title="输入" placeholder="请输入中文文本…" value={input} onChange={setInput} />
      {output && <Form.TextArea id="output" title="输出" value={output} onChange={() => {}} />}
    </Form>
  );
}
