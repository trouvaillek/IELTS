"""Markdown IELTS language bank; Python 3.10+, standard library only."""
import argparse
import csv
import hashlib
import json
import random
import re
import sys
import unicodedata
import uuid
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
TZ = timezone(timedelta(hours=8))
INTERVALS = [1, 3, 7, 14, 30, 60]


def today():
    return datetime.now(TZ).date().isoformat()


def key(expression):
    text = unicodedata.normalize('NFKC', expression).strip().casefold()
    text = re.sub(r'\s+', ' ', text).replace('‑', '-').replace('’', "'")
    return hashlib.sha256(text.encode()).hexdigest()[:16]


def read(path):
    text = path.read_text(encoding='utf-8-sig')
    if not text.startswith('---\n'):
        raise ValueError(f'Missing frontmatter: {path}')
    header, body = text[4:].split('\n---\n', 1)
    data = {}
    for line in header.splitlines():
        name, value = line.split(': ', 1)
        if name in data:
            raise ValueError(f'Duplicate field {name}: {path}')
        data[name] = json.loads(value)
    return data, body


def write(path, data, body):
    path.parent.mkdir(parents=True, exist_ok=True)
    text = '---\n' + '\n'.join(f'{k}: {json.dumps(v, ensure_ascii=False)}' for k, v in data.items()) + '\n---\n' + body
    temp = path.with_suffix(path.suffix + '.tmp')
    temp.write_text(text, encoding='utf-8', newline='\n')
    temp.replace(path)


def entries():
    return [(p, *read(p)) for p in sorted((ROOT / 'entries').glob('*.md'))]


def events():
    return [(p, read(p)[0]) for p in sorted((ROOT / 'reviews').glob('*.md'))]


def timestamp(value):
    dt = datetime.fromisoformat(value)
    if dt.tzinfo is None:
        raise ValueError('reviewed_at must include timezone')
    return dt


def check_event(event, ids):
    required = ['event_id', 'entry_id', 'reviewed_at', 'mode', 'prompt', 'answer', 'result', 'feedback']
    if any(k not in event for k in required):
        raise ValueError('Missing review event fields')
    if str(uuid.UUID(event['event_id'])) != event['event_id']:
        raise ValueError('event_id must be a canonical UUID')
    if event['entry_id'] not in ids:
        raise ValueError('Unknown entry_id')
    timestamp(event['reviewed_at'])
    if event['result'] not in ['correct', 'partial', 'wrong']:
        raise ValueError('Invalid result')
    if event['mode'] not in ['sentence', 'translation', 'cloze', 'paraphrase']:
        raise ValueError('Invalid mode')
    if not all(isinstance(event[k], str) and event[k].strip() for k in ['prompt', 'answer', 'feedback']):
        raise ValueError('Actual prompt, answer and feedback are required')


def validate():
    records = entries()
    ids = set()
    for path, data, body in records:
        if data['id'] in ids or path.stem != data['id']:
            raise ValueError(f'Duplicate ID or incorrect filename: {path}')
        ids.add(data['id'])
        if not isinstance(data['expression'], str) or not data['expression'].strip():
            raise ValueError(f'Empty expression: {path}')
        if data['quality'] not in ['ready', 'unverified', 'needs_context']:
            raise ValueError(f'Invalid quality: {path}')
        date.fromisoformat(data['created_at'])
        if not isinstance(data['occurrences'], list) or not data['occurrences']:
            raise ValueError(f'Missing original/source: {path}')
        for occurrence in data['occurrences']:
            if not occurrence.get('original') or not occurrence.get('source'):
                raise ValueError(f'Missing original/source: {path}')
    seen = set()
    for path, event in events():
        check_event(event, ids)
        if event['event_id'] in seen or path.stem != event['event_id']:
            raise ValueError(f'Duplicate event or incorrect filename: {path}')
        seen.add(event['event_id'])
    return len(records), len(seen)


def state(data, all_events):
    history = sorted((e for e in all_events if e['entry_id'] == data['id']), key=lambda e: (timestamp(e['reviewed_at']), e['event_id']))
    streak = 0
    last = None
    due = data['created_at']
    for event in history:
        streak = streak + 1 if event['result'] == 'correct' else 0
        days = INTERVALS[min(streak - 1, len(INTERVALS) - 1)] if streak else 1
        last = event['reviewed_at']
        due = (timestamp(last).astimezone(TZ).date() + timedelta(days=days)).isoformat()
    return dict(review_count=len(history), correct_streak=streak, last_review=last, next_review=due,
                mastery='mastered' if streak >= 6 else 'familiar' if streak >= 3 else 'learning' if history else 'untested')


def cell(value):
    return str(value if value is not None else '未记录').replace('|', '\\|').replace('\n', ' ')


def refresh():
    validate()
    all_events = [e for _, e in events()]
    table = ['# 雅思积累库', '', f'更新日期：{today()}。统计由复习事件生成；新增记录不等于已复习。', '',
             '| 表达 | 释义 | 用途标签 | 笔记日期 | 收录日期 | 复习次数 | 下次复习 | 核实状态 |',
             '|---|---|---|---|---|---|---|---|']
    pending = ['# 待核实与待补语境', '', 'unverified 表示保留原笔记但未逐项核实；needs_context 表示需语境才能确定原意。默认抽查排除这些条目。', '']
    for path, data, body in sorted(entries(), key=lambda r: r[1]['expression'].casefold()):
        data.update(state(data, all_events))
        marker = '\n<!-- GENERATED-REVIEWS -->'
        body = body.split(marker)[0].rstrip() + '\n'
        history = [e for e in all_events if e['entry_id'] == data['id']]
        body += marker + '\n\n## 我的造句与复习历史\n\n'
        if not history:
            body += '尚未作答。我的造句留空；AI 示例不计为用户造句。\n'
        else:
            for event in sorted(history, key=lambda e: timestamp(e['reviewed_at'])):
                body += f"- [{event['reviewed_at']} · {event['mode']} · {event['result']}](../reviews/{event['event_id']}.md)\n"
        write(path, data, body)
        noted = sorted({str(o['noted_at'])[:10] for o in data['occurrences'] if o.get('noted_at')})
        values = [f"[{cell(data['expression'])}](entries/{data['id']}.md)", cell(data['meaning']), ', '.join(data['tags']), ', '.join(noted) or '未知', data['created_at'], data['review_count'], data['next_review'], data['quality']]
        table.append('| ' + ' | '.join(map(str, values)) + ' |')
        if data['quality'] != 'ready':
            pending.append(f"- [{cell(data['expression'])}](entries/{data['id']}.md) — {data['quality']}")
    (ROOT / 'INDEX.md').write_text('\n'.join(table) + '\n', encoding='utf-8')
    (ROOT / 'REVIEW-QUEUE.md').write_text('\n'.join(pending) + '\n', encoding='utf-8')


def import_batch(path):
    batch = json.loads(Path(path).read_text(encoding='utf-8-sig'))
    if not isinstance(batch, list):
        raise ValueError('Batch must be a list')
    # Check the complete batch before mutation.
    for item in batch:
        if not isinstance(item.get('expression'), str) or not item['expression'].strip():
            raise ValueError('Each item needs an expression')
        if item.get('quality', 'unverified') not in ['ready', 'unverified', 'needs_context']:
            raise ValueError('Invalid quality')
        for o in item.get('occurrences', []):
            if not o.get('original') or not o.get('source'):
                raise ValueError('Invalid occurrence')
    added = merged = 0
    for item in batch:
        entry_id = key(item['expression'])
        dest = ROOT / 'entries' / f'{entry_id}.md'
        occurrences = item.get('occurrences') or [dict(original=item['expression'], original_meaning=item.get('meaning'), noted_at=None, source='用户提交；原材料来源未记录')]
        if dest.exists():
            data, body = read(dest)
            for occurrence in occurrences:
                if occurrence not in data['occurrences']:
                    data['occurrences'].append(occurrence)
            data['tags'] = sorted(set(data['tags'] + item.get('tags', ['general'])))
            merged += 1
        else:
            data = dict(id=entry_id, expression=item['expression'].strip(), meaning=item.get('meaning') or '待补充',
                        tags=item.get('tags', ['general']), created_at=today(), source_status='original_source_unknown',
                        quality=item.get('quality', 'unverified'), occurrences=occurrences)
            data.update(state(data, []))
            body = f"\n# {data['expression']}\n\n## 中文释义\n\n{data['meaning']}\n\n## 用法与纠正\n\n{item.get('notes') or '原笔记尚未逐项核实；复习出题前检查释义与搭配。'}\n\n## AI 示例\n\n{item.get('example') or '未生成。'}\n\n## 原始记录\n\n完整原文、原释义、笔记日期和来源标记保存在文件开头 occurrences 字段；未知出处不补造。\n"
            added += 1
        write(dest, data, body)
    refresh()
    print(json.dumps(dict(added=added, merged=merged, total=len(entries())), ensure_ascii=False))


def record(path):
    event = json.loads(Path(path).read_text(encoding='utf-8-sig'))
    check_event(event, {d['id'] for _, d, _ in entries()})
    dest = ROOT / 'reviews' / f"{event['event_id']}.md"
    if dest.exists():
        if read(dest)[0] != event:
            raise ValueError('This event_id already exists with different content')
        print('Already recorded; no duplicate review counted.')
        refresh()
        return
    body = f"\n# 复习记录\n\n## 题目\n\n{event['prompt']}\n\n## 用户原回答\n\n{event['answer']}\n\n## 反馈\n\n{event['feedback']}\n\n## 建议修改句\n\n{event.get('corrected_sentence') or '不适用。'}\n"
    write(dest, event, body)
    refresh()
    print('Review saved.')


def due(limit, tag, include_all):
    validate()
    all_events = [e for _, e in events()]
    candidates = []
    for _, data, _ in entries():
        data.update(state(data, all_events))
        if data['quality'] == 'ready' and (not tag or tag in data['tags']) and (include_all or data['next_review'] <= today()):
            candidates.append(data)
    random.shuffle(candidates)
    candidates.sort(key=lambda d: (d['next_review'], 0 if d['review_count'] and not d['correct_streak'] else 1))
    print(json.dumps(candidates[:limit], ensure_ascii=False, indent=2))


def export():
    refresh()
    dest = ROOT / 'exports' / 'language-bank.csv'
    dest.parent.mkdir(exist_ok=True)
    fields = ['id', 'expression', 'meaning', 'tags', 'created_at', 'review_count', 'last_review', 'next_review', 'quality', 'user_sentences']
    all_events = [e for _, e in events()]
    with dest.open('w', encoding='utf-8-sig', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=fields)
        writer.writeheader()
        for _, data, _ in entries():
            data['user_sentences'] = '\n'.join(e['answer'] for e in all_events if e['entry_id'] == data['id'] and e['mode'] == 'sentence')
            row = {f: ', '.join(data[f]) if isinstance(data.get(f), list) else data.get(f) for f in fields}
            # Spreadsheet viewers should display notes as text, not formulas.
            row = {k: "'" + v if isinstance(v, str) and v.startswith(('=', '+', '-', '@', '\t', '\r')) else v for k, v in row.items()}
            writer.writerow(row)
    print(dest)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    for name in ['import', 'record']:
        sub.add_parser(name).add_argument('file')
    for name in ['validate', 'refresh', 'export']:
        sub.add_parser(name)
    selection = sub.add_parser('due')
    selection.add_argument('--limit', type=int, default=10)
    selection.add_argument('--tag')
    selection.add_argument('--all', action='store_true')
    args = parser.parse_args()
    if args.command == 'import':
        import_batch(args.file)
    elif args.command == 'record':
        record(args.file)
    elif args.command == 'validate':
        n, m = validate()
        print(f'Validated {n} entries and {m} review events.')
    elif args.command == 'refresh':
        refresh()
        print('Index and review statistics refreshed.')
    elif args.command == 'due':
        if args.limit < 1:
            parser.error('--limit must be positive')
        due(args.limit, args.tag, args.all)
    else:
        export()


if __name__ == '__main__':
    try:
        main()
    except (ValueError, KeyError, OSError) as exc:
        print(f'Error: {exc}', file=sys.stderr)
        sys.exit(1)
