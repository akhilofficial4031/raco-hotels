import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import { Badge, Button, Input } from "antd";
import { useEffect, useState } from "react";

import { type TableHeaderProps } from "../models/tableHeader";

const TableHeader: React.FC<TableHeaderProps> = ({
  searchPlaceholder = "",
  showAddButton = true,
  showSearch = true,
  showFilter = false,
  hasActiveFilters = false,
  addButtonOnClick,
  onSearch,
  onFilterClick,
}) => {
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch?.(searchValue);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue, onSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-lg mb-2 border border-gray-200">
      {showSearch && (
        <Input
          placeholder={`Search ${searchPlaceholder}`}
          className="!w-64"
          value={searchValue}
          onChange={handleSearchChange}
          allowClear
        />
      )}
      <div className="flex gap-2">
        {showFilter && (
          <Badge dot={hasActiveFilters} color="blue">
            <Button onClick={onFilterClick}>
              <FilterOutlined />
              Filter
            </Button>
          </Badge>
        )}
        {showAddButton && (
          <Button
            type="primary"
            onClick={addButtonOnClick}
            className="!capitalize"
          >
            <PlusOutlined />
            Add {searchPlaceholder}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TableHeader;
