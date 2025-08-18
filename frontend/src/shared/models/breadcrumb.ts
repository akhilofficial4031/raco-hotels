export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface RouteHandle {
  crumb?: () => BreadcrumbItem;
}
