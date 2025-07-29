import { NextRequest, NextResponse } from "next/server"
import { supabase, AnalysisRecord, createAnalysisRecord } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  console.log('🚀 开始处理通用分析请求')
  
  try {
    const { text } = await request.json()
    console.log('📝 接收到输入文本，长度:', text.length)

    if (!text || typeof text !== "string") {
      console.log('❌ 输入验证失败')
      return NextResponse.json({ error: "请提供有效的文本内容" }, { status: 400 })
    }
    console.log('✅ 输入验证通过')

    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      console.log('❌ API密钥未配置')
      return NextResponse.json({ error: "API密钥未配置" }, { status: 500 })
    }
    console.log('✅ API密钥检查通过')

    const prompt = `你是一个专业的文本分析助手，请分析文本，返回JSON：

${text}

格式：
{
  "themes": ["主题1", "主题2", "主题3"],
  "people": ["人员1", "人员2", "人员3"],
  "todos": ["待办1", "待办2", "待办3"],
  "summaryParagraphs": ["摘要段落1", "摘要段落2", "摘要段落3"],
  "qa": [
    {"question": "问题1", "answer": "答案1"},
    {"question": "问题2", "answer": "答案2"},
    {"question": "问题3", "answer": "答案3"}
  ],
  "mindMap": {
    "meta": {"name": "分析", "author": "AI", "version": "1.0"},
    "format": "node_tree",
    "data": {
      "id": "root",
      "topic": "主题",
      "children": [
        {"id": "n1", "topic": "要点1", "children": [{"id": "n1_1", "topic": "细节1"}]},
        {"id": "n2", "topic": "要点2", "children": [{"id": "n2_1", "topic": "细节2"}]}
      ]
    }
  }
}

注意：不要限制人名和待办任务的数量，有多少提取多少。`

    console.log('📋 构建AI提示词完成')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)
    console.log('⏱️ 设置30秒超时')

    try {
      console.log('🌐 开始调用DeepSeek API')
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
          presence_penalty: 0,
          frequency_penalty: 0,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      console.log('✅ API请求完成，状态码:', response.status)

      if (!response.ok) {
        console.log('❌ API请求失败:', response.status)
        throw new Error(`API请求失败: ${response.status}`)
      }

      const data = await response.json()
      console.log('📦 解析API响应完成')
      
      // 处理AI返回的内容，清理Markdown格式
      let content = data.choices[0].message.content.trim()
      console.log('🧹 清理Markdown格式前内容长度:', content.length)
      
      // 移除可能的Markdown代码块标记
      content = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim()
      console.log('🧹 清理Markdown格式后内容长度:', content.length)
      
      // 尝试解析JSON
      let analysisResult
      try {
        analysisResult = JSON.parse(content)
        console.log('✅ JSON解析成功')
      } catch (parseError) {
        console.error('❌ JSON解析失败:', parseError)
        console.error('原始内容:', content)
        
        // 如果解析失败，返回错误信息
        throw new Error('AI返回的内容格式不正确，请重试')
      }

      console.log('💾 开始存储到数据库')
      // 尝试存储到Supabase数据库（可选功能）
      const recordResult = await createAnalysisRecord({
        agent_type: "general",
        input_text: text,
        analysis_result: analysisResult,
        status: "success"
      })

      if (!recordResult.success) {
        console.warn("⚠️ 数据库存储失败（不影响分析功能）:", recordResult.error)
      } else {
        console.log('✅ 数据库存储成功')
      }

      console.log('🎉 通用分析处理完成')
      return NextResponse.json(analysisResult)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      console.log('❌ API调用失败:', fetchError.message)
      
      // 尝试存储错误记录到数据库（可选功能）
      console.log('💾 开始存储错误记录到数据库')
      await createAnalysisRecord({
        agent_type: "general",
        input_text: text,
        analysis_result: {},
        status: "error",
        error_message: fetchError.message || "分析失败"
      })
      console.log('✅ 错误记录存储完成')

      throw fetchError
    }
  } catch (error: any) {
    console.error("💥 通用分析错误:", error)
    console.log('🔄 返回错误响应')
    return NextResponse.json(
      { 
        error: "通用分析错误",
        themes: ["示例主题"],
        people: ["示例人员"],
        todos: ["示例待办"],
        summaryParagraphs: ["这是一个示例摘要段落"],
        qa: [
          { question: "示例问题", answer: "示例答案" }
        ],
        mindMap: {
          meta: { name: "分析", author: "AI", version: "1.0" },
          format: "node_tree",
          data: {
            id: "root",
            topic: "示例主题",
            children: [
              { id: "n1", topic: "示例要点1", children: [{ id: "n1_1", topic: "示例细节1" }] },
              { id: "n2", topic: "示例要点2", children: [{ id: "n2_1", topic: "示例细节2" }] }
            ]
          }
        }
      },
      { status: 500 }
    )
  }
}
