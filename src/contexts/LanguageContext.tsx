import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'zh' | 'en';

type TranslationMap = Record<string, string>;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, ...args: Array<string | number>) => string;
}

const translations: Record<Language, TranslationMap> = {
  zh: {
    app_title: 'DLUT-GPA',
    app_desc: 'DLUT-GPA',
    confirm_reset: '确定要重置所有数据吗？此操作不可撤销。',
    reset: '重置',
    data_mgmt: '数据管理',
    share: '分享报告',
    total_gpa: '总 GPA',
    based_on_credits: '基于 {0} 学分',
    compulsory_gpa: '必修 GPA',
    compulsory_desc: '必修 {0} 学分',
    avg_score: '加权平均分',
    hundred_scale: '百分制',
    course_count: '课程数量',
    selected_total: '已选 {0} 门课程',
    all_semesters: '全部学期',
    selected_semesters: '已选 {0} 个学期',
    filter_semester: '筛选学期',
    all_types: '全部类型',
    type_compulsory: '必修',
    type_elective: '选修',
    type_optional: '任选',
    filter_type: '筛选类型',
    core_only: '仅核心课',
    search_placeholder: '搜索课程名称...',
    score_dist: '成绩分布',
    histogram: '直方图',
    ocr_import_title: 'OCR 成绩导入',
    ocr_upload_prompt: '点击上传教务系统截图',
    ocr_supported_formats: '支持 JPG、PNG、WEBP 格式',
    upload_image: '上传图片',
    ocr_scanning: '正在扫描',
    ocr_no_courses_found: '未在图片中找到课程信息，请检查截图是否包含成绩单',
    ocr_error_occurred: 'OCR 识别过程中发生错误，请稍后重试',
    ocr_instruction_line1: '1. 截取包含课程信息的教务系统页面',
    ocr_instruction_line2: '2. 确保截图包含课程名称、学分和成绩',
    credits: '学分',
    current_score: '当前分数',
    show_radar: '显示雷达图',
    hide_radar: '隐藏雷达图',
    academic_radar_title: '学业雷达图',
    theme_light: '浅色主题',
    theme_dark: '深色主题',
    category_math: '数学类',
    category_english: '英语类',
    category_major: '专业核心',
    category_general: '通识教育',
    category_sports: '体育类',
    category_other: '其他',
    scores: '分数',
    no_data_for_radar: '暂无数据绘制雷达图',
    no_data: '暂无数据',
    app_calc_title: '留学申请计算器',
    nav_overview: '总览',
    nav_courses: '课程',
    nav_analysis: '分析',
    analysis_overview: '总览分析',
    analysis_experiment: '成绩实验',
    analysis_radar: '学业雷达',
    analysis_advisor: '智能建议',
    analysis_overview_sublabel: '图表总览',
    analysis_experiment_sublabel: '方案对比',
    analysis_radar_sublabel: '学业结构',
    analysis_advisor_sublabel: '辅助建议',
    experiment_label: '实验工作区',
    experiment_title: '成绩实验室',
    experiment_inactive_desc: '复制当前正式数据作为基线，在独立草稿中调整成绩并实时比较；只有明确应用后才会保存。',
    experiment_active_desc: '调整实验成绩并观察 GPA、均分与学分变化，正式数据保持不变。',
    experiment_start: '开始实验',
    experiment_return: '返回实验室',
    experiment_status: '实验进行中',
    experiment_baseline_gpa: '基线 GPA',
    experiment_draft_gpa: '实验 GPA',
    experiment_baseline_short: '基线',
    experiment_draft_short: '实验',
    experiment_track_label: '基线与实验 GPA 对比刻度',
    experiment_gpa_delta: 'GPA 变化',
    experiment_average_delta: '平均分变化',
    experiment_credits_delta: '学分变化',
    experiment_changed_courses: '改动课程',
    experiment_direction_up: '实验 GPA 上升',
    experiment_direction_down: '实验 GPA 下降',
    experiment_direction_same: '实验 GPA 持平',
    experiment_editor_title: '课程实验台',
    experiment_editor_desc: '输入或拖动分数，结果会立即同步到当前实验草稿。',
    experiment_search_label: '搜索实验课程',
    experiment_search_placeholder: '搜索课程名称…',
    experiment_semester: '实验学期',
    experiment_type: '实验课程类型',
    experiment_changed_only: '仅看已改',
    experiment_show_excluded: '显示未计入',
    experiment_visible_count: '显示 {0} 门',
    experiment_course_list: '实验课程列表',
    experiment_excluded: '未计入',
    experiment_score: '实验分数',
    experiment_score_slider: '分数滑块',
    experiment_restore: '恢复',
    experiment_change_count: '已改动 {0} 门课程',
    experiment_not_saved: '应用前不会写入正式数据',
    experiment_reset: '撤销全部',
    experiment_discard: '放弃实验',
    experiment_commit: '应用到正式数据',
    experiment_cancel: '取消',
    experiment_discard_title: '放弃实验？',
    experiment_discard_desc: '当前实验的全部调整都会丢失，正式数据不会改变。',
    experiment_commit_title: '应用实验结果？',
    experiment_commit_desc: '当前实验草稿将替换正式课程数据并保存到本机。',
    experiment_confirm_discard: '确认放弃',
    experiment_confirm_commit: '确认应用',
    overview_title: '学业控制台',
    overview_primary_cta: '进入课程',
    overview_secondary_cta: '查看分析',
    overview_state_live: '本地自动保存',
    overview_terms: '已覆盖学期',
    overview_active: '计入课程',
    section_method: '计算方式',
    section_status: '当前状态',
    quick_metrics: '核心指标',
    course_workspace_title: '课程控制台',
    course_workspace_desc: '录入、筛选和档案表在同一工作区。',
    new_course: '新建课程',
    close_entry: '关闭录入',
    course_entry: '课程录入',
    course_entry_desc: '输入课程信息后立即重算 GPA。',
    analysis_title: '分析中心',
    analysis_desc: '切换总览、实验、雷达和建议。',
    filter_state_filtered: '筛选中',
    filter_state_all: '全部课程',
    clear_filters: '清除筛选',
    empty_courses_title: '暂无课程',
    empty_courses_desc: '添加第一门课程或导入现有成绩单。',
    empty_filtered_courses_title: '暂无匹配课程',
    empty_filtered_courses_desc: '当前筛选条件下没有课程，尝试清除筛选或切换其他条件。',
    import_courses: '导入数据',
    close_panel: '关闭面板',
    language_toggle: '切换语言',
    chart_loading: '模块加载中...',
    theme_light_short: '亮',
    theme_dark_short: '暗'
    ,primary_nav: '主导航'
    ,primary_navigation: '主导航'
    ,analysis_views: '分析视图'
    ,gpa_method: 'GPA 算法'
    ,enabled: '启用'
    ,open_tools: '打开工具'
    ,tools: '工具'
    ,academic_console: 'Academic Console'
    ,overview_intro: '主绩点、关键摘要和下一步操作都压进了首屏。'
    ,current_gpa: '当前 GPA'
    ,included_credits: '已计入学分'
    ,included_now: '当前计入'
    ,total_credits: '累计学分'
    ,recorded_terms: '已记录学期'
    ,included_in_gpa: '当前计入 GPA'
    ,experiment_draft: '实验草稿'
    ,target_projection: '目标推算'
    ,target_gpa_calculator: '目标 GPA 计算器'
    ,current_gpa_short: '当前 GPA'
    ,included_credits_short: '已计入学分'
    ,target_required: '目标 GPA 应在 0–{0} 之间'
    ,expected_gpa_range: '请输入 0–{0} 之间的预期绩点'
    ,required_field: '请输入{0}'
    ,remaining_credits_positive: '剩余学分必须大于 0'
    ,not_reachable: '在当前剩余学分下无法达到'
    ,target_achieved: '当前已达到目标'
    ,plan_reaches_target: '按当前计划可达到目标'
    ,higher_future_gpa_required: '需要提高后续课程表现'
    ,required_future_projected: '所需后续平均绩点 {0} · 预计累计 GPA {1}'
    ,target_gpa: '目标 GPA'
    ,remaining_credits: '剩余学分'
    ,expected_average_gpa: '预期平均绩点'
    ,overview_current_gpa: '当前 GPA'
    ,overview_experiment_isolated: '当前实验草稿与正式数据隔离，只有应用实验结果后才会保存。'
    ,overview_autosave_hint: '本地自动保存已启用，先录入课程，再回到分析区查看结构变化。'
    ,total_credits_detail: '累计学分'
    ,included_now_detail: '当前计入'
    ,recorded_terms_detail: '已记录学期'
    ,terms_recorded_detail: '按已记录学期统计'
    ,course_workspace_hint: '搜索、筛选与课程总表压成一个真正的操作台，首屏优先给你可扫描的信息。'
    ,courses_included: '计入 {0} 门'
    ,analysis_data_label: '学业数据分析'
    ,analysis_workspace_hint: '查看成绩结构、推算目标，并在独立实验中比较调整方案。'
    ,included_in_gpa_detail: '当前计入 GPA'
    ,included_metrics_detail: '以下统计仅使用已启用的 {0} / {1} 门课程'
    ,weighted_gpa: '加权 GPA'
    ,weighted_average: '加权平均分'
    ,included_credits_detail: '已计入学分'
    ,included_courses_detail: '计入课程数'
    ,enabled_courses_only: '仅启用课程'
    ,all_courses_total: '全部 {0} 门'
    ,no_courses_to_analyze: '暂无可分析课程'
    ,add_or_include_course: '请先添加课程或将课程设为计入 GPA。'
    ,reset_data_detail: '此操作会清除当前课程数据。'
    ,experiment_draft_removed: '已从草稿删除'
    ,experiment_restore_hint: '恢复后将按原课程顺序插回实验草稿。'
    ,score_points: '分'
  },
  en: {
    app_title: 'DLUT-GPA',
    app_desc: 'DLUT-GPA',
    confirm_reset: 'Are you sure you want to reset all data? This action cannot be undone.',
    reset: 'Reset',
    data_mgmt: 'Data Mgmt',
    share: 'Share Report',
    total_gpa: 'Total GPA',
    based_on_credits: 'Based on {0} credits',
    compulsory_gpa: 'Compulsory GPA',
    compulsory_desc: 'Compulsory {0} credits',
    avg_score: 'Weighted Avg',
    hundred_scale: '100 Scale',
    course_count: 'Courses',
    selected_total: 'Selected {0} courses',
    all_semesters: 'All Semesters',
    selected_semesters: 'Selected {0} semesters',
    filter_semester: 'Filter Semester',
    all_types: 'All Types',
    type_compulsory: 'Compulsory',
    type_elective: 'Elective',
    type_optional: 'Optional',
    filter_type: 'Filter Type',
    core_only: 'Core Only',
    search_placeholder: 'Search course name...',
    score_dist: 'Score Dist',
    histogram: 'Histogram',
    ocr_import_title: 'OCR Import',
    ocr_upload_prompt: 'Click to upload academic record screenshot',
    ocr_supported_formats: 'Supports JPG, PNG, WEBP formats',
    upload_image: 'Upload Image',
    ocr_scanning: 'Scanning',
    ocr_no_courses_found: 'No course information found in the image, please check if the screenshot contains transcript',
    ocr_error_occurred: 'An error occurred during OCR recognition, please try again later',
    ocr_instruction_line1: '1. Screenshot the academic record page from academic system',
    ocr_instruction_line2: '2. Ensure the screenshot includes course name, credits, and grades',
    credits: 'Credits',
    current_score: 'Current Score',
    show_radar: 'Show Radar',
    hide_radar: 'Hide Radar',
    academic_radar_title: 'Academic Radar',
    theme_light: 'Light Theme',
    theme_dark: 'Dark Theme',
    category_math: 'Math',
    category_english: 'English',
    category_major: 'Major Core',
    category_general: 'General Ed',
    category_sports: 'Sports',
    category_other: 'Other',
    scores: 'Scores',
    no_data_for_radar: 'No data to draw radar chart',
    no_data: 'No Data',
    app_calc_title: 'Application Calculator',
    nav_overview: 'Overview',
    nav_courses: 'Courses',
    nav_analysis: 'Analysis',
    analysis_overview: 'Analysis Overview',
    analysis_experiment: 'Grade Experiment',
    analysis_radar: 'Radar',
    analysis_advisor: 'Advisor',
    analysis_overview_sublabel: 'Charts',
    analysis_experiment_sublabel: 'Compare',
    analysis_radar_sublabel: 'Radar',
    analysis_advisor_sublabel: 'Notes',
    experiment_label: 'Experiment workspace',
    experiment_title: 'Grade Experiment Lab',
    experiment_inactive_desc: 'Copy saved courses into an isolated draft, compare changes live, and save only when you explicitly apply them.',
    experiment_active_desc: 'Adjust experimental scores and compare GPA, average, and credits while saved data stays untouched.',
    experiment_start: 'Start Experiment',
    experiment_return: 'Return to Lab',
    experiment_status: 'Experiment active',
    experiment_baseline_gpa: 'Baseline GPA',
    experiment_draft_gpa: 'Experiment GPA',
    experiment_baseline_short: 'Baseline',
    experiment_draft_short: 'Experiment',
    experiment_track_label: 'Baseline and experiment GPA scale',
    experiment_gpa_delta: 'GPA Change',
    experiment_average_delta: 'Average Change',
    experiment_credits_delta: 'Credit Change',
    experiment_changed_courses: 'Changed Courses',
    experiment_direction_up: 'Experiment GPA increased',
    experiment_direction_down: 'Experiment GPA decreased',
    experiment_direction_same: 'Experiment GPA unchanged',
    experiment_editor_title: 'Course Workbench',
    experiment_editor_desc: 'Type or drag a score to update the current experiment draft immediately.',
    experiment_search_label: 'Search experiment courses',
    experiment_search_placeholder: 'Search course name…',
    experiment_semester: 'Experiment semester',
    experiment_type: 'Experiment course type',
    experiment_changed_only: 'Changed only',
    experiment_show_excluded: 'Show excluded',
    experiment_visible_count: '{0} courses shown',
    experiment_course_list: 'Experiment course list',
    experiment_excluded: 'Excluded',
    experiment_score: 'experiment score',
    experiment_score_slider: 'score slider',
    experiment_restore: 'Restore ',
    experiment_change_count: '{0} courses changed',
    experiment_not_saved: 'Saved data stays untouched until apply',
    experiment_reset: 'Reset All',
    experiment_discard: 'Discard Experiment',
    experiment_commit: 'Apply to Saved Data',
    experiment_cancel: 'Cancel',
    experiment_discard_title: 'Discard experiment?',
    experiment_discard_desc: 'All experiment adjustments will be lost. Saved data will remain unchanged.',
    experiment_commit_title: 'Apply experiment results?',
    experiment_commit_desc: 'The current draft will replace your saved course data on this device.',
    experiment_confirm_discard: 'Confirm Discard',
    experiment_confirm_commit: 'Confirm Apply',
    overview_title: 'Academic Control Center',
    overview_primary_cta: 'Open Courses',
    overview_secondary_cta: 'Open Analysis',
    overview_state_live: 'Local autosave',
    overview_terms: 'Terms Covered',
    overview_active: 'Active Courses',
    section_method: 'Method',
    section_status: 'Status',
    quick_metrics: 'Core Metrics',
    course_workspace_title: 'Course Console',
    course_workspace_desc: 'Input, filters, and the ledger live in one operational space.',
    new_course: 'New Course',
    close_entry: 'Close Entry',
    course_entry: 'Course Entry',
    course_entry_desc: 'Enter a course and recalculate GPA immediately.',
    analysis_title: 'Analysis Hub',
    analysis_desc: 'Switch between overview, experiment, radar, and advisor.',
    filter_state_filtered: 'Filtered',
    filter_state_all: 'All Courses',
    clear_filters: 'Clear Filters',
    empty_courses_title: 'No Courses Yet',
    empty_courses_desc: 'Add the first course or import an existing record.',
    empty_filtered_courses_title: 'No Matching Courses',
    empty_filtered_courses_desc: 'No courses match the current filters. Clear them or switch to another combination.',
    import_courses: 'Import Data',
    close_panel: 'Close panel',
    language_toggle: 'Switch language',
    chart_loading: 'Loading module...',
    theme_light_short: 'Light',
    theme_dark_short: 'Dark'
    ,primary_nav: 'Primary'
    ,primary_navigation: 'Primary navigation'
    ,analysis_views: 'Analysis views'
    ,gpa_method: 'GPA Method'
    ,enabled: 'On'
    ,open_tools: 'Open tools'
    ,tools: 'Tools'
    ,academic_console: 'Academic Console'
    ,overview_intro: 'The first screen is driven by GPA, key metrics, and the next useful action.'
    ,current_gpa: 'Current GPA'
    ,included_credits: 'Included credits'
    ,included_now: 'Included now'
    ,total_credits: 'Total credits'
    ,recorded_terms: 'Recorded terms'
    ,included_in_gpa: 'Included in GPA'
    ,experiment_draft: 'Experiment draft'
    ,target_projection: 'Projection'
    ,target_gpa_calculator: 'Target GPA calculator'
    ,current_gpa_short: 'Current GPA'
    ,included_credits_short: 'Included credits'
    ,target_required: 'Target GPA must be between 0 and {0}'
    ,expected_gpa_range: 'Expected GPA must be between 0 and {0}'
    ,required_field: 'This field is required'
    ,remaining_credits_positive: 'Remaining credits must be greater than 0'
    ,not_reachable: 'Not reachable with these credits'
    ,target_achieved: 'Target already achieved'
    ,plan_reaches_target: 'The current plan reaches the target'
    ,higher_future_gpa_required: 'A higher future GPA is required'
    ,required_future_projected: 'Required future GPA {0} · Projected cumulative GPA {1}'
    ,target_gpa: 'Target GPA'
    ,remaining_credits: 'Remaining credits'
    ,expected_average_gpa: 'Expected average GPA'
    ,overview_current_gpa: 'Current GPA'
    ,overview_experiment_isolated: 'The current experiment draft stays isolated until you explicitly apply it.'
    ,overview_autosave_hint: 'Local autosave is active. Record courses first, then come back to analysis for structure changes.'
    ,total_credits_detail: 'Total credits'
    ,included_now_detail: 'Included now'
    ,recorded_terms_detail: 'Recorded terms'
    ,terms_recorded_detail: 'Calculated from recorded terms'
    ,course_workspace_hint: 'Search, filters, and the ledger now behave like one operational workspace.'
    ,courses_included: '{0} active'
    ,analysis_data_label: 'Academic data analysis'
    ,analysis_workspace_hint: 'Review academic structure, project targets, and compare changes in an isolated experiment.'
    ,included_in_gpa_detail: 'Included in GPA'
    ,included_metrics_detail: 'Metrics use {0} of {1} enabled courses'
    ,weighted_gpa: 'Weighted GPA'
    ,weighted_average: 'Weighted average'
    ,included_credits_detail: 'Included credits'
    ,included_courses_detail: 'Included courses'
    ,enabled_courses_only: 'Enabled courses only'
    ,all_courses_total: '{0} total'
    ,no_courses_to_analyze: 'No courses to analyze'
    ,add_or_include_course: 'Add a course or include one in GPA first.'
    ,reset_data_detail: 'This clears the current course data.'
    ,experiment_draft_removed: 'Removed from draft'
    ,experiment_restore_hint: 'Restore this course to its original position in the draft.'
    ,score_points: 'points'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  const t = (key: string, ...args: Array<string | number>) => {
    let translation = translations[language][key] ?? key;

    args.forEach((arg, index) => {
      translation = translation.replace(`{${index}}`, String(arg));
    });

    return translation;
  };

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
