import type { Icon } from '@phosphor-icons/react';
import { Users, Buildings, CalendarCheck, ClipboardText, Clock, ChartBar, Wallet, Money } from '@phosphor-icons/react';

export type NavSection = 'people' | 'time_off' | 'attendance' | 'finance';

export interface NavItem {
  path: string;
  label: string;
  icon: Icon;
  roles: string[];
  section: NavSection;
  end?: boolean;
}

export const navSections: { key: NavSection; labelKey: string }[] = [
  { key: 'people', labelKey: 'nav.section_people' },
  { key: 'time_off', labelKey: 'nav.section_time_off' },
  { key: 'attendance', labelKey: 'nav.section_attendance' },
  { key: 'finance', labelKey: 'nav.section_finance' },
];

export const menuItems: NavItem[] = [
  { path: '/employees', label: 'nav.employees', icon: Users, roles: ['admin', 'manager'], section: 'people' },
  { path: '/departments', label: 'nav.departments', icon: Buildings, roles: ['admin', 'manager'], section: 'people' },
  { path: '/leaves', label: 'nav.leaves', icon: CalendarCheck, roles: ['admin', 'manager', 'employee'], section: 'time_off', end: true },
  { path: '/leaves/approvals', label: 'nav.leave_approvals', icon: ClipboardText, roles: ['admin', 'manager'], section: 'time_off' },
  { path: '/attendance', label: 'nav.attendance', icon: Clock, roles: ['admin', 'manager', 'employee'], section: 'attendance', end: true },
  { path: '/attendance/report', label: 'nav.attendance_report', icon: ChartBar, roles: ['admin', 'manager'], section: 'attendance' },
  { path: '/payroll', label: 'nav.payroll', icon: Wallet, roles: ['admin', 'manager', 'employee'], section: 'finance', end: true },
  { path: '/payroll/manage', label: 'nav.payroll_management', icon: Money, roles: ['admin'], section: 'finance' },
];
