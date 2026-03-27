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
| [obsidian-attachment-janitor](skills/obsidian-attachment-janitor/SKILL.md) | 清理和整理 Obsidian 附件目录，删除未引用附件并统一重命名已引用文件 |
| [blog-feedback](skills/blog-feedback/SKILL.md) | 模拟指定读者逐节阅读文章，输出真实的阅读体验反馈 |
| [blog-illustration](skills/blog-illustration/SKILL.md) | 为博客文章生成插图提示词，适合工作流、架构图和抽象概念配图 |
| [blog-writing](skills/blog-writing/SKILL.md) | 基于 SCQA 方法论创建和优化博客文章 |
| [defuddle](skills/defuddle/SKILL.md) | 通过 defuddle.md 从任意 URL 提取正文内容 |
| [nix-self-iteration-protocol](skills/nix-self-iteration-protocol/SKILL.md) | 指令系统迭代型 skill，用于评估和演进 AGENTS.md、SKILL.md、prompt 架构与 routing，适合诊断 prompt failure、误触发、漏触发与指令冲突 |
| [system-prompt-tuning](skills/system-prompt-tuning/SKILL.md) | 评估和优化全局上下文（~/.claude/CLAUDE.md），按官方标准审查、精简、改动 |
