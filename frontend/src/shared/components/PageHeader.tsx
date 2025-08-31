import React from "react";

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, actions }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      {actions && <div>{actions}</div>}
    </div>
  );
};

export default PageHeader;
