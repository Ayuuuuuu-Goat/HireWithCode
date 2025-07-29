# Supabase 数据库设置指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并注册账户
2. 创建新项目
3. 记录项目 URL 和 anon key

## 2. 创建数据库表

在 Supabase SQL 编辑器中运行以下 SQL：

```sql
-- 创建分析记录表
CREATE TABLE analysis_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID,
  agent_type TEXT NOT NULL,
  input_text TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  error_message TEXT
);

-- 创建索引以提高查询性能
CREATE INDEX idx_analysis_records_created_at ON analysis_records(created_at DESC);
CREATE INDEX idx_analysis_records_agent_type ON analysis_records(agent_type);
CREATE INDEX idx_analysis_records_status ON analysis_records(status);

-- 设置行级安全策略（可选）
ALTER TABLE analysis_records ENABLE ROW LEVEL SECURITY;

-- 允许所有用户读取和写入（开发环境）
CREATE POLICY "Allow all operations" ON analysis_records
  FOR ALL USING (true);
```

## 3. 配置环境变量

创建 `.env.local` 文件：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# DeepSeek API配置
DEEPSEEK_API_KEY=your_deepseek_api_key
```

## 4. 安装依赖

```bash
npm install @supabase/supabase-js
```

## 5. 功能说明

### 数据库存储功能

- **自动存储**：每次分析都会自动存储到数据库
- **错误记录**：分析失败时也会记录错误信息
- **历史查看**：访问 `/history` 页面查看所有记录
- **记录管理**：支持查看、导出、删除历史记录

### 存储的数据结构

```typescript
interface AnalysisRecord {
  id?: string                    // 记录ID
  created_at?: string           // 创建时间
  user_id?: string             // 用户ID（预留）
  agent_type: string           // 智能体类型：general/sales/education/medical
  input_text: string           // 输入文本
  analysis_result: {           // 分析结果
    themes?: string[]          // 主题内容
    people?: string[]          // 涉及人员
    todos?: string[]           // 待办任务
    summaryParagraphs?: string[] // 摘要段落
    qa?: { question: string; answer: string }[] // 问答
    mindMap?: any              // 脑图数据
  }
  status: 'success' | 'error'  // 分析状态
  error_message?: string       // 错误信息
}
```

### 访问历史记录

启动应用后，访问 `http://localhost:3000/history` 查看所有分析记录。

## 6. 安全注意事项

1. **环境变量**：确保 `.env.local` 文件不被提交到版本控制
2. **API密钥**：妥善保管 DeepSeek API 密钥
3. **数据库权限**：生产环境中应设置适当的行级安全策略
4. **数据备份**：定期备份重要数据

## 7. 故障排除

### 常见问题

1. **连接失败**：检查 Supabase URL 和 anon key 是否正确
2. **表不存在**：确保已正确创建 `analysis_records` 表
3. **权限错误**：检查 RLS 策略设置
4. **环境变量未加载**：重启开发服务器

### 调试方法

1. 检查浏览器控制台错误信息
2. 查看 Supabase 仪表板中的日志
3. 验证环境变量是否正确加载
4. 测试数据库连接

## 8. 生产环境部署

1. 设置生产环境的 Supabase 项目
2. 配置生产环境的环境变量
3. 设置适当的数据库权限和安全策略
4. 配置数据备份策略 