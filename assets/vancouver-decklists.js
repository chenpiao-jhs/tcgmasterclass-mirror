window.tcgVancouverDecklists = (() => {
  const imageBase = "https://jihuanshe-r2-imagex.jihuanshe.com/lol/card_versions/";
  const catalog = {
    "皎月女神": {
      name: "皎月女神",
      meta: "传奇｜蓝/紫｜异画(签名)",
      image: imageBase + "next/20260401cc2c7c7324e18ea3b994952e8a066568.jpg",
      cardId: 500429,
      cardVersionId: 501856
    },
    "黛安娜, 皎月化身": {
      name: "黛安娜, 皎月化身",
      meta: "英雄单位｜蓝｜3费｜3力量｜异画",
      image: imageBase + "next/20260325c03c02e63155719eaeab37c2f99b0a1d.jpg",
      cardId: 500369,
      cardVersionId: 501915
    },
    "傲之追猎者": {
      name: "傲之追猎者",
      meta: "传奇｜红/橙｜异画(签名)",
      image: imageBase + "next/20260325604ecff9a3eaed5e1393b8009b1d0c9e.jpg",
      cardId: 500437,
      cardVersionId: 501980
    },
    "雷恩加尔, 异兽猎手": {
      name: "雷恩加尔, 异兽猎手",
      meta: "英雄单位｜橙｜5费｜6力量｜Promo",
      image: imageBase + "next/20260419797d043356aa5df86acfc50ebc5153c2.jpg",
      cardId: 500372,
      cardVersionId: 502277
    },
    "废弃大厅": {
      name: "废弃大厅",
      meta: "战场｜不凡(闪)",
      image: imageBase + "next/2026040390de1270baa65f63eb51562418234fab.jpg",
      cardId: 500534,
      cardVersionId: 502248
    },
    "巨神峰之巅": {
      name: "巨神峰之巅",
      meta: "战场｜不凡",
      image: imageBase + "next/289-sc-1769680679.jpg",
      cardId: 530,
      cardVersionId: 562
    },
    "拉文布鲁姆学院": {
      name: "拉文布鲁姆学院",
      meta: "战场｜不凡",
      image: imageBase + "next/524-sc-1769680683.jpg",
      cardId: 500091,
      cardVersionId: 500542
    },
    "荣耀竞技场": {
      name: "荣耀竞技场",
      meta: "战场｜不凡(闪)",
      image: imageBase + "next/673-cvx-20250801180606.jpg",
      cardId: 262,
      cardVersionId: 673
    },
    "帝王神坛": {
      name: "帝王神坛",
      meta: "战场｜不凡",
      image: "https://en.fantasysphere.net/assets/uploads/products/sfd-207-221-6980b7c58a9bc.jpg"
    },
    "流星疗泉": {
      name: "流星疗泉",
      meta: "战场｜不凡",
      image: imageBase + "next/882-sc-1774148557.jpg",
      cardId: 500454,
      cardVersionId: 501786
    },
    "混沌符文": {
      name: "混沌符文",
      meta: "符文｜紫｜异画",
      image: imageBase + "next/2026040341da9314131b76d17294772dbc598f3e.jpg",
      cardId: 154,
      cardVersionId: 502274
    },
    "灵光符文": {
      name: "灵光符文",
      meta: "符文｜蓝｜异画",
      image: imageBase + "next/2026040345af51ff6631d8636ce79bf35292eb97.jpg",
      cardId: 130,
      cardVersionId: 502270
    },
    "摧破符文": {
      name: "摧破符文",
      meta: "符文｜橙｜普通",
      image: imageBase + "next/202604036383b80e6154f4788ba48ed1c458c25a.jpg",
      cardId: 141,
      cardVersionId: 502272
    },
    "炽烈符文": {
      name: "炽烈符文",
      meta: "符文｜红｜普通",
      image: imageBase + "next/20260403889136ee6298bfdd3bca9139a1660a5a.jpg",
      cardId: 101,
      cardVersionId: 502266
    },
    "罡风": {
      name: "罡风",
      meta: "法术｜紫｜1费｜普通(闪)",
      image: imageBase + "next/632-cvx-20250801180604.jpg",
      cardId: 155,
      cardVersionId: 632
    },
    "彗, 焚心绘华": {
      name: "彗, 焚心绘华",
      meta: "英雄单位｜蓝｜5费｜5力量｜稀有",
      image: imageBase + "next/743-sc-1773975685.jpg",
      cardId: 500358,
      cardVersionId: 501746
    },
    "拉文布鲁姆学生": {
      name: "拉文布鲁姆学生",
      meta: "单位｜蓝｜2费｜2力量｜Promo",
      image: imageBase + "next/822-cvx-20250830003041.jpg",
      cardId: 135,
      cardVersionId: 822
    },
    "驭风而行": {
      name: "驭风而行",
      meta: "法术｜紫｜2费｜普通(闪)",
      image: imageBase + "next/750-cvx-20250801180611.jpg",
      cardId: 500,
      cardVersionId: 750
    },
    "卡牌骗术": {
      name: "卡牌骗术",
      meta: "法术｜紫｜1费｜Promo",
      image: imageBase + "next/830-cvx-20250830003042.jpg",
      cardId: 504,
      cardVersionId: 830
    },
    "“敲”诈": {
      name: "“敲”诈",
      meta: "法术｜蓝｜1费｜普通(闪)",
      image: imageBase + "next/619-cvx-20250801180603.jpg",
      cardId: 132,
      cardVersionId: 619
    },
    "控潮者": {
      name: "控潮者",
      meta: "单位｜紫｜2费｜2力量｜稀有",
      image: imageBase + "next/344-sc-1764067074.jpg",
      cardId: 511,
      cardVersionId: 543
    },
    "折戟再战": {
      name: "折戟再战",
      meta: "法术｜紫｜1费｜不凡(闪)",
      image: imageBase + "next/665-cvx-20250801180606.jpg",
      cardId: 247,
      cardVersionId: 665
    },
    "菲兹, 捣蛋鬼": {
      name: "菲兹, 捣蛋鬼",
      meta: "英雄单位｜紫｜3费｜3力量｜稀有",
      image: imageBase + "next/519-sc-1764298878.jpg",
      cardId: 500098,
      cardVersionId: 500550
    },
    "强买强卖": {
      name: "强买强卖",
      meta: "法术｜紫｜2费｜不凡(闪)",
      image: imageBase + "next/20260324d22d03ca54e6c5b16529ff637556bbae.jpg",
      cardId: 500060,
      cardVersionId: 500959
    },
    "月之降临": {
      name: "月之降临",
      meta: "专属法术｜蓝/紫｜3费｜史诗",
      image: imageBase + "next/801-sc-1773975733.jpg",
      cardId: 500448,
      cardVersionId: 501777
    },
    "造化弄人": {
      name: "造化弄人",
      meta: "法术｜紫｜3费｜普通(闪)",
      image: imageBase + "next/2026040372baacdbd66b322eafcd64dd336590ee.jpg",
      cardId: 500392,
      cardVersionId: 502219
    },
    "旅行商人": {
      name: "旅行商人",
      meta: "单位｜紫｜2费｜2力量｜不凡(闪)",
      image: imageBase + "next/637-cvx-20250801180604.jpg",
      cardId: 160,
      cardVersionId: 637
    },
    "薇古丝, 冷眼旁观": {
      name: "薇古丝, 冷眼旁观",
      meta: "英雄单位｜紫｜4费｜4力量｜异画",
      image: imageBase + "next/202603272131d52d08d37e8db2ed6dc98958b047.jpg",
      cardId: 500523,
      cardVersionId: 501955
    },
    "闪现": {
      name: "闪现",
      meta: "法术｜紫｜2费｜Promo",
      image: imageBase + "next/20260421fd7737401cda8f23e0bc126f77e25d64.jpg",
      cardId: 289,
      cardVersionId: 502279
    },
    "烟幕弹": {
      name: "烟幕弹",
      meta: "法术｜蓝｜2费｜普通(闪)",
      image: imageBase + "next/739-cvx-20250801180611.jpg",
      cardId: 485,
      cardVersionId: 739
    },
    "化为灰烬": {
      name: "化为灰烬",
      meta: "法术｜蓝｜2费｜普通(闪)",
      image: imageBase + "next/202604032cc97cabe6f14f5f130f3e6d8bb911a9.jpg",
      cardId: 500365,
      cardVersionId: 502185
    },
    "薇古丝, 郁郁": {
      name: "薇古丝, 郁郁",
      meta: "英雄单位｜紫｜5费｜5力量｜稀有",
      image: imageBase + "next/520-sc-1764298880.jpg",
      cardId: 500094,
      cardVersionId: 500545
    },
    "纳什男爵": {
      name: "纳什男爵",
      meta: "单位｜紫｜10费｜12力量｜异画[终极超编]",
      image: imageBase + "next/20260325743cd50e48e1db09cb4346035d82592f.jpg",
      cardId: 500407,
      cardVersionId: 501990
    },
    "星芒凝汇": {
      name: "星芒凝汇",
      meta: "法术｜蓝｜6费｜不凡(闪)",
      image: imageBase + "next/691-cvx-20250801180608.jpg",
      cardId: 309,
      cardVersionId: 691
    },
    "坚定的哨兵": {
      name: "坚定的哨兵",
      meta: "单位｜橙｜1费｜1力量｜稀有",
      image: imageBase + "next/202603254aeb5f87cfcf10dd4f8e77acaa3d9dfb.jpg",
      cardId: 500508,
      cardVersionId: 501938
    },
    "阴森药剂师": {
      name: "阴森药剂师",
      meta: "单位｜红｜3费｜3力量｜稀有",
      image: imageBase + "next/2026032866e538571dd9d0cbe7fda85b307e04f2.jpg",
      cardId: 500484,
      cardVersionId: 501913
    },
    "伊焚娜": {
      name: "伊焚娜",
      meta: "单位｜红｜2费｜1力量｜普通(闪)",
      image: imageBase + "next/202604037486ebe49420de7c38965331fba3f3ae.jpg",
      cardId: 500346,
      cardVersionId: 502141
    },
    "诱人仙灵": {
      name: "诱人仙灵",
      meta: "单位｜橙｜2费｜1力量｜稀有",
      image: imageBase + "next/20260329219abb6a723b7319bf9e9efaf3d47e08.jpg",
      cardId: 500550,
      cardVersionId: 502130
    },
    "卡莎, 九死一生": {
      name: "卡莎, 九死一生",
      meta: "英雄单位｜红｜4费｜4力量｜异画",
      image: imageBase + "next/323-sc-1764067022.jpg",
      cardId: 469,
      cardVersionId: 501
    },
    "均衡门徒": {
      name: "均衡门徒",
      meta: "单位｜橙｜3费｜3力量｜普通(闪)",
      image: imageBase + "next/202604039003a100f1accbe4ee32e7736a699b16.jpg",
      cardId: 500481,
      cardVersionId: 502200
    },
    "奈德丽, 灵猫形态": {
      name: "奈德丽, 灵猫形态",
      meta: "英雄单位｜橙｜3费｜4力量｜稀有",
      image: imageBase + "next/2026040144c5587fa215f7417d2fd871c7f6dcd2.jpg",
      cardId: 500393,
      cardVersionId: 501826
    },
    "竞技场新人": {
      name: "竞技场新人",
      meta: "单位｜橙｜2费｜2力量｜普通(闪)",
      image: imageBase + "next/712-cvx-20250801180609.jpg",
      cardId: 330,
      cardVersionId: 712
    },
    "先打再问": {
      name: "先打再问",
      meta: "法术｜橙｜1费｜普通(闪)",
      image: imageBase + "next/2026032400c9e0616306245874a22d0dcc398a9d.jpg",
      cardId: 500132,
      cardVersionId: 500911
    },
    "派克, 码头屠夫": {
      name: "派克, 码头屠夫",
      meta: "英雄单位｜红｜3费｜2力量｜史诗",
      image: imageBase + "next/835-sc-1774062095.jpg",
      cardId: 500331,
      cardVersionId: 501743
    },
    "狩猎律动": {
      name: "狩猎律动",
      meta: "专属法术｜红/橙｜2费｜史诗",
      image: imageBase + "next/872-sc-1774148536.jpg",
      cardId: 500419,
      cardVersionId: 501767
    },
    "决斗": {
      name: "决斗",
      meta: "法术｜橙｜2费｜Promo",
      image: imageBase + "next/824-cvx-20250830003041.jpg",
      cardId: 142,
      cardVersionId: 824
    },
    "德莱厄斯, 崔法利": {
      name: "德莱厄斯, 崔法利",
      meta: "英雄单位｜红｜5费｜5力量｜异画",
      image: imageBase + "next/28-sc-1764067005.jpg",
      cardId: 107,
      cardVersionId: 109
    },
    "暗中破坏": {
      name: "暗中破坏",
      meta: "法术｜橙｜1费｜稀有",
      image: imageBase + "next/321-sc-1764067060.jpg",
      cardId: 498,
      cardVersionId: 530
    },
    "阿克尚, 放浪不羁": {
      name: "阿克尚, 放浪不羁",
      meta: "英雄单位｜橙｜4费｜4力量｜稀有",
      image: imageBase + "next/612-sc-1764817291.jpg",
      cardId: 500175,
      cardVersionId: 500759
    },
    "颂雷者 布林希尔": {
      name: "颂雷者 布林希尔",
      meta: "单位｜红｜6费｜5力量｜稀有",
      image: imageBase + "next/312-sc-1764067006.jpg",
      cardId: 465,
      cardVersionId: 496
    },
    "坚毅不倒": {
      name: "坚毅不倒",
      meta: "法术｜橙｜1费｜不凡(闪)",
      image: imageBase + "next/747-cvx-20250801180611.jpg",
      cardId: 496,
      cardVersionId: 747
    }
  };

  function card(name, count, sourceName = name) {
    return {
      ...catalog[name],
      count,
      sourceName
    };
  }

  return {
    byKey: {
      "ctg-alanzq-diana": {
        key: "ctg-alanzq-diana",
        player: "CTG ALANZQ",
        databasePlayer: "CTG Alanzq",
        sourcePlayerId: "135798",
        rank: 1,
        record: "14-0-2",
        deckName: "Diana, Scorn of the Moon: Vancouver Regional Qualifier 1st (CTG Alanzq)",
        deckCategory: "Diana - Scorn of the Moon",
        title: "CTG ALANZQ 的皎月牌表",
        buttonLabel: "皎月牌表",
        sourceUrl: "https://rift.yomis-place.de/vancouver/diana",
        tournamentSourceUrl: "https://rift.yomis-place.de/vancouver",
        backupSourceUrl: "https://riftmana.com/tournaments/alanzq-diana-vancouverregional-qualifier-5-30/",
        sourceNote: "Yomi 公开列表提供主牌、符文与备牌；Rift Mana 单页补足完整战场；转播图片版用于视觉复核。",
        main: [
          card("皎月女神", 1, "Scorn of the Moon"),
          card("混沌符文", 6, "Chaos Rune"),
          card("灵光符文", 6, "Mind Rune"),
          card("巨神峰之巅", 1, "Targon's Peak"),
          card("废弃大厅", 1, "Abandoned Hall"),
          card("拉文布鲁姆学院", 1, "Ravenbloom Conservatory"),
          card("黛安娜, 皎月化身", 1, "Diana, Lunari"),
          card("罡风", 3, "Gust"),
          card("彗, 焚心绘华", 3, "Hwei, Brooding Painter"),
          card("拉文布鲁姆学生", 3, "Ravenbloom Student"),
          card("驭风而行", 3, "Ride the Wind"),
          card("卡牌骗术", 3, "Stacked Deck"),
          card("“敲”诈", 3, "Stupefy"),
          card("控潮者", 3, "Tideturner"),
          card("折戟再战", 2, "Acceptable Losses"),
          card("菲兹, 捣蛋鬼", 2, "Fizz, Trickster"),
          card("强买强卖", 2, "Hard Bargain"),
          card("月之降临", 2, "Moonfall"),
          card("造化弄人", 2, "Star-Crossed"),
          card("旅行商人", 2, "Traveling Merchant"),
          card("薇古丝, 冷眼旁观", 2, "Vex, Apathetic"),
          card("闪现", 1, "Flash"),
          card("烟幕弹", 1, "Smoke Screen"),
          card("化为灰烬", 1, "Turn to Dust"),
          card("薇古丝, 郁郁", 1, "Vex, Cheerless")
        ],
        side: [
          card("纳什男爵", 2, "Baron Nashor"),
          card("星芒凝汇", 2, "Singularity"),
          card("月之降临", 1, "Moonfall"),
          card("造化弄人", 1, "Star-Crossed"),
          card("化为灰烬", 1, "Turn to Dust"),
          card("薇古丝, 郁郁", 1, "Vex, Cheerless")
        ]
      },
      "samdsherman-rengar": {
        key: "samdsherman-rengar",
        player: "SAMDSHERMAN",
        databasePlayer: "samdsherman",
        sourcePlayerId: "158620",
        rank: 2,
        record: "13-2-1",
        deckName: "Rengar, Pridestalker: Vancouver Regional Qualifier 2nd (samdsherman)",
        deckCategory: "Rengar - Pridestalker",
        title: "SAMDSHERMAN 的雷恩加尔牌表",
        buttonLabel: "雷恩加尔牌表",
        sourceUrl: "https://rift.yomis-place.de/vancouver/rengar",
        tournamentSourceUrl: "https://rift.yomis-place.de/vancouver",
        backupSourceUrl: "https://riftmana.com/best-of-metal-cards-legend-winner-decklists-vancouver-regional-qualifier/",
        sourceNote: "Yomi 公开列表提供主牌、符文与备牌；Rift Mana 汇总补足完整战场；转播图片版用于视觉复核。",
        main: [
          card("傲之追猎者", 1, "Pridestalker"),
          card("摧破符文", 8, "Body Rune"),
          card("炽烈符文", 4, "Fury Rune"),
          card("荣耀竞技场", 1, "The Arena's Greatest"),
          card("帝王神坛", 1, "Emperor's Dais"),
          card("流星疗泉", 1, "Star Spring"),
          card("雷恩加尔, 异兽猎手", 1, "Rengar, Trophy Hunter"),
          card("坚定的哨兵", 3, "Determined Sentry"),
          card("阴森药剂师", 3, "Grim Apothecary"),
          card("伊焚娜", 3, "Inferna"),
          card("诱人仙灵", 3, "Irresistible Faefolk"),
          card("卡莎, 九死一生", 3, "Kai'Sa, Survivor"),
          card("均衡门徒", 3, "Kinkou Initiate"),
          card("奈德丽, 灵猫形态", 3, "Nidalee, Cat Form"),
          card("竞技场新人", 3, "Pit Rookie"),
          card("先打再问", 3, "Punch First"),
          card("派克, 码头屠夫", 3, "Pyke, Dockside Butcher"),
          card("狩猎律动", 3, "Thrill of the Hunt"),
          card("决斗", 2, "Challenge"),
          card("德莱厄斯, 崔法利", 2, "Darius, Trifarian"),
          card("暗中破坏", 2, "Sabotage")
        ],
        side: [
          card("阿克尚, 放浪不羁", 3, "Akshan, Mischievous"),
          card("颂雷者 布林希尔", 2, "Brynhir Thundersong"),
          card("决斗", 1, "Challenge"),
          card("暗中破坏", 1, "Sabotage"),
          card("坚毅不倒", 1, "Unyielding Spirit")
        ]
      }
    }
  };
})();
