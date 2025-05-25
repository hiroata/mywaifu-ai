// 非認証でアクセス可能なキャラクター詳細ページ
import CharacterDetailPage from './client-page';

export default function Page({ params }: { params: { id: string } }) {
  return <CharacterDetailPage params={params} />;
}
