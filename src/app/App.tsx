import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Book, CalendarRange, GraduationCap, Percent, Plus } from 'lucide-react';
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
import { ScoreDistributionChart } from '../components/analytics/ScoreDistributionChart';
import { ScoreDistributionHistogram } from '../components/analytics/ScoreDistributionHistogram';
import { DashboardModeToggleBar } from '../components/analytics/DashboardModeToggleBar';
import { ReloadPrompt } from '../components/common/ReloadPrompt';
import { Course } from '../types';
import useDebounce from '../hooks/useDebounce';

const DataManagementModal = lazy(() =>
  import('../components/data/DataManagementModal').then((module) => ({ default: module.DataManagementModal }))
);
const ShareableReportModal = lazy(() =>
  import('../components/data/ShareableReportModal').then((module) => ({ default: module.ShareableReportModal }))
);
const GpaSimulationMode = lazy(() =>
  import('../components/analytics/GpaSimulationMode').then((module) => ({ default: module.GpaSimulationMode }))
);
const AcademicRadar = lazy(() =>
  import('../components/analytics/AcademicRadar').then((module) => ({ default: module.AcademicRadar }))
);
const AIAdvisorPanel = lazy(() => import('../components/analytics/AIAdvisorPanel'));

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
    filteredCourses,
    activeCourses,
    stats,
    originalStats,
  } = useCourseFilter(courses, originalCourses, isSandboxMode);

  const [localSearchTerm, setLocalSearchTerm] = useState(rawSearchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [activeAnalysisView, setActiveAnalysisView] = useState<AnalysisView>('overview');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCourseEntryOpen, setIsCourseEntryOpen] = useState(false);
  const [simulatedStats, setSimulatedStats] = useState(stats);

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

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCourseEntryOpen]);

  const analysisInSimulation = activeSection === 'analysis' && activeAnalysisView === 'simulation';
  const visibleStats = analysisInSimulation ? simulatedStats : stats;
  const isFiltered = rawSearchTerm || selectedSemesters.length > 0 || filterType !== 'ALL' || filterCore;
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
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-b-primary" />
      <span className="text-main">{t('chart_loading')}</span>
    </div>
  );

  const handleReset = () => {
    if (window.confirm(t('confirm_reset'))) {
      resetData();
      setSearchTerm('');
      setLocalSearchTerm('');
      setSelectedSemesters([]);
      setFilterType('ALL');
      setFilterCore(false);
    }
  };

  const handleToggleAll = (checked: boolean) => {
    if (isFiltered) {
      const visibleIds = new Set(filteredCourses.map((course) => course.id));
      setAllActive(checked, visibleIds);
      return;
    }

    setAllActive(checked);
  };

  const renderOverview = () => (
    <section className="space-y-5 sm:space-y-6">
      <article className="paper-panel p-6 sm:p-7 lg:p-9">
        <div className="relative z-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
          <div className="space-y-5 sm:space-y-6">
            <div>
              <div className="section-kicker">Overview</div>
              <h2 className="section-heading mt-4 text-main">{t('overview_title')}</h2>
              <p className="section-subtitle mt-3 text-sm sm:text-base">{t('overview_desc')}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="status-chip">{currentMethodLabel}</span>
              <span className="status-chip">{language.toUpperCase()}</span>
              <span className={`status-chip ${isSandboxMode ? 'border-amber-400/30 bg-amber-500/10 text-amber-100' : ''}`}>
                {isSandboxMode ? t('overview_state_sandbox') : t('overview_state_live')}
              </span>
            </div>

            <div>
              <div className="figure-label">{t('total_gpa')}</div>
              <div className="hero-value mt-2 text-primary">{visibleStats.weightedGpa.toFixed(3)}</div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button type="button" onClick={() => setActiveSection('courses')} className="primary-button">
                {t('overview_primary_cta')}
                <ArrowRight size={16} />
              </button>
              <button type="button" onClick={() => setActiveSection('analysis')} className="ghost-button">
                {t('overview_secondary_cta')}
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          <div className="rounded-[1.45rem] border border-primary/10 bg-background/35 p-3 sm:p-4">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="metric-card">
                <div className="figure-label">{t('credits')}</div>
                <div className="mt-3 data-figure text-2xl text-main">{visibleStats.totalCredits.toFixed(1)}</div>
              </div>
              <div className="metric-card">
                <div className="figure-label">{t('avg_score')}</div>
                <div className="mt-3 data-figure text-2xl text-main">{visibleStats.weightedAverageScore.toFixed(2)}</div>
              </div>
              <div className="metric-card">
                <div className="figure-label">{t('overview_active')}</div>
                <div className="mt-3 data-figure text-2xl text-main">
                  {activeCourses.length} / {courses.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title={t('compulsory_gpa')}
          value={visibleStats.compulsoryWeightedGpa.toFixed(3)}
          icon={<Book size={24} />}
          description={t('compulsory_desc', visibleStats.compulsoryCredits)}
          comparisonValue={originalStats?.compulsoryWeightedGpa.toFixed(3)}
          isSandbox={analysisInSimulation || isSandboxMode}
        />
        <StatsCard
          title={t('avg_score')}
          value={visibleStats.weightedAverageScore.toFixed(2)}
          icon={<Percent size={24} />}
          description={t('hundred_scale')}
          comparisonValue={originalStats?.weightedAverageScore.toFixed(2)}
          isSandbox={analysisInSimulation || isSandboxMode}
        />
        <StatsCard
          title={t('overview_terms')}
          value={semesters.length}
          icon={<CalendarRange size={24} />}
          description={t('overview_terms')}
        />
        <StatsCard
          title={t('course_count')}
          value={analysisInSimulation ? simulatedStats.courseCount : activeCourses.length}
          icon={<GraduationCap size={24} />}
          description={analysisInSimulation ? t('selected_total', simulatedStats.courseCount) : t('selected_total', courses.length)}
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
          <div className="section-kicker">Courses</div>
          <h2 className="text-3xl leading-none text-main sm:text-4xl">{t('course_workspace_title')}</h2>
          <p className="mt-2 text-sm text-muted">{t('course_workspace_desc')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={() => setIsCourseEntryOpen(true)} className="primary-button" aria-label={t('new_course')}>
            <Plus size={16} />
            {t('new_course')}
          </button>
          <button type="button" onClick={() => setIsDataModalOpen(true)} className="ghost-button">
            {t('data_mgmt')}
          </button>
          <button type="button" onClick={() => setIsShareModalOpen(true)} className="ghost-button">
            {t('share')}
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
        semesters={semesters}
        isSandboxMode={isSandboxMode}
      />

      <CourseList
        courses={filteredCourses}
        onRemove={removeCourse}
        onEdit={setEditingCourse}
        onToggle={toggleCourse}
        onToggleAll={handleToggleAll}
        onOpenCreate={() => setIsCourseEntryOpen(true)}
        onOpenImport={() => setIsDataModalOpen(true)}
      />
    </section>
  );

  const renderAnalysis = () => (
    <section className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-kicker">Analysis</div>
          <h2 className="text-3xl leading-none text-main sm:text-4xl">{t('analysis_title')}</h2>
          <p className="mt-2 text-sm text-muted">{t('analysis_desc')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="status-chip">{currentMethodLabel}</span>
          <span className="status-chip">{isFiltered ? t('filter_state_filtered') : t('filter_state_all')}</span>
        </div>
      </div>

      {hydrated ? <DashboardModeToggleBar activeView={activeAnalysisView} onChange={setActiveAnalysisView} /> : null}

      {activeAnalysisView === 'simulation' ? (
        <Suspense fallback={panelFallback}>
          <GpaSimulationMode courses={courses} method={method} onSimulatedStats={setSimulatedStats} />
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
        <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <ScoreDistributionChart stats={stats} />
            <ScoreDistributionHistogram stats={stats} />
          </div>
          <div className="space-y-6">
            <TargetGpaCalculator currentGpa={stats.weightedGpa} currentCredits={stats.totalCredits} />
            <GraduationProgress courses={activeCourses} totalCredits={stats.totalCredits} />
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
      sandboxBanner={isSandboxMode ? <SandboxBanner onDiscard={() => exitSandbox(false)} onSave={() => exitSandbox(true)} /> : undefined}
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
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-[rgba(2,6,23,0.72)] backdrop-blur-sm"
            aria-label={t('close_panel')}
            onClick={() => setIsCourseEntryOpen(false)}
          />
          <aside className="course-drawer absolute right-0 top-0 h-full w-full max-w-[28rem] border-l border-primary/10 p-5 sm:p-7">
            <div className="flex h-full flex-col gap-5 sm:gap-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="section-kicker">Entry</div>
                  <h3 className="mt-3 text-3xl leading-none text-main">{t('course_entry')}</h3>
                  <p className="mt-2 text-sm text-muted">{t('course_entry_desc')}</p>
                </div>
                <button type="button" onClick={() => setIsCourseEntryOpen(false)} className="ghost-button px-3 py-2" aria-label={t('close_entry')}>
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
                  existingNames={courses.map((course) => course.name)}
                  existingSemesters={semesters}
                />
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="space-y-6 sm:space-y-8">
        {activeSection === 'overview' ? renderOverview() : null}
        {activeSection === 'courses' ? renderCourses() : null}
        {activeSection === 'analysis' ? renderAnalysis() : null}
      </div>
    </Layout>
  );
}

export default App;
