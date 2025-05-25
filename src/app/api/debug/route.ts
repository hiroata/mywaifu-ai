import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 本番環境でのデバッグ情報（機密情報は除く）
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    platform: process.platform,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    environmentVariables: {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET', 
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
      XAI_API_KEY: process.env.XAI_API_KEY ? 'SET' : 'NOT SET',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET',
      RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL || 'NOT SET',
    },
    buildInfo: {
      nextjsVersion: process.env.npm_package_dependencies_next || 'unknown',
      buildTime: process.env.BUILD_TIME || 'unknown'
    }
  };

  return NextResponse.json(debugInfo, {
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    }
  });
}
