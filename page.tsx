// サーバーコンポーネント
import ContentUploadPage from './client-page';

// 静的生成のためのパラメータを指定します
export function generateStaticParams() {
  // 注意: ここでは静的ビルドのために固定IDリストを返します
  // 本番環境では、データベースやAPIから実際のキャラクターIDリストを取得する必要があります
  return [
    { id: 'character-1' },
    { id: 'character-2' },
    { id: 'character-3' },
    { id: 'character-4' },
    { id: 'character-5' },
  ];
}

// サーバーコンポーネントから、クライアントコンポーネントを呼び出します
export default function Page({ params }: { params: { id: string } }) {
  return <ContentUploadPage params={params} />;
}
