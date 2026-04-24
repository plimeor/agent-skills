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
| [code-scope-gate](skills/code-scope-gate/SKILL.md) | 编码前的范围门，防止过度实现并收敛到最小正确改动 |
| [blog-feedback](skills/blog-feedback/SKILL.md) | 模拟指定读者逐节阅读文章，输出真实的阅读体验反馈 |
| [blog-illustration](skills/blog-illustration/SKILL.md) | 为博客文章生成插图提示词，适合工作流、架构图和抽象概念配图 |
| [blog-writing](skills/blog-writing/SKILL.md) | 基于 SCQA 方法论创建和优化博客文章 |
| [context-engineering-global](skills/context-engineering-global/SKILL.md) | 为全局 rules file 做 context engineering，专注跨任务、跨项目、跨会话都长期成立的规则 |
| [context-engineering-project](skills/context-engineering-project/SKILL.md) | 为项目层做 context engineering，覆盖 repo-local 规则、任务级 context packing 与项目内漂移诊断 |
| [defuddle](skills/defuddle/SKILL.md) | 通过 defuddle.md 从任意 URL 提取正文内容 |
