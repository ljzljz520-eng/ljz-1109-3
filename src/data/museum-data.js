/**
 * 竹编展示馆馆藏数据（唯一数据源）
 * 所有页面内容均由本数据渲染；字段结构受 src/data/schema.js 约束，
 * 构建时 tools/validate-data.mjs 会复查器物类型、媒体引用与文件存在性。
 */

export const museumData = {
  history: [
    {
      era: "新石器时代",
      title: "竹编的源头",
      text: "距今约五千年的浙江吴兴钱山漾遗址出土了竹篮、竹席等二百余件竹编，织法已有“人字纹”“菱形纹”，说明竹编在文明初曙时已是成熟手艺。",
    },
    {
      era: "春秋战国",
      title: "从日用走向精细",
      text: "南方吴越楚国广泛使用竹笥、竹筐、竹箕，器物编扎紧密，部分纹样已具备装饰意味，竹编与陶器、青铜器共同进入日常礼制。",
    },
    {
      era: "汉 唐",
      title: "竹器盛于市井",
      text: "竹席、竹箱、竹笼成为常见器物，工匠开始对篾片染色、印花；唐代陆羽《茶经》记载茶人以竹编茶具收纳采制之器。",
    },
    {
      era: "宋 元",
      title: "文房与雅趣",
      text: "点茶、焚香、挂画之风兴盛，竹编茶笼、香篮、画匣大量出现，编织由粗入细，追求与书画相称的清雅质感。",
    },
    {
      era: "明 清",
      title: "流派纷呈",
      text: "东阳竹编、嵊州竹编、青神竹编、泉州竹编等地方流派成型，瓷胎竹编与金漆镶嵌结合，竹编从民具升阶为陈设艺术。",
    },
    {
      era: "近现代",
      title: "守艺与新生",
      text: "竹编一度作为重要出口手工艺品远销海外；工业化冲击后，传承人转向精品创作、建筑装饰与文创，竹编重新走入当代生活。",
    },
    {
      era: "二〇〇八年",
      title: "列入国家级非遗",
      text: "东阳竹编、青神竹编等相继列入国家级非物质文化遗产代表性项目名录，竹编技艺的传承有了制度性的守护。",
    },
  ],

  bamboos: [
    {
      name: "毛竹",
      latin: "Phyllostachys edulis",
      use: "杆粗通直、竹壁厚实，篾性刚柔并济，是篮、筐、席等大件器物的主要用材。",
    },
    {
      name: "水竹",
      latin: "Phyllostachys heteroclada",
      use: "竹节平滑、纤维致密坚韧，劈出的篾不易折断，宜做细编与长期使用的日用器。",
    },
    {
      name: "慈竹",
      latin: "Bambusa emeiensis",
      use: "质地偏柔，一根竹可启出十几层薄篾，是精编字画、瓷胎竹编常用的材料。",
    },
    {
      name: "淡竹",
      latin: "Phyllostachys glauca",
      use: "竹壁较薄、色泽清浅，宜劈为极细篾丝，团扇、灯罩等轻薄器物多用之。",
    },
  ],

  processes: [
    { name: "选竹", text: "以生长两到四年、向阳山坡的竹子为佳；过嫩易蛀，过老则脆。" },
    { name: "砍竹", text: "秋冬时节竹液收敛、糖分低，此时砍伐可减少虫蛀霉变。" },
    { name: "刮青", text: "用刮刀除去竹青表面的蜡质与青皮，使篾片易上色、不打滑。" },
    { name: "锯段破竹", text: "按器物尺寸锯成竹筒，再以篾刀对半开劈，裂声顺纹而行。" },
    { name: "启篾", text: "将竹块层层剖开，分离竹青与竹黄，一竹可启数层乃至十数层。" },
    { name: "匀篾拉篾", text: "以匀刀或拉刀反复修整，使每根篾宽窄厚薄分毫不差。" },
    { name: "煮晒防蛀", text: "沸水煮篾或石灰水浸泡后阴干，定色、防虫、防霉变。" },
    { name: "染色打磨", text: "天然植物染或现代染料着色，再以细砂打磨至缎面光泽，方可上机编织。" },
  ],

  strips: [
    {
      name: "经篾",
      spec: "宽约 3–5 mm · 骨",
      text: "竖向排布的骨架篾，受力最大，通常选用竹青层，宽厚而有弹性。",
    },
    {
      name: "纬篾",
      spec: "宽约 2–4 mm · " + "脉",
      text: "横向穿插的编织篾，随编法在经篾间起伏，决定表面的纹样与节奏。",
    },
    {
      name: "篾丝",
      spec: "宽 0.5 mm 以下 · 毫芒",
      text: "精编所用的极细篾丝，薄如蝉翼、细若发丝，可在瓷胎上织出整幅书画。",
    },
  ],

  weaves: [
    {
      id: "plain",
      name: "压一挑一",
      sub: "平纹编 · 最基本的经纬",
      description:
        "纬篾每前进一步，便在一根经篾下方穿过、从下一根经篾上方压过，循环往复。结构平整紧密，是篮、席、灯罩的通用底纹。",
      animated: true,
    },
    {
      id: "twill",
      name: "斜纹编",
      sub: "压二挑二 · 逐行错位",
      description:
        "纬篾每次连压两根经篾、再连挑两根，下一行整体错开一位，表面便形成斜向纹路。纹路密实耐磨，茶盘、盒匣多用此法。",
      animated: true,
    },
    {
      id: "edge",
      name: "收边",
      sub: "回折 · 锁口",
      description:
        "器物编到高度后，将外露的经篾端头沿口沿依次回折 180°，插入相邻编层内锁紧。口沿因此挺括不散，是整件器物的收束之功。",
      animated: true,
    },
    {
      id: "hexagon",
      name: "六角眼",
      sub: "三向交织 · 疏朗透空",
      description:
        "篾片按六十度三个方向交织，围合出六角形镂空孔眼，通风透气，宜做针线篮、灯罩与渔篓。",
      animated: false,
    },
    {
      id: "herringbone",
      name: "人字编",
      sub: "左右换向 · 形如“人”字",
      description:
        "纬篾沿中轴线左右换向斜编，纹路连续成人字形，受力均匀，是凉席与渔篓的经典纹理。",
      animated: false,
    },
  ],

  media: [
    { src: "assets/works/basket-simple.svg", alt: "素面提篮示意图", width: 400, height: 300 },
    { src: "assets/works/basket-hex.svg", alt: "六角眼针线篮示意图", width: 400, height: 300 },
    { src: "assets/works/creel.svg", alt: "腰形渔篓示意图", width: 400, height: 300 },
    { src: "assets/works/tea-tray.svg", alt: "竹编茶盘示意图", width: 400, height: 300 },
    { src: "assets/works/lacquer-box.svg", alt: "黑漆描金果盒示意图", width: 400, height: 300 },
    { src: "assets/works/plum-vase.svg", alt: "竹丝扣梅瓶示意图", width: 400, height: 300 },
    { src: "assets/works/mat.svg", alt: "万字纹凉席示意图", width: 400, height: 300 },
    { src: "assets/works/round-fan.svg", alt: "素面团扇示意图", width: 400, height: 300 },
    { src: "assets/works/lantern.svg", alt: "竹丝灯笼示意图", width: 400, height: 300 },
    { src: "assets/works/hat.svg", alt: "细篾斗笠示意图", width: 400, height: 300 },
  ],

  masters: [
    {
      id: "he-fu",
      name: "何福礼",
      title: "东阳竹编代表性传承人 · 中国工艺美术大师",
      born: "1944 年生",
      region: "浙江东阳",
      bio:
        "十四岁拜师学艺，深耕竹编六十余载。他擅长将传统篮盘技艺与立体造型结合，作品精于百鸟朝凤等细密题材；晚年主持北京故宫倦勤斋竹丝镶嵌的修复，让失传两百余年的清代宫廷竹艺重见天日。",
      quote: "竹篾是有脾气的，你顺着它的纹路，它才肯替你说话。",
    },
    {
      id: "chen-yun-hua",
      name: "陈云华",
      title: "青神竹编代表性传承人",
      born: "1947 年生",
      region: "四川青神",
      bio:
        "自幼随家人编竹，中年后致力把慈竹篾丝推向“薄如纸、细如丝”的极致，能在竹篾上织出《清明上河图》与名人字画。他创办竹编艺术博物馆与技艺培训班，带动青神上万农户靠竹编增收。",
      quote: "把一根竹子劈到细无可细，人的心思也就静了下来。",
    },
    {
      id: "yu-zhang-gen",
      name: "俞樟根",
      title: "嵊州竹编代表人物 · 中国工艺美术大师",
      born: "1932 年生",
      region: "浙江嵊州",
      bio:
        "十八岁参与组建竹编生产合作社，一生钻研模拟动物与仿古器皿竹编，创制漂白、花筋、蓝胎漆等新工艺，让嵊州竹编以“中看不中用的精品”之名远销五十多个国家和地区。",
      quote: "编竹先编骨，骨立住了，神气才出得来。",
    },
  ],

  works: [
    {
      id: "lan-01",
      name: "素面提篮",
      type: "篮",
      media: "assets/works/basket-simple.svg",
      masterId: "he-fu",
      year: "当代",
      region: "浙江东阳",
      weave: "plain",
      description:
        "不加雕饰的日常提篮，通体压一挑一平纹编，篮身略收、提弓流畅，胜在篾片匀净、口沿紧实，盛物三十年而不松。",
    },
    {
      id: "lan-02",
      name: "六角眼针线篮",
      type: "篮",
      media: "assets/works/basket-hex.svg",
      masterId: "he-fu",
      year: "当代",
      region: "浙江东阳",
      weave: "hexagon",
      description:
        "篮壁取六角眼透空编法，三向篾片交织成规整蜂巢，通风轻巧；盖面收成密纹，针线小物不致漏出，是旧时嫁女的陪嫁之物。",
    },
    {
      id: "lan-03",
      name: "腰形渔篓",
      type: "篮",
      media: "assets/works/creel.svg",
      masterId: "chen-yun-hua",
      year: "当代",
      region: "四川青神",
      weave: "herringbone",
      description:
        "篓身作腰形、可贴腰系挂，人字编纹路随形体转向，既承鱼获又沥水透气；收口处回折锁边，是江边渔户的随身器具。",
    },
    {
      id: "pan-01",
      name: "竹编茶盘",
      type: "盘",
      media: "assets/works/tea-tray.svg",
      masterId: "he-fu",
      year: "当代",
      region: "浙江东阳",
      weave: "twill",
      description:
        "盘面采用压二挑二斜纹编，斜纹致密不易积茶渣，四周以双层篾收口起线；盘底髹薄桐油，温润防水，适配潮汕工夫茶席。",
    },
    {
      id: "he-01",
      name: "黑漆描金果盒",
      type: "盒",
      media: "assets/works/lacquer-box.svg",
      masterId: "yu-zhang-gen",
      year: "当代",
      region: "浙江嵊州",
      weave: "twill",
      description:
        "细斜纹竹胎内外裱布髹黑漆，盖面描金折枝佛手；竹胎轻便而漆层坚润，开合有轻声，承嵊州竹编“蓝胎漆”一脉工艺。",
    },
    {
      id: "ping-01",
      name: "竹丝扣梅瓶",
      type: "瓶",
      media: "assets/works/plum-vase.svg",
      masterId: "chen-yun-hua",
      year: "当代",
      region: "四川青神",
      weave: "plain",
      description:
        "以白瓷梅瓶为胎，取慈竹最内层篾丝压一挑一紧贴瓶身编织，竹丝随弧面流转而不露断口，金竹与白瓷相映，是竹丝扣瓷的代表形制。",
    },
    {
      id: "xi-01",
      name: "万字纹凉席",
      type: "席",
      media: "assets/works/mat.svg",
      masterId: "chen-yun-hua",
      year: "当代",
      region: "四川青神",
      weave: "herringbone",
      description:
        "水竹篾片以人字编为地，间出连续万字不到头纹，席面平整可卧、卷起不折。一张精席需篾逾千根、耗时数月。",
    },
    {
      id: "shan-01",
      name: "素面团扇",
      type: "扇",
      media: "assets/works/round-fan.svg",
      masterId: "yu-zhang-gen",
      year: "当代",
      region: "浙江嵊州",
      weave: "twill",
      description:
        "淡竹细篾斜纹密织为满月形扇面，纹理呈放射状渐隐；边缘以单根细篾环包，柄留竹节，清风一过，竹香隐隐。",
    },
    {
      id: "deng-01",
      name: "竹丝灯笼",
      type: "灯具",
      media: "assets/works/lantern.svg",
      masterId: "chen-yun-hua",
      year: "当代",
      region: "四川青神",
      weave: "hexagon",
      description:
        "六角眼透空编作灯壁，内糊薄皮纸或绢；烛火点亮后，六边形光影在案头移动，疏篾透光而不泄风，是传统书房清供。",
    },
    {
      id: "li-01",
      name: "细篾斗笠",
      type: "斗笠",
      media: "assets/works/hat.svg",
      masterId: "he-fu",
      year: "当代",
      region: "浙江东阳",
      weave: "plain",
      description:
        "以箬叶与竹篾层层相叠，压一挑一编出锥形笠面，仅重数百克却可遮蔽急雨；檐口一周细篾锁边，笠顶留纽，是江南农事的标志。",
    },
  ],
};
