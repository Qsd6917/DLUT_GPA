import React, { useState, useEffect } from 'react';
import { Course, CourseType } from '../../types';
import { X, Save, BookOpen, Calendar, GraduationCap, Award, Hash, CheckCircle2 } from 'lucide-react';

interface EditCourseModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, name: string, credits: number, score: number, semester: string, type: CourseType, isCore: boolean) => void;
  existingSemesters: string[];
}

export const EditCourseModal: React.FC<EditCourseModalProps> = ({
  course,
  isOpen,
  onClose,
  onSave,
  existingSemesters,
}) => {
  const [name, setName] = useState(course.name);
  const [credits, setCredits] = useState(course.credits.toString());
  const [score, setScore] = useState(course.score.toString());
  const [semester, setSemester] = useState(course.semester);
  const [type, setType] = useState<CourseType>(course.type);
  const [isCore, setIsCore] = useState(course.isCore || false);

  useEffect(() => {
    setName(course.name);
    setCredits(course.credits.toString());
    setScore(course.score.toString());
    setSemester(course.semester);
    setType(course.type);
    setIsCore(course.isCore || false);
  }, [course]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      course.id,
      name,
      parseFloat(credits),
      parseFloat(score),
      semester,
      type,
      isCore
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-primary/10 bg-background/50">
          <h3 className="text-lg font-bold text-main">编辑课程</h3>
          <button onClick={onClose} className="p-2 hover:bg-muted/10 rounded-full transition-colors">
            <X size={20} className="text-muted" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="edit-course-name" className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">课程名称</label>
              <div className="relative">
                 <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                 <input 
                    id="edit-course-name"
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-primary/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-main"
                 />
              </div>
            </div>

            {/* Semester & Credits */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-course-semester" className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">学期</label>
                  <div className="relative">
                     <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                     <input 
                        id="edit-course-semester"
                        type="text" 
                        list="edit-semesters"
                        value={semester} 
                        onChange={e => setSemester(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-primary/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-main"
                     />
                     <datalist id="edit-semesters">
                        {existingSemesters.map(s => <option key={s} value={s} />)}
                     </datalist>
                  </div>
                </div>
                <div>
                  <label htmlFor="edit-course-credits" className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">学分</label>
                  <div className="relative">
                     <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                     <input 
                        id="edit-course-credits"
                        type="number" 
                        step="0.5"
                        value={credits} 
                        onChange={e => setCredits(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-primary/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-main"
                     />
                  </div>
                </div>
            </div>

            {/* Score & Type */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-course-score" className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">成绩</label>
                  <div className="relative">
                     <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                     <input 
                        id="edit-course-score"
                        type="number" 
                        value={score} 
                        onChange={e => setScore(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-primary/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-main"
                     />
                  </div>
                </div>
                <div>
                  <label htmlFor="edit-course-type" className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">属性</label>
                  <div className="relative">
                     <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                     <select 
                        id="edit-course-type"
                        value={type} 
                        onChange={e => setType(e.target.value as CourseType)} 
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-primary/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer text-main"
                     >
                        <option value="必修">必修</option>
                        <option value="选修">选修</option>
                        <option value="任选">任选</option>
                     </select>
                  </div>
                </div>
            </div>
            
            {/* Core Toggle */}
            <div className="pt-2">
                <button
                    type="button"
                    onClick={() => setIsCore(!isCore)}
                    className={`w-full py-3 rounded-xl border transition-all flex items-center justify-center gap-2 font-bold text-sm ${
                      isCore 
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-700 shadow-sm' 
                        : 'bg-background border-primary/20 text-muted hover:bg-background/80'
                    }`}
                >
                    <CheckCircle2 size={18} className={isCore ? 'fill-yellow-500 text-white' : ''} />
                    <span>{isCore ? '核心/主干课程' : '设为核心/主干课程'}</span>
                </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-primary/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-muted/10 hover:bg-muted/20 text-main font-bold rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              保存更改
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
