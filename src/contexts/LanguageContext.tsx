import React, { createContext, useState, useContext, ReactNode } from 'react';

// 定义支持的语言类型
type Language = 'zh' | 'en';

// Context 的类型定义
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, ...args: any[]) => string;
}

// 翻译字典
// 哈基米根据 App.tsx 里的 key 帮您整理好了！
const translations = {
  zh: {
    app_title: 'DLUT-GPA',
    app_desc: 'DLUT-GPA',
    sandbox_mode: '沙盒模式',
    confirm_reset: '确定要重置所有数据吗？此操作不可撤销。',
    reset: '重置',
    data_mgmt: '数据管理',
    share: '分享报告',
    enter_sandbox: '进入沙盒',
    sandbox_active: '沙盒模式已激活',
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
    simulation_mode_title: 'GPA 模拟器',
    original_gpa: '原始 GPA',
    simulated_gpa: '模拟 GPA',
    credits: '学分',
    current_score: '当前分数',
    simulation_instructions: '拖动滑块调整模拟分数，实时查看 GPA 变化',
    show_simulation: '显示模拟器',
    hide_simulation: '隐藏模拟器',
    show_radar: '显示雷达图',
    hide_radar: '隐藏雷达图',
    academic_radar_title: '学业雷达图',
    theme_light: '浅色主题',
    theme_dark: '深色主题',
    theme_dlut_blue: '大工蓝主题',
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
    sandbox_banner: '您正在沙盒模式中，所有更改都不会保存到本地存储，除非您选择保存退出。',
    exit_sandbox_discard: '放弃更改退出',
    exit_sandbox_save: '保存更改退出',
  },
  en: {
    app_title: 'DLUT-GPA',
    app_desc: 'DLUT-GPA',
    sandbox_mode: 'Sandbox Mode',
    confirm_reset: 'Are you sure you want to reset all data? This action cannot be undone.',
    reset: 'Reset',
    data_mgmt: 'Data Mgmt',
    share: 'Share Report',
    enter_sandbox: 'Enter Sandbox',
    sandbox_active: 'Sandbox Active',
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
    simulation_mode_title: 'GPA Simulator',
    original_gpa: 'Original GPA',
    simulated_gpa: 'Simulated GPA',
    credits: 'Credits',
    current_score: 'Current Score',
    simulation_instructions: 'Drag sliders to adjust simulated scores and see real-time GPA changes',
    show_simulation: 'Show Simulator',
    hide_simulation: 'Hide Simulator',
    show_radar: 'Show Radar',
    hide_radar: 'Hide Radar',
    academic_radar_title: 'Academic Radar',
    theme_light: 'Light Theme',
    theme_dark: 'Dark Theme',
    theme_dlut_blue: 'DLUT Blue Theme',
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
    sandbox_banner: 'You are in Sandbox Mode. Changes will not be saved to local storage unless you choose to save & exit.',
    exit_sandbox_discard: 'Discard & Exit',
    exit_sandbox_save: 'Save & Exit',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 默认语言设置为中文
  const [language, setLanguage] = useState<Language>('zh');

  // 翻译函数，支持简单的参数替换 {0}, {1} 等
  const t = (key: string, ...args: any[]) => {
    let translation = translations[language][key as keyof typeof translations['zh']] || key;
    
    if (args.length > 0) {
      args.forEach((arg, index) => {
        translation = translation.replace(`{${index}}`, String(arg));
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 自定义 Hook 以便在组件中轻松使用
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
