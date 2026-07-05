import { useState, useCallback } from 'react';

export type Lang = 'en' | 'vi';

const translations: Record<Lang, Record<string, string>> = {
  en: {
    'app.name': 'HR Management',
    'nav.employees': 'Employees',
    'nav.departments': 'Departments',
    'nav.leaves': 'Leaves',
    'nav.leave_approvals': 'Leave Approvals',
    'nav.attendance': 'Attendance',
    'nav.attendance_report': 'Attendance Report',
    'nav.payroll': 'Payroll',
    'nav.payroll_management': 'Payroll Management',
    'nav.logout': 'Logout',
    'settings': 'Settings',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.light': 'Light',
    'settings.dark': 'Dark',
    'user.edit_profile': 'Edit Profile',
    'user.name': 'Name',
    'user.email': 'Email',
    'user.role': 'Role',
    'user.save': 'Save',
    'dialog.cancel': 'Cancel',
    'profile.updated': 'Profile updated',
  },
  vi: {
    'app.name': 'Quản lý Nhân sự',
    'nav.employees': 'Nhân viên',
    'nav.departments': 'Phòng ban',
    'nav.leaves': 'Nghỉ phép',
    'nav.leave_approvals': 'Phê duyệt',
    'nav.attendance': 'Chấm công',
    'nav.attendance_report': 'Báo cáo',
    'nav.payroll': 'Lương',
    'nav.payroll_management': 'Quản lý lương',
    'nav.logout': 'Đăng xuất',
    'settings': 'Cài đặt',
    'settings.language': 'Ngôn ngữ',
    'settings.theme': 'Giao diện',
    'settings.light': 'Sáng',
    'settings.dark': 'Tối',
    'user.edit_profile': 'Chỉnh sửa',
    'user.name': 'Tên',
    'user.email': 'Email',
    'user.role': 'Vai trò',
    'user.save': 'Lưu',
    'dialog.cancel': 'Hủy',
    'profile.updated': 'Đã cập nhật',
  },
};

export function useLanguage() {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'en');

  const t = useCallback((key: string) => translations[lang][key] || key, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  };

  return { lang, setLang, t };
}
