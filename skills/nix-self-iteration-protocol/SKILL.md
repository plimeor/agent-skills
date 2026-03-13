---
name: nix-self-iteration-protocol
description: 适用于评估、重写、重构、拆分、精简或演进 AGENTS.md、SKILL.md、prompt 架构、skill description 与 routing；也用于诊断提示词失效、prompt failure、模型不遵守全局提示词、误触发、漏触发、指令冲突、规则放错层级，以及各类指令系统使用摩擦。
---

# 目的

- 通过诊断具体失败模式、减少歧义、把规则放到正确层级，持续改进整个指令系统。
- 让全局 AGENTS 保持精简，把可复用的专项工作流迁移到 skill。

# 适用场景

- 评估或重写 AGENTS.md
- 把一份大 prompt 拆成多个 skills
- 重写 skill description 以提高触发精度
- 判断某条规则应放在 global、skill、repo-local AGENTS、tooling 还是 MCP
- 为 prompt / skill 设计 regression tests 或 eval prompts
- 诊断反复出现的 prompt failure 或使用摩擦

# 不适用场景

- 普通编码或调试任务
- 普通知识创作任务
- 普通领域决策支持，而非指令系统设计

# 诊断流程

0. 先判断这是否真的是 prompt / routing / instruction design 问题；若更可能是 context 供给不足、tooling / MCP 缺口、repo-local 约束缺失、模型能力边界或缺少 eval，先在那里修，不要默认改 prompt。
1. 明确观察到的 symptom、重复性 failure 或 friction。
2. 在提改动前，先给 failure 分类。
3. 判断修复应落在哪个层级。
4. 只提出最小但有效的改动。
5. 说明预期收益、可能回归与受影响任务。
6. 指定如何用最小 eval 包或稳定任务集验证改动。

# 失败类型分类

- mode-selection failure
- scope-control failure
- evidence / verification failure
- quality-bar failure
- format / delivery failure
- knowledge-traceability failure
- decision-calibration failure
- over-constraint 或 under-constraint
- routing-description failure
- instruction redundancy / contradiction

# 规则放置层级

## global AGENTS

只保留“总是生效、跨任务、低歧义”的规则。

## skill

承载可复用的专项工作流、领域协议、 richer templates、负例与任务特定质量门槛。

## repo 或目录级 AGENTS

放仓库特定命令、约定、build/test 命令与局部 routing 提示。

## tooling / checks

若规则更适合由 tests、linters、formatters、scripts 或 evals 进行确定性约束，就不要只靠 prompt。

## MCP / 外部系统

若真正缺的是外部系统访问能力，而不是行为指导，应优先考虑 tool / MCP 集成。

# 变更记录模板

每次改动至少按以下顺序输出，不要跳字段：

- observed symptom
- evidence
- likely root cause
- failure class
- placement layer
- minimal change
- eval plan
- rollback signal

# skill description 规则

- description 用单行文本。
- description 只写“触发场景”，不写 Do not use when、Outputs、Success，除非 eval 明确证明必须补充。
- 中文优先，同时补常见英文 trigger words，方便中英文混合请求触发。
- description 是 routing 逻辑，不是 marketing copy。
- 真正的边界、反例、输出要求与完成标准放在正文里。
- 如果 skill 误触发或漏触发，先改 description，再考虑扩正文。

# 改动策略

- 规则要少而强。
- 合并或删除重叠指令。
- 用可观察行为替代抽象口号。
- 当要写入 DSL、Preset、Reference、字段 schema 或其他共享对象时，先确认对象边界、目标使用者和评估函数已经稳定；如果还没稳定，先保留证据层或候选层。
- 除非能在真实任务上改变行为，否则不要新增规则。
- 运行时提示要保持足够精简，避免再次膨胀成总章程。

# 回归验证纪律

不要只靠直觉判断 prompt 改好了。每次改动至少准备一个最小 eval 包：

- 2 个 should-trigger cases
- 2 个 near-miss should-not-trigger cases
- 1 个 baseline 对照（改前 description / prompt / 旧规则 / 无 skill）
- 1 个 held-out case

如果改动影响跨任务 routing、global AGENTS 或多个 skills 的边界，长期仍应维护一个稳定任务集，覆盖：

- 一个 coding bugfix 任务
- 一个局部 refactor 边界案例
- 一个 knowledge organization / synthesis 任务
- 一个 decision-support 任务
- 一个简单 conversation 任务
- 对每个改过 routing 的 skill，至少一个 should-trigger 与一个 should-not-trigger case

# 输出要求

- 要求你修改 prompt 或 skill 时，输出具体改写后的文本，而不只是批评。
- 做评估时，把“诊断”和“建议改动”分开。
- 做拆分时，同时给出：拆出的 skills 与剩余 global prompt。

# 完成标准

- 已先排除明显的非 prompt / routing 问题。
- 改动有明确 failure mode 或持续 friction 作为依据。
- placement layer 选择清楚且可辩护。
- description 足够支撑稳定 routing。
- 验证方式、baseline 与 rollback signal 已被明确。

# 反模式

- 为了解决专项问题而继续膨胀 global prompt
- 为了“看起来更完整”而加规则
- 实际问题在 description，却去堆正文
- 在已有发现上继续堆概念、层级或 schema 名词，却不改变 routing、输出契约或验证方式
- 保留互相矛盾或重复的规则
- 不做真实回归检查就接受 prompt 改动
