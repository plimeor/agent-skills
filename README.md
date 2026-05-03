# Agent Skills

适用于 Claude Code 和其他 coding agent 的 skill 合集。

## 安装

```bash
npx skills add plimeor/agent-skills
```

安装单个 skill：

```bash
npx skills add plimeor/agent-skills --skill ops-url-reader
```

## Project Structure

- `skills/<skill-name>/SKILL.md`：每个 skill 一个独立目录，`SKILL.md` 是入口文件。
- `SKILL.md` frontmatter 里的 `name:` 必须和父目录名完全一致。
- `README.md` 是公开索引；新增、删除或重命名 skill 时同步更新。

## Skills

| Skill | 说明 |
|-------|------|
| [code-scope-gate](skills/code-scope-gate/SKILL.md) | 编码前的范围门，防止过度实现并收敛到最小正确改动 |
| [code-standards-gate](skills/code-standards-gate/SKILL.md) | 基于个人代码标准审核 spec、diff 和实现边界，优先检查公开契约、持久化状态和不必要抽象 |
| [code-test-strategy](skills/code-test-strategy/SKILL.md) | 编码任务中的测试策略门禁，防止测试污染生产代码、过早写测试和实现细节测试 |
| [knowledge-obsidian-attachment-janitor](skills/knowledge-obsidian-attachment-janitor/SKILL.md) | 清理和整理 Obsidian 附件目录，删除未引用附件并统一重命名已引用文件 |
| [meta-context-engineering-global](skills/meta-context-engineering-global/SKILL.md) | 为全局 rules file 做 context engineering，专注跨任务、跨项目、跨会话都长期成立的规则 |
| [meta-context-engineering-project](skills/meta-context-engineering-project/SKILL.md) | 为项目层做 context engineering，覆盖 repo-local 规则、任务级 context packing 与项目内漂移诊断 |
| [meta-evaluate-code-standards](skills/meta-evaluate-code-standards/SKILL.md) | 对照人类 PR/MR review 评估和迭代 code-standards-gate，并判断规则应进入全局 skill、项目规则、tooling 还是保留本地 |
| [meta-project-docs-maintenance](skills/meta-project-docs-maintenance/SKILL.md) | 维护项目 docs 分层、语言、命名和 living spec 清理策略 |
| [ops-codex-session-maintenance](skills/ops-codex-session-maintenance/SKILL.md) | 维护本地 Codex 会话状态：先检查和备份，再归档旧 session/worktree、轮转日志并生成 handoff |
| [ops-url-reader](skills/ops-url-reader/SKILL.md) | 通过 defuddle.md 从任意 URL 提取正文内容 |
| [writing-blog](skills/writing-blog/SKILL.md) | 基于 SCQA 方法论创建和优化博客文章 |
| [writing-blog-illustration](skills/writing-blog-illustration/SKILL.md) | 为博客文章生成插图提示词，适合工作流、架构图和抽象概念配图 |
| [writing-humanizer](skills/writing-humanizer/SKILL.md) | 去除 AI 写作痕迹，让 AI 生成的文档和草稿更自然、更像人写 |
| [writing-reader-feedback](skills/writing-reader-feedback/SKILL.md) | 模拟指定读者逐节阅读文章，输出真实的阅读体验反馈 |
