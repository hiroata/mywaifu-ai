import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // 基本的なヘルスチェック
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '0.1.1',      services: {
        database: 'checking...',
        auth: 'ok',
        websocket: 'ok',
        configuration: 'ok',
        ai_apis: {
          openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
          xai: process.env.XAI_API_KEY ? 'configured' : 'missing',
          gemini: process.env.GEMINI_API_KEY ? 'configured' : 'missing'
        }
      }
    };

    // データベース接続チェック
    try {
      await db.user.count();
      health.services.database = 'ok';
    } catch (error) {
      console.error('Database health check failed:', error);
      health.services.database = 'error';
      health.status = 'degraded';
    }

    // APIキー設定確認
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
      health.status = 'degraded';
      health.services.configuration = `Missing: ${missingEnvVars.join(', ')}`;
    }

    return NextResponse.json(health, {
      status: health.status === 'ok' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, { status: 503 });
  }
}
