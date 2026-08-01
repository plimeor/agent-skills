---
name: role-mining
description: 从本机 Claude Code / Grok 历史会话逆向工程用户的「隐性角色与决策人格」，跑完整五阶段管道（发现→清洗过滤→信号提取→角色推断→回放验证），最终生成 roles.md 供 multi-agent 落地。当用户提到 role mining、角色挖掘、逆向工程自己的角色/决策人格、从 session 数据生成或更新 roles.md、重跑/重放 agent-analysis 管道、分析自己的会话历史提炼工作模式时使用；即使用户只说「重新跑一遍分析」「用最新 session 更新角色」也应使用本 skill。
---

# Role Mining

从真实会话行为逆向用户的角色分工与决策人格：人很难凭空列出自己身上的角色，但会话史里有他主动发起了什么、怎么纠正 agent、什么必须亲自拍板。工具 stdout / 文件全文几乎不含人格信息，管道会大幅压缩它们，完整保留用户原话。

最终交付物是一份双层 `roles.md`：Part 1 数据忠实的原始角色 + Part 2 可跨域复用的通用角色。

## 运行前提

- 需要 `bun`（脚本零第三方依赖）。
- 源数据只读：`~/.claude/projects/`、`~/.grok/sessions/` 永不写入。所有产物落在 run 目录内。
- 完整跑一轮是重活（Stage 2/3/4 是大量 LLM 工作）。开始前告知用户预期规模（会话数 × 提取成本），大批量提取用 subagent 分批。

## Run 目录与可复现契约

```
<workdir>/runs/<stamp>-<label>/
├── config.json          # 全部参数快照；改参数 = 新 run
├── inventory/           # 发现清单、排除审计（每条丢弃都有 reason）、themes.json、stats.json
├── cleaned/             # Stage 1 trajectory（全部主会话，含被过滤的，保证可审计）
├── manifest.md          # 漏斗结果 + 保留清单
├── user-turns/          # 每会话用户轮次抽取（Stage 4 回放 + 开放模式对照用）
├── census/              # 放权普查（被排除的低干预会话）
├── signals/             # Stage 2 信号（_open-schema/ 为对照组）
├── signals-manifest.md
├── roles.md             # Stage 3 交付物
└── validation/          # Stage 4 回放结果
```

复现性来自：config 快照、确定性排序与种子采样、丢弃全量留痕、脚本幂等（重跑覆盖同名产物；`--skip-existing` 支持断点续跑）。对比两轮 run 就是对比两个 run 目录。

## 管道流程

脚本一律通过 `bun <skill>/scripts/pipeline.ts <cmd> --run <runDir>` 调用。

### Stage 0 — 初始化

```bash
bun scripts/pipeline.ts init --workdir <目标目录> --label <名字>   # 打印 run 目录
```

默认 config 排除 `english-coach` 项目、丢低干预、中干预主题白名单 `review/bugfix/migration/i18n-docs`、cleaned ≥20KB。用户域不同就先改 `config.json` 再继续——阈值是启发式，不是真理。

### Stage 1 — 发现、清洗、过滤

```bash
bun scripts/pipeline.ts discover --run <run>
bun scripts/pipeline.ts normalize --run <run>          # 全量；可 --only/--limit/--skip-existing
bun scripts/pipeline.ts filter --run <run>
```

- 主会话定义：Claude = `<project>/<uuid>.jsonl`（排除 `agent-*.jsonl`、`subagents/`）；Grok = `session_kind ∉ {subagent, subagent_resume}`。
- filter 后若有 `pending-theme`：读 `inventory/pending-themes.md`，逐个读 cleaned 判断主题，把结果写进 `inventory/themes.json`（被丢弃的也要写真实主题名，保证审计可读），再重跑 `filter`。主题分桶需要判断力，这一步是 agent 的活，不是脚本的。
- 完成后跑 `stats` 核对漏斗数字，并抽查 2–3 个 cleaned 文件确认清洗质量（用户原话完整、噪音已剔）。

### Stage 1.5 — 放权普查 + 用户轮次抽取

```bash
bun scripts/pipeline.ts user-turns --run <run>
```

被丢弃的低干预会话是「什么已经可以安全放权」的正面证据，只看摩擦语料会把角色定义偏向管控。按 `references/stage2-signals.md` §2C 对 `census/census-list.json` 做轻量标注 → `census/census.md`。

### Stage 2 — 信号提取

读 `references/stage2-signals.md`，按其模板对每个 kept 会话产出信号文件。三条硬要求：

1. 关键互动必须引用用户原话 + 轮次号（可回溯到 cleaned）。
2. 跑开放模式对照组（§2B，`sample --n 15 --seed 42`）——预设框架提取会循环论证，对照组测量这个偏置。
3. 覆盖必须齐：`stats` 的 `signalsWritten` = kept 数。

### Stage 3 — 角色推断

读 `references/stage3-roles.md`，产出双层 `roles.md`。不可省略的三件事：

- **残差记账**：每个高价值信号要么入角色，要么进残差清单；描述性结论静默丢弃不合形样本 = 保真缺陷。
- **相位类型**：每个角色标「批处理型 / 对话型」——设计类职能是对话型，目标是每轮质量而非减少轮次。
- **Owner 在系统外**，命名与层级选择属 Owner 拍板（L5），不得说成「数据证明」。

### Stage 4 — 回放验证

读 `references/stage4-replay.md`。用 ≥5 个真实会话的 INITIAL 轮次回放角色管道（回放者不得看真实后续轮次），测升级准确率、摩擦预防量、参与密度削减估计，结论回写 `roles.md`。没跑回放的 roles.md 要在局限声明里写明「未经回放检验」。

## 迭代

- 新会话积累后重跑：同 config 新 run → 全管道 → 对比两轮 `roles.md` 与 `validation/summary.md`，角色应趋稳；反复漂移说明聚类过拟合于批次。
- 只想改 Stage 3 结论：复用旧 run 的 signals，直接重做 Stage 3/4。
- 修改过滤阈值：必须新 run（config 是快照），并在结论中注明漏斗差异。

## 诚实条款

各阶段的价值/干预标签是启发式，非金标；写进 manifest 与 roles.md 时保持这个措辞。覆盖了什么、没覆盖什么，如实写在产物里——这份 skill 的产出会被用来配置替用户做事的 agent，虚高的完成度会直接变成越权的 agent。
