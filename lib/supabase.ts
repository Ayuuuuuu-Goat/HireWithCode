import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 检查环境变量是否配置
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase环境变量未配置，数据库功能将不可用')
  console.warn('请检查 .env.local 文件中的 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// 数据库表结构类型定义
export interface AnalysisRecord {
  id?: string
  created_at?: string
  user_id?: string
  agent_type: string
  input_text: string
  analysis_result: {
    themes?: string[]
    people?: string[]
    todos?: string[]
    summaryParagraphs?: string[]
    qa?: { question: string; answer: string }[]
    mindMap?: any
  }
  status: 'success' | 'error'
  error_message?: string
}

// 创建数据库记录的辅助函数
export async function createAnalysisRecord(record: Omit<AnalysisRecord, 'id' | 'created_at'>) {
  console.log('💾 开始创建数据库记录:', record.agent_type)
  
  try {
    const { data, error } = await supabase
      .from('analysis_records')
      .insert([record])
      .select()

    if (error) {
      console.warn("❌ 数据库存储失败:", error.message)
      return { success: false, error }
    }

    console.log('✅ 数据库记录创建成功，ID:', data?.[0]?.id)
    return { success: true, data: data?.[0] }
  } catch (error) {
    console.warn("❌ 数据库连接失败:", error)
    return { success: false, error }
  }
} 