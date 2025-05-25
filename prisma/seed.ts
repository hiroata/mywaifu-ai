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
