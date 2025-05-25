'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  content: string;
  userId: string;
  timestamp: string;
  isBot: boolean;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  joinChat: (chatId: string) => void;
  sendMessage: (chatId: string, message: string, userId: string) => void;
  setTyping: (chatId: string, userId: string, isTyping: boolean) => void;
}

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    // WebSocketサーバーに接続
    const socketUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin
      : 'http://localhost:3001'; // 開発環境のポートを3001に変更

    console.log('Connecting to WebSocket:', socketUrl);

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      forceNew: true, // 強制的に新しい接続を作成
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // 接続イベント
    newSocket.on('connect', () => {
      console.log('WebSocketに接続しました:', newSocket.id);
      setIsConnected(true);
    });

    // 切断イベント
    newSocket.on('disconnect', (reason) => {
      console.log('WebSocketから切断しました:', reason);
      setIsConnected(false);
    });

    // 再接続イベント
    newSocket.on('reconnect', (attemptNumber) => {
      console.log('WebSocketに再接続しました:', attemptNumber);
      setIsConnected(true);
    });

    // エラーイベント
    newSocket.on('connect_error', (error) => {
      console.error('WebSocket接続エラー:', error);
      setIsConnected(false);
    });

    // クリーンアップ
    return () => {
      newSocket.close();
      socketRef.current = null;
    };
  }, []);

  const joinChat = (chatId: string) => {
    if (socket?.connected) {
      socket.emit('join-chat', chatId);
      console.log('チャットルームに参加:', chatId);
    }
  };

  const sendMessage = (chatId: string, message: string, userId: string) => {
    if (socket?.connected) {
      socket.emit('send-message', { chatId, message, userId });
    }
  };

  const setTyping = (chatId: string, userId: string, isTyping: boolean) => {
    if (socket?.connected) {
      socket.emit('typing', { chatId, userId, isTyping });
    }
  };

  return {
    socket,
    isConnected,
    joinChat,
    sendMessage,
    setTyping,
  };
};

export default useSocket;
