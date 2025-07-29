"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, FileText, Brain, Loader2, BookOpen, Stethoscope, TrendingUp, Users, CheckSquare, Target, FileText as FileTextIcon, AlertCircle, UserCheck, Calendar } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import MindMapPanel from "@/components/mind-map-panel"
import NotesPanel from "@/components/notes-panel"
import Sidebar from "@/components/sidebar"
import { cn } from "@/lib/utils"

interface AnalysisResult {
  keywords: string[]
  summary: string
  qa: { question: string; answer: string }[]
  mindMap: any
  people?: string[]
  todos?: string[]
  themes?: string[]
  summaryParagraphs?: string[]
}

const agents = {
  general: {
    name: "智能文本分析平台",
    description: "基于AI技术的文本处理平台，提供关键词提炼、内容概要、问答回顾和脑图生成",
    icon: Brain,
    color: "bg-blue-600"
  },
  sales: {
    name: "销售分析助手",
    description: "专业的销售文本分析平台，提供客户需求识别、销售策略建议、成交机会分析",
    icon: TrendingUp,
    color: "bg-green-600"
  },
  education: {
    name: "教育分析专家",
    description: "专业的教育内容分析平台，提供知识点提取、学习建议、教学方案优化",
    icon: BookOpen,
    color: "bg-purple-600"
  },
  medical: {
    name: "医学分析顾问",
    description: "专业的医学文本分析平台，提供症状识别、诊断建议、治疗方案分析",
    icon: Stethoscope,
    color: "bg-red-600"
  }
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

export default function TextAnalysisApp() {
  const [inputText, setInputText] = useState("")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [activeAgent, setActiveAgent] = useState("general")

  const currentAgent = agents[activeAgent as keyof typeof agents]

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast({
        title: "请输入文本",
        description: "请在左侧输入要分析的文本内容",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    try {
      const apiEndpoint = activeAgent === "general" ? "/api/analyze" : `/api/analyze/${activeAgent}`
      
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      })

      if (!response.ok) {
        throw new Error("分析失败")
      }

      const result = await response.json()
      setAnalysisResult(result)
    } catch (error) {
      toast({
        title: "分析失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleExportText = () => {
    if (!analysisResult) return

    const content = `
文本分析结果

${analysisResult.themes && analysisResult.themes.length > 0 ? `主题内容：\n${analysisResult.themes.join(", ")}\n\n` : ''}

${analysisResult.people && analysisResult.people.length > 0 ? `涉及人员：\n${analysisResult.people.join(", ")}\n\n` : ''}

${analysisResult.todos && analysisResult.todos.length > 0 ? `待办任务：\n${analysisResult.todos.map((todo: string, index: number) => `${index + 1}. ${todo}`).join("\n")}\n\n` : ''}

${analysisResult.summaryParagraphs && analysisResult.summaryParagraphs.length > 0 ? `摘要段落：\n${analysisResult.summaryParagraphs.map((para: string, index: number) => `${index + 1}. ${para}`).join("\n\n")}` : ''}
    `.trim()

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "文本分析结果.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAgentChange = (agentId: string) => {
    setActiveAgent(agentId)
    setAnalysisResult(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 固定左侧边栏 */}
      <div className="fixed top-0 left-0 h-screen w-64 bg-white shadow-md z-50">
        <Sidebar activeAgent={activeAgent} onAgentChange={handleAgentChange} />
      </div>

      {/* 主内容区域，右移避开边栏 */}
      <div className="flex-1 p-2 ml-64">
        <div className="max-w-[95%] mx-auto">
          <header className="mb-8">
            <div className="flex items-center mb-3">
              <div className={cn("p-2 rounded-xl shadow-lg mr-3", currentAgent.color)}>
                <currentAgent.icon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">{currentAgent.name}</h1>
            </div>
            <p className="text-sm text-gray-600 max-w-xl">
              {currentAgent.description}
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-180px)]">
            {/* 左侧文本输入区域 */}
            <div className="lg:col-span-7">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    文本输入
                  </CardTitle>
                  <CardDescription>请在下方输入或粘贴需要分析的文本内容</CardDescription>
                </CardHeader>
                <CardContent className="h-[calc(100%-120px)] flex flex-col">
                  <Textarea
                    placeholder="请输入要分析的文本内容..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 resize-none text-sm leading-relaxed"
                  />
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">字符数: {inputText.length}</span>
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !inputText.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:transform-none disabled:opacity-50"
                      style={{
                          minWidth: isAnalyzing ? "75px" : "100px",
                          padding: isAnalyzing ? "8px 10px" : "8px 20px",
                      }}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          分析中
                        </>
                      ) : (
                        "开始分析"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧功能展示区域 */}
            <div className="lg:col-span-5">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Brain className="w-5 h-5" />
                      分析结果
                    </CardTitle>
                    {analysisResult && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportText}
                        className="flex items-center gap-2 bg-transparent"
                      >
                        <Download className="w-4 h-4" />
                        导出
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="h-[calc(100%-100px)]">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="details">详情</TabsTrigger>
                      <TabsTrigger value="mindmap">脑图</TabsTrigger>
                      <TabsTrigger value="notes">笔记</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="h-[calc(100%-50px)] overflow-auto">
                      {analysisResult ? (
                        <div className="space-y-6">

                          {/* 主题内容（最上面） */}
                          {analysisResult.themes && analysisResult.themes.length > 0 ? (
                            <div>
                              <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                主题内容
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {analysisResult.themes.map((theme, index) => (
                                  <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                                    {theme}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                主题内容
                              </h3>
                              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">未搜索到相关内容</span>
                              </div>
                            </div>
                          )}

                          <Separator />

                          {/* 摘要段落（最后） */}
                          {analysisResult.summaryParagraphs && analysisResult.summaryParagraphs.length > 0 ? (
                            <div>
                              <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                                <FileTextIcon className="w-4 h-4" />
                                摘要段落
                              </h3>
                              <div className="space-y-3">
                                {analysisResult.summaryParagraphs.map((paragraph, index) => (
                                  <div key={index} className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-700 leading-relaxed">{paragraph}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                                <FileTextIcon className="w-4 h-4" />
                                摘要段落
                              </h3>
                              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">未搜索到相关内容</span>
                              </div>
                            </div>
                          )}

                          {/* 待办列表（智能人+任务组合） */}
                          <Separator />
                          <div>
                            <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                              <UserCheck className="w-4 h-4" />
                              待办列表
                            </h3>
                            <div className="space-y-3">
                              {/* 智能生成人+任务组合 */}
                              {analysisResult.todos && analysisResult.todos.length > 0 ? (
                                <div className="space-y-2">
                                  {analysisResult.todos.map((todo, index) => {
                                    // 尝试从任务中提取人名
                                    const extractedPerson = extractPersonFromTask(todo, analysisResult.people || [])
                                    
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
                                analysisResult.people && analysisResult.people.length > 0 ? (
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                                      <Users className="w-3 h-3" />
                                      相关人员
                                    </h4>
                                    <div className="space-y-2">
                                      {analysisResult.people.map((person, index) => (
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
                                    <AlertCircle className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">未搜索到相关内容</span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                          <Separator />

                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>请先输入文本并点击"开始分析"</p>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="mindmap" className="h-[calc(100%-50px)]">
                      <MindMapPanel mindMapData={analysisResult?.mindMap} />
                    </TabsContent>

                    <TabsContent value="notes" className="h-[calc(100%-50px)]">
                      <NotesPanel analysisResult={analysisResult} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
