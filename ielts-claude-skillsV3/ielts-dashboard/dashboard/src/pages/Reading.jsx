import { useState } from 'react';
import { useApi } from '../api.js';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import Empty from '../components/Empty.jsx';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import { READING_QUESTION_TYPES, READING_ERROR_LABELS, labelCN } from '../labels.js';

const PIE_COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e', '#84cc16', '#6366f1', '#0891b2'];

export default function Reading() {
  const { data, loading } = useApi('/reading');
  const { data: synonyms } = useApi('/synonyms');
  const [q, setQ] = useState('');

  if (loading) return <div className="text-slate-400">加载中…</div>;
  const subs = data?.submissions || [];
  if (!data || data.count === 0 || subs.length === 0) {
    return (
      <>
        <PageHeader title="阅读" subtitle="正确率 + 题型分布 + 同义替换" />
        <Empty>跑 “分析雅思阅读” 分析一篇阅读，数据就出来了。</Empty>
      </>
    );
  }

  const trend = subs.map((s) => ({ date: s.date, accuracy: +((s.accuracy ?? 0) * 100).toFixed(1), band: s.band || null }));
  const recentAvg = subs.slice(-5).reduce((s, x) => s + (x.accuracy ?? 0), 0) / Math.min(5, subs.length);

  const typeDist = (data.question_type_distribution || []).map((d) => ({
    ...d,
    label: labelCN(READING_QUESTION_TYPES, d.type),
    acc_pct: +((d.accuracy ?? 0) * 100).toFixed(1),
  }));

  const topErrors = (data.top_errors || []).slice(0, 10).map((e) => ({
    ...e,
    label: labelCN(READING_ERROR_LABELS, e.tag),
  }));

  const filteredSyn = (synonyms?.items || []).filter((s) => {
    if (!q) return true;
    const k = q.toLowerCase();
    return s.original.toLowerCase().includes(k) || s.paraphrase.toLowerCase().includes(k);
  });

  return (
    <>
      <PageHeader
        title="阅读"
        subtitle={`${data.count} 次分析 · 累计同义替换 ${synonyms?.count || 0} 对`}
        hint="tfng = True/False/Not Given 判断题 · mcq = 多选题 · matching = 匹配题"
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="最近正确率" value={`${((subs.at(-1)?.accuracy ?? 0) * 100).toFixed(0)}%`} sub={subs.at(-1)?.source} />
        <StatCard label="近 5 次平均" value={`${(recentAvg * 100).toFixed(0)}%`} />
        <StatCard label="累计题数" value={subs.reduce((s, x) => s + (x.total ?? 0), 0)} />
        <StatCard label="累计同义替换" value={synonyms?.count || 0} sub="对" />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="card">
          <div className="text-sm font-medium mb-3">正确率趋势</div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip />
              <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="正确率" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="text-sm font-medium mb-3">题型分布</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={typeDist}
                dataKey="total"
                nameKey="label"
                outerRadius={90}
                label={(e) => `${e.label} ${e.total}`}
              >
                {typeDist.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
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
              <Bar dataKey="acc_pct" fill="#0ea5e9" name="正确率%" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="text-sm font-medium mb-3">高频错误 Top 10</div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topErrors} layout="vertical" margin={{ left: 40, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 10 }} width={220} />
              <Tooltip />
              <Bar dataKey="count" fill="#f43f5e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card mt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium">同义替换库（{filteredSyn.length} / {synonyms?.count || 0}）</div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索 original / paraphrase…"
            className="text-sm px-3 py-1 border border-slate-200 rounded-md w-64"
          />
        </div>
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400 text-xs uppercase sticky top-0 bg-white">
              <tr>
                <th className="text-left p-2">题目用词 (original)</th>
                <th className="text-left p-2">原文用词 (paraphrase)</th>
                <th className="text-left p-2">出处</th>
                <th className="text-left p-2">语境</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {filteredSyn.slice(0, 200).map((s, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="p-2">{s.original}</td>
                  <td className="p-2 text-emerald-700">{s.paraphrase}</td>
                  <td className="p-2 text-slate-500">{s.source}</td>
                  <td className="p-2 text-slate-500">{s.context || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSyn.length > 200 && <div className="text-xs text-slate-400 mt-2">前 200 条已显示，输入关键词缩小范围。</div>}
      </div>
    </>
  );
}
