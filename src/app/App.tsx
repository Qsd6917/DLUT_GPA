import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
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
import { CourseFilterBar } from '../components/course/CourseFilterBar';
import { AddCourseForm } from '../components/course/AddCourseForm';
import { CourseList } from '../components/course/CourseList';
import { EditCourseModal } from '../components/course/EditCourseModal';
import { StatsCard } from '../components/analytics/StatsCard';
import {
  AnalysisView,
  DashboardModeToggleBar,
} from '../components/analytics/DashboardModeToggleBar';
import { ReloadPrompt } from '../components/common/ReloadPrompt';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Course } from '../types';
import useDebounce from '../hooks/useDebounce';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { calculateSemesterTrends } from '../services/gpaService';

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
const ExperimentLab = lazy(() =>
  import('../components/analytics/ExperimentLab').then(module => ({
    default: module.ExperimentLab,
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
const SemesterTrendChart = lazy(() =>
  import('../components/analytics/SemesterTrendChart').then(module => ({
    default: module.SemesterTrendChart,
  }))
);
const TargetGpaCalculator = lazy(() =>
  import('../components/analytics/TargetGpaCalculator').then(module => ({ default: module.TargetGpaCalculator }))
);
const GraduationProgress = lazy(() =>
  import('../components/analytics/GraduationProgress').then(module => ({ default: module.GraduationProgress }))
);

type Section = 'overview' | 'courses' | 'analysis';
function App() {
  const { t } = useTranslation();
  const {
    courses,
    hydrated,
    method,
    setMethod,
    experiment,
    isExperimentActive,
    addCourse,
    removeCourse,
    toggleCourse,
    saveCourse,
    updateCourseScore,
    importData,
    resetData,
    startExperiment,
    resetExperiment,
    restoreExperimentCourse,
    discardExperiment,
    commitExperiment,
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
    baselineStats,
    clearFilters,
    hasActiveFilters,
  } = useCourseFilter(
    courses,
    experiment?.baselineCourses ?? [],
    isExperimentActive
  );

  const [localSearchTerm, setLocalSearchTerm] = useState(rawSearchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [activeAnalysisView, setActiveAnalysisView] =
    useState<AnalysisView>('overview');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCourseEntryOpen, setIsCourseEntryOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const shareReturnFocusRef = useRef<HTMLElement | null>(null);
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

  const visibleStats = stats;
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
  const maximumGpa = useMemo(() => {
    if (method === 'STD_4_0' || method === 'PKU_4_0' || method === 'WES') return 4;
    if (method === 'SCALE_4_5') return 4.5;
    return 5;
  }, [method]);
  const semesterTrends = useMemo(
    () => calculateSemesterTrends(activeCourses),
    [activeCourses]
  );

  const panelFallback = (
    <div className="paper-panel flex items-center justify-center gap-3 p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-b-primary" />
      <span className="text-main">{t('chart_loading')}</span>
    </div>
  );

  const handleReset = () => setIsResetConfirmOpen(true);
  const confirmReset = () => {
      resetData();
      setLocalSearchTerm('');
      clearFilters();
      setIsResetConfirmOpen(false);
  };

  const handleToggleAll = (checked: boolean) => {
    if (hasActiveFilters) {
      const visibleIds = new Set(filteredCourses.map(course => course.id));
      setAllActive(checked, visibleIds);
      return;
    }

    setAllActive(checked);
  };

  const handleOpenShareReport = () => {
    shareReturnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setIsShareModalOpen(true);
  };

  const handleOpenExperiment = () => {
    if (!isExperimentActive) startExperiment();
    setActiveSection('analysis');
    setActiveAnalysisView('experiment');
  };

  const handleDiscardExperiment = () => {
    discardExperiment();
    setActiveAnalysisView('overview');
  };

  const handleCommitExperiment = () => {
    commitExperiment();
    setActiveAnalysisView('overview');
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

  const renderOverview = () => (
    <section className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="section-kicker">{t('nav_overview')}</div>
          <h2 className="type-page-title text-main">{t('overview_title')}</h2>
          <p className="type-body-sm mt-1.5">{t('overview_intro')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="status-chip">{currentMethodLabel}</span>
          <span className="status-chip">
            {isExperimentActive ? t('experiment_status') : t('overview_state_live')}
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
                    {t('overview_current_gpa')}
                  </div>
                  <div className="hero-value mt-3 text-main">
                    {visibleStats.weightedGpa.toFixed(3)}
                  </div>
                  <p className="type-body-sm mt-3 max-w-xl">
                    {isExperimentActive
                      ? t('overview_experiment_isolated')
                      : t('overview_autosave_hint')}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:max-w-[30rem] lg:grid-cols-3">
                  {renderMetaCard(
                    t('credits'),
                    visibleStats.totalCredits.toFixed(1),
                    t('total_credits_detail')
                  )}
                  {renderMetaCard(
                    t('avg_score'),
                    visibleStats.weightedAverageScore.toFixed(2),
                    t('hundred_scale')
                  )}
                  {renderMetaCard(
                    t('overview_active'),
                    `${activeCourses.length} / ${courses.length}`,
                    t('included_now_detail')
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {renderMetaCard(
                  t('compulsory_gpa'),
                  visibleStats.compulsoryWeightedGpa.toFixed(3),
                  t('compulsory_desc', visibleStats.compulsoryCredits)
                )}
                {renderMetaCard(
                  t('overview_terms'),
                  String(semesters.length),
                  t('recorded_terms_detail')
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

        </div>
      </article>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title={t('compulsory_gpa')}
          value={visibleStats.compulsoryWeightedGpa.toFixed(3)}
          icon={<Book size={20} />}
          description={t('compulsory_desc', visibleStats.compulsoryCredits)}
          comparisonValue={baselineStats?.compulsoryWeightedGpa.toFixed(3)}
          isExperiment={isExperimentActive}
        />
        <StatsCard
          title={t('avg_score')}
          value={visibleStats.weightedAverageScore.toFixed(2)}
          icon={<Percent size={20} />}
          description={t('hundred_scale')}
          comparisonValue={baselineStats?.weightedAverageScore.toFixed(2)}
          isExperiment={isExperimentActive}
        />
        <StatsCard
          title={t('overview_terms')}
          value={semesters.length}
          icon={<CalendarRange size={20} />}
          description={
            t('terms_recorded_detail')
          }
        />
        <StatsCard
          title={t('course_count')}
          value={activeCourses.length}
          icon={<GraduationCap size={20} />}
          description={t('selected_total', courses.length)}
          comparisonValue={baselineStats?.courseCount}
          isExperiment={isExperimentActive}
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
            {t('course_workspace_hint')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="status-chip">
            {hasActiveFilters
              ? t('filter_state_filtered')
              : t('filter_state_all')}
          </span>
          <span className="status-chip">
            {t('courses_included', activeCourses.length)}
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
        isExperimentActive={isExperimentActive}
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
    <section className="space-y-4 sm:space-y-5" aria-label={t('analysis_data_label')}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="section-kicker">{t('nav_analysis')}</div>
          <h2 className="type-page-title text-main">{t('analysis_title')}</h2>
          <p className="type-body-sm mt-1.5">
            {t('analysis_workspace_hint')}
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
            {t('courses_included', activeCourses.length)}
          </span>
        </div>
      </div>

      {hydrated ? (
        <DashboardModeToggleBar
          activeView={activeAnalysisView}
          onChange={setActiveAnalysisView}
        />
      ) : null}

      <div
        role="tabpanel"
        id={`analysis-panel-${activeAnalysisView}`}
        aria-labelledby={`analysis-tab-${activeAnalysisView}`}
        tabIndex={0}
      >
      {activeAnalysisView === 'experiment' ? (
        <Suspense fallback={panelFallback}>
          <ExperimentLab
            experiment={experiment}
            maximumGpa={maximumGpa}
            onStart={startExperiment}
            onUpdateCourseScore={updateCourseScore}
            onRemoveCourse={removeCourse}
            onRestoreCourse={restoreExperimentCourse}
            onReset={resetExperiment}
            onDiscard={handleDiscardExperiment}
            onCommit={handleCommitExperiment}
          />
        </Suspense>
      ) : activeAnalysisView === 'radar' ? (
        <Suspense fallback={panelFallback}>
          <AcademicRadar courses={activeCourses} />
        </Suspense>
      ) : activeAnalysisView === 'advisor' ? (
        <Suspense fallback={panelFallback}>
          <AIAdvisorPanel courses={activeCourses} gpaStats={stats} targetGPA={3.8} maximumGpa={maximumGpa} />
        </Suspense>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><div className="section-kicker">{t('included_in_gpa_detail')}</div><p className="type-body-sm mt-1">{t('included_metrics_detail', activeCourses.length, courses.length)}</p></div>
            {isExperimentActive ? <span className="status-chip text-[hsl(var(--color-accent))]">{t('experiment_draft')}</span> : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {renderMetaCard(t('weighted_gpa'), stats.weightedGpa.toFixed(3), currentMethodLabel, 'primary')}
            {renderMetaCard(t('weighted_average'), stats.weightedAverageScore.toFixed(2), t('hundred_scale'))}
            {renderMetaCard(t('included_credits_detail'), stats.totalCredits.toFixed(1), t('enabled_courses_only'))}
            {renderMetaCard(t('included_courses_detail'), String(stats.courseCount), t('all_courses_total', courses.length))}
          </div>
          {stats.courseCount === 0 ? (
            <div className="paper-panel p-8 text-center"><h3 className="type-section-title text-main">{t('no_courses_to_analyze')}</h3><p className="type-body-sm mt-2">{t('add_or_include_course')}</p></div>
          ) : <>
          <div className="grid gap-4 xl:grid-cols-2">
            <Suspense fallback={panelFallback}>
              <ScoreDistributionChart stats={stats} />
            </Suspense>
            <Suspense fallback={panelFallback}>
              <SemesterTrendChart trends={semesterTrends} />
            </Suspense>
          </div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(21rem,0.88fr)]">
            <Suspense fallback={panelFallback}>
            <TargetGpaCalculator
              currentGpa={stats.weightedGpa}
              currentCredits={stats.totalCredits}
              maximumGpa={maximumGpa}
            />
            </Suspense>
            <Suspense fallback={panelFallback}>
            <GraduationProgress
              courses={activeCourses}
              totalCredits={stats.totalCredits}
            />
            </Suspense>
          </div>
          </>}
        </div>
      )}
      </div>
    </section>
  );

  return (
    <Layout
      isExperimentActive={isExperimentActive}
      header={
        <>
          <ReloadPrompt />
          <Header
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            isExperimentActive={isExperimentActive}
            onReset={handleReset}
            onDataMgmt={() => setIsDataModalOpen(true)}
            onShare={handleOpenShareReport}
            onOpenExperiment={handleOpenExperiment}
            method={method}
            setMethod={setMethod}
          />
        </>
      }
      >
      <ConfirmDialog open={isResetConfirmOpen} title={t('confirm_reset')} description={t('reset_data_detail')} confirmLabel={t('reset')} cancelLabel={t('experiment_cancel')} onConfirm={confirmReset} onCancel={() => setIsResetConfirmOpen(false)} />
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
          calculationMethodLabel={currentMethodLabel}
          isExperiment={isExperimentActive}
          totalCourseCount={courses.length}
          filteredCourseCount={filteredCourses.length}
          hasActiveFilters={hasActiveFilters}
          returnFocusRef={shareReturnFocusRef}
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

          <aside
            className="course-drawer absolute right-0 top-0 h-full w-full max-w-[28rem] border-l border-primary/10 p-5 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-entry-title"
          >
            <div className="flex h-full flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="section-kicker">{t('course_entry')}</div>
                  <h3 id="course-entry-title" className="type-section-title mt-2 text-main">
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
