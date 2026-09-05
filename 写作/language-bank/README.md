# 雅思词句积累库

把词句直接发给 Codex，说“加入积累库”。复习时说“考我今天到期的 10 个，一次一道”。

## 使用入口

- [全部词句](INDEX.md)：日期、释义、用途、复习次数和下次复习。
- [需要补语境的条目](REVIEW-QUEUE.md)：不确定的原文不会直接拿来考你。
- [录入与复习 skill](.agents/skills/ielts-language-bank/SKILL.md)：两台电脑共用的规则。
- `entries/`：每个表达独立 Markdown，保留原始笔记和纠正说明。
- `reviews/`：实际完成的每次复习，含你的原回答、评分、反馈和修改句。首次作答后建立。
- `sources/`：此次导入的原始附件和带日期的摘录。未知出处如实保留。

初次导入包含 487 行附件和 24 条近期笔记，合并 6 次重复表达，共 505 个词条。500 个可用于抽查，5 个需补语境。用途标签为训练建议，并不代表已经找回原文出处。
所有词条初始复习次数为 0；笔记记录日期不等于复习日期；没有替你编写“我的造句”。AI 例句单独标记。

## 可以直接说的话

> 把这些加入积累库；不知道出处，日期按今天。

> 抽查写作表达，给中文让我造句，一次一道，先别给答案。

> 考我今天到期的 10 个，优先上次答错的。

> 这句是我自己造的，请批改并保存原句和修改版。

> 导出 Excel 能打开的表格。

看到题目不算复习；回答并收到反馈才记一次。正确后的间隔依次为 1、3、7、14、30、60 天；部分正确或错误，安排次日再练。长期掌握仍会抽查。

## 笔记本与台式电脑

GitHub 仓库：[trouvaillek/IELTS](https://github.com/trouvaillek/IELTS)。资料库位于仓库内的 `写作/language-bank/`。

每台电脑安装 Git 和 Python 3.10+，将仓库克隆到自己习惯的位置。推送学习记录时需登录具有写入权限的 GitHub 账号。

```text
git clone https://github.com/trouvaillek/IELTS.git
cd IELTS/写作/language-bank
```

在 Codex 中打开 `IELTS/写作/language-bank` 文件夹。项目 skill 位于其中的 `.agents/skills/`，与数据一起同步；该目录的 AGENTS.md 也会引导读取该 skill。已克隆过仓库时直接拉取最新内容，不再创建另一份主库。

不要依赖某台电脑的绝对路径，也不需要复制历史聊天。相同的资料和规则都在仓库中。
若当前 Codex 会话没有刷新技能列表，重新打开项目/新建对话，或直接让它读取上面链接的 SKILL.md。

Codex 每次操作时遵循：检查状态 → 干净时 `git pull --ff-only` → 录入/复习 → 验证并更新索引 → 仅提交本次相关文件 → `git push`。
这不是后台自动同步服务；你结束学习前让 Codex 完成保存和推送即可。没有网络时仍能在本机学习，但另一台电脑暂时看不到新记录。避免两台机器同时编辑同一个条目；发生分叉时保留双方数据再合并，不覆盖文件。

## 本机命令

从资料库目录执行：

```text
python bank.py validate
python bank.py refresh
python bank.py due --limit 10
python bank.py due --limit 10 --tag writing
python bank.py export
```

`due` 输出给 Codex 读取，其中包含答案，不要让 Codex 在出题前整表展示。
`export` 生成 UTF-8 CSV，可用 Excel 打开；它是导出副本，主资料仍是 Markdown。脚本不依赖额外 Python 包。
录入/复习事件格式见 [schema.md](.agents/skills/ielts-language-bank/references/schema.md)。

## 数据可靠性

重复录入按表达去重，保留多个原始来源；不同词形或义项不盲目合并。复习事件使用唯一 ID，重试不会多计一次。统计与浏览页可从这些主记录重建。
首次整理修正了例如 captial → capital、finiance → finance、hyginee → hygiene、economy powerhouse → economic powerhouse；原文仍在每个词条的 occurrences 和 sources 中。
