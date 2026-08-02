import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { SemesterTrend } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';

export function SemesterTrendChart({ trends }: { trends: SemesterTrend[] }) {
  const { language } = useTranslation();
  const TrendTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: SemesterTrend }> }) => {
    if (!active || !payload?.length) return null;
    const trend = payload[0].payload;
    return <div className="rounded-xl border border-primary/10 bg-surface p-3 text-sm shadow-lg"><strong>{trend.semester}</strong><div>GPA: {trend.gpa.toFixed(3)}</div><div>{language === 'zh' ? '平均分' : 'Average score'}: {trend.averageScore.toFixed(2)}</div><div>{language === 'zh' ? '学分' : 'Credits'}: {trend.credits.toFixed(1)}</div><div>{language === 'zh' ? '课程数' : 'Courses'}: {trend.courseCount}</div></div>;
  };
  return (
    <section className="paper-panel p-5 sm:p-6" aria-labelledby="semester-trend-title">
      <div className="mb-4 flex items-center justify-between"><div><div className="section-kicker">{language === 'zh' ? '时间序列' : 'Timeline'}</div><h3 id="semester-trend-title" className="type-section-title mt-2 text-main">{language === 'zh' ? '学期趋势' : 'Semester trend'}</h3></div><TrendingUp className="text-primary" size={18} /></div>
      {trends.length ? <>
        <div className="h-72" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><LineChart data={trends}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="semester" /><YAxis /><Tooltip content={<TrendTooltip />} /><Line type="monotone" dataKey="gpa" stroke="#005BAC" strokeWidth={3} /><Line type="monotone" dataKey="averageScore" stroke="#10B981" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
        <div className="overflow-x-auto"><table className="w-full text-sm" aria-label={language === 'zh' ? '学期趋势数据' : 'Semester trend data'}><thead><tr className="text-left text-muted"><th>{language === 'zh' ? '学期' : 'Semester'}</th><th>GPA</th><th>{language === 'zh' ? '平均分' : 'Average'}</th><th>{language === 'zh' ? '学分' : 'Credits'}</th><th>{language === 'zh' ? '课程数' : 'Courses'}</th></tr></thead><tbody>{trends.map(trend => <tr key={trend.semester} className="border-t border-primary/10"><td>{trend.semester}</td><td>{trend.gpa.toFixed(3)}</td><td>{trend.averageScore.toFixed(2)}</td><td>{trend.credits.toFixed(1)}</td><td>{trend.courseCount}</td></tr>)}</tbody></table></div>
      </> : <p className="type-body-sm py-12 text-center">{language === 'zh' ? '暂无有效学期数据' : 'No valid semester data'}</p>}
    </section>
  );
}
