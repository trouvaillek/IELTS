import { useApi } from '../api.js';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import Empty from '../components/Empty.jsx';
import { STORY_STATUS, SPEAKING_GROUP_NAMES, cnOnly } from '../labels.js';

const STATUS_COLOR = {
  drafted: 'bg-slate-100 text-slate-600',
  rehearsed: 'bg-amber-100 text-amber-700',
  recorded: 'bg-emerald-100 text-emerald-700',
};

export default function Speaking() {
  const { data, loading } = useApi('/speaking');
  if (loading) return <div className="text-slate-400">加载中…</div>;
  if (!data || data.count === 0) {
    return (
      <>
        <PageHeader title="口语" subtitle="话题覆盖率 + 万能故事" />
        <Empty>跑 “准备雅思口语素材” 生成第一个万能故事，数据就出来了。</Empty>
      </>
    );
  }

  const groups = data.groups;
  const stories = data.stories || [];
  const coverage = groups ? +((groups.coverage_rate ?? 0) * 100).toFixed(0) : null;

  // 构建故事 id → 主题的映射，用来把「关联故事 #2」换成「关联故事 #2 香港之旅」之类可读文字
  const storyIndex = new Map(stories.map((s) => [s.id, s.topic_primary]));

  return (
    <>
      <PageHeader
        title="口语"
        subtitle={`${stories.length} 个故事`}
        hint="核心策略：5-7 个万能故事覆盖所有话题。实际练口语去 Gemini Live / ChatGPT Voice。"
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="故事总数" value={stories.length} />
        <StatCard
          label="话题覆盖率"
          value={coverage != null ? `${coverage}%` : '—'}
          sub={groups && `${groups.covered_topics}/${groups.total_topics} 个话题`}
        />
        <StatCard label="已彩排" value={stories.filter((s) => s.status === 'rehearsed').length} />
        <StatCard label="已录音" value={stories.filter((s) => s.status === 'recorded').length} accent />
      </div>

      {groups && (
        <div className="card mt-6">
          <div className="text-sm font-medium mb-2">话题分组</div>
          <div className="text-xs text-slate-500 mb-4">
            每组展示该大类下所有雅思话题，以及你准备的哪几个故事能应对它们。
            <strong className="text-slate-600">「关联故事 #N」= 考官问这组任何话题，你都用第 N 号故事回答。</strong>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groups.groups.map((g, i) => (
              <div key={i} className="border border-slate-100 rounded-lg p-3">
                <div className="font-medium text-sm mb-1">
                  {cnOnly(SPEAKING_GROUP_NAMES, g.name)} <span className="text-slate-400 text-xs font-normal">({g.name})</span>
                </div>
                <div className="text-xs text-slate-500 mb-2">
                  关联故事（用这些故事可以答这一组）：{g.stories.length
                    ? g.stories.map((sid) => `#${sid}${storyIndex.get(sid) ? ` ${storyIndex.get(sid)}` : ''}`).join('、')
                    : '还没准备'}
                </div>
                <div className="flex flex-wrap gap-1">
                  {g.topics.map((t, j) => (
                    <span key={j} className="text-xs px-2 py-0.5 bg-slate-50 rounded" title={`雅思话题: ${t}`}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card mt-6">
        <div className="text-sm font-medium mb-2">故事卡片墙</div>
        <div className="text-xs text-slate-500 mb-4">
          每张卡是一个万能故事。状态：
          <span className="inline-block mx-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">初稿 drafted</span>
          <span className="inline-block mx-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">已彩排 rehearsed</span>
          <span className="inline-block mx-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">已录音 recorded</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {stories.map((s) => (
            <div key={s.id} className="border border-slate-100 rounded-lg p-3 hover:border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">#{s.id} {s.topic_primary}</div>
                <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLOR[s.status] || 'bg-slate-100'}`}>
                  {cnOnly(STORY_STATUS, s.status)}
                </span>
              </div>
              <div className="text-xs text-slate-500 mb-2">
                {[
                  s.length_sec ? `时长 ${s.length_sec}s` : null,
                  s.parts?.length ? `适用 Part ${s.parts.join(',')}` : null,
                ].filter(Boolean).join(' · ')}
              </div>
              <div className="text-xs text-slate-400 mb-1">可覆盖话题：</div>
              <div className="flex flex-wrap gap-1">
                {(s.topics_covered || []).map((t, i) => (
                  <span key={i} className="text-xs px-1.5 py-0.5 bg-slate-50 rounded">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
