import { useApi } from '../api.js';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import Empty from '../components/Empty.jsx';

function daysUntil(date) {
  if (!date) return null;
  const target = new Date(date);
  const now = new Date();
  return Math.ceil((target - now) / 86400000);
}

function latestScore(scores) {
  if (!scores?.records?.length) return null;
  return scores.records[scores.records.length - 1];
}

function suggestNext(snap) {
  const s = snap;
  if (!s?.profile) return '先跑 “分析雅思成绩” 摸底。';
  const goal = s.profile.goal_band;
  const c = s.profile.current || {};
  const gaps = [
    { sk: '写作', g: goal - 0.5 - (c.w || 0) },
    { sk: '阅读', g: goal - (c.r || 0) },
    { sk: '听力', g: goal - (c.l || 0) },
    { sk: '口语', g: goal - 0.5 - (c.s || 0) },
  ].sort((a, b) => b.g - a.g);
  return `最大缺口：${gaps[0].sk}（差 ${gaps[0].g.toFixed(1)} 分）。建议今天主攻这科。`;
}

export default function Home() {
  const { data: snap, loading, error } = useApi('/snapshot');

  if (loading) return <div className="text-slate-400">加载中…</div>;
  if (error) return (
    <div className="text-red-500">
      <div>加载失败：{error.message}</div>
      <div className="text-sm text-slate-500 mt-2">确认后端在 http://127.0.0.1:4000 运行（终端有没有 [server] listening 字样）。</div>
    </div>
  );
  if (!snap) return null;

  const profile = snap.profile;
  const latest = latestScore(snap.scores);
  const days = daysUntil(profile?.exam_date);
  const issues = snap.issues || [];

  return (
    <>
      <PageHeader
        title="备考概览"
        subtitle={profile ? `目标 ${profile.goal_band} · 重点 ${profile.focus?.join('、') || '未设置'}` : '还没有 profile，先跑 “分析雅思成绩”'}
      />

      {!profile ? (
        <Empty>
          <div>没有 <code>~/.ielts/profile.md</code>。</div>
          <div className="mt-2">先跑 <code>“分析雅思成绩”</code> 给系统第一份数据，或 <code>npm run seed</code> 灌一份假数据。</div>
        </Empty>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              label="目标"
              value={profile.goal_band}
              sub={profile.exam_date && `考试 ${profile.exam_date}`}
            />
            <StatCard
              label="距离考试"
              value={days != null ? `${days} 天` : '—'}
              sub={days != null && days < 30 && '冲刺期'}
              accent={days != null && days < 30}
            />
            <StatCard
              label="最近模考总分"
              value={latest?.overall ?? '—'}
              sub={latest?.date}
            />
            <StatCard
              label="距离目标"
              value={latest?.overall ? `+${(profile.goal_band - latest.overall).toFixed(1)}` : '—'}
            />
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4">
            <StatCard label="听力" value={latest?.l ?? profile.current?.l ?? '—'} />
            <StatCard label="阅读" value={latest?.r ?? profile.current?.r ?? '—'} />
            <StatCard label="写作" value={latest?.w ?? profile.current?.w ?? '—'} />
            <StatCard label="口语" value={latest?.s ?? profile.current?.s ?? '—'} />
          </div>

          <div className="card mt-6">
            <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">今日建议</div>
            <div className="text-base">{suggestNext(snap)}</div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6">
            <StatCard label="写作记录" value={snap.writing?.count ?? 0} sub="篇批改" />
            <StatCard label="阅读记录" value={snap.reading?.count ?? 0} sub="次分析" />
            <StatCard label="听力记录" value={snap.listening?.count ?? 0} sub="套精分析" />
            <StatCard label="背词进度" value={`Day ${snap.vocab?.summary?.current_day ?? 0}`} sub={`掌握 ${snap.vocab?.summary?.total_mastered ?? 0}`} />
          </div>

          {issues.length > 0 && (
            <div className="card mt-6 border-amber-300 bg-amber-50">
              <div className="text-xs uppercase tracking-wider text-amber-700 mb-2">数据校验问题（{issues.length}）</div>
              <ul className="text-sm space-y-1 max-h-48 overflow-auto">
                {issues.slice(0, 20).map((it, i) => (
                  <li key={i} className="flex gap-2">
                    <code className="text-amber-700 shrink-0">{it.file}</code>
                    <span className="text-slate-600">{it.error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </>
  );
}
