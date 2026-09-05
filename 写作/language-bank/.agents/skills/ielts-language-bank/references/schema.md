# 字段与命令

Markdown frontmatter 使用 YAML 的子集：每行 `key: JSON值`，不写多行值。bank.py 仅解析此子集，不需额外 Python 包。正文保留可读说明。

## 录入批次

JSON 文件是对象数组。每项必须有 expression；其余字段示例：

```json
[
  {
    "expression": "take a toll on",
    "meaning": "对……造成损害或负面影响",
    "tags": ["reading", "writing"],
    "quality": "ready",
    "notes": "toll 通常用单数；their 指前面复数主语时可用 take their toll on。",
    "example": "Long working hours can take a toll on people's health.",
    "occurrences": [
      {
        "original": "take their toll",
        "original_meaning": null,
        "noted_at": "2026-09-05T10:49:00+08:00",
        "source": "聊天摘录；原材料来源未记录"
      }
    ]
  }
]
```

quality 只能是 ready / unverified / needs_context。import 默认 unverified，不会将导入行为当成核实。
id 由规范化 expression 的 SHA256 前 16 位产生；已存在时只合并不重复的 occurrences 和 tags，不覆盖复习数据、正文或已校订释义。需要更新释义/quality/正文时读后明确编辑。
created_at 是入库日；noted_at 是每次笔记日期，可为 null。source 是可溯源标记，不能捏造书本出处。用户提供整句但未确认原创时保留在 occurrences，而不是 user_sentence。

每篇 entries/ 文件还含 review_count / correct_streak / last_review / next_review / mastery，这些是 reviews/ 事件派生的缓存，由 refresh 重建。

## 复习事件

先把事件 JSON 写到本机临时目录，避免意外上传中间文件。字段：

```json
{
  "event_id": "87d06a34-d49b-490b-b8c8-9f0ceef84ee0",
  "entry_id": "从目标词条读取",
  "reviewed_at": "2026-09-05T19:00:00+08:00",
  "mode": "sentence",
  "prompt": "用该表达写一句关于工作压力的句子。",
  "answer": "用户实际回答",
  "result": "partial",
  "feedback": "解释关键错误",
  "corrected_sentence": "仅在造句批改时填写；否则可为 null"
}
```

mode 可为 sentence / translation / cloze / paraphrase。record 校验事件，保存为 reviews/<event_id>.md；同 ID 相同内容重试无副作用，不同内容拒绝。正文显示原回答和反馈。用户造句历史保存在 mode=sentence 的事件，词条正文通过链接呈现；不要覆盖历史。

```text
python bank.py import /path/to/batch.json
python bank.py validate
python bank.py refresh
python bank.py due --limit 10
python bank.py due --limit 10 --tag writing
python bank.py due --limit 10 --all
python bank.py record /path/to/event.json
python bank.py export
```

--all 包含未到期的 ready 词条，仍不抽取未核实/缺语境项。以上命令从任意目录执行时需使用 bank.py 的完整路径；库根目录按脚本位置定位。
