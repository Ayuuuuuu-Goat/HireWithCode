"use client"

import { Button } from "@/components/ui/button"
import { Brain, BookOpen, Stethoscope, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface Agent {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const agents: Agent[] = [
  {
    id: "general",
    name: "通用分析",
    description: "智能文本分析，提供关键词提炼、内容概要、问答回顾和脑图生成",
    icon: Brain,
    color: "bg-blue-600"
  },
  {
    id: "sales",
    name: "销售助手",
    description: "专业销售文本分析，客户需求识别、销售策略建议、成交机会分析",
    icon: TrendingUp,
    color: "bg-green-600"
  },
  {
    id: "education",
    name: "教育专家",
    description: "教育内容分析，知识点提取、学习建议、教学方案优化",
    icon: BookOpen,
    color: "bg-purple-600"
  },
  {
    id: "medical",
    name: "医学顾问",
    description: "医学文本分析，症状识别、诊断建议、治疗方案分析",
    icon: Stethoscope,
    color: "bg-red-600"
  }
]

interface SidebarProps {
  activeAgent: string
  onAgentChange: (agentId: string) => void
}

export default function Sidebar({ activeAgent, onAgentChange }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-lg flex flex-col h-screen">
      {/* 顶部标题区域 */}
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">智能分析助手</h2>
            <p className="text-sm text-gray-500">选择专业领域进行分析</p>
          </div>
        </div>
      </div>
      
      {/* 智能体选择区域 */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {agents.map((agent) => {
          const isActive = activeAgent === agent.id
          return (
            <div
              key={agent.id}
              className={cn(
                "w-full p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md",
                isActive 
                  ? `${agent.color} text-white shadow-lg transform scale-[1.02]` 
                  : "hover:bg-gray-50 border border-transparent hover:border-gray-200 bg-white"
              )}
              onClick={() => onAgentChange(agent.id)}
            >
              <div className="flex items-start space-x-4 w-full">
                <div className={cn(
                  "p-3 rounded-xl flex-shrink-0 transition-all duration-200",
                  isActive 
                    ? "bg-white/20 shadow-inner" 
                    : "bg-gray-100 hover:bg-gray-200"
                )}>
                  <agent.icon className={cn(
                    "w-5 h-5 transition-colors duration-200",
                    isActive ? "text-white" : "text-gray-600"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "font-semibold text-sm mb-2 transition-colors duration-200",
                    isActive ? "text-white" : "text-gray-800"
                  )}>
                    {agent.name}
                  </div>
                  <div className={cn(
                    "text-xs leading-relaxed transition-colors duration-200 break-words whitespace-normal",
                    isActive ? "text-white/90" : "text-gray-500"
                  )}>
                    {agent.description}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* 底部说明区域 */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            平台特色
          </h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
              <span>每个智能体都针对特定领域优化</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
              <span>分析结果更加专业和精准</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
              <span>支持跨领域内容分析</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 