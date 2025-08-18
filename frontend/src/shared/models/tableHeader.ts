export interface TableHeaderProps {
  searchPlaceholder?: string;
  showAddButton?: boolean;
  showSearch?: boolean;
  showFilter?: boolean;
  addButtonOnClick?: () => void;
  onSearch?: (value: string) => void;
  onFilterClick?: () => void;
}
