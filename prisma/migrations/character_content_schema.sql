// 追加するスキーマ定義

// Character Content (キャラクターコンテンツ)
model CharacterContent {
  id                String    @id @default(cuid())
  title             String
  description       String
  contentType       String    // "story", "image", "video"
  contentUrl        String?   // 画像や動画のURL
  storyContent      String?   // 小説/ストーリーのテキスト
  characterId       String?
  customCharacterId String?
  userId            String
  isPublic          Boolean   @default(true)
  likes             Int       @default(0)
  views             Int       @default(0)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // 関連テーブル
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  character         Character? @relation(fields: [characterId], references: [id], onDelete: SetNull)
  customCharacter   CustomCharacter? @relation(fields: [customCharacterId], references: [id], onDelete: SetNull)
  comments          ContentComment[]
  contentTags       ContentTag[]
}

// Content Comment (コンテンツへのコメント)
model ContentComment {
  id                String    @id @default(cuid())
  contentId         String
  userId            String
  comment           String
  createdAt         DateTime  @default(now())
  
  // 関連テーブル
  content           CharacterContent @relation(fields: [contentId], references: [id], onDelete: Cascade)
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Content Tag (コンテンツのタグ)
model ContentTag {
  id                String    @id @default(cuid())
  name              String
  contentId         String
  
  // 関連テーブル
  content           CharacterContent @relation(fields: [contentId], references: [id], onDelete: Cascade)
  
  @@unique([name, contentId])
}

// User (ユーザー) モデルに関連フィールドを追加
model User {
  // 既存のフィールド
  characterContents CharacterContent[]
  contentComments   ContentComment[]
}

// Character (キャラクター) モデルに関連フィールドを追加
model Character {
  // 既存のフィールド
  contents          CharacterContent[]
}

// CustomCharacter (カスタムキャラクター) モデルに関連フィールドを追加
model CustomCharacter {
  // 既存のフィールド
  contents          CharacterContent[]
}
