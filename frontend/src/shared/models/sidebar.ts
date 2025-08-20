export interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  children?: SidebarItem[];
}
