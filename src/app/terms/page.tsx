import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/register">
            <Button variant="ghost" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              登録ページに戻る
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              MyWaifuAI 利用規約
            </CardTitle>
            <p className="text-center text-gray-600 mt-2">
              最終更新日: 2025年5月25日
            </p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-3">第1条（適用）</h2>
                <p className="text-gray-700 leading-relaxed">
                  本規約は、MyWaifuAI（以下「当サービス」）の利用条件を定めるものです。
                  利用者は本規約に同意したうえで当サービスを利用するものとします。
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">第2条（利用登録）</h2>
                <p className="text-gray-700 leading-relaxed">
                  当サービスの利用を希望する者は、本規約に同意のうえ、当社の定める方法によって利用登録を申請し、
                  当社がこれを承認することによって利用登録が完了するものとします。
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">第3条（禁止事項）</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  利用者は、当サービスの利用にあたり、以下の行為をしてはなりません。
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>法令または公序良俗に違反する行為</li>
                  <li>犯罪行為に関連する行為</li>
                  <li>当社、当サービスの他の利用者、または第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                  <li>当社のサービスの運営を妨害するおそれのある行為</li>
                  <li>他の利用者に関する個人情報等を収集または蓄積する行為</li>
                  <li>不正アクセスをし、またはこれを試みる行為</li>
                  <li>他の利用者に成りすます行為</li>
                  <li>当社のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
                  <li>その他、当社が不適切と判断する行為</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">第4条（本サービスの提供の停止等）</h2>
                <p className="text-gray-700 leading-relaxed">
                  当社は、以下のいずれかの事由があると判断した場合、利用者に事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">第5条（利用制限および登録抹消）</h2>
                <p className="text-gray-700 leading-relaxed">
                  当社は、利用者が以下のいずれかに該当する場合には、事前の通知なく、投稿データを削除し、
                  当該利用者に対して本サービスの全部もしくは一部の利用を制限しまたは利用者としての登録を抹消することができるものとします。
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">第6条（保証の否認および免責事項）</h2>
                <p className="text-gray-700 leading-relaxed">
                  当社は、本サービスに事実上または法律上の瑕疵がないことを明示的にも黙示的にも保証しておりません。
                  当社は、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">第7条（サービス内容の変更等）</h2>
                <p className="text-gray-700 leading-relaxed">
                  当社は、利用者に通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、
                  これによって利用者に生じた損害について一切の責任を負いません。
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">第8条（利用規約の変更）</h2>
                <p className="text-gray-700 leading-relaxed">
                  当社は、必要と判断した場合には、利用者に通知することなくいつでも本規約を変更することができるものとします。
                  なお、本規約の変更後、本サービスの利用を開始した場合には、当該利用者は変更後の規約に同意したものとみなします。
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">第9条（個人情報の取扱い）</h2>
                <p className="text-gray-700 leading-relaxed">
                  当社は、本サービスの利用によって取得する個人情報については、当社「プライバシーポリシー」に従い適切に取り扱うものとします。
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">第10条（準拠法・裁判管轄）</h2>
                <p className="text-gray-700 leading-relaxed">
                  本規約の解釈にあたっては、日本法を準拠法とします。
                  本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
                </p>
              </section>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>お問い合わせ:</strong><br />
                  本規約に関するご質問やお問い合わせは、サービス内のお問い合わせフォームよりご連絡ください。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
