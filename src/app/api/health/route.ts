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
      version: process.env.npm_package_version || '0.1.1',
      services: {
        database: 'checking...',
        auth: 'ok',
        websocket: 'ok',
        configuration: 'checking...',
        ai_apis: {
          openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
          xai: process.env.XAI_API_KEY ? 'configured' : 'missing',
          gemini: process.env.GEMINI_API_KEY ? 'configured' : 'missing'
        }
      },
      environment_vars: {
        DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'MISSING'
      }
    };

    // データベース接続チェック
    try {
      await db.user.count();
      health.services.database = 'ok';
    } catch (error) {
      console.error('Database health check failed:', error);
      health.services.database = `error: ${error instanceof Error ? error.message : 'Unknown error'}`;
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
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
