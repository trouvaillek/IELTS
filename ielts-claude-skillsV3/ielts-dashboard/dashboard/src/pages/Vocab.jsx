import { useApi } from '../api.js';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import Empty from '../components/Empty.jsx';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

function calendarHeatmap(days) {
  const map = {};
  for (const d of days) {
    map[d.date] = (map[d.date] || 0) + (d.words_pushed?.length || 0);
  }
  const today = new Date();
  const cells = [];
  for (let i = 90; i >= 0; i--) {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - i);
    const key = dt.toISOString().slice(0, 10);
    cells.push({ date: key, count: map[key] || 0 });
  }
  return cells;
}

function HeatmapGrid({ cells }) {
  const max = Math.max(...cells.map((c) => c.count), 1);
  const colorFor = (n) => {
    if (n === 0) return '#e2e8f0';
    const intensity = n / max;
    if (intensity < 0.25) return '#bbf7d0';
    if (intensity < 0.5) return '#86efac';
    if (intensity < 0.75) return '#22c55e';
    return '#15803d';
  };
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return (
    <div className="flex gap-1">
      {weeks.map((week, i) => (
        <div key={i} className="flex flex-col gap-1">
          {week.map((c) => (
            <div
              key={c.date}
              title={`${c.date}: ${c.count} 词`}
              className="w-3 h-3 rounded-sm"
              style={{ background: colorFor(c.count) }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Vocab() {
  const { data, loading } = useApi('/vocab');
  if (loading) return <div className="text-slate-400">加载中…</div>;
  if (!data || data.days.length === 0) {
    return (
      <>
        <PageHeader title="词汇" subtitle="间隔重复 + 难词池" />
        <Empty>跑 “练雅思词汇” 推送一天词汇，数据就出来了。</Empty>
      </>
    );
  }

  const days = data.days;
  const summary = data.summary;
  const stackData = days.map((d) => ({
    day: `D${d.day}`,
    pushed: d.words_pushed?.length || 0,
    mastered: d.mastered_today?.length || 0,
    difficult: d.difficult_added?.length || 0,
  }));
  const accuracyTrend = days
    .filter((d) => d.test && d.test.total > 0)
    .map((d) => ({ day: `D${d.day}`, acc: +((d.test.correct / d.test.total) * 100).toFixed(1) }));

  return (
    <>
      <PageHeader title="词汇" subtitle={`Day ${summary.current_day} · 推送 ${summary.total_pushed} · 掌握 ${summary.total_mastered}`} />

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="当前 Day" value={summary.current_day} />
        <StatCard label="累计推送" value={summary.total_pushed} sub="词" />
        <StatCard label="已掌握" value={summary.total_mastered} accent />
        <StatCard label="难词池" value={summary.total_difficult} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="card">
          <div className="text-sm font-medium mb-3">每日推送 / 掌握 / 难词</div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stackData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="pushed" stackId="1" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} name="推送" />
              <Area type="monotone" dataKey="mastered" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="掌握" />
              <Area type="monotone" dataKey="difficult" stackId="3" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.4} name="难词" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="text-sm font-medium mb-3">测试正确率</div>
          {accuracyTrend.length === 0 ? (
            <div className="text-slate-400 text-sm py-12 text-center">还没测试记录</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={accuracyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="acc" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="正确率%" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card mt-6">
        <div className="text-sm font-medium mb-3">最近 90 天推送热力图</div>
        <HeatmapGrid cells={calendarHeatmap(days)} />
        <div className="text-xs text-slate-400 mt-3 flex items-center gap-2">
          少 <div className="w-3 h-3 rounded-sm bg-slate-200" />
          <div className="w-3 h-3 rounded-sm bg-green-200" />
          <div className="w-3 h-3 rounded-sm bg-green-400" />
          <div className="w-3 h-3 rounded-sm bg-green-600" />
          <div className="w-3 h-3 rounded-sm bg-green-800" /> 多
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="card">
          <div className="text-sm font-medium mb-3">难词池（{data.difficult.length}）</div>
          <div className="max-h-72 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400 text-xs uppercase sticky top-0 bg-white">
                <tr>
                  <th className="text-left p-2">词</th>
                  <th className="text-right p-2">复习次数</th>
                  <th className="text-right p-2">最后正确</th>
                  <th className="text-left p-2">最后复习</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {data.difficult.slice(0, 100).map((d, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="p-2">{d.word}</td>
                    <td className="p-2 text-right">{d.review_count}</td>
                    <td className="p-2 text-right">{d.last_correct ? '✓' : '✗'}</td>
                    <td className="p-2 text-slate-500">{d.last_review || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="text-sm font-medium mb-3">已掌握（{data.mastered.length}）</div>
          <div className="max-h-72 overflow-auto">
            <div className="flex flex-wrap gap-1.5">
              {data.mastered.slice(0, 200).map((m, i) => (
                <span key={i} title={`Day ${m.mastered_day}`} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-sm">
                  {m.word}
                </span>
              ))}
            </div>
            {data.mastered.length > 200 && <div className="text-xs text-slate-400 mt-3">显示前 200 词。</div>}
          </div>
        </div>
      </div>
    </>
  );
}
