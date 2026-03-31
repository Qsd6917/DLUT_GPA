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
        className={`mt-2 text-[1.28rem] font-bold tracking-[-0.04em] ${
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

  const renderSummaryItem = (
    label: string,
    value: string,
    detail?: string,
    emphasis?: 'primary' | 'accent'
  ) => (
    <div className="summary-item">
      <div className="min-w-0">
        <div className="summary-item-label">{label}</div>
        {detail ? <div className="type-body-sm mt-1">{detail}</div> : null}
      </div>
      <div
        className={`summary-item-value ${
          emphasis === 'primary'
            ? 'text-primary'
            : emphasis === 'accent'
              ? 'text-[hsl(var(--color-accent))]'
              : 'text-main'
        }`}
      >
        {value}
      </div>
    </div>
  );

  const renderOverview = () => (
    <section className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="section-kicker">{t('nav_overview')}</div>
          <h2 className="type-page-title text-main">{t('overview_title')}</h2>
          <p className="type-body-sm mt-1.5">
            {language === 'zh'
              ? '主绩点、关键摘要和下一步操作都压进了首屏，不再靠大标题撑场。'
              : 'The first screen is now driven by GPA, summary metrics, and the next useful action.'}
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

      <article className="paper-panel p-5 sm:p-6 lg:p-7">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.22fr)_minmax(21rem,0.78fr)]">
          <div className="flex flex-col justify-between gap-5">
            <div className="space-y-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="section-kicker text-primary">
                    {language === 'zh' ? '当前 GPA' : 'Current GPA'}
                  </div>
                  <div className="hero-value mt-3 text-main">
                    {visibleStats.weightedGpa.toFixed(3)}
                  </div>
                  <p className="type-body-sm mt-3 max-w-xl">
                    {isSandboxMode
                      ? language === 'zh'
                        ? '当前正在沙盒演算，所有试算结果与正式数据隔离，可放心比较方案。'
                        : 'Sandbox simulation is active, so experiments stay isolated from your saved record.'
                      : language === 'zh'
                        ? '本地自动保存已启用，先录入课程，再回到分析区查看结构变化。'
                        : 'Local autosave is active. Record courses first, then come back to analysis for structure changes.'}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:max-w-[30rem] lg:grid-cols-3">
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
                    language === 'zh' ? '当前计入' : 'Included now'
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {renderMetaCard(
                  language === 'zh' ? '必修 GPA' : 'Compulsory GPA',
                  visibleStats.compulsoryWeightedGpa.toFixed(3),
                  t('compulsory_desc', visibleStats.compulsoryCredits)
                )}
                {renderMetaCard(
                  t('overview_terms'),
                  String(semesters.length),
                  language === 'zh' ? '已记录学期' : 'Recorded terms'
                )}
                {renderMetaCard(
                  t('course_count'),
                  String(courses.length),
                  t('selected_total', activeCourses.length)
                )}
              </div>
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
              <button
                type="button"
                onClick={() => setIsDataModalOpen(true)}
                className="ghost-button"
              >
                {t('data_mgmt')}
              </button>
            </div>
          </div>

          <div className="summary-strip">
            {renderSummaryItem(
              language === 'zh' ? '学分' : 'Credits',
              visibleStats.totalCredits.toFixed(1),
              language === 'zh' ? '当前累计' : 'Accumulated'
            )}
            {renderSummaryItem(
              language === 'zh' ? '平均分' : 'Average',
              visibleStats.weightedAverageScore.toFixed(2),
              t('hundred_scale')
            )}
            {renderSummaryItem(
              language === 'zh' ? '计入课程' : 'Included',
              `${activeCourses.length} / ${courses.length}`,
              language === 'zh' ? '当前纳入 GPA' : 'Affecting GPA now'
            )}
            {renderSummaryItem(
              language === 'zh' ? 'GPA 制度' : 'Method',
              currentMethodLabel,
              language === 'zh' ? '当前换算标准' : 'Current GPA scale',
              'primary'
            )}
            {renderSummaryItem(
              language === 'zh' ? '数据状态' : 'Status',
              isSandboxMode
                ? language === 'zh'
                  ? '沙盒演算'
                  : 'Sandbox'
                : language === 'zh'
                  ? '已保存'
                  : 'Saved',
              language === 'zh' ? '本地自动存储' : 'Local autosave',
              isSandboxMode ? 'accent' : undefined
            )}
          </div>
        </div>
      </article>

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
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="section-kicker">{t('nav_courses')}</div>
          <h2 className="type-page-title text-main">
            {t('course_workspace_title')}
          </h2>
          <p className="type-body-sm mt-1.5">
            {language === 'zh'
              ? '搜索、筛选与课程总表压成一个真正的操作台，首屏优先给你可扫描的信息。'
              : 'Search, filters, and the ledger now behave like one operational workspace.'}
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
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="section-kicker">{t('nav_analysis')}</div>
          <h2 className="type-page-title text-main">{t('analysis_title')}</h2>
          <p className="type-body-sm mt-1.5">
            {language === 'zh'
              ? '切换器退回为真正 tabs，图表和工具面板重新回到主次清楚的控制台结构。'
              : 'The view switcher is now a true tab bar, with charts and tools back in a clear primary-secondary layout.'}
          </p>
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
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(21rem,0.88fr)]">
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
