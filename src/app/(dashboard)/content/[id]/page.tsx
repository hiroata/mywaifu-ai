// filepath: c:\Users\atara\Desktop\mywaifu-ai\src\app\(dashboard)\content\[id]\page.tsx
import ContentDetailPage from './client-page';
import { generateContentStaticParams } from '@/lib/static-params';

// 静的生成のためのパラメータを指定します
export function generateStaticParams() {
  return generateContentStaticParams();
}

// サーバーコンポーネントから、クライアントコンポーネントを呼び出します
export default function Page({ params }: { params: { id: string } }) {
  return <ContentDetailPage params={params} />;
}
