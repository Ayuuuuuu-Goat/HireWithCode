"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function DebugPage() {
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl: boolean
    supabaseKey: boolean
  }>({
    supabaseUrl: false,
    supabaseKey: false
  })
  const [dbStatus, setDbStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [dbError, setDbError] = useState<string>('')

  useEffect(() => {
    // 检查客户端环境变量
    setEnvStatus({
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })

    // 测试数据库连接
    testDatabaseConnection()
  }, [])

  const testDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('analysis_records')
        .select('count')
        .limit(1)

      if (error) {
        setDbStatus('error')
        setDbError(error.message)
      } else {
        setDbStatus('success')
      }
    } catch (error: any) {
      setDbStatus('error')
      setDbError(error.message || '未知错误')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">系统调试信息</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 环境变量状态 */}
          <Card>
            <CardHeader>
              <CardTitle>环境变量状态</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Supabase URL:</span>
                <Badge variant={envStatus.supabaseUrl ? 'default' : 'destructive'}>
                  {envStatus.supabaseUrl ? '已配置' : '未配置'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Supabase Key:</span>
                <Badge variant={envStatus.supabaseKey ? 'default' : 'destructive'}>
                  {envStatus.supabaseKey ? '已配置' : '未配置'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>DeepSeek Key:</span>
                <Badge variant="secondary">
                  服务器端配置
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 数据库连接状态 */}
          <Card>
            <CardHeader>
              <CardTitle>数据库连接状态</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>连接状态:</span>
                <Badge 
                  variant={dbStatus === 'success' ? 'default' : dbStatus === 'error' ? 'destructive' : 'secondary'}
                >
                  {dbStatus === 'loading' ? '检查中...' : dbStatus === 'success' ? '连接成功' : '连接失败'}
                </Badge>
              </div>
              {dbStatus === 'error' && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <strong>错误信息:</strong> {dbError}
                </div>
              )}
              <Button 
                onClick={testDatabaseConnection}
                disabled={dbStatus === 'loading'}
                size="sm"
              >
                重新测试连接
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 配置说明 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>配置说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">1. 环境变量配置</h3>
                <p className="text-gray-600 mb-2">确保在项目根目录创建 <code className="bg-gray-100 px-1 rounded">.env.local</code> 文件：</p>
                <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
{`# Supabase配置（客户端可访问）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# DeepSeek API配置（仅服务器端）
DEEPSEEK_API_KEY=your_deepseek_api_key`}
                </pre>
                <p className="text-gray-500 text-xs mt-2">
                  <strong>注意：</strong> NEXT_PUBLIC_ 前缀的环境变量在客户端可见，其他变量仅在服务器端可用
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">2. 数据库表创建</h3>
                <p className="text-gray-600 mb-2">在Supabase SQL编辑器中运行：</p>
                <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
{`CREATE TABLE analysis_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID,
  agent_type TEXT NOT NULL,
  input_text TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  error_message TEXT
);`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. 测试分析功能</h3>
                <p className="text-gray-600 mb-2">如果数据库未配置，分析功能仍然可以正常工作，只是不会保存历史记录。</p>
                <p className="text-gray-600">访问主页测试分析功能：<a href="/" className="text-blue-600 hover:underline">返回主页</a></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 