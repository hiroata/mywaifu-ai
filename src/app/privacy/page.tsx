import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/register" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft className="mr-2 h-4 w-4" />
            登録ページに戻る
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              MyWaifuAI プライバシーポリシー
            </CardTitle>
            <p className="text-center text-gray-600 mt-2">
              最終更新日: 2025年5月25日
            </p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. 基本方針</h2>
                <p className="text-gray-700 leading-relaxed">
                  MyWaifuAI（以下「当社」）は、お客様の個人情報保護の重要性を認識し、
                  個人情報の保護に関する法律（個人情報保護法）を遵守し、
                  適切な個人情報の保護に努めます。
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">2. 収集する個人情報</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  当社は、以下の個人情報を収集する場合があります：
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>氏名</li>
                  <li>メールアドレス</li>
                  <li>プロフィール画像</li>
                  <li>IPアドレス</li>
                  <li>Cookie情報</li>
                  <li>サービス利用履歴</li>
                  <li>チャット履歴</li>
                  <li>作成したコンテンツ</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">3. 個人情報の利用目的</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  収集した個人情報は、以下の目的で利用いたします：
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>サービスの提供および運営</li>
                  <li>ユーザーサポートの提供</li>
                  <li>サービスの改善および新機能の開発</li>
                  <li>利用状況の分析</li>
                  <li>重要なお知らせの配信</li>
                  <li>不正利用の防止</li>
                  <li>法的義務の履行</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">4. 個人情報の第三者提供</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  当社は、以下の場合を除き、お客様の同意なく個人情報を第三者に提供することはありません：
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>法令に基づく場合</li>
                  <li>人の生命、身体または財産の保護のために必要がある場合</li>
                  <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
                  <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">5. 個人情報の管理</h2>
                <p className="text-gray-700 leading-relaxed">
                  当社は、個人情報の漏洩、滅失またはき損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。
                  個人情報の取扱いを委託する場合には、委託先において個人情報の安全管理が図られるよう必要かつ適切な監督を行います。
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. Cookieについて</h2>
                <p className="text-gray-700 leading-relaxed">
                  当サービスでは、サービスの利便性向上のためにCookieを使用しています。
                  Cookieの使用を希望されない場合は、ブラウザの設定でCookieを無効にすることができますが、
                  一部のサービス機能が利用できなくなる可能性があります。
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">7. Google OAuth認証について</h2>
                <p className="text-gray-700 leading-relaxed">
                  当サービスでは、Googleアカウントでのログイン機能を提供しています。
                  この機能を利用される場合、Googleから提供される基本的なプロフィール情報
                  （名前、メールアドレス、プロフィール画像）を取得します。
                  これらの情報は、アカウント作成およびサービス提供のためにのみ使用されます。
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">8. AI生成コンテンツについて</h2>
                <p className="text-gray-700 leading-relaxed">
                  当サービスでは、AI技術を使用してコンテンツを生成します。
                  お客様との会話履歴は、サービス提供の品質向上のために保存され、
                  匿名化された形で分析に使用される場合があります。
                  個人を特定できる形での会話内容の第三者提供は行いません。
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">9. 個人情報の開示・訂正・削除</h2>
                <p className="text-gray-700 leading-relaxed">
                  お客様は、当社が保有するお客様の個人情報について、開示、訂正、削除を求めることができます。
                  これらのご要請については、本人確認を行った上で、合理的な期間内に対応いたします。
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">10. 個人情報の保存期間</h2>
                <p className="text-gray-700 leading-relaxed">
                  個人情報は、利用目的の達成に必要な期間、または法令で定められた期間保存します。
                  アカウント削除をご希望の場合は、お客様からのご要請に基づき、
                  合理的な期間内に個人情報を削除いたします。
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">11. プライバシーポリシーの変更</h2>
                <p className="text-gray-700 leading-relaxed">
                  本プライバシーポリシーは、法令の変更やサービスの改善に伴い、
                  予告なく変更される場合があります。
                  変更後のプライバシーポリシーは、当サイトに掲載された時点で効力を生じるものとします。
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">12. お問い合わせ</h2>
                <p className="text-gray-700 leading-relaxed">
                  個人情報の取扱いに関するお問い合わせは、サービス内のお問い合わせフォームよりご連絡ください。
                  迅速かつ適切に対応いたします。
                </p>
              </section>

              <div className="mt-8 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>重要:</strong><br />
                  当サービスは、お客様の個人情報保護を最優先に考えています。
                  ご不明な点やご心配な点がございましたら、お気軽にお問い合わせください。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
