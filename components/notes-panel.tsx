"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Calendar, Clock, User } from "lucide-react"
import RichTextEditor from "@/components/rich-text-editor"
import NotesEvaluation from "@/components/notes-evaluation"

interface NotesPanelProps {
  analysisResult: any
}

export default function NotesPanel({ analysisResult }: NotesPanelProps) {
  const [notes, setNotes] = useState("")
  const [activeTab, setActiveTab] = useState("editor")

  const handleNotesChange = (value: string) => {
    setNotes(value)
  }

  const currentDate = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    })

  const currentTime = new Date().toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    })

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">笔记纪要</h3>
        </div>
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{currentDate}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{currentTime}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="flex-1 min-h-0 mb-1">
        <RichTextEditor value={notes} onChange={handleNotesChange} placeholder="在此开始编写您的笔记..." />
        </div>
      </div>

      <div className="text-xs text-gray-500 flex justify-between items-center">
        <span>支持富文本格式编辑</span>
        <div className="flex items-center gap-4">
          <span>字符数: {notes.replace(/<[^>]*>/g, "").length}</span>
        </div>
      </div>

      <Separator className="my-4" />

      {/* 评测功能 */}
      <NotesEvaluation analysisResult={analysisResult} />
    </div>
  )
}
