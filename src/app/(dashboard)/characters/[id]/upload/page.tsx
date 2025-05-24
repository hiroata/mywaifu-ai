// サーバーコンポーネント
import ContentUploadPage from './client-page';
import { generateCharacterStaticParams } from '@/lib/static-params';

// 静的生成のためのパラメータを指定します
export function generateStaticParams() {
  return generateCharacterStaticParams();
}

// サーバーコンポーネントから、クライアントコンポーネントを呼び出します
export default function Page({ params }: { params: { id: string } }) {
  return <ContentUploadPage params={params} />;
}
