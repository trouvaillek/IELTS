import { useApi } from '../api.js';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import Empty from '../components/Empty.jsx';
import {
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend,
} from 'recharts';
import { WRITING_DIMENSIONS, WRITING_ERROR_LABELS, labelCN } from '../labels.js';

const DIM = [
  { key: 'tr', label: `TR (${WRITING_DIMENSIONS.tr.cn})` },
  { key: 'cc', label: `CC (${WRITING_DIMENSIONS.cc.cn})` },
  { key: 'lr', label: `LR (${WRITING_DIMENSIONS.lr.cn})` },
  { key: 'ga', label: `GA (${WRITING_DIMENSIONS.ga.cn})` },
];

export default function Writing() {
  const { data, loading } = useApi('/writing');
  if (loading) return <div className="text-slate-400">加载中…</div>;
  const subs = data?.submissions || [];
  if (!data || data.count === 0 || subs.length === 0) {
    return (
      <>
        <PageHeader title="写作" subtitle="四维评分 + 错误标签" />
        <Empty>跑 “批改雅思作文” 批改一篇作文，数据就出来了。</Empty>
      </>
    );
  }

  const last = subs[subs.length - 1];
  const avg = (k) => +(subs.reduce((s, x) => s + (x.score?.[k] ?? 0), 0) / subs.length).toFixed(2);
  const radarData = DIM.map((d) => ({ dim: d.label, '最近一篇': last.score?.[d.key] ?? 0, '平均': avg(d.key) }));
  const trendData = subs.map((s) => ({ date: s.date, overall: s.score?.overall, tr: s.score?.tr, cc: s.score?.cc, lr: s.score?.lr, ga: s.score?.ga }));
  const errorData = (data.top_errors || [])
    .slice(0, 10)
    .map((e) => ({ ...e, label: labelCN(WRITING_ERROR_LABELS, e.tag) }));

  return (
    <>
      <PageHeader
        title="写作"
        subtitle={`${data.count} 篇批改记录`}
        hint="四维 = TR审题 / CC连贯 / LR词汇 / GA语法，各占 25%。AI 评分普遍偏高 0.5。"
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="最近总分" value={last.score.overall} sub={last.date} />
        <StatCard label="平均总分" value={avg('overall')} />
        <StatCard label="最高分" value={Math.max(...subs.map((s) => s.score.overall))} />
        <StatCard label="字数中位数" value={(() => {
          const ws = subs.map((s) => s.word_count || 0).filter(Boolean).sort((a, b) => a - b);
          return ws.length ? ws[Math.floor(ws.length / 2)] : '—';
        })()} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="card">
          <div className="text-sm font-medium mb-3">四维雷达（最近一篇 vs 平均）</div>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 9]} tick={{ fontSize: 10 }} />
              <Radar name="平均" dataKey="平均" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
              <Radar name="最近" dataKey="最近一篇" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="text-sm font-medium mb-3">分数趋势</div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[4, 9]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="tr" stroke="#0ea5e9" name={`TR (${WRITING_DIMENSIONS.tr.cn})`} />
              <Line type="monotone" dataKey="cc" stroke="#22c55e" name={`CC (${WRITING_DIMENSIONS.cc.cn})`} />
              <Line type="monotone" dataKey="lr" stroke="#f59e0b" name={`LR (${WRITING_DIMENSIONS.lr.cn})`} />
              <Line type="monotone" dataKey="ga" stroke="#ec4899" name={`GA (${WRITING_DIMENSIONS.ga.cn})`} />
              <Line type="monotone" dataKey="overall" stroke="#0f172a" strokeWidth={3} name="总分" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card mt-6">
        <div className="text-sm font-medium mb-3">高频错误 Top 10</div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={errorData} layout="vertical" margin={{ left: 40, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={220} />
            <Tooltip />
            <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card mt-6">
        <div className="text-sm font-medium mb-3">所有批改</div>
        <table className="w-full text-sm">
          <thead className="text-slate-400 text-xs uppercase">
            <tr>
              <th className="text-left p-2">日期</th>
              <th className="text-left p-2">Task</th>
              <th className="text-left p-2">话题</th>
              <th className="text-right p-2" title="Task Response 审题">TR</th>
              <th className="text-right p-2" title="Coherence & Cohesion 连贯衔接">CC</th>
              <th className="text-right p-2" title="Lexical Resource 词汇">LR</th>
              <th className="text-right p-2" title="Grammar & Accuracy 语法">GA</th>
              <th className="text-right p-2">总分</th>
              <th className="text-right p-2">字数</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {[...subs].reverse().map((s, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="p-2">{s.date}</td>
                <td className="p-2">T{s.task}</td>
                <td className="p-2 text-slate-600">{s.topic}</td>
                <td className="p-2 text-right">{s.score.tr}</td>
                <td className="p-2 text-right">{s.score.cc}</td>
                <td className="p-2 text-right">{s.score.lr}</td>
                <td className="p-2 text-right">{s.score.ga}</td>
                <td className="p-2 text-right font-semibold">{s.score.overall}</td>
                <td className="p-2 text-right text-slate-500">{s.word_count || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-xs text-slate-400 mt-2">
          提示：TR = 审题 · CC = 连贯衔接 · LR = 词汇 · GA = 语法（鼠标悬停表头看完整名称）
        </div>
      </div>
    </>
  );
}
