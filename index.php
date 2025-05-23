<?php
// filepath: c:\Users\atara\Desktop\mywaifu-ai\public\index.php
// Node.jsアプリケーションへのプロキシスクリプト
$host = 'localhost';
$port = 3000;

// リクエストURIを取得
$request_uri = $_SERVER['REQUEST_URI'];

// リクエストヘッダーを準備
$headers = [];
foreach ($_SERVER as $key => $value) {
    if (strpos($key, 'HTTP_') === 0) {
        // HTTP_USER_AGENTをUser-Agentに変換するなど
        $name = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($key, 5)))));
        $headers[] = "$name: $value";
    }
}

// リクエストボディを取得
$request_body = file_get_contents('php://input');

// Node.jsサーバーに転送するリクエストを設定
$context = stream_context_create([
    'http' => [
        'method' => $_SERVER['REQUEST_METHOD'],
        'header' => implode("\r\n", $headers),
        'content' => $request_body,
        'ignore_errors' => true, // エラーレスポンスも処理する
    ],
]);

// Node.jsサーバーにリクエストを転送
$response = @file_get_contents("http://$host:$port$request_uri", false, $context);

// レスポンスヘッダーを取得して設定
foreach ($http_response_header as $header) {
    if (!preg_match('/^Transfer-Encoding/', $header)) {
        header($header);
    }
}

// レスポンスボディを出力
echo $response;
