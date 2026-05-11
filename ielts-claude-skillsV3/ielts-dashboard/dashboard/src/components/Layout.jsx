import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const NAV = [
  { to: '/',          label: '首页',    icon: '🏠' },
  { to: '/trends',    label: '趋势',    icon: '📈' },
  { to: '/writing',   label: '写作',    icon: '✍️' },
  { to: '/reading',   label: '阅读',    icon: '📖' },
  { to: '/listening', label: '听力',    icon: '🎧' },
  { to: '/vocab',     label: '词汇',    icon: '🔤' },
  { to: '/speaking',  label: '口语',    icon: '🗣️' },
  { to: '/timeline',  label: '时间线',  icon: '🗓️' },
];

export default function Layout({ children }) {
  return (
    <div className="min-h-full grid grid-cols-[220px_1fr]">
      <aside className="border-r border-slate-200 bg-white p-5">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider text-slate-400">IELTS</div>
          <div className="text-lg font-semibold">Dashboard <span className="text-slate-400 text-sm font-normal">v3</span></div>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                )
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 text-xs text-slate-400 leading-relaxed">
          数据源：<code className="text-slate-500">~/.ielts/</code>
          <br />
          只读视图。修改数据走 skill 对话。
        </div>
      </aside>
      <main className="p-8 max-w-[1400px]">{children}</main>
    </div>
  );
}
