'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error?.toLowerCase()) { // エラーコードを小文字で比較
      case 'configuration':
        return 'サーバーの設定に問題があります。管理者にお問い合わせください。'
      case 'accessdenied':
        return 'アクセスが拒否されました。権限がない可能性があります。'
      case 'verification':
        return 'メール認証トークンが無効であるか、期限切れです。再度お試しください。'
      case 'credentialsSignin':
        return 'メールアドレスまたはパスワードが正しくありません。'
      case 'oauthsignin':
      case 'oauthcallback':
      case 'oauthcreateaccount':
      case 'emailcreateaccount':
      case 'callback':
        return '外部プロバイダーでのサインイン中にエラーが発生しました。'
      case 'emailsignin':
         return 'メールアドレスの送信に失敗しました。'
      case 'sessionrequired':
        return 'このページにアクセスするにはサインインが必要です。'
      default:
        return `認証中にエラーが発生しました。(${error || '不明なエラー'})`
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            認証エラー
          </h2>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  ログインできませんでした
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{getErrorMessage(error)}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              ログインページに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
