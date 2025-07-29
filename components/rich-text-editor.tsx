"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered } from "lucide-react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [fontSize, setFontSize] = useState("14")
  const [textStyle, setTextStyle] = useState("div")
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
  const editorRef = useRef<HTMLDivElement>(null)
  const [isInternalChange, setIsInternalChange] = useState(false)

  const fontSizes = [
    { label: "12", value: "12" },
    { label: "14", value: "14" },
    { label: "16", value: "16" },
    { label: "18", value: "18" },
    { label: "20", value: "20" },
    { label: "24", value: "24" },
  ]

  const textStyles = [
    { label: "正文", value: "div" },
    { label: "标题1", value: "h1" },
    { label: "标题2", value: "h2" },
    { label: "标题3", value: "h3" },
  ]

  const formatButtons = [
    { command: "bold", icon: Bold, label: "加粗" },
    { command: "italic", icon: Italic, label: "斜体" },
    { command: "underline", icon: Underline, label: "下划线" },
  ]

  const alignButtons = [
    { command: "justifyLeft", icon: AlignLeft, label: "左对齐" },
    { command: "justifyCenter", icon: AlignCenter, label: "居中" },
    { command: "justifyRight", icon: AlignRight, label: "右对齐" },
  ]

  const listButtons = [
    { command: "insertUnorderedList", icon: List, label: "无序列表" },
    { command: "insertOrderedList", icon: ListOrdered, label: "有序列表" },
  ]

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    updateActiveFormats()
    handleContentChange()
  }

  const updateActiveFormats = () => {
    const formats = new Set<string>()

    if (document.queryCommandState("bold")) formats.add("bold")
    if (document.queryCommandState("italic")) formats.add("italic")
    if (document.queryCommandState("underline")) formats.add("underline")

    setActiveFormats(formats)
  }

  const handleContentChange = () => {
    if (editorRef.current && !isInternalChange) {
      const newValue = editorRef.current.innerHTML
      if (newValue !== value) {
        onChange(newValue)
      }
    }
  }

  // 确保编辑器内容与外部value同步
  useEffect(() => {
    if (editorRef.current && !isInternalChange) {
      const currentContent = editorRef.current.innerHTML
      if (currentContent !== value) {
        setIsInternalChange(true)
        editorRef.current.innerHTML = value
        setIsInternalChange(false)
    }
  }
  }, [value])

  const handleFontSizeChange = (size: string) => {
    setFontSize(size)
    executeCommand("fontSize", "3")
    if (editorRef.current) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        if (!range.collapsed) {
          const span = document.createElement("span")
          span.style.fontSize = `${size}px`
          try {
            range.surroundContents(span)
          } catch {
            executeCommand("fontSize", "3")
          }
        }
      }
      editorRef.current.style.fontSize = `${size}px`
    }
  }

  const handleTextStyleChange = (style: string) => {
    setTextStyle(style)
    executeCommand("formatBlock", style)
  }

  return (
    <div className="border rounded-lg bg-white h-full flex flex-col">
      {/* 工具栏 - 压缩版本 */}
      <div className="border-b p-2">
        {/* 第一行：字体大小、文本样式和格式化按钮 */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">字号:</span>
            <Select value={fontSize} onValueChange={handleFontSizeChange}>
              <SelectTrigger className="w-14 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontSizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">样式:</span>
            <Select value={textStyle} onValueChange={handleTextStyleChange}>
              <SelectTrigger className="w-20 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {textStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 文本格式按钮 */}
          <div className="flex items-center gap-1 border-l pl-2 ml-1">
            {formatButtons.map((button) => {
              const Icon = button.icon
              return (
                <Button
                  key={button.command}
                  variant={activeFormats.has(button.command) ? "default" : "ghost"}
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => executeCommand(button.command)}
                  title={button.label}
                >
                  <Icon className="w-3 h-3" />
                </Button>
              )
            })}
          </div>
        </div>

        {/* 第二行：对齐方式和列表 */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* 对齐方式 */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            {alignButtons.map((button) => {
              const Icon = button.icon
              return (
                <Button
                  key={button.command}
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => executeCommand(button.command)}
                  title={button.label}
                >
                  <Icon className="w-3 h-3" />
                </Button>
              )
            })}
          </div>

          {/* 列表 */}
          <div className="flex items-center gap-1">
            {listButtons.map((button) => {
              const Icon = button.icon
              return (
                <Button
                  key={button.command}
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => executeCommand(button.command)}
                  title={button.label}
                >
                  <Icon className="w-3 h-3" />
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 编辑器 */}
      <div
        ref={editorRef}
        contentEditable
        className={cn(
          "flex-1 min-h-[500px] p-4 outline-none",
          "prose prose-sm max-w-none",
          "focus:ring-2 focus:ring-blue-500 focus:ring-inset",
        )}
        style={{ fontSize: `${fontSize}px` }}
        onInput={handleContentChange}
        onBlur={handleContentChange}
        onMouseUp={updateActiveFormats}
        onKeyUp={updateActiveFormats}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
