-- ContentLikeモデルの追加
model ContentLike {
  userId            String
  contentId         String
  createdAt         DateTime  @default(now())
  
  // 関連テーブル
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  content           CharacterContent @relation(fields: [contentId], references: [id], onDelete: Cascade)
  
  // 複合主キー
  @@id([userId, contentId])
  @@map("content_likes")
}

// User (ユーザー) モデルに関連フィールドを追加
model User {
  // 既存のフィールド
  contentLikes      ContentLike[]
}

// CharacterContent モデルに関連フィールドを追加
model CharacterContent {
  // 既存のフィールド
  contentLikes      ContentLike[]
}
