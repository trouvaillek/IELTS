# IELTS V3 数据规范（SCHEMA）

> 所有 skill 写入 `~/.ielts/` 时必须遵守本规范。Dashboard 启动时按本规范扫描聚合。
> 版本：V3.1.0（2026-04-23）

---

## 核心原则

1. **原子文件 = 唯一真相**。批改/分析/背词每次产生一个独立 md/yaml，带强制 frontmatter。
2. **聚合视图 = 实时计算**。`index.md` / `errors.md` / `synonyms.md` 已废弃，由 dashboard 扫原子聚合生成。
3. **md 主体保留人类可读**。frontmatter 只提取结构化字段，正文继续给人看。
4. **YAML 子文件存纯数据**。同义替换、难词池等高频读写的数据用 yaml，避免 frontmatter 膨胀。

---

## 目录结构

```
~/.ielts/
├── profile.md                          用户档案（单文件）
├── scores.md                           分数历史（单文件，frontmatter 数组）
├── writing/
│   └── submissions/
│       └── YYYYMMDD_taskN_topic.md     每篇批改一个文件
├── reading/
│   ├── submissions/
│   │   └── YYYYMMDD_source.md          每次阅读一个文件
│   └── synonyms/
│       └── YYYYMMDD_source.yaml        每次新增的同义替换
├── listening/
│   └── submissions/
│       └── YYYYMMDD_source.md          每套听力一个文件
├── vocab/
│   ├── days/
│   │   └── dayNN.md                    每天背词记录
│   └── difficult.yaml                  难词池（单文件，状态需要单点维护）
└── speaking/
    └── stories/
        └── story_NN_topic.md           每个万能故事一个文件
```

---

## 各文件 Schema

### `profile.md`

```yaml
---
goal_band: 7.5
exam_date: 2026-09-15
created_at: 2026-04-01
current: {l: 6.5, r: 7, w: 6, s: 6}
weekly_hours: 15
focus: [writing, listening]            # 用户自选重点
---
（人类备注，可选）
```

**字段说明**：
- `goal_band`: 数字，0.5 步进
- `exam_date`: ISO 日期 `YYYY-MM-DD`
- `current`: 四科当前水平（首次诊断给出）
- `focus`: 数组，可选值 `writing | reading | listening | speaking | vocab`

---

### `scores.md`

```yaml
---
records:
  - {date: 2026-04-01, type: mock,    l: 6.0, r: 6.5, w: 5.5, s: 6.0, overall: 6.0, source: cam17-test1}
  - {date: 2026-04-15, type: mock,    l: 6.5, r: 7.0, w: 6.0, s: 6.0, overall: 6.5, source: cam18-test2}
  - {date: 2026-09-15, type: real,    l: 7.0, r: 7.5, w: 6.5, s: 6.5, overall: 7.0, source: official}
---
（人类备注，可选）
```

**字段说明**：
- `type`: `mock` | `real` | `partial` | `diagnose`（partial 表示只考了部分科目；diagnose 表示通过 `“分析雅思成绩”` 估算的水平，不是真实模考）
- 缺考科目用 `null`

---

### `writing/submissions/YYYYMMDD_taskN_topic.md`

**文件名规范**：`20260420_task2_technology.md`

```yaml
---
date: 2026-04-20
task: 2                                # 1 | 2
topic: technology                      # 单词或短语，下划线分隔
score:
  tr: 6.5                              # Task Response
  cc: 7.0                              # Coherence & Cohesion
  lr: 6.0                              # Lexical Resource
  ga: 6.5                              # Grammar & Accuracy
  overall: 6.5                         # 加权后总分
errors:
  - {type: grammar,  tag: conditional,        count: 3}
  - {type: lexical,  tag: prep_collocation,   count: 2}
  - {type: cohesion, tag: linker_overuse,     count: 1}
duration_min: 38
word_count: 287
---
# 题目
（题目原文）

# 学生作文
（学生作文）

# 批改
（四维评分详细解释 + 句子级标注 + 改写对比）
```

**字段说明**：
- `score.overall`: Task 1 和 Task 2 的加权（Task 2 双倍权重）
- `errors[].type`: `grammar | lexical | cohesion | task_response | coherence`
- `errors[].tag`: 自由标签，建议小写下划线
- `errors[].count`: 这篇里出现的次数

---

### `reading/submissions/YYYYMMDD_source.md`

**文件名规范**：`20260420_cam18-test3-passage2.md`

```yaml
---
date: 2026-04-20
source: cam18-test3-passage2           # 唯一标识
total: 13
correct: 9
accuracy: 0.69
band: 6.5                              # 按算分表换算
question_types:
  - {type: tfng,     total: 5, correct: 3}
  - {type: matching, total: 4, correct: 3}
  - {type: summary,  total: 4, correct: 3}
errors:
  - {tag: tfng_inference,        question: 3,  type: tfng}
  - {tag: matching_paraphrase,   question: 8,  type: matching}
synonyms_added: 12
duration_min: 18
---
# 文章原文 / 题目 / 解析
```

**字段说明**：
- `question_types[].type`: 阅读题型枚举（与 `“分析雅思阅读”` skill 保持一致）：
  `tfng` | `ynng` | `matching_info` | `matching_features` | `matching_headings` |
  `mcq` | `summary` | `sentence_completion` | `short_answer` | `table` | `flow_chart`
  （兼容 V3.0：`matching` 仍可读，但建议新数据细化为 `matching_info` / `matching_features` / `matching_headings`）
- `errors[].tag`: 错题类型标签
- `synonyms_added`: 数量。明细在 `synonyms/YYYYMMDD_source.yaml`

---

### `reading/synonyms/YYYYMMDD_source.yaml`

```yaml
- {original: significant,   paraphrase: substantial,    source: cam18-t3-p2, context: "scientific findings"}
- {original: decline,       paraphrase: deteriorate,    source: cam18-t3-p2, context: "ecosystem"}
- {original: gather,        paraphrase: accumulate,     source: cam18-t3-p2}
```

---

### `listening/submissions/YYYYMMDD_source.md`

**文件名规范**：`20260420_cam18-test3.md`

```yaml
---
date: 2026-04-20
source: cam18-test3
total: 40
correct: 31
band: 7.0
section_scores: [9, 8, 7, 7]
section_types:                         # 每个 section 的题型分布
  - {section: 1, type: form_completion, total: 10, correct: 9}
  - {section: 2, type: map,             total: 10, correct: 7}
  - {section: 3, type: matching,        total: 10, correct: 8}
  - {section: 4, type: note_completion, total: 10, correct: 7}
error_types:
  - {tag: spelling, count: 4, examples: [accommodation, conscientious, restaurant, exhibition]}
  - {tag: number,   count: 2, examples: ["13.50", "fifteen"]}
  - {tag: map,      count: 3}
  - {tag: distractor_trap, count: 2}
---
# 错题详细分析
```

**字段说明**：
- `section_types[].type`: 听力题型枚举（与 `“分析雅思听力”` skill 保持一致）：
  `form_completion` | `note_completion` | `summary_completion` | `sentence_completion` |
  `mcq` | `matching` | `map` | `plan` | `diagram` | `short_answer` | `table`
- `error_types[].tag`: 自由稳定标签。常用：`spelling` | `number` | `map` | `distractor_trap` |
  `paraphrase` | `over_word_limit` | `singular_plural` | `missed_negation` | `accent`

---

### `vocab/days/dayNN.md`

**文件名规范**：`day12.md`（NN 从 01 起，宽度自适应）

```yaml
---
day: 12
date: 2026-04-20
words_pushed:                          # 当天推送的新词
  - ubiquitous
  - exacerbate
  - paradigm
  - ...
test:
  total: 15
  correct: 12
  wrong: [conundrum, ephemeral, recalcitrant]
mastered_today: [ubiquitous, exacerbate]   # 测试连对，毕业
difficult_added: [conundrum, ephemeral]    # 进难词池
review_due:                            # 间隔重复触发的复习
  - {from_day: 7, count: 15}
  - {from_day: 4, count: 15}
duration_min: 25
---
（可选：当天发现的搭配/语境笔记）
```

---

### `vocab/difficult.yaml`

```yaml
- {word: conundrum,   added_day: 12, review_count: 1, last_correct: false, last_review: 2026-04-20}
- {word: ephemeral,   added_day: 12, review_count: 2, last_correct: true,  last_review: 2026-04-21}
- {word: recalcitrant, added_day: 8, review_count: 4, last_correct: true,  last_review: 2026-04-19}
```

**出池规则**：连对 3 次（`review_count >= 3 && last_correct == true`）→ 移到 `vocab/mastered.yaml`。

---

### `vocab/mastered.yaml`

```yaml
- {word: ubiquitous,  mastered_day: 12, mastered_at: 2026-04-20, source: day12}
- {word: exacerbate,  mastered_day: 12, mastered_at: 2026-04-20, source: day12}
```

---

### `speaking/stories/story_NN_topic.md`

**文件名规范**：`story_07_work.md`

```yaml
---
id: 7
topic_primary: work
topics_covered: [work, study, future_plan, success]   # 一个故事覆盖多话题
parts: [2, 3]
length_sec: 90
status: drafted                        # drafted | rehearsed | recorded
created_at: 2026-04-15
---
# Part 2 卡片题
（话题卡片）

# 故事正文
（90 秒口述稿）

# Part 3 追问预测
（3-5 个追问 + 答题骨架）
```

---

### `speaking/topic_groups.yaml`

```yaml
groups:
  - {name: people,        topics: [friend, family, teacher, person_helped_you], stories: [3, 5]}
  - {name: places,        topics: [hometown, holiday_place, restaurant],         stories: [2, 8]}
  - {name: things,        topics: [book, photo, gift, app],                      stories: [1, 4, 6]}
  - {name: events,        topics: [success, decision, change, achievement],      stories: [7]}
  - {name: experiences,   topics: [travel, learning, work, party],               stories: [7, 8]}
total_topics: 37                       # 官方 Part 2 话题总数
covered_topics: 22
coverage_rate: 0.59
```

---

## 字段约定

### 通用
- 日期一律 ISO `YYYY-MM-DD`
- 分数一律 `0.0-9.0`，0.5 步进
- 标签一律小写 + 下划线（`prep_collocation` 不是 `PrepCollocation`）
- 数组用 flow style `[a, b, c]` 或 block style，不混用

### 命名空间
- `errors[].tag`: 自由扩展，但应稳定（同一类错误用同一个标签）
- `source`: 剑桥真题用 `cam18-test3` 或 `cam18-test3-passage2` 格式

---

## Dashboard 校验

启动时执行 `validate.js`，对每个文件检查：
1. frontmatter 是否存在
2. 必填字段是否齐全
3. 字段类型是否正确（zod schema）
4. 文件名是否符合规范

不通过的条目独立列出来给用户修，不阻断 dashboard 启动。

---

## 废弃说明（V2 → V3）

| V2 文件 | V3 处理 |
|---------|---------|
| `writing/index.md` | 废弃，dashboard 实时聚合 |
| `writing/errors.md` | 废弃，dashboard 实时聚合 |
| `reading/index.md` | 废弃 |
| `reading/errors.md` | 废弃 |
| `reading/synonyms.md`（单文件累计） | 拆成 `synonyms/YYYYMMDD_source.yaml` |
| `vocab/progress.md`（单文件累计） | 拆成 `vocab/days/dayNN.md` |
| `vocab/difficult.md` | 改为 `vocab/difficult.yaml`（结构化） |
| `vocab/mastered.md` | 改为 `vocab/mastered.yaml`（结构化） |
| `speaking/topic_groups.md` | 改为 `speaking/topic_groups.yaml` |

V2 数据由 `migrate-v2-to-v3.js` 自动迁移。
