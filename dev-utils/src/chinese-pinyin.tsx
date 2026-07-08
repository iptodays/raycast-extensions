import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const PINYIN_MAP: Record<string, string> = {
  啊: "ā", 阿: "ā", 埃: "āi", 挨: "āi", 哎: "āi", 哀: "āi", 癌: "ái", 矮: "ǎi", 爱: "ài", 碍: "ài",
  安: "ān", 按: "àn", 暗: "àn", 岸: "àn", 案: "àn", 昂: "áng", 凹: "āo", 熬: "áo", 袄: "ǎo", 傲: "ào",
  八: "bā", 巴: "bā", 拔: "bá", 把: "bǎ", 坝: "bà", 吧: "ba", 白: "bái", 百: "bǎi", 败: "bài", 班: "bān",
  般: "bān", 板: "bǎn", 半: "bàn", 办: "bàn", 帮: "bāng", 包: "bāo", 薄: "báo", 保: "bǎo", 报: "bào", 爆: "bào",
  杯: "bēi", 北: "běi", 被: "bèi", 备: "bèi", 本: "běn", 笨: "bèn", 逼: "bī", 鼻: "bí", 比: "bǐ", 笔: "bǐ",
  币: "bì", 必: "bì", 避: "bì", 边: "biān", 编: "biān", 变: "biàn", 便: "biàn", 遍: "biàn", 标: "biāo", 表: "biǎo",
  别: "bié", 宾: "bīn", 冰: "bīng", 兵: "bīng", 饼: "bǐng", 并: "bìng", 病: "bìng", 波: "bō", 播: "bō", 博: "bó",
  不: "bù", 步: "bù", 部: "bù", 布: "bù", 擦: "cā", 猜: "cāi", 才: "cái", 材: "cái", 采: "cǎi", 彩: "cǎi",
  菜: "cài", 参: "cān", 餐: "cān", 残: "cán", 仓: "cāng", 藏: "cáng", 操: "cāo", 草: "cǎo", 策: "cè", 测: "cè",
  层: "céng", 曾: "céng", 查: "chá", 察: "chá", 差: "chà", 产: "chǎn", 长: "cháng", 常: "cháng", 场: "chǎng", 唱: "chàng",
  超: "chāo", 朝: "cháo", 潮: "cháo", 车: "chē", 彻: "chè", 陈: "chén", 称: "chēng", 成: "chéng", 城: "chéng", 程: "chéng",
  吃: "chī", 持: "chí", 尺: "chǐ", 斥: "chì", 充: "chōng", 虫: "chóng", 抽: "chōu", 愁: "chóu", 丑: "chǒu", 出: "chū",
  初: "chū", 除: "chú", 处: "chù", 触: "chù", 穿: "chuān", 传: "chuán", 船: "chuán", 窗: "chuāng", 床: "chuáng", 创: "chuàng",
  吹: "chuī", 春: "chūn", 纯: "chún", 词: "cí", 磁: "cí", 此: "cǐ", 次: "cì", 从: "cóng", 粗: "cū", 存: "cún", 寸: "cùn", 错: "cuò",
  打: "dǎ", 大: "dà", 代: "dài", 带: "dài", 待: "dài", 单: "dān", 但: "dàn", 蛋: "dàn", 当: "dāng", 党: "dǎng",
  挡: "dǎng", 刀: "dāo", 导: "dǎo", 到: "dào", 道: "dào", 得: "dé", 德: "dé", 灯: "dēng", 等: "děng", 低: "dī",
  敌: "dí", 底: "dǐ", 地: "dì", 第: "dì", 点: "diǎn", 电: "diàn", 店: "diàn", 定: "dìng",
  丢: "diū", 东: "dōng", 冬: "dōng", 懂: "dǒng", 动: "dòng", 都: "dōu", 读: "dú", 肚: "dù", 度: "dù", 端: "duān",
  短: "duǎn", 段: "duàn", 断: "duàn", 对: "duì", 队: "duì", 吨: "dūn", 多: "duō", 夺: "duó", 朵: "duǒ", 饿: "è",
  儿: "ér", 而: "ér", 尔: "ěr", 二: "èr", 发: "fā", 罚: "fá", 法: "fǎ", 翻: "fān", 烦: "fán", 反: "fǎn",
  饭: "fàn", 方: "fāng", 防: "fáng", 房: "fáng", 访: "fǎng", 放: "fàng", 飞: "fēi", 非: "fēi", 肥: "féi", 费: "fèi",
  分: "fēn", 份: "fèn", 丰: "fēng", 风: "fēng", 封: "fēng", 否: "fǒu", 夫: "fū", 服: "fú", 福: "fú", 府: "fǔ",
  父: "fù", 负: "fù", 复: "fù", 傅: "fù", 富: "fù", 改: "gǎi", 概: "gài", 干: "gān", 感: "gǎn", 赶: "gǎn",
  刚: "gāng", 钢: "gāng", 港: "gǎng", 高: "gāo", 搞: "gǎo", 告: "gào", 哥: "gē", 歌: "gē", 革: "gé", 格: "gé",
  个: "gè", 各: "gè", 给: "gěi", 根: "gēn", 跟: "gēn", 更: "gèng", 工: "gōng", 公: "gōng", 功: "gōng", 共: "gòng",
  狗: "gǒu", 够: "gòu", 姑: "gū", 古: "gǔ", 股: "gǔ", 故: "gù", 顾: "gù", 刮: "guā", 挂: "guà", 怪: "guài",
  关: "guān", 观: "guān", 官: "guān", 管: "guǎn", 馆: "guǎn", 惯: "guàn", 光: "guāng", 广: "guǎng", 规: "guī", 鬼: "guǐ",
  贵: "guì", 滚: "gǔn", 锅: "guō", 国: "guó", 果: "guǒ", 过: "guò", 哈: "hā", 孩: "hái", 海: "hǎi",
  害: "hài", 寒: "hán", 含: "hán", 喊: "hǎn", 汉: "hàn", 航: "háng", 好: "hǎo", 号: "hào", 喝: "hē",
  合: "hé", 何: "hé", 和: "hé", 河: "hé", 核: "hé", 黑: "hēi", 很: "hěn", 恨: "hèn", 恒: "héng", 红: "hóng",
  后: "hòu", 厚: "hòu", 呼: "hū", 忽: "hū", 湖: "hú", 虎: "hǔ", 互: "hù", 户: "hù", 护: "hù", 花: "huā",
  华: "huá", 滑: "huá", 化: "huà", 画: "huà", 话: "huà", 坏: "huài", 欢: "huān", 环: "huán", 换: "huàn",
  黄: "huáng", 回: "huí", 会: "huì", 汇: "huì", 活: "huó", 火: "huǒ", 或: "huò", 货: "huò", 获: "huò", 机: "jī",
  鸡: "jī", 基: "jī", 及: "jí", 级: "jí", 极: "jí", 即: "jí", 集: "jí", 几: "jǐ", 己: "jǐ", 计: "jì",
  记: "jì", 技: "jì", 季: "jì", 济: "jì", 既: "jì", 继: "jì", 加: "jiā", 家: "jiā", 甲: "jiǎ", 假: "jiǎ",
  价: "jià", 架: "jià", 坚: "jiān", 间: "jiān", 检: "jiǎn", 简: "jiǎn", 见: "jiàn", 件: "jiàn", 建: "jiàn", 健: "jiàn",
  将: "jiāng", 江: "jiāng", 讲: "jiǎng", 降: "jiàng", 交: "jiāo", 教: "jiāo", 角: "jiǎo", 脚: "jiǎo", 叫: "jiào", 较: "jiào",
  接: "jiē", 街: "jiē", 节: "jié", 结: "jié", 解: "jiě", 姐: "jiě", 介: "jiè", 界: "jiè", 今: "jīn", 金: "jīn",
  仅: "jǐn", 紧: "jǐn", 尽: "jìn", 近: "jìn", 进: "jìn", 京: "jīng", 经: "jīng", 精: "jīng", 警: "jǐng", 景: "jǐng",
  静: "jìng", 境: "jìng", 究: "jiū", 九: "jiǔ", 久: "jiǔ", 酒: "jiǔ", 旧: "jiù", 就: "jiù", 救: "jiù", 居: "jū",
  局: "jú", 举: "jǔ", 具: "jù", 据: "jù", 剧: "jù", 决: "jué", 绝: "jué", 军: "jūn", 均: "jūn", 开: "kāi",
  看: "kàn", 刊: "kān", 康: "kāng", 抗: "kàng", 考: "kǎo", 靠: "kào", 科: "kē", 可: "kě", 客: "kè", 课: "kè",
  肯: "kěn", 空: "kōng", 孔: "kǒng", 控: "kòng", 口: "kǒu", 苦: "kǔ", 库: "kù", 快: "kuài", 宽: "kuān", 款: "kuǎn",
  况: "kuàng", 块: "kuài", 困: "kùn", 扩: "kuò", 拉: "lā", 来: "lái", 蓝: "lán", 览: "lǎn", 烂: "làn", 浪: "làng",
  劳: "láo", 老: "lǎo", 乐: "lè", 了: "le", 累: "lèi", 冷: "lěng", 离: "lí", 李: "lǐ", 理: "lǐ", 力: "lì",
  历: "lì", 立: "lì", 利: "lì", 例: "lì", 连: "lián", 联: "lián", 脸: "liǎn", 练: "liàn", 炼: "liàn", 良: "liáng",
  凉: "liáng", 粮: "liáng", 两: "liǎng", 亮: "liàng", 量: "liàng", 料: "liào", 列: "liè", 林: "lín", 临: "lín",
  灵: "líng", 零: "líng", 领: "lǐng", 另: "lìng", 流: "liú", 留: "liú", 六: "liù", 龙: "lóng", 楼: "lóu", 路: "lù",
  录: "lù", 陆: "lù", 旅: "lǚ", 律: "lǜ", 绿: "lǜ", 乱: "luàn", 论: "lùn", 落: "luò", 妈: "mā", 马: "mǎ",
  码: "mǎ", 吗: "ma", 买: "mǎi", 卖: "mài", 满: "mǎn", 慢: "màn", 忙: "máng", 毛: "máo", 贸: "mào", 么: "me",
  没: "méi", 每: "měi", 美: "měi", 门: "mén", 们: "men", 猛: "měng", 梦: "mèng", 密: "mì", 面: "miàn", 民: "mín",
  名: "míng", 明: "míng", 命: "mìng", 模: "mó", 末: "mò", 某: "mǒu", 母: "mǔ", 木: "mù", 目: "mù", 拿: "ná",
  哪: "nǎ", 那: "nà", 纳: "nà", 奶: "nǎi", 男: "nán", 南: "nán", 难: "nán", 脑: "nǎo", 呢: "ne", 内: "nèi",
  能: "néng", 泥: "ní", 你: "nǐ", 年: "nián", 念: "niàn", 娘: "niáng", 鸟: "niǎo", 您: "nín", 牛: "niú", 农: "nóng",
  努: "nǔ", 怒: "nù", 女: "nǚ", 暖: "nuǎn", 欧: "ōu", 爬: "pá", 怕: "pà", 排: "pái", 派: "pài", 旁: "páng",
  胖: "pàng", 跑: "pǎo", 赔: "péi", 配: "pèi", 朋: "péng", 批: "pī", 皮: "pí", 片: "piàn", 偏: "piān", 篇: "piān",
  漂: "piào", 票: "piào", 品: "pǐn", 平: "píng", 评: "píng", 瓶: "píng", 破: "pò", 普: "pǔ", 七: "qī", 期: "qī",
  其: "qí", 奇: "qí", 骑: "qí", 起: "qǐ", 气: "qì", 汽: "qì", 器: "qì", 千: "qiān", 前: "qián", 钱: "qián",
  强: "qiáng", 墙: "qiáng", 抢: "qiǎng", 桥: "qiáo", 切: "qiè", 且: "qiě", 亲: "qīn", 青: "qīng", 轻: "qīng", 清: "qīng",
  情: "qíng", 请: "qǐng", 庆: "qìng", 穷: "qióng", 秋: "qiū", 球: "qiú", 求: "qiú", 区: "qū", 取: "qǔ", 去: "qù",
  全: "quán", 权: "quán", 缺: "quē", 确: "què", 群: "qún", 然: "rán", 让: "ràng", 热: "rè", 人: "rén", 任: "rèn",
  认: "rèn", 仍: "réng", 日: "rì", 容: "róng", 如: "rú", 入: "rù", 软: "ruǎn", 若: "ruò", 弱: "ruò", 三: "sān",
  散: "sàn", 色: "sè", 森: "sēn", 沙: "shā", 杀: "shā", 山: "shān", 伤: "shāng", 商: "shāng", 上: "shàng", 少: "shǎo",
  绍: "shào", 蛇: "shé", 设: "shè", 社: "shè", 射: "shè", 谁: "shéi", 深: "shēn", 身: "shēn", 什: "shén", 神: "shén",
  升: "shēng", 生: "shēng", 声: "shēng", 省: "shěng", 胜: "shèng", 失: "shī", 师: "shī", 石: "shí", 时: "shí", 识: "shí",
  实: "shí", 食: "shí", 史: "shǐ", 使: "shǐ", 始: "shǐ", 示: "shì", 世: "shì", 市: "shì", 事: "shì", 试: "shì",
  是: "shì", 适: "shì", 收: "shōu", 手: "shǒu", 首: "shǒu", 受: "shòu", 书: "shū", 输: "shū", 熟: "shú", 属: "shǔ",
  数: "shù", 术: "shù", 树: "shù", 双: "shuāng", 水: "shuǐ", 睡: "shuì", 顺: "shùn", 说: "shuō", 思: "sī", 死: "sǐ",
  四: "sì", 似: "sì", 送: "sòng", 苏: "sū", 素: "sù", 速: "sù", 算: "suàn", 虽: "suī", 随: "suí", 岁: "suì",
  碎: "suì", 损: "sǔn", 所: "suǒ", 索: "suǒ", 他: "tā", 她: "tā", 它: "tā", 台: "tái", 太: "tài", 态: "tài",
  谈: "tán", 弹: "tán", 汤: "tāng", 糖: "táng", 躺: "tǎng", 讨: "tǎo", 套: "tào", 特: "tè", 疼: "téng", 提: "tí",
  题: "tí", 体: "tǐ", 天: "tiān", 田: "tián", 条: "tiáo", 跳: "tiào", 铁: "tiě", 听: "tīng", 停: "tíng",
  通: "tōng", 同: "tóng", 统: "tǒng", 头: "tóu", 图: "tú", 土: "tǔ", 团: "tuán", 推: "tuī", 腿: "tuǐ", 退: "tuì",
  脱: "tuō", 外: "wài", 完: "wán", 玩: "wán", 晚: "wǎn", 碗: "wǎn", 万: "wàn", 王: "wáng", 往: "wǎng", 网: "wǎng",
  忘: "wàng", 望: "wàng", 为: "wéi", 围: "wéi", 维: "wéi", 伟: "wěi", 尾: "wěi", 委: "wěi", 卫: "wèi", 未: "wèi",
  位: "wèi", 味: "wèi", 温: "wēn", 文: "wén", 闻: "wén", 问: "wèn", 我: "wǒ", 握: "wò", 无: "wú", 五: "wǔ",
  午: "wǔ", 武: "wǔ", 舞: "wǔ", 物: "wù", 务: "wù", 西: "xī", 吸: "xī", 希: "xī", 析: "xī", 息: "xī",
  习: "xí", 洗: "xǐ", 喜: "xǐ", 戏: "xì", 系: "xì", 细: "xì", 下: "xià", 夏: "xià", 先: "xiān", 鲜: "xiān",
  显: "xiǎn", 险: "xiǎn", 现: "xiàn", 限: "xiàn", 线: "xiàn", 相: "xiāng", 香: "xiāng", 乡: "xiāng", 想: "xiǎng", 响: "xiǎng",
  向: "xiàng", 象: "xiàng", 项: "xiàng", 消: "xiāo", 小: "xiǎo", 效: "xiào", 校: "xiào", 笑: "xiào", 些: "xiē", 协: "xié",
  写: "xiě", 谢: "xiè", 新: "xīn", 心: "xīn", 信: "xìn", 星: "xīng", 兴: "xīng", 形: "xíng",
  型: "xíng", 醒: "xǐng", 性: "xìng", 姓: "xìng", 幸: "xìng", 需: "xū", 许: "xǔ", 续: "xù", 选: "xuǎn", 学: "xué",
  雪: "xuě", 训: "xùn", 迅: "xùn", 压: "yā", 牙: "yá", 亚: "yà", 烟: "yān", 言: "yán", 严: "yán",
  研: "yán", 眼: "yǎn", 演: "yǎn", 验: "yàn", 羊: "yáng", 阳: "yáng", 杨: "yáng", 养: "yǎng", 样: "yàng", 要: "yào",
  药: "yào", 也: "yě", 业: "yè", 页: "yè", 夜: "yè", 一: "yī", 衣: "yī", 医: "yī", 依: "yī", 移: "yí",
  已: "yǐ", 以: "yǐ", 义: "yì", 亿: "yì", 忆: "yì", 艺: "yì", 议: "yì", 异: "yì", 易: "yì", 意: "yì",
  因: "yīn", 音: "yīn", 银: "yín", 引: "yǐn", 饮: "yǐn", 印: "yìn", 应: "yīng", 英: "yīng", 营: "yíng", 影: "yǐng",
  硬: "yìng", 用: "yòng", 优: "yōu", 由: "yóu", 油: "yóu", 游: "yóu", 友: "yǒu", 有: "yǒu", 又: "yòu", 右: "yòu",
  鱼: "yú", 与: "yǔ", 语: "yǔ", 雨: "yǔ", 育: "yù", 预: "yù", 元: "yuán", 员: "yuán", 原: "yuán", 园: "yuán",
  圆: "yuán", 远: "yuǎn", 院: "yuàn", 约: "yuē", 月: "yuè", 越: "yuè", 云: "yún", 运: "yùn", 杂: "zá", 在: "zài",
  再: "zài", 咱: "zán", 早: "zǎo", 造: "zào", 则: "zé", 责: "zé", 怎: "zěn", 增: "zēng", 展: "zhǎn", 占: "zhàn",
  战: "zhàn", 站: "zhàn", 张: "zhāng", 章: "zhāng", 掌: "zhǎng", 丈: "zhàng", 招: "zhāo", 找: "zhǎo", 照: "zhào",
  者: "zhě", 这: "zhè", 真: "zhēn", 针: "zhēn", 阵: "zhèn", 争: "zhēng", 整: "zhěng", 正: "zhèng", 证: "zhèng", 政: "zhèng",
  之: "zhī", 支: "zhī", 知: "zhī", 织: "zhī", 直: "zhí", 值: "zhí", 职: "zhí", 止: "zhǐ", 只: "zhǐ", 纸: "zhǐ",
  指: "zhǐ", 至: "zhì", 志: "zhì", 制: "zhì", 治: "zhì", 质: "zhì", 中: "zhōng", 终: "zhōng", 种: "zhǒng", 众: "zhòng",
  重: "zhòng", 州: "zhōu", 周: "zhōu", 洲: "zhōu", 轴: "zhóu", 逐: "zhú", 主: "zhǔ", 助: "zhù", 住: "zhù", 注: "zhù",
  著: "zhù", 抓: "zhuā", 专: "zhuān", 转: "zhuǎn", 装: "zhuāng", 准: "zhǔn", 桌: "zhuō", 着: "zhe", 资: "zī", 子: "zǐ",
  字: "zì", 自: "zì", 宗: "zōng", 总: "zǒng", 走: "zǒu", 租: "zū", 族: "zú", 组: "zǔ", 嘴: "zuǐ", 最: "zuì",
  罪: "zuì", 尊: "zūn", 昨: "zuó", 左: "zuǒ", 做: "zuò", 作: "zuò", 坐: "zuò", 座: "zuò",
};

function toPinyin(text: string): string {
  let result = "";
  for (const ch of text) {
    result += PINYIN_MAP[ch] || ch;
  }
  return result;
}

export default function ChinesePinyin() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const convert = useCallback(() => {
    setOutput(toPinyin(input));
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
          <Action title="→ Pinyin (声调)" icon={Icon.ArrowRight} onAction={convert} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea id="input" title="中文文本" placeholder="请输入中文文本…" value={input} onChange={setInput} />
      {output && <Form.TextArea id="output" title="拼音 (带声调)" value={output} onChange={() => {}} />}
    </Form>
  );
}
