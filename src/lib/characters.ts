"use client";

// 日本人女性の名前データ
const japaneseGivenNames = [
  "あかり", "あやか", "あおい", "ちひろ", "えみ", "はるか", "ひかり", "ほのか", 
  "かえで", "かおり", "かなえ", "かりん", "かすみ", "まい", "まなみ", "まお", 
  "めぐみ", "みさき", "みゆき", "ももか", "なぎさ", "ななみ", "のぞみ", "りか", 
  "りん", "さくら", "さやか", "せいか", "しずく", "すみれ", "たまき", "ともみ", 
  "ゆい", "ゆか", "ゆみ", "ゆな", "ゆうな", "あき", "あすか", "あや",
  "はな", "ひな", "いちか", "いずみ", "かな", "まどか", "まひろ", "まりあ",
  "みく", "みほ", "みお", "みさと", "なな", "なお", "のあ", "れい",
  "りお", "りさ", "さち", "さと", "せな", "しおり", "そら", "すず",
  "つぐみ", "うた", "わかな", "やよい", "よしの", "ゆきの", "遥", "陽菜",
  "詩織", "美咲", "菜々子", "七海", "彩花", "彩香", "優花", "優奈",
  "理沙", "沙織", "麻衣", "舞", "萌", "未来", "智子", "瑞希",
  "桃香", "奈々", "奈緒", "直美", "紗希", "里奈", "早紀", "楓",
  // 追加の名前
  "愛", "杏", "千尋", "恵", "文", "華", "小春", "真琴",
  "美月", "美優", "美桜", "七瀬", "乃愛", "琴音", "心", "心美",
  "沙羅", "咲良", "小雪", "立花", "千夏", "千花", "都", "友香"
];

const japaneseFamilyNames = [
  "佐藤", "鈴木", "高橋", "田中", "伊藤", "渡辺", "山本", "中村",
  "小林", "加藤", "吉田", "山田", "佐々木", "山口", "松本", "井上",
  "木村", "林", "斎藤", "清水", "山崎", "森", "池田", "橋本",
  "阿部", "石川", "山下", "中島", "石井", "小川", "前田", "岡田",
  "後藤", "村上", "長谷川", "近藤", "石田", "坂本", "遠藤", "青木",
  "藤田", "西村", "福田", "太田", "三浦", "藤井", "岡本", "松田",
  "中川", "中野", "原田", "小野", "田村", "竹内", "金子", "和田",
  "中山", "藤原", "石原", "大橋", "松井", "菊地", "木下", "松尾",
  "野口", "菅原", "杉山", "千葉", "桜井", "池上", "渡部", "上田",
  "吉川", "山内", "大野", "水野", "村田", "西田", "森田", "内田"
];

// タグラインのテンプレート
const taglineTemplates = [
  "趣味は{}です", 
  "{}が好きです",
  "一緒に{}しませんか",
  "{}について話しましょう",
  "今日は{}しています",
  "{}を勉強中です",
  "{}が得意です",
  "{}を探しています",
  "最近{}にハマっています",
  "{}が特技です",
  // 追加のタグライン
  "あなたと{}を共有したいです",
  "プロフェッショナルな{}です",
  "{}に目標を持っています",
  "{}を通して心を癒します",
  "{}でリラックスするのが好き",
  "{}は私の情熱です",
  "{}を通して自分を表現します",
  "{}から得られる喜びは格別です",
  "{}を通じて新しい発見をしています",
  "{}の世界をあなたに見せたい"
];

// 趣味や関心のリスト
const interests = [
  "料理", "旅行", "映画鑑賞", "音楽", "読書", "ダンス", "写真撮影", "ヨガ", 
  "ゲーム", "アニメ鑑賞", "カフェ巡り", "散歩", "絵を描くこと", "ショッピング", 
  "ガーデニング", "スポーツ観戦", "キャンプ", "ランニング", "お菓子作り", "御朱印集め",
  "ハンドメイド", "天体観測", "カラオケ", "ファッション", "温泉巡り", "ドライブ", "釣り", "ダイビング",
  "コスプレ", "楽器演奏", "ボルダリング", "フィギュアスケート", "ボードゲーム", "陶芸", "茶道", "書道",
  // 追加の趣味
  "和菓子作り", "着物", "華道", "俳句", "日本舞踊", "神社巡り", "漫画", "アイドル",
  "ライブ参戦", "カメラ", "ペット", "骨董品収集", "美術館巡り", "ジャズ鑑賞", "言語学習", "ヴィンテージ服",
  "インテリア", "ジャーナリング", "パン作り", "コーヒー", "お茶", "演劇", "バレエ", "ボランティア",
  "園芸", "スケッチ", "マラソン", "登山", "サイクリング", "競馬", "将棋", "占い"
];

// 画像URLのテンプレート - ランダムな人物写真用
const imageUrls = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=388&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=387&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=464&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=461&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=387&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=387&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=464&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=387&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=386&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=387&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=870&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506956191951-7a88da4435e5?q=80&w=1074&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1485893086445-ed75865251e0?q=80&w=580&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504730030853-eff311f57d3c?q=80&w=1170&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1491349174775-aaafddd81942?q=80&w=387&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?q=80&w=580&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=1170&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1485875437342-9b39470b3d95?q=80&w=1173&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=386&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=1170&auto=format&fit=crop",
  // 追加の画像
  "https://images.unsplash.com/photo-1514315384763-ba401779410f?q=80&w=1383&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1496440737103-cd596325d314?q=80&w=1374&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514846326710-096e4a8035e0?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504276048855-f3d60e69632f?q=80&w=1287&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1486074051793-e41332bf18fc?q=80&w=1374&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=1080&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1484399172022-72a90b12e3c1?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?q=80&w=1287&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=1288&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494354145959-25cb82edf23d?q=80&w=1287&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521252659862-eec69941b071?q=80&w=1325&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1499155286265-79a9dc9c6380?q=80&w=1488&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?q=80&w=1287&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551292831-023188e78222?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1532171875345-9712d9d4f65a?q=80&w=1287&auto=format&fit=crop"
];

// 日本人女性キャラクターを生成する関数
export function generateJapaneseWomen(count = 100) {
  const characters = [];
  const usedNames = new Set();
  const usedPhotos = new Set();
  
  for (let i = 0; i < count; i++) {
    // ユニークな名前を生成
    let fullName = '';
    do {
      const familyName = japaneseFamilyNames[Math.floor(Math.random() * japaneseFamilyNames.length)];
      const givenName = japaneseGivenNames[Math.floor(Math.random() * japaneseGivenNames.length)];
      fullName = `${familyName} ${givenName}`;
    } while (usedNames.has(fullName));
    
    usedNames.add(fullName);
    
    // ランダムなタグラインを生成
    const interest = interests[Math.floor(Math.random() * interests.length)];
    const taglineTemplate = taglineTemplates[Math.floor(Math.random() * taglineTemplates.length)];
    const tagline = taglineTemplate.replace('{}', interest);
    
    // ランダムな年齢を生成 (18-50歳)
    const age = Math.floor(Math.random() * 33) + 18;
    
    // ランダムなイメージURLを選択（重複を避ける）
    let imageIndex;
    let avatarUrl;
    do {
      imageIndex = Math.floor(Math.random() * imageUrls.length);
      avatarUrl = imageUrls[imageIndex];
    } while (usedPhotos.has(avatarUrl) && usedPhotos.size < imageUrls.length);
    
    usedPhotos.add(avatarUrl);
    
    // ランダムにオンライン/新規状態を決定
    const isOnline = Math.random() > 0.7;
    const isNew = Math.random() > 0.8;
    
    // ランダムにタイプを割り当て
    const types = ['実写', 'アニメ', '3D', 'リアル調'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // ランダムに人気度を割り当て
    const popularities = ['人気', '新しい', 'トレンド'];
    const popularity = popularities[Math.floor(Math.random() * popularities.length)];
    
    // 地域情報を追加
    const regions = ['東京', '大阪', '京都', '北海道', '沖縄', '神奈川', '福岡', '愛知', '埼玉', '千葉'];
    const region = regions[Math.floor(Math.random() * regions.length)];
    
    characters.push({
      id: `jp-${i + 1}`,
      name: fullName,
      age: age,
      tagline: tagline,
      avatarUrl: avatarUrl,
      isOnline: isOnline,
      isNew: isNew,
      type: type,
      popularity: popularity,
      region: region,
      joinDate: getRandomDate(new Date('2024-01-01'), new Date())
    });
  }
  
  return characters;
}

// ランダムな日付を生成するヘルパー関数
function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
