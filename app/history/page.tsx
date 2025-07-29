"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { supabase, AnalysisRecord } from "@/lib/supabase"
import { Brain, TrendingUp, BookOpen, Stethoscope, Download, Trash2, Eye, UserCheck, Users, CheckSquare } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const agentIcons = {
  general: Brain,
  sales: TrendingUp,
  education: BookOpen,
  medical: Stethoscope
}

const agentNames = {
  general: "通用分析",
  sales: "销售分析",
  education: "教育分析",
  medical: "医学分析"
}

// 智能提取任务执行者的函数
function extractPersonFromTask(task: string, people: string[]): string | null {
  if (!people || people.length === 0) return null
  
  // 1. 直接匹配：任务中包含人名
  for (const person of people) {
    if (task.includes(person)) {
      return person
    }
  }
  
  // 2. 关键词匹配：任务中包含"由"、"负责"、"指派给"等关键词
  const keywords = ['由', '负责', '指派给', '分配给', '交给', '委托给']
  for (const keyword of keywords) {
    const index = task.indexOf(keyword)
    if (index !== -1) {
      const afterKeyword = task.substring(index + keyword.length).trim()
      for (const person of people) {
        if (afterKeyword.startsWith(person)) {
          return person
        }
      }
    }
  }
  
  // 3. 代词匹配：任务中包含"他"、"她"等代词，尝试根据上下文推断
  const pronouns = ['他', '她', '他们', '她们']
  for (const pronoun of pronouns) {
    if (task.includes(pronoun)) {
      // 如果有多个人员，返回第一个作为默认
      return people.length > 0 ? people[0] : null
    }
  }
  
  // 4. 动词匹配：任务以特定动词开头，可能暗示执行者
  const actionVerbs = ['需要', '应该', '必须', '要']
  for (const verb of actionVerbs) {
    if (task.startsWith(verb)) {
      // 尝试从任务中提取可能的人名
      const afterVerb = task.substring(verb.length).trim()
      for (const person of people) {
        if (afterVerb.includes(person)) {
          return person
        }
      }
    }
  }
  
  return null
}

export default function HistoryPage() {
  const [records, setRecords] = useState<AnalysisRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('analysis_records')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('获取记录失败:', error)
        toast({
          title: "获取记录失败",
          description: "数据库连接失败，请检查配置",
          variant: "destructive"
        })
        // 设置空数组而不是返回，让页面显示空状态
        setRecords([])
        return
      }

      setRecords(data || [])
    } catch (error) {
      console.warn('获取记录错误:', error)
      toast({
        title: "获取记录失败",
        description: "无法连接到数据库",
        variant: "destructive"
      })
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('analysis_records')
        .delete()
        .eq('id', id)

      if (error) {
        toast({
          title: "删除失败",
          description: error.message,
          variant: "destructive"
        })
        return
      }

      toast({
        title: "删除成功",
        description: "记录已删除"
      })

      fetchRecords()
    } catch (error) {
      console.warn('删除记录错误:', error)
      toast({
        title: "删除失败",
        description: "数据库连接失败",
        variant: "destructive"
      })
    }
  }

  const exportRecord = (record: AnalysisRecord) => {
    // 智能生成人+任务的组合文本
    let todoListText = ''
    if (record.analysis_result.todos && record.analysis_result.todos.length > 0) {
      todoListText = '待办列表：\n'
      record.analysis_result.todos.forEach((todo: string, index: number) => {
        const extractedPerson = extractPersonFromTask(todo, record.analysis_result.people || [])
        if (extractedPerson) {
          todoListText += `${index + 1}. ${extractedPerson} 需要 ${todo}\n`
        } else {
          todoListText += `${index + 1}. [待分配] ${todo}\n`
        }
      })
    } else if (record.analysis_result.people && record.analysis_result.people.length > 0) {
      todoListText = `相关人员：\n${record.analysis_result.people.map((person: string, index: number) => `${index + 1}. ${person}`).join("\n")}`
    } else {
      todoListText = '未搜索到相关内容'
    }

    const content = `
文本分析结果 - ${agentNames[record.agent_type as keyof typeof agentNames]}

输入文本：
${record.input_text}

分析结果：
${record.analysis_result.themes && record.analysis_result.themes.length > 0 ? `主题内容：\n${record.analysis_result.themes.join(", ")}\n\n` : ''}

${todoListText}

${record.analysis_result.summaryParagraphs && record.analysis_result.summaryParagraphs.length > 0 ? `\n摘要段落：\n${record.analysis_result.summaryParagraphs.map((para: string, index: number) => `${index + 1}. ${para}`).join("\n\n")}` : ''}

分析时间：${record.created_at}
状态：${record.status === 'success' ? '成功' : '失败'}
${record.error_message ? `错误信息：${record.error_message}` : ''}
    `.trim()

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `分析结果_${record.agent_type}_${new Date(record.created_at!).toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 固定标题区域 - 包含所有标题 */}
      <div className="sticky top-0 z-10 bg-gray-50 px-8 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">分析历史记录</h1>
          <p className="text-gray-600 mb-4">查看所有历史分析记录</p>
          
          {/* 左右分栏标题 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <h2 className="text-xl font-semibold text-gray-800">记录列表</h2>
            <h2 className="text-xl font-semibold text-gray-800">详细信息</h2>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="px-8 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-240px)]">
            {/* 左侧记录列表 - 独立盒子 */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="h-full overflow-y-auto">
                <div className="p-4 space-y-4">
                  {records.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center text-gray-500">
                        暂无分析记录
                      </CardContent>
                    </Card>
                  ) : (
                    records.map((record) => {
                      const IconComponent = agentIcons[record.agent_type as keyof typeof agentIcons]
                      return (
                        <Card key={record.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100">
                                  <IconComponent className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{agentNames[record.agent_type as keyof typeof agentNames]}</CardTitle>
                                  <CardDescription>
                                    {new Date(record.created_at!).toLocaleString()}
                                  </CardDescription>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={record.status === 'success' ? 'default' : 'destructive'}>
                                  {record.status === 'success' ? '成功' : '失败'}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {record.input_text.substring(0, 100)}...
                            </p>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedRecord(record)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                查看
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => exportRecord(record)}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                导出
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteRecord(record.id!)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                删除
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* 右侧详情面板 - 独立盒子 */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="h-full overflow-y-auto">
                <div className="p-4">
                  {selectedRecord ? (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100">
                            {React.createElement(agentIcons[selectedRecord.agent_type as keyof typeof agentIcons], { className: "w-5 h-5 text-blue-600" })}
                          </div>
                          <div>
                            <CardTitle>{agentNames[selectedRecord.agent_type as keyof typeof agentNames]}</CardTitle>
                            <CardDescription>
                              {new Date(selectedRecord.created_at!).toLocaleString()}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">输入文本</h3>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {selectedRecord.input_text}
                          </p>
                        </div>

                        {selectedRecord.status === 'success' && selectedRecord.analysis_result && (
                          <>
                            {selectedRecord.analysis_result.themes && selectedRecord.analysis_result.themes.length > 0 && (
                              <div>
                                <h3 className="font-semibold mb-2">主题内容</h3>
                                <div className="flex flex-wrap gap-2">
                                  {selectedRecord.analysis_result.themes.map((theme, index) => (
                                    <Badge key={index} variant="secondary">
                                      {theme}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 待办列表（智能人+任务组合） */}
                            <div>
                              <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <UserCheck className="w-4 h-4" />
                                待办列表
                              </h3>
                              <div className="space-y-3">
                                {/* 智能生成人+任务组合 */}
                                {selectedRecord.analysis_result.todos && selectedRecord.analysis_result.todos.length > 0 ? (
                                  <div className="space-y-2">
                                    {selectedRecord.analysis_result.todos.map((todo: string, index: number) => {
                                      // 尝试从任务中提取人名
                                      const extractedPerson = extractPersonFromTask(todo, selectedRecord.analysis_result.people || [])
                                      
                                      return (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mt-0.5">
                                            {index + 1}
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              {extractedPerson ? (
                                                <>
                                                  <span className="text-sm font-medium text-blue-700">{extractedPerson}</span>
                                                  <span className="text-xs text-gray-500">需要</span>
                                                </>
                                              ) : (
                                                <span className="text-xs text-gray-500">待分配</span>
                                              )}
                                            </div>
                                            <p className="text-sm text-gray-800">{todo}</p>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                ) : (
                                  /* 如果没有任务，显示人员列表 */
                                  selectedRecord.analysis_result.people && selectedRecord.analysis_result.people.length > 0 ? (
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                                        <Users className="w-3 h-3" />
                                        相关人员
                                      </h4>
                                      <div className="space-y-2">
                                        {selectedRecord.analysis_result.people.map((person: string, index: number) => (
                                          <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mt-0.5">
                                              {index + 1}
                                            </div>
                                            <div className="flex-1">
                                              <p className="text-sm text-gray-800">{person}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    /* 如果都没有，显示空状态 */
                                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                                      <span className="text-sm text-gray-500">未搜索到相关内容</span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>

                            {selectedRecord.analysis_result.summaryParagraphs && selectedRecord.analysis_result.summaryParagraphs.length > 0 && (
                              <div>
                                <h3 className="font-semibold mb-2">摘要段落</h3>
                                <div className="space-y-3">
                                  {selectedRecord.analysis_result.summaryParagraphs.map((paragraph, index) => (
                                    <div key={index} className="p-3 bg-blue-50 rounded-lg">
                                      <p className="text-sm text-gray-700 leading-relaxed">{paragraph}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {selectedRecord.status === 'error' && selectedRecord.error_message && (
                          <div>
                            <h3 className="font-semibold mb-2 text-red-600">错误信息</h3>
                            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                              {selectedRecord.error_message}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center text-gray-500">
                        请选择一个记录查看详细信息
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 