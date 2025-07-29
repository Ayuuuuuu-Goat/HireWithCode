"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Brain, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface MindMapPanelProps {
  mindMapData: any
}

export default function MindMapPanel({ mindMapData }: MindMapPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const jmRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isInitialized, setIsInitialized] = useState(false)

  // 加载jsMind库
  useEffect(() => {
    const loadJsMind = async () => {
      if (typeof window === "undefined") return

      try {
        // 加载CSS
        if (!document.querySelector('link[href*="jsmind"]')) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/jsmind@0.4.6/style/jsmind.css"
          document.head.appendChild(link)
        }

        // 加载JS
        if (!(window as any).jsMind) {
          const script = document.createElement("script")
          script.src = "https://unpkg.com/jsmind@0.4.6/js/jsmind.js"
          script.onload = () => setIsLoaded(true)
          document.head.appendChild(script)
        } else {
          setIsLoaded(true)
        }
      } catch (error) {
        console.error("Failed to load jsMind:", error)
      }
    }

    loadJsMind()
  }, [])

  // 初始化脑图
  useEffect(() => {
    if (!isLoaded || !mindMapData || !containerRef.current) return

    const initializeMindMap = () => {
      try {
        const jsMind = (window as any).jsMind

        // 清理之前的实例
        if (jmRef.current) {
          try {
            jmRef.current.remove()
          } catch (e) {
            console.log("Previous instance cleanup:", e)
          }
          jmRef.current = null
        }

        // 清空容器
        if (containerRef.current) {
          containerRef.current.innerHTML = ''
        }

        // 简化的配置选项
        const options = {
          container: containerRef.current,
          theme: "primary",
          editable: false,
          view: {
            hmargin: 100,
            vmargin: 100,
            line_width: 2,
            line_color: "#9CA3AF",
            draggable: true,
            hide_scrollbars_when_draggable: false
          },
          layout: {
            hspace: 30,
            vspace: 20,
            pspace: 13
          }
        }

        // 创建脑图实例
        jmRef.current = new jsMind(options)
        jmRef.current.show(mindMapData)

        // 启用拖拽
        if (typeof jmRef.current.enable_draggable === "function") {
          jmRef.current.enable_draggable()
        }

        // 应用自定义样式
        applyCustomStyles()

        // 标记为已初始化
        setIsInitialized(true)
        setZoomLevel(1.0)

        console.log("Mind map initialized successfully")

      } catch (error) {
        console.error("Failed to initialize mind map:", error)
        setIsInitialized(false)
      }
    }

    // 重置状态并初始化
    setIsInitialized(false)
    // 延迟初始化以确保DOM准备就绪
    setTimeout(initializeMindMap, 100)

  }, [isLoaded, mindMapData])

  // 应用自定义样式 - 优化文字渲染和对齐
  const applyCustomStyles = () => {
    // 移除旧样式
    const existingStyle = document.querySelector("#mindmap-custom-style")
    if (existingStyle) {
      existingStyle.remove()
    }

    const style = document.createElement("style")
    style.id = "mindmap-custom-style"
    style.textContent = `
      .jsmind-inner jmnode {
        background: #F3F4F6 !important;
        border: 1px solid #D1D5DB !important;
        border-radius: 6px !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
        color: #374151 !important;
        font-weight: 500 !important;
        padding: 6px 12px !important;
        font-size: 14px !important;
        transition: all 0.2s ease !important;
        
        /* 修复文字对齐和渲染 */
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        text-align: center !important;
        line-height: 1.2 !important;
        vertical-align: baseline !important;
        white-space: nowrap !important;
        
        /* 高质量文字渲染 */
        text-rendering: optimizeLegibility !important;
        font-smooth: always !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
        font-feature-settings: "liga", "kern" !important;
      }
      
      .jsmind-inner jmnode:hover {
        background: #E5E7EB !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
      }
      
      .jsmind-inner jmnode.root {
        background: #3B82F6 !important;
        border: 1px solid #2563EB !important;
        color: white !important;
        font-size: 16px !important;
        font-weight: 600 !important;
        padding: 10px 16px !important;
        
        /* 根节点文字对齐优化 */
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        text-align: center !important;
        line-height: 1.2 !important;
        vertical-align: baseline !important;
        
        /* 根节点高质量文字渲染 */
        text-rendering: optimizeLegibility !important;
        font-smooth: always !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
      }
      
      .jsmind-inner jmnode.root:hover {
        background: #2563EB !important;
      }
      
      .jsmind-inner jmexpander {
        display: none !important;
      }

      .jsmind-inner {
        overflow: visible !important;
        position: relative !important;
        width: 100% !important;
        height: 100% !important;
        
        /* 容器高质量渲染设置 */
        backface-visibility: hidden !important;
        perspective: 1000px !important;
        transform-style: preserve-3d !important;
        will-change: transform !important;
      }
      
      /* 全局高质量文字渲染 */
      .jsmind-inner * {
        text-rendering: optimizeLegibility !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
      }
    `
    document.head.appendChild(style)
  }

  // 高质量缩放功能 - 避免文字模糊
  const applyZoom = (targetZoom: number) => {
    if (!containerRef.current || !isInitialized || !jmRef.current) return

    try {
      // 方法1: 如果jsMind支持内置缩放，优先使用
      if (jmRef.current.view && typeof jmRef.current.view.set_zoom === "function") {
        jmRef.current.view.set_zoom(targetZoom)
        setZoomLevel(targetZoom)
        return
      }

      // 方法2: 高质量CSS缩放 - 使用transform3d和优化设置
      const mindMapContainer = containerRef.current.querySelector(".jsmind-inner") as HTMLElement
      if (mindMapContainer) {
        // 设置高质量渲染属性
        mindMapContainer.style.transform = `scale3d(${targetZoom}, ${targetZoom}, 1)`
        mindMapContainer.style.transformOrigin = "center center"
        mindMapContainer.style.transition = "transform 0.2s ease"
        
        // 强制高质量渲染
        mindMapContainer.style.backfaceVisibility = "hidden"
        mindMapContainer.style.perspective = "1000px"
        mindMapContainer.style.transformStyle = "preserve-3d"
        
        // 对所有文本节点应用抗锯齿
        const textNodes = mindMapContainer.querySelectorAll('jmnode')
        textNodes.forEach((node: any) => {
          node.style.textRendering = "optimizeLegibility"
          node.style.fontSmooth = "always"
          node.style.webkitFontSmoothing = "antialiased"
          node.style.mozOsxFontSmoothing = "grayscale"
        })
        
        setZoomLevel(targetZoom)
      }
    } catch (error) {
      console.error("Zoom error:", error)
    }
  }

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 0.2, 2.0)
    applyZoom(newZoom)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.2, 0.3)
    applyZoom(newZoom)
  }

  const handleResetZoom = () => {
    applyZoom(1.0)
  }

  // 导出功能 - 修复文字下坠问题
  const handleExportMindMap = () => {
    if (!jmRef.current || !containerRef.current) return

    try {
      const innerElement = containerRef.current.querySelector(".jsmind-inner") as HTMLElement
      if (innerElement) {
        // 保存当前缩放状态
        const originalZoom = zoomLevel
        
        // 临时重置为1.0缩放，并等待渲染完成
        applyZoom(1.0)

        // 动态导入html2canvas
        import("html2canvas")
          .then((html2canvas) => {
            setTimeout(() => {
              // 临时修复文字对齐问题
              const nodes = innerElement.querySelectorAll('jmnode')
              const originalStyles: Array<{element: HTMLElement, style: string}> = []
              
              // 保存原始样式并应用修复
              nodes.forEach((node: any) => {
                const htmlNode = node as HTMLElement
                originalStyles.push({
                  element: htmlNode,
                  style: htmlNode.style.cssText
                })
                
                // 修复文字垂直对齐
                htmlNode.style.display = 'inline-flex'
                htmlNode.style.alignItems = 'center'
                htmlNode.style.justifyContent = 'center'
                htmlNode.style.lineHeight = '1.2'
                htmlNode.style.verticalAlign = 'baseline'
                htmlNode.style.textAlign = 'center'
              })

              // 强制重绘
              innerElement.offsetHeight

                               html2canvas
                   .default(innerElement, {
                     backgroundColor: "#ffffff",
                     scale: 2, // 降低分辨率避免字体问题
                     useCORS: true,
                     allowTaint: false,
                     width: innerElement.scrollWidth,
                     height: innerElement.scrollHeight,
                     // 字体渲染优化设置
                     logging: false,
                     imageTimeout: 15000,
                     removeContainer: false, // 保持容器避免布局问题
                     ignoreElements: () => false
                   })
                .then((canvas) => {
                  // 恢复原始样式
                  originalStyles.forEach(({element, style}) => {
                    element.style.cssText = style
                  })
                  
                  const link = document.createElement("a")
                  link.download = "思维导图.png"
                  link.href = canvas.toDataURL("image/png", 0.95)
                  link.click()

                  // 恢复原始缩放
                  applyZoom(originalZoom)

                  toast({
                    title: "导出成功",
                    description: "脑图已导出为图片",
                  })
                })
                .catch((error) => {
                  console.error("Export error:", error)
                  
                  // 恢复原始样式
                  originalStyles.forEach(({element, style}) => {
                    element.style.cssText = style
                  })
                  
                  applyZoom(originalZoom)
                  toast({
                    title: "导出失败",
                    description: "请稍后重试",
                    variant: "destructive",
                  })
                })
            }, 800) // 增加等待时间确保样式应用完成
          })
          .catch((error) => {
            console.error("Import html2canvas error:", error)
            applyZoom(originalZoom)
            toast({
              title: "导出失败",
              description: "请稍后重试",
              variant: "destructive",
            })
          })
      }
    } catch (error) {
      console.error("Export mind map error:", error)
      toast({
        title: "导出失败",  
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  if (!mindMapData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">暂无脑图数据</p>
          <p className="text-sm mt-2">请先进行文本分析生成思维导图</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          智能脑图
        </h3>
        <div className="flex items-center gap-2">
          {/* 缩放控制 */}
          <div className="flex items-center gap-1 border rounded-lg p-1 bg-white">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.3 || !isInitialized}
              className="h-7 w-7 p-0"
              title="缩小"
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <span className="text-xs px-2 text-gray-600 min-w-[3rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2.0 || !isInitialized}
              className="h-7 w-7 p-0"
              title="放大"
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleResetZoom} 
              className="h-7 w-7 p-0" 
              title="重置缩放"
              disabled={!isInitialized}
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportMindMap}
            className="flex items-center gap-2"
            disabled={!isInitialized}
          >
            <Download className="w-3 h-3" />
            导出脑图
          </Button>
        </div>
      </div>

      <div className="flex-1 border rounded-lg bg-white relative overflow-hidden">
        <div 
          ref={containerRef} 
          className="w-full h-full" 
          style={{ 
            minHeight: "400px",
            overflow: "auto"
          }}
        />
      </div>
    </div>
  )
}