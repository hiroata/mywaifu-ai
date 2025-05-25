import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('データベースにシードデータを挿入中...')

  // デモキャラクター
  const characters = [
    {
      id: 'character-1',
      name: 'サクラ',
      description: '優しくて思いやりのある女の子です。ピンクの髪と大きな瞳が特徴的です。',
      shortDescription: '心優しい桜の精',
      age: 20,
      gender: 'female' as const,
      type: 'anime' as const,
      personality: 'kind,cheerful,caring',
      profileImageUrl: '/images/characters/sakura.jpg',
      isPublic: true,
    },
    {
      id: 'character-2',
      name: 'ユキ',
      description: 'クールで知的な女性。青い髪と鋭い目つきが印象的です。',
      shortDescription: '冷静沈着な知識の番人',
      age: 22,
      gender: 'female' as const,
      type: 'anime' as const,
      personality: 'intelligent,cool,mysterious',
      profileImageUrl: '/images/characters/yuki.jpg',
      isPublic: true,
    },
    {
      id: 'character-3',
      name: 'アカネ',
      description: '元気いっぱいのスポーツ少女。赤い髪がトレードマークです。',
      shortDescription: '太陽のように明るいスポーツ少女',
      age: 19,
      gender: 'female' as const,
      type: 'anime' as const,
      personality: 'energetic,sporty,friendly',
      profileImageUrl: '/images/characters/akane.jpg',
      isPublic: true,
    },
    {
      id: 'character-4',
      name: 'ミドリ',
      description: '自然を愛する穏やかな女性。緑の髪と優しい笑顔が特徴です。',
      shortDescription: '自然と共に生きる癒しの存在',
      age: 24,
      gender: 'female' as const,
      type: 'anime' as const,
      personality: 'calm,nature-loving,gentle',
      profileImageUrl: '/images/characters/midori.jpg',
      isPublic: true,
    },
    {
      id: 'character-5',
      name: 'ムラサキ',
      description: 'ミステリアスで魅力的な女性。紫の髪と神秘的な雰囲気を持っています。',
      shortDescription: '謎に満ちた美しき魔女',
      age: 25,
      gender: 'female' as const,
      type: 'anime' as const,
      personality: 'mysterious,elegant,sophisticated',
      profileImageUrl: '/images/characters/murasaki.jpg',
      isPublic: true,
    },
  ]

  // タグを作成
  const tags = [
    { name: '優しい' },
    { name: 'ピンク髪' },
    { name: 'アニメ' },
    { name: 'クール' },
    { name: '青髪' },
    { name: 'インテリ' },
    { name: '元気' },
    { name: '赤髪' },
    { name: 'スポーツ' },
    { name: '穏やか' },
    { name: '緑髪' },
    { name: '自然' },
    { name: 'ミステリアス' },
    { name: '紫髪' },
    { name: 'エレガント' },
  ]

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    })
  }

  // キャラクターを作成
  for (const character of characters) {
    await prisma.character.upsert({
      where: { id: character.id },
      update: {},
      create: character,
    })
  }

  // キャラクターとタグの関連付け
  const characterTagMappings = [
    { characterId: 'character-1', tagNames: ['優しい', 'ピンク髪', 'アニメ'] },
    { characterId: 'character-2', tagNames: ['クール', '青髪', 'インテリ', 'アニメ'] },
    { characterId: 'character-3', tagNames: ['元気', '赤髪', 'スポーツ', 'アニメ'] },
    { characterId: 'character-4', tagNames: ['穏やか', '緑髪', '自然', 'アニメ'] },
    { characterId: 'character-5', tagNames: ['ミステリアス', '紫髪', 'エレガント', 'アニメ'] },
  ]

  for (const mapping of characterTagMappings) {
    const character = await prisma.character.findUnique({
      where: { id: mapping.characterId },
    })
    
    if (character) {
      const tagIds = await Promise.all(
        mapping.tagNames.map(async (tagName) => {
          const tag = await prisma.tag.findUnique({ where: { name: tagName } })
          return tag?.id
        })
      )

      await prisma.character.update({
        where: { id: mapping.characterId },
        data: {
          tags: {
            connect: tagIds.filter(Boolean).map(id => ({ id })),
          },
        },
      })
    }
  }  // デモユーザーを作成
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      id: 'demo-user-1',
      name: 'デモユーザー',
      email: 'demo@example.com',
      emailVerified: new Date(),
      hashedPassword: null, // OAuth用のデモユーザー
    },
  })
  // キャラクターコンテンツを作成
  const characterContents = [
    // サクラのコンテンツ（小説）
    {
      id: 'content-1',
      title: 'サクラの春の物語',
      description: '桜の花びらが舞い散る中で起こる心温まるエピソード。サクラの優しさが伝わる感動的な短編です。',
      contentType: 'story',
      storyContent: `春の陽だまりの中で、サクラは静かに微笑んでいました。「今日はとても良い天気ですね」と彼女は言いました。桜の花びらが風に舞い踊り、まるで彼女の優しい心を表現しているかのようでした。

「あなたも一緒にお花見しませんか？」サクラは手作りのお弁当を広げながら言いました。彼女の笑顔は桜の花よりも美しく、見ているだけで心が温かくなります。

風が吹くたびに舞い散る花びらを見つめながら、サクラは語りかけます。「桜の花は短い命ですが、その美しさは永遠に心に残るんです。人との出会いも同じですね。」

そんな彼女の言葉に、心が癒されていくのを感じました。サクラと過ごす時間は、まさに桜の季節のように儚くも美しいものでした。`,
      characterId: 'character-1',
      userId: demoUser.id,
      isPublic: true,
      likes: 45,
      views: 280,
    },
    {
      id: 'content-2',
      title: 'サクラの料理教室',
      description: 'サクラが教える心のこもった手料理のレシピと、料理に込められた思い',
      contentType: 'story',
      storyContent: `「今日は桜餅を作りましょう！」サクラはエプロンを身に着けながら言いました。彼女の手つきは丁寧で、一つ一つの工程に愛情を込めています。

「料理は心です」とサクラは微笑みます。「大切な人を思いながら作ると、きっと美味しくなりますよ。」

粉を混ぜる手の動きも、餡を包む仕草も、すべてが優雅で美しく見えます。完成した桜餅は、まるでサクラの優しさそのもののような味がしました。`,
      characterId: 'character-1',
      userId: demoUser.id,
      isPublic: true,
      likes: 32,
      views: 195,
    },
    // サクラの動画コンテンツ
    {
      id: 'content-3',
      title: 'サクラの桜並木散歩',
      description: 'サクラと一緒に桜並木を歩く癒しの動画。彼女の優しい声と美しい桜の映像をお楽しみください',
      contentType: 'video',
      contentUrl: '/videos/sakura-walk.mp4',
      characterId: 'character-1',
      userId: demoUser.id,
      isPublic: true,
      likes: 78,
      views: 520,
    },
    // ユキのコンテンツ（小説）
    {
      id: 'content-4',
      title: 'ユキの図書館での一日',
      description: '静かな図書館でユキが過ごす知的な時間。知識への探求心と冷静な思考が魅力的',
      contentType: 'story',
      storyContent: `図書館の静寂の中で、ユキは古い本を手に取りました。「知識は力です」と彼女は静かに呟きました。青い髪が本のページをめくる風に揺れています。

「この本には、失われた古代文明の秘密が記されています」ユキは冷静な声で説明します。「歴史の謎を解き明かすことは、未来への道筋を見つけることでもあるのです。」

彼女の知的な瞳は、文字を追うたびに輝きを増していきます。深い知識と鋭い洞察力を持つユキと過ごす時間は、まるで知的な冒険のようでした。`,
      characterId: 'character-2',
      userId: demoUser.id,
      isPublic: true,
      likes: 56,
      views: 340,
    },
    {
      id: 'content-5',
      title: 'ユキの天体観測',
      description: 'ユキと一緒に星空を観察する神秘的な夜。宇宙の謎について語り合う知的な物語',
      contentType: 'story',
      storyContent: `星空の下で、ユキは望遠鏡を覗き込んでいます。「宇宙は無限の可能性に満ちています」と彼女は神秘的に微笑みます。

「あの星座には、古代の人々の想いが込められているんです」ユキの説明は詳しく、聞いているだけで宇宙への理解が深まります。

冷たい夜風が彼女の青い髪を揺らしますが、その知的な表情は変わりません。星の光が彼女の瞳に反射して、まるで宇宙の知恵を宿しているかのようでした。`,
      characterId: 'character-2',
      userId: demoUser.id,
      isPublic: true,
      likes: 43,
      views: 265,
    },
    // ユキの動画コンテンツ
    {
      id: 'content-6',
      title: 'ユキの研究室ツアー',
      description: 'ユキが自分の研究室を案内する知的な動画。最新の研究設備と彼女の専門知識を紹介',
      contentType: 'video',
      contentUrl: '/videos/yuki-lab-tour.mp4',
      characterId: 'character-2',
      userId: demoUser.id,
      isPublic: true,
      likes: 64,
      views: 420,
    },
    // アカネのコンテンツ（小説）
    {
      id: 'content-7',
      title: 'アカネの朝ランニング',
      description: '元気いっぱいのアカネが朝のランニングを楽しむ話。彼女のポジティブなエネルギーが伝わる',
      contentType: 'story',
      storyContent: `朝日が昇る中、アカネは軽快な足取りで走っていました。「今日も一日頑張りましょう！」と彼女は元気よく声をかけました。赤い髪が朝風になびいています。

「運動は体だけじゃなくて、心も元気にしてくれるんです！」アカネの声は弾んでいます。彼女のペースについていくのは大変ですが、そのエネルギーは伝染性があります。

「負けられませんね！」と言いながら、アカネは更にペースを上げます。彼女の前向きな姿勢は、見ているだけで勇気がもらえました。`,
      characterId: 'character-3',
      userId: demoUser.id,
      isPublic: true,
      likes: 67,
      views: 380,
    },
    {
      id: 'content-8',
      title: 'アカネのスポーツ指導',
      description: 'アカネが初心者にスポーツを教える心温まるエピソード。彼女の面倒見の良さが光る',
      contentType: 'story',
      storyContent: `「大丈夫、最初はみんなそうですよ！」アカネは転んでしまった初心者に優しく声をかけます。彼女の笑顔は太陽のように明るく、励ましの言葉には真心がこもっています。

「スポーツは競争じゃありません。自分自身との挑戦なんです」とアカネは教えます。失敗を恐れず、楽しむことの大切さを彼女から学びました。`,
      characterId: 'character-3',
      userId: demoUser.id,
      isPublic: true,
      likes: 52,
      views: 295,
    },
    // アカネの動画コンテンツ
    {
      id: 'content-9',
      title: 'アカネのワークアウト動画',
      description: 'アカネと一緒に楽しくエクササイズ！初心者でも安心のトレーニング動画',
      contentType: 'video',
      contentUrl: '/videos/akane-workout.mp4',
      characterId: 'character-3',
      userId: demoUser.id,
      isPublic: true,
      likes: 95,
      views: 680,
    },
    // ミドリのコンテンツ（小説）
    {
      id: 'content-10',
      title: 'ミドリのガーデニング',
      description: 'ミドリが愛する庭で植物の世話をする穏やかな時間。自然との調和を感じる癒しの物語',
      contentType: 'story',
      storyContent: `緑豊かな庭で、ミドリは優しく花に水をやっていました。「植物たちはみんな生きているんです」と彼女は穏やかに微笑みました。自然との調和を感じる瞬間でした。

「この子たちの声が聞こえるんです」ミドリは花に語りかけます。「今日も元気に咲いてくれてありがとう、って。」

彼女の手に触れられた植物たちは、より一層美しく輝いて見えます。ミドリの愛情が、庭全体を優しく包み込んでいるようでした。`,
      characterId: 'character-4',
      userId: demoUser.id,
      isPublic: true,
      likes: 58,
      views: 325,
    },
    {
      id: 'content-11',
      title: 'ミドリの森の散策',
      description: 'ミドリと一緒に深い森を歩く神秘的な体験。自然の美しさと生命力を感じる',
      contentType: 'story',
      storyContent: `深い森の中で、ミドリは立ち止まって大きく息を吸い込みます。「森の香りは心を落ち着かせてくれますね」と彼女は静かに微笑みます。

「木々は長い時間をかけて成長し、多くの生命を支えています」ミドリの説明を聞きながら森を歩くと、自然の偉大さを実感できます。

鳥のさえずり、葉の擦れる音、小川のせせらぎ。ミドリと一緒にいると、自然の音楽がより美しく聞こえました。`,
      characterId: 'character-4',
      userId: demoUser.id,
      isPublic: true,
      likes: 41,
      views: 240,
    },
    // ミドリの動画コンテンツ
    {
      id: 'content-12',
      title: 'ミドリの植物図鑑',
      description: 'ミドリが様々な植物を紹介する教育的な動画。植物の特徴や育て方を優しく解説',
      contentType: 'video',
      contentUrl: '/videos/midori-plants.mp4',
      characterId: 'character-4',
      userId: demoUser.id,
      isPublic: true,
      likes: 72,
      views: 450,
    },
    // ムラサキのコンテンツ（小説）
    {
      id: 'content-13',
      title: 'ムラサキの夜の魔法',
      description: '神秘的なムラサキが夜に見せる不思議な魔法。幻想的で美しい魔法の世界へご案内',
      contentType: 'story',
      storyContent: `月明かりの下で、ムラサキは静かに魔法の呪文を唱えていました。「この世界にはまだ知られていない秘密がたくさんあります」と彼女は神秘的に微笑みました。

紫の髪が夜風に舞い、彼女の周りには幻想的な光が踊っています。「魔法は心の力です」とムラサキは説明します。「信じる気持ちが、不可能を可能にするのです。」

彼女の魔法を見ていると、現実と夢の境界が曖昧になります。ムラサキの存在そのものが、まるで魔法のようでした。`,
      characterId: 'character-5',
      userId: demoUser.id,
      isPublic: true,
      likes: 89,
      views: 485,
    },
    {
      id: 'content-14',
      title: 'ムラサキの占い館',
      description: 'ムラサキが神秘的な占いで未来を見つめる物語。彼女の洞察力の深さに驚かされる',
      contentType: 'story',
      storyContent: `薄暗い占い館で、ムラサキはタロットカードを広げています。「未来は決められたものではありません」と彼女は静かに語ります。

「カードが示すのは可能性です。あなた自身の選択が、運命を創り出すのです」ムラサキの言葉には不思議な説得力があります。

彼女の洞察は驚くほど的確で、まるで心の奥底まで見透かされているようでした。ムラサキとの出会いは、人生を変える転機となるかもしれません。`,
      characterId: 'character-5',
      userId: demoUser.id,
      isPublic: true,
      likes: 76,
      views: 410,
    },
    // ムラサキの動画コンテンツ
    {
      id: 'content-15',
      title: 'ムラサキの魔法レッスン',
      description: 'ムラサキが基本的な魔法を教える神秘的な動画。幻想的な演出と美しい映像美',
      contentType: 'video',
      contentUrl: '/videos/murasaki-magic.mp4',
      characterId: 'character-5',
      userId: demoUser.id,
      isPublic: true,
      likes: 134,
      views: 750,
    },
  ]

  for (const content of characterContents) {
    await prisma.characterContent.upsert({
      where: { id: content.id },
      update: {},
      create: content,
    })
  }

  console.log('シードデータの挿入が完了しました！')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
