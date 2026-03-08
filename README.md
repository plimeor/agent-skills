# Agent Skills

适用于 Claude Code 和其他 coding agent 的 skill 合集。

## 安装

```bash
npx skills add plimeor/agent-skills
```

安装单个 skill：

```bash
npx skills add plimeor/agent-skills --skill defuddle
```

## Skills

| Skill | 说明 |
|-------|------|
| [blog-feedback](skills/blog-feedback/SKILL.md) | 模拟指定读者逐节阅读文章，输出真实的阅读体验反馈 |
| [blog-writing](skills/blog-writing/SKILL.md) | 基于 SCQA 方法论创建和优化博客文章 |
| [defuddle](skills/defuddle/SKILL.md) | 通过 defuddle.md 从任意 URL 提取正文内容 |
