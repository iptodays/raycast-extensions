import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const SEG_DICT = [
  "我们",
  "他们",
  "你们",
  "什么",
  "怎么",
  "为什么",
  "因为",
  "所以",
  "可以",
  "可能",
  "应该",
  "必须",
  "需要",
  "虽然",
  "但是",
  "如果",
  "问题",
  "解决",
  "方法",
  "方案",
  "系统",
  "服务",
  "提供",
  "支持",
  "开发",
  "设计",
  "实现",
  "使用",
  "通过",
  "进行",
  "完成",
  "开始",
  "信息",
  "数据",
  "用户",
  "管理",
  "技术",
  "应用",
  "环境",
  "安全",
  "简单",
  "复杂",
  "重要",
  "基本",
  "主要",
  "一般",
  "特别",
  "非常",
  "人",
  "是",
  "的",
  "一",
  "不",
  "了",
  "在",
  "有",
  "个",
  "上",
  "这",
  "大",
  "就",
  "也",
  "到",
  "说",
  "要",
  "去",
  "你",
  "会",
  "着",
  "没",
  "看",
  "好",
  "自",
  "过",
  "做",
  "对",
  "她",
  "还",
  "他",
  "之",
  "与",
  "把",
  "能",
  "来",
  "多",
  "让",
  "得",
  "那",
  "新",
  "下",
  "为",
  "可",
  "出",
  "和",
  "年",
  "时",
  "而",
  "生",
  "前",
  "中",
  "所",
  "用",
  "小",
  "天",
  "然",
  "们",
  "很",
  "些",
  "都",
  "经",
  "想",
  "己",
  "又",
  "并",
  "成",
  "子",
  "种",
  "间",
  "里",
  "从",
  "以",
  "后",
  "道",
  "如",
  "它",
  "公",
  "全",
  "心",
].sort((a, b) => b.length - a.length);

function segment(text: string): string {
  let remaining = text;
  const words: string[] = [];
  while (remaining.length) {
    let found = false;
    for (const word of SEG_DICT) {
      if (remaining.startsWith(word)) {
        words.push(word);
        remaining = remaining.slice(word.length);
        found = true;
        break;
      }
    }
    if (!found) {
      words.push(remaining[0]!);
      remaining = remaining.slice(1);
    }
  }
  return words.join(" | ");
}

export default function ChineseSegment() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const doSegment = useCallback(() => {
    setOutput(segment(input));
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
          <Action title="分词" icon={Icon.ArrowRight} onAction={doSegment} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea id="input" title="文本" placeholder="请输入中文文本进行分词…" value={input} onChange={setInput} />
      {output && <Form.TextArea id="output" title="分词结果" value={output} onChange={() => {}} />}
    </Form>
  );
}
