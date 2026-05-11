import { useApi } from '../api.js';
import PageHeader from '../components/PageHeader.jsx';
import Empty from '../components/Empty.jsx';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { SCORE_TYPES, cnOnly } from '../labels.js';

const COLORS = { l: '#0ea5e9', r: '#22c55e', w: '#f59e0b', s: '#ec4899', overall: '#0f172a' };
const NAMES = { l: '听力', r: '阅读', w: '写作', s: '口语', overall: '总分' };

export default function Trends() {
  const { data: scores, loading } = useApi('/scores');
  const { data: profile } = useApi('/profile');

  if (loading) return <div className="text-slate-400">加载中…</div>;
  const records = scores?.records || [];

  if (records.length === 0) {
    return (
      <>
        <PageHeader title="分数趋势" subtitle="四科分数随时间变化" />
        <Empty>跑 “分析雅思成绩” 录入模考成绩，趋势就有了。</Empty>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="分数趋势"
        subtitle={`${records.length} 次记录`}
        hint="目标分用虚线标注。.25/.75 向上取整，所以总分可能比四科平均略高。"
      />

      <div className="card">
        <div className="text-sm font-medium mb-3">四科 + 总分</div>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={records} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={[4, 9]} ticks={[4, 5, 6, 7, 8, 9]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            {profile?.goal_band && (
              <ReferenceLine y={profile.goal_band} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: `目标 ${profile.goal_band}`, fontSize: 11, fill: '#64748b' }} />
            )}
            {['l', 'r', 'w', 's'].map((k) => (
              <Line key={k} type="monotone" dataKey={k} name={NAMES[k]} stroke={COLORS[k]} strokeWidth={2} dot={{ r: 3 }} />
            ))}
            <Line type="monotone" dataKey="overall" name="总分" stroke={COLORS.overall} strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card mt-6">
        <div className="text-sm font-medium mb-3">所有记录</div>
        <table className="w-full text-sm">
          <thead className="text-slate-400 text-xs uppercase">
            <tr>
              <th className="text-left p-2">日期</th>
              <th className="text-left p-2">类型</th>
              <th className="text-right p-2">听</th>
              <th className="text-right p-2">读</th>
              <th className="text-right p-2">写</th>
              <th className="text-right p-2">说</th>
              <th className="text-right p-2">总</th>
              <th className="text-left p-2">来源</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {records.map((r, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="p-2">{r.date}</td>
                <td className="p-2">{cnOnly(SCORE_TYPES, r.type)} <span className="text-slate-400 text-xs">({r.type})</span></td>
                <td className="p-2 text-right">{r.l ?? '—'}</td>
                <td className="p-2 text-right">{r.r ?? '—'}</td>
                <td className="p-2 text-right">{r.w ?? '—'}</td>
                <td className="p-2 text-right">{r.s ?? '—'}</td>
                <td className="p-2 text-right font-semibold">{r.overall ?? '—'}</td>
                <td className="p-2 text-slate-500">{r.source || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
