import { lazy, Suspense, useEffect, useState } from 'react';
import { Award, Book, Percent, GraduationCap } from 'lucide-react';
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

const panelFallback = (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    <span className="ml-3 text-main">模块加载中...</span>
  </div>
);

function App() {
  const { t } = useTranslation();
  
  // Data & State
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
    setAllActive
  } = useCourseData();

  // Filters & Derived Stats
  const {
    searchTerm: rawSearchTerm, setSearchTerm,
    selectedSemesters, setSelectedSemesters,
    filterType, setFilterType,
    filterCore, setFilterCore,
    semesters,
    filteredCourses,
    activeCourses,
    stats,
    originalStats
  } = useCourseFilter(courses, originalCourses, isSandboxMode);

  // 使用防抖处理搜索词
  const [localSearchTerm, setLocalSearchTerm] = useState(rawSearchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);

  // 当防抖搜索词改变时，更新实际的搜索状态
  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchTerm]);

  // UI State
  const [logoError, setLogoError] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [showRadar, setShowRadar] = useState(false);
  const [showAIAdvisor, setShowAIAdvisor] = useState(false);
  const [simulatedStats, setSimulatedStats] = useState(stats);

  const handleReset = () => {
    if (window.confirm(t('confirm_reset'))) {
      resetData();
      // Reset filters
      setSearchTerm('');
      setSelectedSemesters([]);
      setFilterType('ALL');
      setFilterCore(false);
    }
  };

  const handleToggleAll = (checked: boolean) => {
    if (rawSearchTerm || selectedSemesters.length > 0 || filterType !== 'ALL' || filterCore) {
        const visibleIds = new Set(filteredCourses.map(c => c.id));
        setAllActive(checked, visibleIds);
    } else {
        setAllActive(checked);
    }
  };

  return (
    <Layout
      isSandboxMode={isSandboxMode}
      header={
        <>
          <ReloadPrompt />
          <Header
            isSandboxMode={isSandboxMode}
            logoError={logoError}
            setLogoError={setLogoError}
            onReset={handleReset}
            onDataMgmt={() => setIsDataModalOpen(true)}
            onShare={() => setIsShareModalOpen(true)}
            onEnterSandbox={enterSandbox}
            method={method}
            setMethod={setMethod}
          />
          {hydrated && (
            <DashboardModeToggleBar
              showSimulation={showSimulation}
              showRadar={showRadar}
              showAdvisor={showAIAdvisor}
              onToggleSimulation={() => {
                setShowSimulation(!showSimulation);
                setShowRadar(false);
                setShowAIAdvisor(false);
              }}
              onToggleRadar={() => {
                setShowRadar(!showRadar);
                setShowSimulation(false);
                setShowAIAdvisor(false);
              }}
              onToggleAdvisor={() => {
                setShowAIAdvisor(!showAIAdvisor);
                setShowSimulation(false);
                setShowRadar(false);
              }}
            />
          )}
        </>
      }
      sandboxBanner={
        isSandboxMode ? (
          <SandboxBanner onDiscard={() => exitSandbox(false)} onSave={() => exitSandbox(true)} />
        ) : undefined
      }
    >

      {/* Modals */}
      {editingCourse && (
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
      )}

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

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatsCard
          title={t('total_gpa')}
          value={showSimulation ? simulatedStats.weightedGpa.toFixed(3) : stats.weightedGpa.toFixed(3)}
          icon={<Award className="text-white" size={24} />}
          description={showSimulation 
            ? t('based_on_credits', simulatedStats.totalCredits) 
            : t('based_on_credits', stats.totalCredits)}
          colorClass="bg-gradient-to-br from-primary to-blue-900 text-white shadow-lg shadow-blue-900/20"
          comparisonValue={originalStats?.weightedGpa.toFixed(3)}
          isSandbox={isSandboxMode || showSimulation}
        />
        <StatsCard
          title={t('compulsory_gpa')}
          value={showSimulation ? simulatedStats.compulsoryWeightedGpa.toFixed(3) : stats.compulsoryWeightedGpa.toFixed(3)}
          icon={<Book className="text-purple-600 dark:text-purple-400" size={24} />}
          description={showSimulation 
            ? t('compulsory_desc', simulatedStats.compulsoryCredits) 
            : t('compulsory_desc', stats.compulsoryCredits)}
          colorClass="bg-surface text-main border-l-4 border-purple-500 shadow-lg"
          comparisonValue={originalStats?.compulsoryWeightedGpa.toFixed(3)}
          isSandbox={isSandboxMode || showSimulation}
        />
        <StatsCard
          title={t('avg_score')}
          value={showSimulation ? simulatedStats.weightedAverageScore.toFixed(2) : stats.weightedAverageScore.toFixed(2)}
          icon={<Percent className="text-emerald-600 dark:text-emerald-400" size={24} />}
          description={t('hundred_scale')}
          colorClass="bg-surface text-main border-l-4 border-emerald-500 shadow-lg"
          comparisonValue={originalStats?.weightedAverageScore.toFixed(2)}
          isSandbox={isSandboxMode || showSimulation}
        />
        <StatsCard
          title={t('course_count')}
          value={showSimulation ? simulatedStats.courseCount : activeCourses.length}
          icon={<GraduationCap className="text-primary" size={24} />}
          description={showSimulation 
            ? t('selected_total', simulatedStats.courseCount) 
            : t('selected_total', courses.length)}
          colorClass="bg-surface text-main shadow-lg"
          comparisonValue={originalStats?.courseCount}
          isSandbox={isSandboxMode || showSimulation}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Input and List */}
        <div className="lg:col-span-2 space-y-6">
          <AddCourseForm 
              onAdd={addCourse} 
              existingNames={courses.map(c => c.name)}
              existingSemesters={semesters}
          />
          
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
          />
        </div>

        {/* Right Column: Visualization */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 h-fit pb-10">
          {showSimulation ? (
            <Suspense fallback={panelFallback}>
              <GpaSimulationMode
                courses={courses}
                method={method}
                onSimulatedStats={setSimulatedStats}
              />
            </Suspense>
          ) : showRadar ? (
            <Suspense fallback={panelFallback}>
              <AcademicRadar courses={activeCourses} />
            </Suspense>
          ) : showAIAdvisor ? (
              <Suspense fallback={panelFallback}>
                <AIAdvisorPanel
                  courses={courses}
                  gpaStats={stats}
                  targetGPA={3.5} // 默认目标GPA，可以从上下文中获取或允许用户设置
                />
              </Suspense>
          ) : (
            <>
              <ScoreDistributionChart stats={stats} />

              <ScoreDistributionHistogram stats={stats} />

              <TargetGpaCalculator currentGpa={stats.weightedGpa} currentCredits={stats.totalCredits} />
              <GraduationProgress courses={activeCourses} totalCredits={stats.totalCredits} />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default App;
