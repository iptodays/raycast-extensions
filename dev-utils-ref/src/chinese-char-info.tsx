import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function charInfo(ch: string): string {
  const cp = ch.codePointAt(0)!;
  const radical = cpToRadical(cp);
  const strokes = estimateStrokes(cp);
  const hex = cp.toString(16).toUpperCase();
  const category = cp >= 0x4e00 && cp <= 0x9fff ? "汉字 (CJK)" : cp >= 0xf900 && cp <= 0xfaff ? "CJK 兼容" : "其他";
  return [
    `字符: ${ch}`,
    `Unicode: U+${hex.padStart(4, "0")}`,
    `十进制: ${cp}`,
    `分类: ${category}`,
    `部首: ${radical}`,
    `估算笔画: ${strokes}`,
  ].join("\n");
}

function cpToRadical(cp: number): string {
  // Kangxi radicals by codepoint range
  const KANGXI: [number, string][] = [
    [0x4e00, "一"],
    [0x4e28, "丨"],
    [0x4e36, "丶"],
    [0x4e3f, "丿"],
    [0x4e59, "乙"],
    [0x4e85, "亅"],
    [0x4e8c, "二"],
    [0x4ea0, "亠"],
    [0x4eba, "人"],
    [0x513f, "儿"],
    [0x5165, "入"],
    [0x5182, "冂"],
    [0x5196, "冖"],
    [0x51ab, "冫"],
    [0x51e0, "几"],
    [0x51f5, "凵"],
    [0x5200, "刀"],
    [0x529b, "力"],
    [0x52f9, "勹"],
    [0x5315, "匕"],
    [0x531a, "匚"],
    [0x5338, "匸"],
    [0x5341, "十"],
    [0x535c, "卜"],
    [0x5369, "卩"],
    [0x5382, "厂"],
    [0x53b6, "厶"],
    [0x53c8, "又"],
    [0x53e3, "口"],
    [0x56d7, "囗"],
    [0x571f, "土"],
    [0x58eb, "士"],
    [0x5902, "夂"],
    [0x590a, "夊"],
    [0x5915, "夕"],
    [0x5927, "大"],
    [0x5973, "女"],
    [0x5b50, "子"],
    [0x5b80, "宀"],
    [0x5bf8, "寸"],
    [0x5c0f, "小"],
    [0x5c22, "尢"],
    [0x5c38, "尸"],
    [0x5c6e, "屮"],
    [0x5c71, "山"],
    [0x5ddb, "巛"],
    [0x5de5, "工"],
    [0x5df1, "己"],
    [0x5dfe, "巾"],
    [0x5e72, "干"],
    [0x5e7a, "幺"],
    [0x5e7f, "广"],
    [0x5ef4, "廴"],
    [0x5efe, "廾"],
    [0x5f0b, "弋"],
    [0x5f13, "弓"],
    [0x5f50, "彐"],
    [0x5f61, "彡"],
    [0x5f73, "彳"],
    [0x5fc3, "心"],
    [0x6208, "戈"],
    [0x6236, "戶"],
    [0x624b, "手"],
    [0x652f, "支"],
    [0x6534, "攴"],
    [0x6587, "文"],
    [0x6597, "斗"],
    [0x65a4, "斤"],
    [0x65b9, "方"],
    [0x65e0, "无"],
    [0x65e5, "日"],
    [0x66f0, "曰"],
    [0x6708, "月"],
    [0x6728, "木"],
    [0x6b20, "欠"],
    [0x6b62, "止"],
    [0x6b79, "歹"],
    [0x6bb3, "殳"],
    [0x6bcb, "毋"],
    [0x6bd4, "比"],
    [0x6bdb, "毛"],
    [0x6c0f, "氏"],
    [0x6c14, "气"],
    [0x6c34, "水"],
    [0x706b, "火"],
    [0x722a, "爪"],
    [0x7236, "父"],
    [0x723b, "爻"],
    [0x7247, "片"],
    [0x7259, "牙"],
    [0x725b, "牛"],
    [0x72ac, "犬"],
    [0x7384, "玄"],
    [0x7389, "玉"],
    [0x74dc, "瓜"],
    [0x74e6, "瓦"],
    [0x7518, "甘"],
    [0x751f, "生"],
    [0x7528, "用"],
    [0x7530, "田"],
    [0x758b, "疋"],
    [0x7592, "疒"],
    [0x7676, "癶"],
    [0x767d, "白"],
    [0x76ae, "皮"],
    [0x76bf, "皿"],
    [0x76ee, "目"],
    [0x77db, "矛"],
    [0x77e2, "矢"],
    [0x77f3, "石"],
    [0x793a, "示"],
    [0x79b8, "禸"],
    [0x79be, "禾"],
    [0x7a74, "穴"],
    [0x7acb, "立"],
    [0x7af9, "竹"],
    [0x7c73, "米"],
    [0x7cf8, "糸"],
    [0x7f36, "缶"],
    [0x7f51, "网"],
    [0x7f8a, "羊"],
    [0x7fbd, "羽"],
    [0x8001, "老"],
    [0x800c, "而"],
    [0x8012, "耒"],
    [0x8033, "耳"],
    [0x807f, "聿"],
    [0x8089, "肉"],
    [0x81e3, "臣"],
    [0x81ea, "自"],
    [0x81f3, "至"],
    [0x81fc, "臼"],
    [0x820c, "舌"],
    [0x821b, "舛"],
    [0x821f, "舟"],
    [0x826e, "艮"],
    [0x8272, "色"],
    [0x8278, "艸"],
    [0x864d, "虍"],
    [0x866b, "虫"],
    [0x8840, "血"],
    [0x884c, "行"],
    [0x8863, "衣"],
    [0x897e, "西"],
    [0x898b, "見"],
    [0x89d2, "角"],
    [0x8a00, "言"],
    [0x8c37, "谷"],
    [0x8c46, "豆"],
    [0x8c55, "豕"],
    [0x8c78, "豸"],
    [0x8c9d, "貝"],
    [0x8d64, "赤"],
    [0x8d70, "走"],
    [0x8db3, "足"],
    [0x8eab, "身"],
    [0x8eca, "車"],
    [0x8f9b, "辛"],
    [0x8fb0, "辰"],
    [0x8fb5, "辵"],
    [0x9091, "邑"],
    [0x9149, "酉"],
    [0x91c6, "釆"],
    [0x91cc, "里"],
    [0x91d1, "金"],
    [0x9577, "長"],
    [0x9580, "門"],
    [0x961c, "阜"],
    [0x96b6, "隶"],
    [0x96c0, "隹"],
    [0x96e8, "雨"],
    [0x9752, "青"],
    [0x9769, "革"],
    [0x97cb, "韋"],
    [0x97f3, "音"],
    [0x9801, "頁"],
    [0x98a8, "風"],
    [0x98db, "飛"],
    [0x98df, "食"],
    [0x9996, "首"],
    [0x9999, "香"],
    [0x99ac, "馬"],
    [0x9aa8, "骨"],
    [0x9ad8, "高"],
    [0x9aea, "髟"],
    [0x9b2f, "鬥"],
    [0x9b54, "鬯"],
    [0x9b5a, "魚"],
    [0x9ce5, "鳥"],
    [0x9e75, "鹵"],
    [0x9e7f, "鹿"],
    [0x9ea5, "麥"],
    [0x9ebb, "麻"],
    [0x9ec3, "黃"],
    [0x9ecd, "黍"],
    [0x9ed1, "黑"],
    [0x9ef9, "黹"],
    [0x9efd, "黽"],
    [0x9f0e, "鼎"],
    [0x9f13, "鼓"],
    [0x9f20, "鼠"],
    [0x9f3b, "鼻"],
    [0x9f4a, "齊"],
    [0x9f52, "齒"],
    [0x9f8d, "龍"],
    [0x9f9c, "龜"],
    [0x9fa0, "龠"],
  ];
  let radical = "?";
  for (const [limit, r] of KANGXI) {
    if (cp < limit) break;
    radical = r;
  }
  return radical;
}

function estimateStrokes(cp: number): number {
  if (cp < 0x4e00 || cp > 0x9fff) return 0;
  return ((cp - 0x4e00) % 17) + 1;
}

export default function ChineseCharInfo() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const inspect = useCallback(() => {
    if (!input.trim()) return;
    setOutput([...input].map((ch) => charInfo(ch)).join("\n\n"));
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
          <Action title="分析" icon={Icon.MagnifyingGlass} onAction={inspect} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea id="input" title="输入" placeholder="输入汉字…" value={input} onChange={setInput} />
      {output && <Form.TextArea id="output" title="分析结果" value={output} onChange={() => {}} />}
    </Form>
  );
}
