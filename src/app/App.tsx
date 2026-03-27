import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Book,
  CalendarRange,
  GraduationCap,
  Percent,
  Plus,
} from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { useCourseData } from '../hooks/useCourseData';
import { useCourseFilter } from '../hooks/useCourseFilter';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { SandboxBanner } from '../components/layout/SandboxBanner';
import { CourseFilterBar } from '../components/course/CourseFilterBar';
import { AddCourseForm } from '../components/course/AddCourseForm';
import { CourseList } from '../components/course/CourseList';
import { EditCourseModal } from '../components/course/EditCourseModal';
import { StatsCard } from '../components/analytics/StatsCard';
import { TargetGpaCalculator } from '../components/analytics/TargetGpaCalculator';
import { GraduationProgress } from '../components/analytics/GraduationProgress';
import { DashboardModeToggleBar } from '../components/analytics/DashboardModeToggleBar';
import { ReloadPrompt } from '../components/common/ReloadPrompt';
import { Course } from '../types';
import useDebounce from '../hooks/useDebounce';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const DataManagementModal = lazy(() =>
  import('../components/data/DataManagementModal').then(module => ({
    default: module.DataManagementModal,
  }))
);
const ShareableReportModal = lazy(() =>
  import('../components/data/ShareableReportModal').then(module => ({
    default: module.ShareableReportModal,
  }))
);
const GpaSimulationMode = lazy(() =>
  import('../components/analytics/GpaSimulationMode').then(module => ({
    default: module.GpaSimulationMode,
  }))
);
const AcademicRadar = lazy(() =>
  import('../components/analytics/AcademicRadar').then(module => ({
    default: module.AcademicRadar,
  }))
);
const AIAdvisorPanel = lazy(
  () => import('../components/analytics/AIAdvisorPanel')
);
const ScoreDistributionChart = lazy(() =>
  import('../components/analytics/ScoreDistributionChart').then(module => ({
    default: module.ScoreDistributionChart,
  }))
);
const ScoreDistributionHistogram = lazy(() =>
  import('../components/analytics/ScoreDistributionHistogram').then(module => ({
    default: module.ScoreDistributionHistogram,
  }))
);

type Section = 'overview' | 'courses' | 'analysis';
type AnalysisView = 'overview' | 'simulation' | 'radar' | 'advisor';

function App() {
  const { t, language } = useTranslation();
  const {
    courses,
    hydrated,
    method,
    setMethod,
    isSandboxMode,
    originalCourses,
    addCourse,
    removeCourse,
    toggleCourse,
    saveCourse,
    importData,
    resetData,
    enterSandbox,
    exitSandbox,
    setAllActive,
  } = useCourseData();

  const {
    searchTerm: rawSearchTerm,
    setSearchTerm,
    selectedSemesters,
    setSelectedSemesters,
    filterType,
    setFilterType,
    filterCore,
    setFilterCore,
    semesters,
    semesterOptions,
    filteredCourses,
    activeCourses,
    stats,
    originalStats,
    clearFilters,
    hasActiveFilters,
  } = useCourseFilter(courses, originalCourses, isSandboxMode);

  const [localSearchTerm, setLocalSearchTerm] = useState(rawSearchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [activeAnalysisView, setActiveAnalysisView] =
    useState<AnalysisView>('overview');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCourseEntryOpen, setIsCourseEntryOpen] = useState(false);
  const [simulatedStats, setSimulatedStats] = useState(stats);
  useBodyScrollLock(isCourseEntryOpen);

  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchTerm]);

  useEffect(() => {
    if (!isCourseEntryOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCourseEntryOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCourseEntryOpen]);

  const analysisInSimulation =
    activeSection === 'analysis' && activeAnalysisView === 'simulation';
  const visibleStats = analysisInSimulation ? simulatedStats : stats;
  const currentMethodLabel = useMemo(() => {
    switch (method) {
      case 'STD_4_0':
        return 'Std 4.0';
      case 'PKU_4_0':
        return 'PKU 4.0';
      case 'SCALE_4_5':
        return '4.5 Scale';
      case 'LINEAR':
        return 'Linear 5.0';
      case 'WES':
        return 'WES 5.0';
      default:
        return 'DLUT 5.0';
    }
  }, [method]);

  const panelFallback = (
    <div className="paper-panel flex items-center justify-center gap-3 p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-b-primary" />
      <span className="text-main">{t('chart_loading')}</span>
    </div>
  );

  const handleReset = () => {
    if (window.confirm(t('confirm_reset'))) {
      resetData();
      setLocalSearchTerm('');
      clearFilters();
    }
  };

  const handleToggleAll = (checked: boolean) => {
    if (hasActiveFilters) {
      const visibleIds = new Set(filteredCourses.map(course => course.id));
      setAllActive(checked, visibleIds);
      return;
    }

    setAllActive(checked);
  };

  const renderMetaCard = (
    label: string,
    value: string,
    detail?: string,
    emphasis?: 'primary' | 'accent'
  ) => (
    <div className="metric-card">
      <div className="figure-label">{label}</div>
      <div
        className={`mt-3 text-[1.45rem] font-extrabold tracking-[-0.05em] ${
          emphasis === 'primary'
            ? 'text-primary'
            : emphasis === 'accent'
              ? 'text-[hsl(var(--color-accent))]'
              : 'text-main'
        }`}
      >
        {value}
      </div>
      {detail ? <div className="type-body-sm mt-1">{detail}</div> : null}
    </div>
  );

  const renderOverview = () => (
    <section className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-kicker">{t('nav_overview')}</div>
          <h2 className="type-page-title text-main">{t('overview_title')}</h2>
          <p className="type-body-sm mt-2">
            {language === 'zh'
              ? '核心绩点、学分进度与下一步操作都压缩到一个真正可用的首页。'
              : 'The homepage is rebuilt around GPA, credits, and the next useful action.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="status-chip">{currentMethodLabel}</span>
          <span className="status-chip">
            {isSandboxMode ? t('sandbox_mode') : t('overview_state_live')}
          </span>
          <span className="status-chip">
            {semesters.length} {t('overview_terms')}
          </span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
        <article className="paper-panel p-6 sm:p-7">
          <div className="relative z-10 flex h-full flex-col justify-between gap-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <div className="figure-label">{t('total_gpa')}</div>
                <div className="hero-value text-main">
                  {visibleStats.weightedGpa.toFixed(3)}
                </div>
                <div className="type-body-sm">
                  {t('based_on_credits', visibleStats.totalCredits.toFixed(1))}
                </div>
              </div>

              <div className="w-full max-w-sm rounded-[1rem] border border-primary/10 bg-[hsl(var(--surface-2))] p-4">
                <div className="figure-label">
                  {language === 'zh' ? '当前状态' : 'Current State'}
                </div>
                <div className="mt-2 text-sm font-semibold text-main">
                  {isSandboxMode
                    ? language === 'zh'
                      ? '正在沙盒演算，修改不会直接覆盖原数据。'
                      : 'Sandbox mode is active and changes are isolated.'
                    : language === 'zh'
                      ? '本地自动保存已启用，可直接继续录入或分析。'
                      : 'Local autosave is on. Continue editing or analysis safely.'}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {renderMetaCard(
                t('credits'),
                visibleStats.totalCredits.toFixed(1),
                language === 'zh' ? '累计学分' : 'Total credits'
              )}
              {renderMetaCard(
                t('avg_score'),
                visibleStats.weightedAverageScore.toFixed(2),
                t('hundred_scale')
              )}
              {renderMetaCard(
                t('overview_active'),
                `${activeCourses.length} / ${courses.length}`,
                language === 'zh' ? '当前纳入计算' : 'Included in GPA'
              )}
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setActiveSection('courses')}
                className="primary-button"
              >
                {t('overview_primary_cta')}
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('analysis')}
                className="ghost-button"
              >
                {t('overview_secondary_cta')}
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </article>

        <div className="grid gap-3 sm:grid-cols-2">
          {renderMetaCard(
            language === 'zh' ? '计算制度' : 'Method',
            currentMethodLabel,
            language === 'zh' ? '当前换算标准' : 'Current GPA scale',
            'primary'
          )}
          {renderMetaCard(
            language === 'zh' ? '数据状态' : 'Status',
            isSandboxMode
              ? language === 'zh'
                ? '沙盒中'
                : 'Sandbox'
              : language === 'zh'
                ? '已保存'
                : 'Saved',
            language === 'zh' ? '自动本地存储' : 'Local autosave',
            isSandboxMode ? 'accent' : undefined
          )}
          {renderMetaCard(
            t('overview_terms'),
            String(semesters.length),
            language === 'zh' ? '已覆盖学期' : 'Terms covered'
          )}
          {renderMetaCard(
            t('course_count'),
            String(courses.length),
            t('selected_total', activeCourses.length)
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title={t('compulsory_gpa')}
          value={visibleStats.compulsoryWeightedGpa.toFixed(3)}
          icon={<Book size={20} />}
          description={t('compulsory_desc', visibleStats.compulsoryCredits)}
          comparisonValue={originalStats?.compulsoryWeightedGpa.toFixed(3)}
          isSandbox={analysisInSimulation || isSandboxMode}
        />
        <StatsCard
          title={t('avg_score')}
          value={visibleStats.weightedAverageScore.toFixed(2)}
          icon={<Percent size={20} />}
          description={t('hundred_scale')}
          comparisonValue={originalStats?.weightedAverageScore.toFixed(2)}
          isSandbox={analysisInSimulation || isSandboxMode}
        />
        <StatsCard
          title={t('overview_terms')}
          value={semesters.length}
          icon={<CalendarRange size={20} />}
          description={
            language === 'zh'
              ? '按已记录学期统计'
              : 'Calculated from recorded terms'
          }
        />
        <StatsCard
          title={t('course_count')}
          value={
            analysisInSimulation
              ? simulatedStats.courseCount
              : activeCourses.length
          }
          icon={<GraduationCap size={20} />}
          description={
            analysisInSimulation
              ? t('selected_total', simulatedStats.courseCount)
              : t('selected_total', courses.length)
          }
          comparisonValue={originalStats?.courseCount}
          isSandbox={analysisInSimulation || isSandboxMode}
        />
      </div>
    </section>
  );

  const renderCourses = () => (
    <section className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-kicker">{t('nav_courses')}</div>
          <h2 className="type-page-title text-main">
            {t('course_workspace_title')}
          </h2>
          <p className="type-body-sm mt-2">
            {language === 'zh'
              ? '课程筛选、批量勾选和档案表合并为一个真正高密度的操作区。'
              : 'Filtering, selection, and the course ledger now live in one dense workspace.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="status-chip">
            {hasActiveFilters
              ? t('filter_state_filtered')
              : t('filter_state_all')}
          </span>
          <span className="status-chip">
            {language === 'zh'
              ? `计入 ${activeCourses.length} 门`
              : `${activeCourses.length} active`}
          </span>
          <button
            type="button"
            onClick={() => setIsCourseEntryOpen(true)}
            className="primary-button"
            aria-label={t('new_course')}
          >
            <Plus size={16} />
            {t('new_course')}
          </button>
        </div>
      </div>

      <CourseFilterBar
        selectedSemesters={selectedSemesters}
        setSelectedSemesters={setSelectedSemesters}
        filterType={filterType}
        setFilterType={setFilterType}
        filterCore={filterCore}
        setFilterCore={setFilterCore}
        searchTerm={localSearchTerm}
        onSearchChange={setLocalSearchTerm}
        semesterOptions={semesterOptions}
        isSandboxMode={isSandboxMode}
        isFiltered={hasActiveFilters}
        onClearFilters={() => {
          clearFilters();
          setLocalSearchTerm('');
        }}
      />

      <CourseList
        courses={filteredCourses}
        totalCourses={courses.length}
        isFiltered={hasActiveFilters}
        onRemove={removeCourse}
        onEdit={setEditingCourse}
        onToggle={toggleCourse}
        onToggleAll={handleToggleAll}
        onOpenCreate={() => setIsCourseEntryOpen(true)}
        onOpenImport={() => setIsDataModalOpen(true)}
        onClearFilters={() => {
          clearFilters();
          setLocalSearchTerm('');
        }}
      />
    </section>
  );

  const renderAnalysis = () => (
    <section className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-kicker">{t('nav_analysis')}</div>
          <h2 className="type-page-title text-main">{t('analysis_title')}</h2>
          <p className="type-body-sm mt-2">{t('analysis_desc')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="status-chip">{currentMethodLabel}</span>
          <span className="status-chip">
            {hasActiveFilters
              ? t('filter_state_filtered')
              : t('filter_state_all')}
          </span>
          <span className="status-chip">
            {language === 'zh'
              ? `${activeCourses.length} 门计入`
              : `${activeCourses.length} active`}
          </span>
        </div>
      </div>

      {hydrated ? (
        <DashboardModeToggleBar
          activeView={activeAnalysisView}
          onChange={setActiveAnalysisView}
        />
      ) : null}

      {activeAnalysisView === 'simulation' ? (
        <Suspense fallback={panelFallback}>
          <GpaSimulationMode
            courses={courses}
            method={method}
            onSimulatedStats={setSimulatedStats}
          />
        </Suspense>
      ) : activeAnalysisView === 'radar' ? (
        <Suspense fallback={panelFallback}>
          <AcademicRadar courses={activeCourses} />
        </Suspense>
      ) : activeAnalysisView === 'advisor' ? (
        <Suspense fallback={panelFallback}>
          <AIAdvisorPanel courses={courses} gpaStats={stats} targetGPA={3.5} />
        </Suspense>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
          <div className="space-y-4">
            <Suspense fallback={panelFallback}>
              <ScoreDistributionChart stats={stats} />
            </Suspense>
            <Suspense fallback={panelFallback}>
              <ScoreDistributionHistogram stats={stats} />
            </Suspense>
          </div>

          <div className="space-y-4">
            <TargetGpaCalculator
              currentGpa={stats.weightedGpa}
              currentCredits={stats.totalCredits}
            />
            <GraduationProgress
              courses={activeCourses}
              totalCredits={stats.totalCredits}
            />
          </div>
        </div>
      )}
    </section>
  );

  return (
    <Layout
      isSandboxMode={isSandboxMode}
      header={
        <>
          <ReloadPrompt />
          <Header
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            isSandboxMode={isSandboxMode}
            onReset={handleReset}
            onDataMgmt={() => setIsDataModalOpen(true)}
            onShare={() => setIsShareModalOpen(true)}
            onEnterSandbox={enterSandbox}
            method={method}
            setMethod={setMethod}
          />
        </>
      }
      sandboxBanner={
        isSandboxMode ? (
          <SandboxBanner
            onDiscard={() => exitSandbox(false)}
            onSave={() => exitSandbox(true)}
          />
        ) : undefined
      }
    >
      {editingCourse ? (
        <EditCourseModal
          course={editingCourse}
          isOpen={true}
          onClose={() => setEditingCourse(null)}
          onSave={(id, name, credits, score, semester, type, isCore) => {
            saveCourse(id, name, credits, score, semester, type, isCore);
            setEditingCourse(null);
          }}
          existingSemesters={semesters}
        />
      ) : null}

      <Suspense fallback={null}>
        <DataManagementModal
          isOpen={isDataModalOpen}
          onClose={() => setIsDataModalOpen(false)}
          courses={courses}
          onImport={importData}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ShareableReportModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          stats={stats}
          courses={activeCourses}
        />
      </Suspense>

      {isCourseEntryOpen ? (
        <div className="fixed inset-0 z-[120]">
          <button
            type="button"
            className="absolute inset-0 bg-[rgba(2,6,23,0.46)] backdrop-blur-sm"
            aria-label={t('close_panel')}
            onClick={() => setIsCourseEntryOpen(false)}
          />

          <aside className="course-drawer absolute right-0 top-0 h-full w-full max-w-[28rem] border-l border-primary/10 p-5 sm:p-6">
            <div className="flex h-full flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="section-kicker">{t('course_entry')}</div>
                  <h3 className="type-section-title mt-2 text-main">
                    {t('new_course')}
                  </h3>
                  <p className="type-body-sm mt-2">{t('course_entry_desc')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCourseEntryOpen(false)}
                  className="ghost-button px-3 py-2"
                  aria-label={t('close_entry')}
                >
                  {t('close_entry')}
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <AddCourseForm
                  variant="drawer"
                  onAdd={(name, credits, score, semester, type, isCore) => {
                    addCourse(name, credits, score, semester, type, isCore);
                    setIsCourseEntryOpen(false);
                  }}
                  existingNames={courses.map(course => course.name)}
                  existingSemesters={semesters}
                />
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="space-y-6">
        {activeSection === 'overview' ? renderOverview() : null}
        {activeSection === 'courses' ? renderCourses() : null}
        {activeSection === 'analysis' ? renderAnalysis() : null}
      </div>
    </Layout>
  );
}

export default App;
