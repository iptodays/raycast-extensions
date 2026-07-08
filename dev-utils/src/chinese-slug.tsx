import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const PINYIN_MAP: Record<string, string> = {
  啊: "a", 阿: "a", 爱: "ai", 安: "an", 按: "an", 暗: "an",
  八: "ba", 巴: "ba", 把: "ba", 白: "bai", 百: "bai", 班: "ban",
  半: "ban", 办: "ban", 帮: "bang", 包: "bao", 保: "bao", 报: "bao",
  杯: "bei", 北: "bei", 被: "bei", 本: "ben", 比: "bi", 笔: "bi",
  边: "bian", 变: "bian", 表: "biao", 别: "bie", 冰: "bing", 并: "bing",
  不: "bu", 步: "bu", 部: "bu", 才: "cai", 菜: "cai", 参: "can",
  草: "cao", 策: "ce", 层: "ceng", 查: "cha", 差: "cha", 产: "chan",
  长: "chang", 常: "chang", 场: "chang", 唱: "chang", 超: "chao", 车: "che",
  陈: "chen", 称: "cheng", 成: "cheng", 城: "cheng", 程: "cheng", 吃: "chi",
  持: "chi", 出: "chu", 初: "chu", 除: "chu", 处: "chu", 穿: "chuan",
  传: "chuan", 窗: "chuang", 创: "chuang", 春: "chun", 词: "ci", 此: "ci",
  次: "ci", 从: "cong", 错: "cuo", 打: "da", 大: "da", 代: "dai",
  带: "dai", 单: "dan", 但: "dan", 当: "dang", 刀: "dao", 到: "dao",
  道: "dao", 得: "de", 的: "de", 灯: "deng", 等: "deng", 地: "di",
  第: "di", 点: "dian", 电: "dian", 店: "dian", 定: "ding", 东: "dong",
  冬: "dong", 懂: "dong", 动: "dong", 都: "dou", 读: "du", 度: "du",
  短: "duan", 段: "duan", 对: "dui", 队: "dui", 多: "duo", 儿: "er",
  而: "er", 二: "er", 发: "fa", 法: "fa", 翻: "fan", 反: "fan",
  饭: "fan", 方: "fang", 房: "fang", 放: "fang", 飞: "fei", 非: "fei",
  分: "fen", 丰: "feng", 风: "feng", 否: "fou", 服: "fu", 福: "fu",
  父: "fu", 复: "fu", 该: "gai", 改: "gai", 干: "gan", 感: "gan",
  刚: "gang", 高: "gao", 告: "gao", 歌: "ge", 个: "ge", 各: "ge",
  给: "gei", 根: "gen", 更: "geng", 工: "gong", 公: "gong", 共: "gong",
  狗: "gou", 古: "gu", 故: "gu", 关: "guan", 观: "guan", 管: "guan",
  光: "guang", 广: "guang", 规: "gui", 贵: "gui", 国: "guo", 果: "guo",
  过: "guo", 海: "hai", 害: "hai", 好: "hao", 号: "hao",
  喝: "he", 和: "he", 河: "he", 黑: "hei", 很: "hen", 红: "hong",
  后: "hou", 呼: "hu", 湖: "hu", 互: "hu", 花: "hua", 华: "hua",
  化: "hua", 画: "hua", 话: "hua", 坏: "huai", 还: "huan", 换: "huan",
  黄: "huang", 回: "hui", 会: "hui", 活: "huo", 火: "huo", 或: "huo",
  机: "ji", 基: "ji", 及: "ji", 级: "ji", 几: "ji", 己: "ji",
  计: "ji", 记: "ji", 技: "ji", 季: "ji", 加: "jia", 家: "jia",
  价: "jia", 间: "jian", 见: "jian", 建: "jian", 将: "jiang", 讲: "jiang",
  交: "jiao", 叫: "jiao", 接: "jie", 节: "jie", 结: "jie", 解: "jie",
  介: "jie", 今: "jin", 金: "jin", 近: "jin", 进: "jin", 京: "jing",
  经: "jing", 精: "jing", 警: "jing", 九: "jiu", 酒: "jiu", 就: "jiu",
  居: "ju", 局: "ju", 具: "ju", 据: "ju", 决: "jue", 军: "jun",
  开: "kai", 看: "kan", 康: "kang", 考: "kao", 科: "ke", 可: "ke",
  客: "ke", 课: "ke", 空: "kong", 口: "kou", 苦: "ku", 快: "kuai",
  宽: "kuan", 来: "lai", 蓝: "lan", 老: "lao", 了: "le", 类: "lei",
  冷: "leng", 离: "li", 理: "li", 力: "li", 立: "li", 例: "li",
  连: "lian", 联: "lian", 脸: "lian", 练: "lian", 良: "liang", 两: "liang",
  量: "liang", 林: "lin", 零: "ling", 领: "ling", 流: "liu",
  六: "liu", 龙: "long", 楼: "lou", 路: "lu", 旅: "lv", 绿: "lv",
  乱: "luan", 论: "lun", 落: "luo", 妈: "ma", 马: "ma", 吗: "ma",
  买: "mai", 卖: "mai", 满: "man", 慢: "man", 忙: "mang", 毛: "mao",
  么: "me", 没: "mei", 每: "mei", 美: "mei", 门: "men", 们: "men",
  梦: "meng", 密: "mi", 面: "mian", 民: "min", 名: "ming", 明: "ming",
  命: "ming", 目: "mu", 拿: "na", 那: "na", 男: "nan", 南: "nan",
  难: "nan", 脑: "nao", 呢: "ne", 内: "nei", 能: "neng", 你: "ni",
  年: "nian", 念: "nian", 您: "nin", 牛: "niu", 农: "nong", 努: "nu",
  女: "nv", 暖: "nuan", 欧: "ou", 怕: "pa", 排: "pai", 朋: "peng",
  皮: "pi", 片: "pian", 票: "piao", 品: "pin", 平: "ping", 破: "po",
  七: "qi", 期: "qi", 其: "qi", 起: "qi", 气: "qi", 千: "qian",
  前: "qian", 钱: "qian", 强: "qiang", 切: "qie", 亲: "qin", 青: "qing",
  清: "qing", 情: "qing", 请: "qing", 球: "qiu", 区: "qu", 去: "qu",
  全: "quan", 确: "que", 群: "qun", 然: "ran", 让: "rang", 热: "re",
  人: "ren", 任: "ren", 认: "ren", 日: "ri", 容: "rong", 如: "ru",
  入: "ru", 三: "san", 色: "se", 山: "shan", 商: "shang", 上: "shang",
  少: "shao", 社: "she", 深: "shen", 什: "shen", 生: "sheng", 声: "sheng",
  师: "shi", 十: "shi", 时: "shi", 识: "shi", 实: "shi", 史: "shi",
  是: "shi", 市: "shi", 事: "shi", 收: "shou", 手: "shou", 书: "shu",
  数: "shu", 树: "shu", 双: "shuang", 水: "shui", 说: "shuo", 思: "si",
  四: "si", 送: "song", 算: "suan", 虽: "sui", 岁: "sui", 所: "suo",
  他: "ta", 她: "ta", 它: "ta", 台: "tai", 太: "tai", 谈: "tan",
  特: "te", 提: "ti", 题: "ti", 体: "ti", 天: "tian", 条: "tiao",
  听: "ting", 停: "ting", 通: "tong", 同: "tong", 头: "tou", 图: "tu",
  团: "tuan", 推: "tui", 外: "wai", 完: "wan", 玩: "wan", 晚: "wan",
  万: "wan", 王: "wang", 往: "wang", 网: "wang", 忘: "wang", 为: "wei",
  围: "wei", 伟: "wei", 卫: "wei", 未: "wei", 位: "wei", 文: "wen",
  问: "wen", 我: "wo", 无: "wu", 五: "wu", 武: "wu", 物: "wu",
  西: "xi", 习: "xi", 喜: "xi", 系: "xi", 细: "xi", 下: "xia",
  先: "xian", 现: "xian", 线: "xian", 相: "xiang", 香: "xiang", 想: "xiang",
  向: "xiang", 消: "xiao", 小: "xiao", 校: "xiao", 些: "xie", 写: "xie",
  谢: "xie", 新: "xin", 心: "xin", 信: "xin", 星: "xing", 行: "xing",
  形: "xing", 性: "xing", 需: "xu", 许: "xu", 选: "xuan", 学: "xue",
  雪: "xue", 训: "xun", 压: "ya", 言: "yan", 研: "yan", 眼: "yan",
  样: "yang", 要: "yao", 也: "ye", 业: "ye", 一: "yi", 衣: "yi",
  已: "yi", 以: "yi", 意: "yi", 因: "yin", 音: "yin", 银: "yin",
  应: "ying", 英: "ying", 影: "ying", 用: "yong", 由: "you", 有: "you",
  又: "you", 鱼: "yu", 与: "yu", 语: "yu", 雨: "yu", 元: "yuan",
  原: "yuan", 远: "yuan", 月: "yue", 越: "yue", 云: "yun", 运: "yun",
  在: "zai", 再: "zai", 早: "zao", 则: "ze", 怎: "zen", 展: "zhan",
  战: "zhan", 站: "zhan", 张: "zhang", 找: "zhao", 照: "zhao",
  者: "zhe", 这: "zhe", 真: "zhen", 争: "zheng", 整: "zheng", 正: "zheng",
  政: "zheng", 之: "zhi", 知: "zhi", 直: "zhi", 只: "zhi", 指: "zhi",
  至: "zhi", 制: "zhi", 中: "zhong", 种: "zhong", 重: "zhong", 州: "zhou",
  周: "zhou", 主: "zhu", 助: "zhu", 住: "zhu", 注: "zhu", 转: "zhuan",
  装: "zhuang", 准: "zhun", 着: "zhe", 资: "zi", 子: "zi", 字: "zi",
  自: "zi", 总: "zong", 走: "zou", 组: "zu", 最: "zui", 昨: "zuo",
  做: "zuo", 作: "zuo", 坐: "zuo",
};

function toSlug(text: string): string {
  return [...text]
    .map((ch) => PINYIN_MAP[ch] || ch)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ChineseSlug() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const generate = useCallback(() => {
    setOutput(toSlug(input));
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
          <Action title="生成拼音 Slug" icon={Icon.ArrowRight} onAction={generate} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea id="input" title="中文文本" placeholder="请输入中文标题…" value={input} onChange={setInput} />
      {output && <Form.TextField id="output" title="拼音 Slug" value={output} onChange={() => {}} />}
    </Form>
  );
}
