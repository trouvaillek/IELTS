import { useApi } from '../api.js';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import Empty from '../components/Empty.jsx';
import {
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar,
} from 'recharts';
import { LISTENING_ERROR_LABELS, LISTENING_SECTION_TYPES, labelCN } from '../labels.js';

export default function Listening() {
  const { data, loading } = useApi('/listening');
  if (loading) return <div className="text-slate-400">加载中…</div>;
  const subs = data?.submissions || [];
  if (!data || data.count === 0 || subs.length === 0) {
    return (
      <>
        <PageHeader title="听力" subtitle="Section 分布 + 错误标签" />
        <Empty>跑 “分析雅思听力” 分析一套听力，数据就出来了。</Empty>
      </>
    );
  }

  const last = subs[subs.length - 1];
  const trend = subs.map((s) => ({ date: s.date, band: s.band, correct: s.correct }));
  const sectionAvg = data.section_avg || [];
  const sectionRadar = (sectionAvg.length ? sectionAvg : [0, 0, 0, 0]).map((v, i) => ({
    section: `S${i + 1}`,
    平均: v,
    最近: last.section_scores?.[i] ?? 0,
  }));

  const typeDist = (data.type_distribution || []).map((d) => ({
    ...d,
    label: labelCN(LISTENING_SECTION_TYPES, d.type),
    acc_pct: +(d.accuracy * 100).toFixed(1),
  }));

  const topErrors = (data.top_errors || []).slice(0, 10).map((e) => ({
    ...e,
    label: labelCN(LISTENING_ERROR_LABELS, e.tag),
  }));

  return (
    <>
      <PageHeader
        title="听力"
        subtitle={`${data.count} 套精分析`}
        hint="Band 按官方算分表换算。S1-S4 对应听力 4 个 section（S1/S2 日常，S3/S4 学术）"
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="最近 Band" value={last.band} sub={last.source} />
        <StatCard label="平均 Band" value={(subs.reduce((s, x) => s + x.band, 0) / subs.length).toFixed(2)} />
        <StatCard label="最近对题" value={`${last.correct}/40`} />
        <StatCard label="最弱 Section" value={(() => {
          if (!sectionAvg.length) return '—';
          const min = Math.min(...sectionAvg);
          return `S${sectionAvg.indexOf(min) + 1}`;
        })()} sub={sectionAvg.length ? `${Math.min(...sectionAvg).toFixed(1)}/10` : ''} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="card">
          <div className="text-sm font-medium mb-3">Section 雷达（最近 vs 平均）</div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={sectionRadar}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="section" />
              <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
              <Radar name="平均" dataKey="平均" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
              <Radar name="最近" dataKey="最近" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="text-sm font-medium mb-3">Band 趋势</div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[4, 9]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="band" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="card">
          <div className="text-sm font-medium mb-3">题型正确率</div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={typeDist} margin={{ left: 10, right: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} height={70} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="acc_pct" fill="#22c55e" name="正确率%" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="text-sm font-medium mb-3">高频错误标签</div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topErrors} layout="vertical" margin={{ left: 40, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 10 }} width={200} />
              <Tooltip />
              <Bar dataKey="count" fill="#f43f5e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card mt-6">
        <div className="text-sm font-medium mb-3">所有套数</div>
        <table className="w-full text-sm">
          <thead className="text-slate-400 text-xs uppercase">
            <tr>
              <th className="text-left p-2">日期</th>
              <th className="text-left p-2">Source</th>
              <th className="text-right p-2">对题</th>
              <th className="text-right p-2">Band</th>
              <th className="text-right p-2" title="Section 1 社交场景">S1</th>
              <th className="text-right p-2" title="Section 2 独白介绍">S2</th>
              <th className="text-right p-2" title="Section 3 学术讨论">S3</th>
              <th className="text-right p-2" title="Section 4 学术讲座">S4</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {[...subs].reverse().map((s, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="p-2">{s.date}</td>
                <td className="p-2 text-slate-600">{s.source}</td>
                <td className="p-2 text-right">{s.correct}/40</td>
                <td className="p-2 text-right font-semibold">{s.band}</td>
                {[0, 1, 2, 3].map((j) => (
                  <td key={j} className="p-2 text-right">{s.section_scores?.[j] ?? '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-xs text-slate-400 mt-2">
          S1 日常对话 · S2 独白介绍 · S3 学术讨论 · S4 学术讲座
        </div>
      </div>
    </>
  );
}
