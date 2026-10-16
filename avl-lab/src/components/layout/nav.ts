import { Activity, BookOpen, Braces, FileCode2, Home, Info, ListTree, Network, RefreshCcw, Target, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  short: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', short: 'Overview', icon: Home, end: true },
  { to: '/learn', label: 'Learn AVL Trees', short: 'Lessons', icon: BookOpen },
  { to: '/visualizer', label: 'Interactive Visualizer', short: 'Visualizer', icon: Network },
  { to: '/rotations', label: 'Rotations Lab', short: 'Rotations', icon: RefreshCcw },
  { to: '/algorithms', label: 'Algorithms & Pseudocode', short: 'Pseudocode', icon: ListTree },
  { to: '/c', label: 'C Implementation', short: 'C', icon: FileCode2 },
  { to: '/cpp', label: 'C++ Implementation', short: 'C++', icon: Braces },
  { to: '/complexity', label: 'Complexity Analysis', short: 'Complexity', icon: Activity },
  { to: '/practice', label: 'Practice & Quiz', short: 'Practice', icon: Target },
  { to: '/about', label: 'About', short: 'About', icon: Info },
];
