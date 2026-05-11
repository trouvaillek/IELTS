import { useApi } from '../api.js';
import PageHeader from '../components/PageHeader.jsx';
import Empty from '../components/Empty.jsx';
import StatCard from '../components/StatCard.jsx';

const TYPE_COLOR = {
  writing: 'bg-amber-100 text-amber-700',
  reading: 'bg-emerald-100 text-emerald-700',
  listening: 'bg-sky-100 text-sky-700',
  vocab: 'bg-violet-100 text-violet-700',
};

const TYPE_CN = {
  writing: '写作',
  reading: '阅读',
  listening: '听力',
  vocab: '词汇',
};

function buildHeatmap(events) {
  const map = {};
  for (const e of events) {
    map[e.date] = (map[e.date] || 0) + 1;
  }
  const today = new Date();
  const cells = [];
  for (let i = 180; i >= 0; i--) {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - i);
    const key = dt.toISOString().slice(0, 10);
    cells.push({ date: key, count: map[key] || 0 });
  }
  return cells;
}

function colorFor(n) {
  if (n === 0) return '#e2e8f0';
  if (n === 1) return '#bae6fd';
  if (n === 2) return '#7dd3fc';
  if (n === 3) return '#0ea5e9';
  return '#0369a1';
}

export default function Timeline() {
  const { data, loading } = useApi('/timeline');
  if (loading) return <div className="text-slate-400">加载中…</div>;
  if (!data || data.events.length === 0) {
    return (
      <>
        <PageHeader title="时间线" subtitle="所有学习活动" />
        <Empty>跑任何 skill 写一些数据，时间线就有了。</Empty>
      </>
    );
  }

  const cells = buildHeatmap(data.events);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const totals = data.events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {});

  const last7 = (() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return data.events.filter((e) => new Date(e.date) >= cutoff).length;
  })();

  return (
    <>
      <PageHeader title="时间线" subtitle={`${data.events.length} 个活动`} />

      <div className="grid grid-cols-5 gap-4">
        <StatCard label="过去 7 天" value={last7} sub="次活动" />
        <StatCard label="写作" value={totals.writing || 0} />
        <StatCard label="阅读" value={totals.reading || 0} />
        <StatCard label="听力" value={totals.listening || 0} />
        <StatCard label="词汇" value={totals.vocab || 0} />
      </div>

      <div className="card mt-6">
        <div className="text-sm font-medium mb-3">最近 180 天活动热力图</div>
        <div className="overflow-x-auto">
          <div className="flex gap-1">
            {weeks.map((week, i) => (
              <div key={i} className="flex flex-col gap-1">
                {week.map((c) => (
                  <div
                    key={c.date}
                    title={`${c.date}: ${c.count} 次`}
                    className="w-3 h-3 rounded-sm"
                    style={{ background: colorFor(c.count) }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <div className="text-sm font-medium mb-3">活动列表</div>
        <table className="w-full text-sm">
          <thead className="text-slate-400 text-xs uppercase">
            <tr>
              <th className="text-left p-2">日期</th>
              <th className="text-left p-2">类型</th>
              <th className="text-left p-2">详情</th>
              <th className="text-right p-2">分数</th>
            </tr>
          </thead>
          <tbody>
            {[...data.events].reverse().slice(0, 200).map((e, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="p-2 font-mono">{e.date}</td>
                <td className="p-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${TYPE_COLOR[e.type] || 'bg-slate-100'}`}>
                    {TYPE_CN[e.type] || e.type} <span className="opacity-60">({e.type})</span>
                  </span>
                </td>
                <td className="p-2 text-slate-600">{e.label}</td>
                <td className="p-2 text-right font-mono">{e.score ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
