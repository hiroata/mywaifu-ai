-- 20240521_add_ai_provider_to_messages
-- マイグレーション: メッセージテーブルにAIプロバイダーカラムを追加

-- メッセージテーブルにaiProviderカラムを追加
ALTER TABLE `Message` ADD COLUMN `aiProvider` VARCHAR(191) NULL;

-- 既存データのaiProviderにはデフォルト値としてopenaiを設定
UPDATE `Message` SET `aiProvider` = 'openai' WHERE `role` = 'assistant' AND `aiProvider` IS NULL;
