import React from 'react';
import { Course } from '../../types';
import { Trash2, Edit, CheckSquare, Square, BookOpen } from 'lucide-react';
import VirtualCourseList from './VirtualCourseList';

interface CourseListProps {
  courses: Course[];
  onRemove: (id: string) => void;
  onEdit: (course: Course) => void;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
}

export const CourseList: React.FC<CourseListProps> = ({
  courses,
  onRemove,
  onEdit,
  onToggle,
  onToggleAll,
}) => {
  const allSelected = courses.length > 0 && courses.every(c => c.isActive);
  const someSelected = courses.some(c => c.isActive);

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted bg-surface border border-dashed border-primary/20 rounded-2xl">
        <BookOpen size={48} className="mb-4 text-muted/30" />
        <p className="text-lg font-medium text-main">暂无课程数据</p>
        <p className="text-sm text-muted">请添加课程或导入数据开始计算</p>
      </div>
    );
  }

  // 当课程数量超过阈值时使用虚拟滚动
  const useVirtualScroll = courses.length > 50;

  if (useVirtualScroll) {
    return (
      <VirtualCourseList
        courses={courses}
        onRemove={onRemove}
        onEdit={onEdit}
        onToggle={onToggle}
      />
    );
  }

  return (
    <div className="bg-surface rounded-2xl shadow-soft border border-primary/10 overflow-hidden transition-all hover:shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background/50 border-b border-primary/10 text-xs font-bold text-muted uppercase tracking-wider">
              <th className="p-4 w-12 text-center">
                <button
                  onClick={() => onToggleAll(!allSelected)}
                  className="p-1 rounded hover:bg-primary/10 transition-colors"
                  title={allSelected ? "取消全选" : "全选"}
                >
                  {allSelected ? (
                    <CheckSquare size={18} className="text-primary" />
                  ) : (
                    <Square size={18} className="text-muted/50" />
                  )}
                </button>
              </th>
              <th className="p-4 pl-0 text-muted">课程名称</th>
              <th className="p-4 w-20 text-center text-muted">学分</th>
              <th className="p-4 w-20 text-center text-muted">成绩</th>
              <th className="p-4 w-20 text-center text-muted">绩点</th>
              <th className="p-4 w-24 text-center text-muted">属性</th>
              <th className="p-4 w-24 text-center text-muted">学期</th>
              <th className="p-4 w-24 text-center text-muted">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {courses.map((course) => (
              <tr
                key={course.id}
                className={`group transition-colors hover:bg-primary/5 ${!course.isActive ? 'opacity-50 grayscale-[0.5] bg-background/50' : ''}`}
              >
                <td className="p-4 text-center">
                  <button
                    onClick={() => onToggle(course.id)}
                    className="p-1 rounded hover:bg-primary/10 transition-colors"
                  >
                    {course.isActive ? (
                      <CheckSquare size={18} className="text-primary" />
                    ) : (
                      <Square size={18} className="text-muted/50" />
                    )}
                  </button>
                </td>
                <td className="p-4 pl-0 font-medium text-main">
                    <div className="flex items-center gap-2">
                        {course.isCore && (
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" title="核心课程"></div>
                        )}
                        {course.name}
                    </div>
                </td>
                <td className="p-4 text-center text-main font-mono text-sm">{course.credits}</td>
                <td className="p-4 text-center font-bold font-mono text-sm">
                    <span className={`${course.score >= 90 ? 'text-emerald-600 dark:text-emerald-400' : course.score < 60 ? 'text-red-500 dark:text-red-400' : 'text-main'}`}>
                        {course.score}
                    </span>
                </td>
                <td className="p-4 text-center font-mono text-sm font-bold text-primary">
                  {course.gpa.toFixed(2)}
                </td>
                <td className="p-4 text-center">
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    course.type === '必修'
                      ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
                      : course.type === '选修'
                        ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                        : 'bg-background text-muted border-primary/10'
                  }`}>
                    {course.type}
                  </span>
                </td>
                <td className="p-4 text-center text-xs text-main font-medium bg-background/50 rounded-lg mx-2 my-1 inline-block min-w-[60px]">
                    {course.semester}
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(course)}
                      className="p-1.5 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onRemove(course.id)}
                      className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/30 dark:hover:text-red-300"
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="bg-background/50 px-6 py-3 border-t border-primary/10 flex items-center justify-between text-xs font-medium text-muted">
          <div>
            共 {courses.length} 门课程
            {someSelected && <span className="ml-1 text-primary">(已选 {courses.filter(c => c.isActive).length})</span>}
          </div>
          <div className="flex gap-4">
              <span>总学分: {courses.filter(c => c.isActive).reduce((a, b) => a + b.credits, 0).toFixed(1)}</span>
          </div>
      </div>
    </div>
  );
};
