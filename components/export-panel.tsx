"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, FileText, FileImage, Link, Share2, Copy, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ExportPanelProps {
  analysisResult: any
  notes?: string
}

export default function ExportPanel({ analysisResult, notes }: ExportPanelProps) {
  const [copied, setCopied] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExportText = () => {
    if (!analysisResult) return

    // 智能生成人+任务的组合文本
    let todoListText = ''
    if (analysisResult.todos && analysisResult.todos.length > 0) {
      todoListText = '待办列表：\n'
      analysisResult.todos.forEach((todo: string, index: number) => {
        const extractedPerson = extractPersonFromTask(todo, analysisResult.people || [])
        if (extractedPerson) {
          todoListText += `${index + 1}. ${extractedPerson} 需要 ${todo}\n`
        } else {
          todoListText += `${index + 1}. [待分配] ${todo}\n`
        }
      })
    } else if (analysisResult.people && analysisResult.people.length > 0) {
      todoListText = `相关人员：\n${analysisResult.people.map((person: string, index: number) => `${index + 1}. ${person}`).join("\n")}`
    } else {
      todoListText = '未搜索到相关内容'
    }

    const content = `
文本分析结果

${analysisResult.themes && analysisResult.themes.length > 0 ? `主题内容：\n${analysisResult.themes.join(", ")}\n\n` : ''}

${todoListText}

${analysisResult.summaryParagraphs && analysisResult.summaryParagraphs.length > 0 ? `\n摘要段落：\n${analysisResult.summaryParagraphs.map((para: string, index: number) => `${index + 1}. ${para}`).join("\n\n")}` : ''}
`.trim()

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `文本分析结果_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "导出成功",
      description: "文本文件已下载到您的设备",
    })
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

  const handleExportPDF = async () => {
    setIsExporting(true)
    
    try {
      // 这里可以集成PDF生成库，如jsPDF或html2canvas
      // 暂时使用简单的提示
      toast({
        title: "PDF导出",
        description: "PDF导出功能正在开发中，请稍后使用",
      })
    } catch (error) {
      toast({
        title: "导出失败",
        description: "PDF导出过程中出现错误",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleGenerateH5Link = () => {
    // 生成包含分析结果的H5链接
    const analysisData = {
      result: analysisResult,
      notes: notes,
      timestamp: new Date().toISOString(),
      shareId: Date.now().toString()
    }

    const shareData = btoa(JSON.stringify(analysisData))
    const shareUrl = `${window.location.origin}/share/${shareData}`

    // 复制到剪贴板
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      
      toast({
        title: "链接已复制",
        description: "H5分享链接已复制到剪贴板",
      })
    }).catch(() => {
      toast({
        title: "复制失败",
        description: "请手动复制链接",
        variant: "destructive",
      })
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "文本分析结果",
          text: "查看我的文本分析结果",
          url: window.location.href
        })
      } catch (error) {
        console.log("分享被取消")
      }
    } else {
      // 降级到复制链接
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: "链接已复制",
          description: "页面链接已复制到剪贴板",
        })
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Download className="w-4 h-4" />
          导出功能
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 文本文档导出 */}
        <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              文本文档
            </CardTitle>
            <CardDescription>
              导出为TXT格式的纯文本文档
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleExportText}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!analysisResult}
            >
              <Download className="w-4 h-4 mr-2" />
              导出TXT
            </Button>
          </CardContent>
        </Card>

        {/* PDF导出 */}
        <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileImage className="w-4 h-4" />
              PDF文档
            </CardTitle>
            <CardDescription>
              导出为PDF格式的文档
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleExportPDF}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!analysisResult || isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "导出中..." : "导出PDF"}
            </Button>
          </CardContent>
        </Card>

        {/* H5链接生成 */}
        <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Link className="w-4 h-4" />
              H5分享链接
            </CardTitle>
            <CardDescription>
              生成包含完整分析结果的H5链接
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateH5Link}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={!analysisResult}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  生成链接
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 分享功能 */}
        <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              分享结果
            </CardTitle>
            <CardDescription>
              通过系统分享功能分享结果
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleShare}
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={!analysisResult}
            >
              <Share2 className="w-4 h-4 mr-2" />
              分享
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* 导出说明 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2">导出说明</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• <strong>文本文档：</strong>包含完整分析结果的纯文本文件</p>
          <p>• <strong>PDF文档：</strong>格式化的PDF文档，包含图表和样式</p>
          <p>• <strong>H5链接：</strong>可分享的网页链接，包含完整分析内容</p>
          <p>• <strong>分享功能：</strong>使用系统原生分享功能</p>
        </div>
      </div>
    </div>
  )
} 