---
name: nix-decision-protocol
description: 适用于决策分析、recommendation、优先级/prioritization、trade-off 分析、选项比较/option comparison、build vs buy、战略评估等以做选择为主的任务。
---

# 目的

- 把含糊的选择题转成结构清晰的决策问题：选项、标准、trade-off、可逆性与置信度都要显式。
- 帮助用户做出选择、延后选择、分阶段推进，或先把决策风险降下来，而不是只介绍主题。

# 适用场景

- decision framing
- recommendation 请求
- trade-off 分析
- prioritization / sequencing
- build vs buy
- strategy、policy、investment 等需要明确标准的选择题

# 不适用场景

- 主要任务是写知识对象，而不是做选择
- 主要任务是实现或调试代码
- 主要任务是修改 AGENTS、skills 或指令系统

# 先框定决策

在给建议之前，先明确或合理推断：

- 要做什么决策
- 目标是什么
- 约束是什么
- 时间跨度是什么
- 是否存在关键 stakeholder
- 如果现在不做决定，默认会发生什么

# 按选项组织答案

当用户是在多个路径之间做选择时，答案应优先围绕这些字段组织：

- options
- decision criteria
- trade-offs
- reversibility
- risks / failure modes
- missing information
- recommended next step

# 推荐纪律

- 只有在标准明确或可以合理推断时才给 recommendation。
- 区分：已观察事实、假设、推断、价值判断。
- 不夸大证据强度。
- 明确校准 confidence。
- 当不确定性高时，优先推荐可逆实验。
- 对高影响决策，指出“哪条额外信息最便宜、最能提高决策质量”。

# 常用输出形状

## 单一推荐

至少包含：

- 决策本身
- 推荐选项
- 它为何在当前标准下更优
- 关键 trade-off
- confidence 与 uncertainty
- next step

## 选项比较

至少包含：

- options
- criteria
- 各项优缺点
- reversibility 与“判断错的代价”
- 推荐选项或分阶段路径

## 优先级排序

至少包含：

- 候选事项
- 排序逻辑
- trade-off
- 被降级或暂缓的事项，以及原因

# 信息缺失时怎么处理

- 不要隐藏 missing information。
- 如果在若干假设成立时仍可继续决策，要写明 recommendation 依赖哪些假设。
- 如果还不适合定案，要指出缺的是什么，以及哪一个缺失事实最可能改变答案。

# 输出要求

- 决策结构要足够显式，让用户能审计 recommendation。
- 回答必须帮助用户选择、延后，或去风险；不能只停留在话题解释。
- 当你在做价值判断时，要让它与事实层分开。

# 完成标准

- 决策、选项与标准都已显式化。
- trade-off 与 reversibility 清晰可见。
- recommendation 的强度与证据强度匹配。
- 用户拿到明确的下一步，即使下一步是继续补信息。

# 反模式

- 没框定决策就直接给建议
- 隐藏驱动 recommendation 的标准
- 把事实与判断压缩成一个未经支撑的结论
- 伪装成低不确定性
- 只罗列选项，不帮助用户行动
