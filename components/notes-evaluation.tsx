"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThumbsUp, ThumbsDown, MessageSquare, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface EvaluationData {
  id: string
  type: "positive" | "negative"
  comment: string
  timestamp: Date
}

interface NotesEvaluationProps {
  analysisResult: any
}

export default function NotesEvaluation({ analysisResult }: NotesEvaluationProps) {
  const [evaluations, setEvaluations] = useState<EvaluationData[]>([])
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [comment, setComment] = useState("")
  const [evaluationType, setEvaluationType] = useState<"positive" | "negative" | null>(null)

  const handleEvaluation = (type: "positive" | "negative") => {
    setEvaluationType(type)
    setShowCommentForm(true)
  }

  const handleSubmitEvaluation = () => {
    if (!evaluationType || !comment.trim()) return

    const newEvaluation: EvaluationData = {
      id: Date.now().toString(),
      type: evaluationType,
      comment: comment.trim(),
      timestamp: new Date()
    }

    setEvaluations(prev => [newEvaluation, ...prev])
    setComment("")
    setEvaluationType(null)
    setShowCommentForm(false)
  }

  const handleCancelEvaluation = () => {
    setComment("")
    setEvaluationType(null)
    setShowCommentForm(false)
  }

  const positiveCount = evaluations.filter(e => e.type === "positive").length
  const negativeCount = evaluations.filter(e => e.type === "negative").length

  return (
    <div className="space-y-6">
      {/* 评测统计 */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Star className="w-4 h-4" />
          笔记评测
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <ThumbsUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">{positiveCount}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ThumbsDown className="w-4 h-4 text-red-600" />
            <span className="text-sm text-gray-600">{negativeCount}</span>
          </div>
        </div>
      </div>

      {/* 评测按钮 */}
      {!showCommentForm && (
        <div className="flex space-x-4">
          <Button
            onClick={() => handleEvaluation("positive")}
            variant="outline"
            className="flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
          >
            <ThumbsUp className="w-4 h-4" />
            好评
          </Button>
          <Button
            onClick={() => handleEvaluation("negative")}
            variant="outline"
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <ThumbsDown className="w-4 h-4" />
            差评
          </Button>
        </div>
      )}

      {/* 评论表单 */}
      {showCommentForm && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {evaluationType === "positive" ? "好评反馈" : "差评反馈"}
            </CardTitle>
            <CardDescription>
              请分享您的具体感受和建议
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="请输入您的评价..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleSubmitEvaluation}
                disabled={!comment.trim()}
                className={cn(
                  "flex items-center gap-2",
                  evaluationType === "positive" 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-red-600 hover:bg-red-700"
                )}
              >
                <MessageSquare className="w-4 h-4" />
                提交评价
              </Button>
              <Button
                onClick={handleCancelEvaluation}
                variant="outline"
              >
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* 评测历史 */}
      {evaluations.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-800 mb-3">评测历史</h4>
          <div className="space-y-3">
            {evaluations.map((evaluation) => (
              <Card key={evaluation.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          evaluation.type === "positive"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        )}
                      >
                        {evaluation.type === "positive" ? "好评" : "差评"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {evaluation.timestamp.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                    {evaluation.comment}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 