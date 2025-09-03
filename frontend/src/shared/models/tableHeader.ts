/* eslint-disable no-unused-vars */
export interface TableHeaderProps {
  searchPlaceholder?: string;
  title?: string;
  showAddButton?: boolean;
  showSearch?: boolean;
  showFilter?: boolean;
  hasActiveFilters?: boolean;
  addButtonOnClick?: () => void;
  onSearch?: (value: string) => void;
  onFilterClick?: () => void;
}
