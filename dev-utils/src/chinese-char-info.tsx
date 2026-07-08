import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function charInfo(ch: string): string {
  const cp = ch.codePointAt(0)!;
  const radical = cpToRadical(cp);
  const strokes = estimateStrokes(cp);
  const hex = cp.toString(16).toUpperCase();
  const category = cp >= 0x4E00 && cp <= 0x9FFF ? "汉字 (CJK)" :
    cp >= 0xF900 && cp <= 0xFAFF ? "CJK 兼容" : "其他";
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
    [0x4E00, "一"], [0x4E28, "丨"], [0x4E36, "丶"], [0x4E3F, "丿"],
    [0x4E59, "乙"], [0x4E85, "亅"], [0x4E8C, "二"], [0x4EA0, "亠"],
    [0x4EBA, "人"], [0x513F, "儿"], [0x5165, "入"], [0x5182, "冂"],
    [0x5196, "冖"], [0x51AB, "冫"], [0x51E0, "几"], [0x51F5, "凵"],
    [0x5200, "刀"], [0x529B, "力"], [0x52F9, "勹"], [0x5315, "匕"],
    [0x531A, "匚"], [0x5338, "匸"], [0x5341, "十"], [0x535C, "卜"],
    [0x5369, "卩"], [0x5382, "厂"], [0x53B6, "厶"], [0x53C8, "又"],
    [0x53E3, "口"], [0x56D7, "囗"], [0x571F, "土"], [0x58EB, "士"],
    [0x5902, "夂"], [0x590A, "夊"], [0x5915, "夕"], [0x5927, "大"],
    [0x5973, "女"], [0x5B50, "子"], [0x5B80, "宀"], [0x5BF8, "寸"],
    [0x5C0F, "小"], [0x5C22, "尢"], [0x5C38, "尸"], [0x5C6E, "屮"],
    [0x5C71, "山"], [0x5DDB, "巛"], [0x5DE5, "工"], [0x5DF1, "己"],
    [0x5DFE, "巾"], [0x5E72, "干"], [0x5E7A, "幺"], [0x5E7F, "广"],
    [0x5EF4, "廴"], [0x5EFE, "廾"], [0x5F0B, "弋"], [0x5F13, "弓"],
    [0x5F50, "彐"], [0x5F61, "彡"], [0x5F73, "彳"], [0x5FC3, "心"],
    [0x6208, "戈"], [0x6236, "戶"], [0x624B, "手"], [0x652F, "支"],
    [0x6534, "攴"], [0x6587, "文"], [0x6597, "斗"], [0x65A4, "斤"],
    [0x65B9, "方"], [0x65E0, "无"], [0x65E5, "日"], [0x66F0, "曰"],
    [0x6708, "月"], [0x6728, "木"], [0x6B20, "欠"], [0x6B62, "止"],
    [0x6B79, "歹"], [0x6BB3, "殳"], [0x6BCB, "毋"], [0x6BD4, "比"],
    [0x6BDB, "毛"], [0x6C0F, "氏"], [0x6C14, "气"], [0x6C34, "水"],
    [0x706B, "火"], [0x722A, "爪"], [0x7236, "父"], [0x723B, "爻"],
    [0x7247, "片"], [0x7259, "牙"], [0x725B, "牛"], [0x72AC, "犬"],
    [0x7384, "玄"], [0x7389, "玉"], [0x74DC, "瓜"], [0x74E6, "瓦"],
    [0x7518, "甘"], [0x751F, "生"], [0x7528, "用"], [0x7530, "田"],
    [0x758B, "疋"], [0x7592, "疒"], [0x7676, "癶"], [0x767D, "白"],
    [0x76AE, "皮"], [0x76BF, "皿"], [0x76EE, "目"], [0x77DB, "矛"],
    [0x77E2, "矢"], [0x77F3, "石"], [0x793A, "示"], [0x79B8, "禸"],
    [0x79BE, "禾"], [0x7A74, "穴"], [0x7ACB, "立"], [0x7AF9, "竹"],
    [0x7C73, "米"], [0x7CF8, "糸"], [0x7F36, "缶"], [0x7F51, "网"],
    [0x7F8A, "羊"], [0x7FBD, "羽"], [0x8001, "老"], [0x800C, "而"],
    [0x8012, "耒"], [0x8033, "耳"], [0x807F, "聿"], [0x8089, "肉"],
    [0x81E3, "臣"], [0x81EA, "自"], [0x81F3, "至"], [0x81FC, "臼"],
    [0x820C, "舌"], [0x821B, "舛"], [0x821F, "舟"], [0x826E, "艮"],
    [0x8272, "色"], [0x8278, "艸"], [0x864D, "虍"], [0x866B, "虫"],
    [0x8840, "血"], [0x884C, "行"], [0x8863, "衣"], [0x897E, "西"],
    [0x898B, "見"], [0x89D2, "角"], [0x8A00, "言"], [0x8C37, "谷"],
    [0x8C46, "豆"], [0x8C55, "豕"], [0x8C78, "豸"], [0x8C9D, "貝"],
    [0x8D64, "赤"], [0x8D70, "走"], [0x8DB3, "足"], [0x8EAB, "身"],
    [0x8ECA, "車"], [0x8F9B, "辛"], [0x8FB0, "辰"], [0x8FB5, "辵"],
    [0x9091, "邑"], [0x9149, "酉"], [0x91C6, "釆"], [0x91CC, "里"],
    [0x91D1, "金"], [0x9577, "長"], [0x9580, "門"], [0x961C, "阜"],
    [0x96B6, "隶"], [0x96C0, "隹"], [0x96E8, "雨"], [0x9752, "青"],
    [0x9769, "革"], [0x97CB, "韋"], [0x97F3, "音"], [0x9801, "頁"],
    [0x98A8, "風"], [0x98DB, "飛"], [0x98DF, "食"], [0x9996, "首"],
    [0x9999, "香"], [0x99AC, "馬"], [0x9AA8, "骨"], [0x9AD8, "高"],
    [0x9AEA, "髟"], [0x9B2F, "鬥"], [0x9B54, "鬯"], [0x9B5A, "魚"],
    [0x9CE5, "鳥"], [0x9E75, "鹵"], [0x9E7F, "鹿"], [0x9EA5, "麥"],
    [0x9EBB, "麻"], [0x9EC3, "黃"], [0x9ECD, "黍"], [0x9ED1, "黑"],
    [0x9EF9, "黹"], [0x9EFD, "黽"], [0x9F0E, "鼎"], [0x9F13, "鼓"],
    [0x9F20, "鼠"], [0x9F3B, "鼻"], [0x9F4A, "齊"], [0x9F52, "齒"],
    [0x9F8D, "龍"], [0x9F9C, "龜"], [0x9FA0, "龠"],
  ];
  let radical = "?";
  for (const [limit, r] of KANGXI) {
    if (cp < limit) break;
    radical = r;
  }
  return radical;
}

function estimateStrokes(cp: number): number {
  if (cp < 0x4E00 || cp > 0x9FFF) return 0;
  return ((cp - 0x4E00) % 17) + 1;
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
