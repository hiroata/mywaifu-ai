<?php
// このスクリプトは、ロリポップサーバーでNode.jsプロセスを起動・停止するためのものです

// サーバーのステータスをチェック
$pid_file = 'server.pid';
$is_running = false;
$current_pid = '';

if (file_exists($pid_file)) {
    $current_pid = trim(file_get_contents($pid_file));
    // Linuxでプロセスが実行中かチェック
    exec("ps -p $current_pid", $output, $return_val);
    $is_running = ($return_val === 0);
}

// アクションの判定 (起動・停止・再起動)
$action = isset($_GET['action']) ? $_GET['action'] : '';

// メッセージを保存する変数
$message = '';

switch ($action) {
    case 'start':
        if ($is_running) {
            $message = "サーバーは既に実行中です (PID: $current_pid)";
        } else {
            // サーバーを起動
            exec("bash start-server.sh > /dev/null 2>&1 &", $output, $return_val);
            $message = ($return_val === 0) 
                ? "サーバーを起動しました" 
                : "サーバーの起動に失敗しました";
            
            // 少し待ってから状態を再チェック
            sleep(2);
            if (file_exists($pid_file)) {
                $current_pid = trim(file_get_contents($pid_file));
                $message .= " (新しいPID: $current_pid)";
            }
        }
        break;
        
    case 'stop':
        if ($is_running) {
            // サーバーを停止
            exec("kill $current_pid", $output, $return_val);
            $message = ($return_val === 0) 
                ? "サーバーを停止しました (PID: $current_pid)" 
                : "サーバーの停止に失敗しました";
                
            if ($return_val === 0) {
                @unlink($pid_file);
            }
        } else {
            $message = "サーバーは実行されていません";
        }
        break;
        
    case 'restart':
        // まず停止
        if ($is_running) {
            exec("kill $current_pid", $output, $return_val);
            if ($return_val !== 0) {
                $message = "サーバーの停止に失敗しました";
                break;
            }
            @unlink($pid_file);
            sleep(2);
        }
        
        // 次に起動
        exec("bash start-server.sh > /dev/null 2>&1 &", $output, $return_val);
        $message = ($return_val === 0) 
            ? "サーバーを再起動しました" 
            : "サーバーの再起動に失敗しました";
        
        // 少し待ってから状態を再チェック
        sleep(2);
        if (file_exists($pid_file)) {
            $current_pid = trim(file_get_contents($pid_file));
            $message .= " (新しいPID: $current_pid)";
        }
        break;
        
    default:
        // ステータスのみ表示
        if ($is_running) {
            $message = "サーバーは実行中です (PID: $current_pid)";
        } else {
            $message = "サーバーは停止しています";
        }
}

// ログファイルの内容を取得
$log_content = '';
if (file_exists('server.log')) {
    $log_content = file_get_contents('server.log');
    // 最大10000文字まで表示
    if (strlen($log_content) > 10000) {
        $log_content = '...' . substr($log_content, -10000);
    }
}
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Node.jsサーバー管理</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
        }
        .status {
            margin: 20px 0;
            padding: 15px;
            background-color: #f8f9fa;
            border-left: 4px solid #28a745;
        }
        .controls {
            margin: 20px 0;
        }
        .controls a {
            display: inline-block;
            margin-right: 10px;
            padding: 8px 15px;
            color: white;
            text-decoration: none;
            border-radius: 4px;
        }
        .start { background-color: #28a745; }
        .stop { background-color: #dc3545; }
        .restart { background-color: #ffc107; color: #333 !important; }
        .logs {
            margin-top: 30px;
        }
        pre {
            background-color: #f8f9fa;
            padding: 15px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <h1>Node.jsサーバー管理</h1>
    
    <?php if ($message): ?>
    <div class="status">
        <?php echo htmlspecialchars($message); ?>
    </div>
    <?php endif; ?>
    
    <div class="controls">
        <a href="?action=start" class="start">起動</a>
        <a href="?action=stop" class="stop">停止</a>
        <a href="?action=restart" class="restart">再起動</a>
        <a href="?" style="color: #333; text-decoration: underline;">ステータス確認</a>
    </div>
    
    <div class="logs">
        <h2>サーバーログ</h2>
        <pre><?php echo htmlspecialchars($log_content); ?></pre>
    </div>
</body>
</html>
