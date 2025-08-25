import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Menu,
  Modal,
  Pagination,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { type ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { useMemo, useState } from "react";
import useSWR, { mutate } from "swr";

import AddEditPromoCode from "../features/promo-code/components/add-edit-promo-code";
import PromoCodeFilters from "../features/promo-code/components/promo-code-filters";
import TableHeader from "../shared/components/TableHeader";
import { type Hotel } from "../shared/models/hotels";
import {
  type CreatePromoCodePayload,
  type PromoCodeListParamStructure,
  type PromoCodeListResponse,
  type PromoCodeWithRelations,
} from "../shared/models/promo-code";
import { convertJsonToQueryParams } from "../shared/utils";
import { fetcher, mutationFetcher } from "../utils/swrFetcher";

dayjs.extend(isBetween);

const { confirm } = Modal;
const { Text } = Typography;

const PromoCode = () => {
  const [openAddPromoCodePanel, setOpenAddPromoCodePanel] = useState(false);
  const [openFiltersPanel, setOpenFiltersPanel] = useState(false);
  const [currentPromoCode, setCurrentPromoCode] =
    useState<PromoCodeWithRelations | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [filterParams, setFilterParams] = useState<PromoCodeListParamStructure>(
    {
      page: 1,
      limit: 10,
      search: "",
      hotelId: "",
      isActive: "",
      dateRange: null,
    },
  );

  const queryString = useMemo(
    () => convertJsonToQueryParams(filterParams),
    [filterParams],
  );

  // Fetch promo codes
  const {
    data: response,
    isLoading,
    error,
  } = useSWR(`/promo-codes${queryString}`, fetcher<PromoCodeListResponse>, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  // Fetch hotels for filter dropdown and hotel name mapping
  const { data: hotelsResponse } = useSWR(
    "/hotels?limit=100",
    fetcher<{ data: { hotels: Hotel[] } }>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  const handlePageChange = (page: number, pageSize: number) => {
    setFilterParams((prev) => ({ ...prev, page, limit: pageSize }));
  };

  const handleAddPromoCode = () => {
    setCurrentPromoCode(null);
    setOpenAddPromoCodePanel(true);
  };

  const handleEditPromoCode = (promoCode: PromoCodeWithRelations) => {
    setCurrentPromoCode(promoCode);
    setOpenAddPromoCodePanel(true);
  };

  const handleDeletePromoCode = (promoCode: PromoCodeWithRelations) => {
    confirm({
      title: "Are you sure you want to delete this promo code?",
      icon: <ExclamationCircleOutlined />,
      content: `This action will permanently delete "${promoCode.code}".`,
      onOk: async () => {
        try {
          await mutationFetcher(`/promo-codes/${promoCode.id}`, {
            arg: { method: "DELETE" },
          });
          message.success("Promo code deleted successfully");
          mutate(`/promo-codes${queryString}`);
        } catch (error) {
          if (error) {
            message.error("Failed to delete promo code");
          }
        }
      },
    });
  };

  const handleFormSubmit = async (data: CreatePromoCodePayload) => {
    setIsSaving(true);
    try {
      if (currentPromoCode) {
        await mutationFetcher(`/promo-codes/${currentPromoCode.id}`, {
          arg: { method: "PUT", body: data },
        });
        message.success("Promo code updated successfully");
      } else {
        await mutationFetcher("/promo-codes", {
          arg: { method: "POST", body: data },
        });
        message.success("Promo code added successfully");
      }
      setOpenAddPromoCodePanel(false);
      setCurrentPromoCode(null);
      mutate(`/promo-codes${queryString}`);
    } catch (error) {
      if (error) {
        message.error("Failed to save promo code");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilterParams((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleApplyFilters = (
    filters: Partial<PromoCodeListParamStructure>,
  ) => {
    setFilterParams((prev) => ({ ...prev, ...filters }));
  };

  const handleOpenFilters = () => {
    setOpenFiltersPanel(true);
  };

  const hasActiveFilters = Boolean(
    filterParams.hotelId || filterParams.isActive || filterParams.dateRange,
  );

  const getHotelName = (hotelId: number) => {
    const hotel = hotelsResponse?.data?.hotels?.find((h) => h.id === hotelId);
    return hotel?.name || `Hotel ${hotelId}`;
  };

  const getPromoCodeStatus = (promoCode: PromoCodeWithRelations) => {
    const now = dayjs();
    const isActive = promoCode.isActive === 1;
    const isWithinDateRange =
      !promoCode.startDate ||
      !promoCode.endDate ||
      dayjs(now).isBetween(
        dayjs(promoCode.startDate),
        dayjs(promoCode.endDate),
        "day",
        "[]",
      );

    return isActive && isWithinDateRange;
  };

  const columns: ColumnsType<PromoCodeWithRelations> = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Hotel",
      dataIndex: "hotelId",
      key: "hotelId",
      render: (hotelId: number) => getHotelName(hotelId),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string, record: PromoCodeWithRelations) => {
        if (type === "percent") {
          return `${record.value}%`;
        }
        return `₹${record.value}`;
      },
    },
    {
      title: "Validity",
      key: "validity",
      render: (_: unknown, record: PromoCodeWithRelations) => (
        <Text>
          {record.startDate
            ? `${dayjs(record.startDate).format("MMM D, YYYY")} - ${dayjs(
                record.endDate,
              ).format("MMM D, YYYY")}`
            : "No date limit"}
        </Text>
      ),
    },
    {
      title: "Usage Count",
      dataIndex: "usageCount",
      key: "usageCount",
    },
    {
      title: "Status",
      key: "status",
      render: (_: unknown, record: PromoCodeWithRelations) => {
        const isActive = getPromoCodeStatus(record);
        return (
          <Tag color={isActive ? "green" : "red"}>
            {isActive ? "Active" : "Inactive"}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: PromoCodeWithRelations) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="edit"
                icon={<EditOutlined />}
                onClick={() => handleEditPromoCode(record)}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                onClick={() => handleDeletePromoCode(record)}
              >
                Delete
              </Menu.Item>
            </Menu>
          }
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <TableHeader
        searchPlaceholder="promo codes"
        showAddButton={true}
        showFilter={true}
        hasActiveFilters={hasActiveFilters}
        onFilterClick={handleOpenFilters}
        addButtonOnClick={handleAddPromoCode}
        onSearch={handleSearch}
      />
      <div className="bg-white p-2 rounded-lg mb-2 border border-gray-200">
        <Table
          dataSource={response?.data.promoCodes || []}
          className="!bg-white"
          bordered={true}
          columns={columns}
          rowKey="id"
          pagination={false}
          loading={isLoading}
          scroll={{ x: "max-content" }}
        />
        <div className="flex justify-end mt-4">
          <Pagination
            current={filterParams.page}
            pageSize={filterParams.limit}
            total={response?.data.pagination?.total || 0}
            onChange={handlePageChange}
          />
        </div>
      </div>
      <AddEditPromoCode
        open={openAddPromoCodePanel}
        onClose={() => setOpenAddPromoCodePanel(false)}
        onSubmit={handleFormSubmit}
        promoCode={currentPromoCode}
        isSaving={isSaving}
      />
      <PromoCodeFilters
        open={openFiltersPanel}
        onClose={() => setOpenFiltersPanel(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filterParams}
      />
    </div>
  );
};

export default PromoCode;
