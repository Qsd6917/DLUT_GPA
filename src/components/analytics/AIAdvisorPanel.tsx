import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Brain,
  Clock,
  Lightbulb,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Course, GpaStats } from '../../types';
import { getAIRecommendations } from '../../services/aiAdvisorService';
import {
  AIDashboardData,
  LearningStrategy,
  Recommendation,
  StudentProfile,
} from '../../types/aiAdvisor';

interface AIAdvisorPanelProps {
  courses: Course[];
  gpaStats: GpaStats;
  targetGPA: number;
}

const AIAdvisorPanel: React.FC<AIAdvisorPanelProps> = ({ courses, gpaStats, targetGPA }) => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'strategies' | 'analysis'>(
    'recommendations'
  );

  const studentProfile = useMemo<StudentProfile>(
    () => ({
      id: 'current-student',
      courses,
      gpaStats,
      strengths: [],
      weaknesses: [],
      preferredSchedule: 'flexible',
      studyHoursPerWeek: 20,
      targetGPA,
      careerGoals: ['Software Engineering', 'Data Science'],
    }),
    [courses, gpaStats, targetGPA]
  );

  const recommendationData = useMemo(() => getAIRecommendations(studentProfile), [studentProfile]);

  return (
    <div className="bg-surface rounded-2xl shadow-soft border border-primary/10 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/5 to-sky-500/5 p-6 border-b border-primary/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-main">智能学业建议</h2>
            <p className="text-sm text-muted">基于当前课程表现的本地规则分析，不会上传个人数据</p>
          </div>
        </div>
      </div>

      <div className="p-1 bg-primary/5">
        <div className="flex border-b border-primary/10">
          <TabButton
            active={activeTab === 'recommendations'}
            icon={<Target size={16} />}
            label="课程推荐"
            onClick={() => setActiveTab('recommendations')}
          />
          <TabButton
            active={activeTab === 'strategies'}
            icon={<BookOpen size={16} />}
            label="学习策略"
            onClick={() => setActiveTab('strategies')}
          />
          <TabButton
            active={activeTab === 'analysis'}
            icon={<BarChart3 size={16} />}
            label="技能分析"
            onClick={() => setActiveTab('analysis')}
          />
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'recommendations' && (
          <RecommendationsTab recommendations={recommendationData.recommendations} />
        )}

        {activeTab === 'strategies' && (
          <LearningStrategiesTab
            strategies={recommendationData.learningStrategies}
            recommendations={recommendationData.recommendations}
          />
        )}

        {activeTab === 'analysis' && (
          <AnalysisTab
            academicRisks={recommendationData.academicRisks}
            skillGapAnalysis={recommendationData.skillGapAnalysis}
            targetGPA={targetGPA}
            currentGPA={gpaStats.weightedGpa}
          />
        )}
      </div>
    </div>
  );
};

const TabButton: React.FC<{
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ active, icon, label, onClick }) => (
  <button
    type="button"
    className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
      active ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted hover:text-main'
    }`}
    onClick={onClick}
  >
    <div className="flex items-center justify-center gap-2">
      {icon}
      {label}
    </div>
  </button>
);

const RecommendationsTab: React.FC<{ recommendations: Recommendation[] }> = ({ recommendations }) => {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        <Target className="mx-auto h-12 w-12 text-muted/50" />
        <p className="mt-2">暂无推荐课程</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-main mb-4">推荐课程</h3>
      <div className="grid gap-4">
        {recommendations.map((recommendation, index) => (
          <div
            key={recommendation.courseId}
            className={`p-4 rounded-xl border ${
              index === 0
                ? 'border-primary/30 bg-primary/5 ring-1 ring-primary/20'
                : 'border-primary/10 bg-background/50'
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h4 className="font-bold text-main flex items-center gap-2">
                  {recommendation.courseName}
                  {index === 0 && (
                    <span className="text-xs bg-yellow-500/10 text-yellow-700 px-2 py-1 rounded-full">
                      最佳匹配
                    </span>
                  )}
                </h4>
                <p className="text-sm text-muted mt-1">{recommendation.reason}</p>
              </div>
              <div className="text-right">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    recommendation.successProbability > 0.8
                      ? 'bg-emerald-500/10 text-emerald-700'
                      : recommendation.successProbability > 0.6
                        ? 'bg-amber-500/10 text-amber-700'
                        : 'bg-red-500/10 text-red-700'
                  }`}
                >
                  成功率 {(recommendation.successProbability * 100).toFixed(0)}%
                </span>
                <div className="text-xs text-muted mt-1">
                  预计成绩 <span className="font-bold text-main">{recommendation.predictedGrade.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-primary/10 flex justify-between text-sm">
              <div>
                <span className="text-muted">置信度</span>{' '}
                <span className="font-medium text-main">{(recommendation.confidence * 100).toFixed(0)}%</span>
              </div>
              <div>
                <Clock size={14} className="inline mr-1" />
                <span className="text-muted">建议投入</span>{' '}
                <span className="font-medium text-main">{recommendation.suggestedStudyTime} 小时/周</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LearningStrategiesTab: React.FC<{
  strategies: LearningStrategy[];
  recommendations: Recommendation[];
}> = ({ strategies, recommendations }) => {
  if (strategies.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        <BookOpen className="mx-auto h-12 w-12 text-muted/50" />
        <p className="mt-2">暂无学习策略</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h3 className="font-bold text-lg text-main mb-4">学习策略</h3>
      {strategies.map((strategy) => {
        const recommendation = recommendations.find((item) => item.courseId === strategy.courseId);
        const courseName = recommendation?.courseName ?? strategy.courseId;

        return (
          <div key={strategy.courseId} className="p-5 bg-background/50 rounded-xl border border-primary/10">
            <h4 className="font-bold text-main flex items-center gap-2 mb-3">
              <Lightbulb size={18} className="text-primary" />
              {courseName}
            </h4>

            <div className="mb-4">
              <h5 className="font-semibold text-sm text-main mb-2">学习策略</h5>
              <ul className="space-y-2">
                {strategy.strategies.map((item, index) => (
                  <li key={`${strategy.courseId}-strategy-${index}`} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span className="text-sm text-main">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h5 className="font-semibold text-sm text-main mb-2">推荐资源</h5>
              <ul className="space-y-2">
                {strategy.resources.map((resource, index) => (
                  <li key={`${strategy.courseId}-resource-${index}`} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span className="text-sm text-main">{resource}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-primary/10">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  strategy.difficultyAssessment === 'high'
                    ? 'bg-red-500/10 text-red-700'
                    : strategy.difficultyAssessment === 'medium'
                      ? 'bg-amber-500/10 text-amber-700'
                      : 'bg-emerald-500/10 text-emerald-700'
                }`}
              >
                {strategy.difficultyAssessment === 'high'
                  ? '高难度'
                  : strategy.difficultyAssessment === 'medium'
                    ? '中等难度'
                    : '低难度'}
              </span>
              <span className="text-sm text-muted">{strategy.timeline}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AnalysisTab: React.FC<{
  academicRisks: string[];
  skillGapAnalysis: AIDashboardData['skillGapAnalysis'];
  targetGPA: number;
  currentGPA: number;
}> = ({ academicRisks, skillGapAnalysis, targetGPA, currentGPA }) => {
  const sortedSkills = [...skillGapAnalysis].sort((a, b) => b.improvementPriority - a.improvementPriority);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-lg text-main mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          GPA 进度分析
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <ProgressCard label="当前 GPA" value={currentGPA} barWidth={(currentGPA / 4.0) * 100} />
          <ProgressCard label="目标 GPA" value={targetGPA} barWidth={(targetGPA / 4.0) * 100} accent />
        </div>

        {targetGPA > currentGPA && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">
                要达到目标 GPA，后续课程平均分需要约{' '}
                <strong>{Math.min(100, Math.max(60, 60 + (targetGPA - currentGPA) * 10)).toFixed(0)} 分</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="font-bold text-lg text-main mb-4 flex items-center gap-2">
          <AlertTriangle size={20} className="text-primary" />
          学术风险
        </h3>

        {academicRisks.length > 0 ? (
          <div className="space-y-3">
            {academicRisks.map((risk, index) => (
              <div
                key={`risk-${index}`}
                className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex items-start"
              >
                <AlertTriangle size={16} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-sm text-main">{risk}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-center text-emerald-700">
            当前没有明显学术风险
          </div>
        )}
      </div>

      <div>
        <h3 className="font-bold text-lg text-main mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-primary" />
          技能差距分析
        </h3>

        {sortedSkills.length > 0 ? (
          <div className="space-y-3">
            {sortedSkills.map((skill) => (
              <div key={skill.skill} className="p-3 bg-background/50 border border-primary/10 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-main">{skill.skill}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      skill.improvementPriority >= 4
                        ? 'bg-red-500/10 text-red-700'
                        : skill.improvementPriority >= 3
                          ? 'bg-amber-500/10 text-amber-700'
                          : 'bg-emerald-500/10 text-emerald-700'
                    }`}
                  >
                    {skill.improvementPriority >= 4
                      ? '高优先级'
                      : skill.improvementPriority >= 3
                        ? '中优先级'
                        : '低优先级'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="w-full bg-primary/10 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${skill.proficiency * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-sm text-muted w-10 text-right">{(skill.proficiency * 100).toFixed(0)}%</span>
                </div>

                <div className="mt-2 text-xs text-muted">改进优先级 {skill.improvementPriority}/5</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted">暂无技能分析数据</div>
        )}
      </div>
    </div>
  );
};

const ProgressCard: React.FC<{
  label: string;
  value: number;
  barWidth: number;
  accent?: boolean;
}> = ({ label, value, barWidth, accent = false }) => (
  <div className="bg-background/50 p-4 rounded-xl border border-primary/10">
    <div className="text-sm text-muted mb-1">{label}</div>
    <div className={`text-2xl font-bold ${accent ? 'text-primary' : 'text-main'}`}>{value.toFixed(2)}</div>
    <div className="w-full bg-primary/10 rounded-full h-2 mt-2">
      <div
        className={`${accent ? 'bg-sky-500' : 'bg-primary'} h-2 rounded-full`}
        style={{ width: `${Math.min(100, barWidth)}%` }}
      />
    </div>
  </div>
);

export default AIAdvisorPanel;
