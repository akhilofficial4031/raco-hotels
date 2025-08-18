import { HomeOutlined } from "@ant-design/icons";
import React from "react";
import { Link, useMatches } from "react-router";

import type { BreadcrumbItem, RouteHandle } from "../models/breadcrumb";

/**
 * Breadcrumbs component that dynamically generates breadcrumb navigation
 * based on the current route matches and their handle data
 */
const Breadcrumbs: React.FC = () => {
  const matches = useMatches();

  // Extract breadcrumb items from route handles

  const breadcrumbItems: BreadcrumbItem[] = React.useMemo(() => {
    const items: BreadcrumbItem[] = [];

    // Always add home/dashboard as the first item
    items.push({
      label: "Dashboard",
      href: "/dashboard",
    });

    // Process matches to build breadcrumb trail
    matches.forEach((match) => {
      const handle = match.handle as RouteHandle | undefined;

      if (handle?.crumb) {
        const crumbData = handle.crumb();
        // Avoid duplicate dashboard entries
        if (crumbData.href !== "/dashboard") {
          items.push(crumbData);
        }
      }
    });

    return items;
  }, [matches]);

  // Don't render if only dashboard item (single level)
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {breadcrumbItems.length > 1 && (
        <p className="text-gray-500 leading-2 text-xl">
          {breadcrumbItems[breadcrumbItems.length - 1].label}
        </p>
      )}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const isFirst = index === 0;

            return (
              <>
                <React.Fragment key={item.href}>
                  {/* Separator */}
                  {index > 0 && (
                    <span className="text-gray-400 select-none">/</span>
                  )}

                  {/* Breadcrumb Item */}
                  <div className="flex items-center">
                    {isFirst && <HomeOutlined className="mr-1 text-gray-500" />}

                    {isLast ? (
                      // Current page - not clickable
                      <span className="font-medium text-gray-900">
                        {item.label}
                      </span>
                    ) : (
                      // Previous pages - clickable links
                      <Link
                        to={item.href}
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                </React.Fragment>
              </>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Breadcrumbs;
