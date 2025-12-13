import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Modal,
  Pagination,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { type ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import useSWR, { mutate } from "swr";

import TableHeader from "@shared/components/TableHeader";
import { convertJsonToQueryParams } from "@utils/queryParams";
import { fetcher, mutationFetcher } from "@utils/swrFetcher";

import AddEditInquiry from "../components/AddEditInquiry";
import InquiryFilters from "../components/InquiryFilters";
import {
  type CreateInquiryPayload,
  type Inquiry,
  type InquiryListParamStructure,
  type InquiryListResponse,
  type InquiryStatus,
} from "../types/inquiry";

const { confirm } = Modal;
const { Text } = Typography;

const InquiryPage = () => {
  const [openAddInquiryPanel, setOpenAddInquiryPanel] = useState(false);
  const [openFiltersPanel, setOpenFiltersPanel] = useState(false);
  const [currentInquiry, setCurrentInquiry] = useState<Inquiry | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formKey, setFormKey] = useState(0); // Add counter for form reset

  const [filterParams, setFilterParams] = useState<InquiryListParamStructure>({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });

  const queryString = useMemo(
    () => convertJsonToQueryParams(filterParams),
    [filterParams],
  );

  // Fetch inquiries
  const {
    data: response,
    isLoading,
    error,
  } = useSWR(`/inquiries${queryString}`, fetcher<InquiryListResponse>, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  const handlePageChange = (page: number, pageSize: number) => {
    setFilterParams((prev) => ({ ...prev, page, limit: pageSize }));
  };

  const handleAddInquiry = () => {
    setCurrentInquiry(null);
    setFormKey((prev) => prev + 1); // Increment key to force form reset
    setOpenAddInquiryPanel(true);
  };

  const handleEditInquiry = (inquiry: Inquiry) => {
    setCurrentInquiry(inquiry);
    setOpenAddInquiryPanel(true);
  };

  const handleDeleteInquiry = (inquiry: Inquiry) => {
    confirm({
      title: "Are you sure you want to delete this inquiry?",
      icon: <ExclamationCircleOutlined />,
      content: `This action will permanently delete the inquiry from "${inquiry.name}".`,
      onOk: async () => {
        try {
          await mutationFetcher(`/inquiries/${inquiry.id}`, {
            arg: { method: "DELETE" },
          });
          message.success("Inquiry deleted successfully");
          mutate(`/inquiries${queryString}`);
        } catch (error) {
          if (error) {
            message.error("Failed to delete inquiry");
          }
        }
      },
    });
  };

  const handleFormSubmit = async (data: CreateInquiryPayload) => {
    setIsSaving(true);
    try {
      await (currentInquiry
        ? mutationFetcher(`/inquiries/${currentInquiry.id}`, {
            arg: { method: "PUT", body: data },
          })
        : mutationFetcher("/inquiries", {
            arg: { method: "POST", body: data },
          }));

      message.success(
        `Inquiry ${currentInquiry ? "updated" : "created"} successfully`,
      );

      setOpenAddInquiryPanel(false);
      setCurrentInquiry(null);
      mutate(`/inquiries${queryString}`);
    } catch (error) {
      console.error("Failed to save inquiry:", error);
      message.error("Failed to save inquiry");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilterParams((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleApplyFilters = (filters: Partial<InquiryListParamStructure>) => {
    setFilterParams((prev) => ({ ...prev, ...filters }));
  };

  const handleOpenFilters = () => {
    setOpenFiltersPanel(true);
  };

  const hasActiveFilters = Boolean(
    filterParams.status || filterParams.dateFrom || filterParams.dateTo,
  );

  const getStatusColor = (status: InquiryStatus): string => {
    switch (status) {
      case "pending":
        return "orange";
      case "addressed":
        return "blue";
      case "confirmed":
        return "green";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: InquiryStatus): string => {
    switch (status) {
      case "pending":
        return "Pending";
      case "addressed":
        return "Addressed";
      case "confirmed":
        return "Confirmed";
      default:
        return status;
    }
  };

  const columns: ColumnsType<Inquiry> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Inquiry) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" className="text-sm">
            {record.phone}
          </Text>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => {
        const dateObj = new Date(date);
        return (
          <Text>
            {dateObj.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Text>
        );
      },
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (message: string) => (
        <Text ellipsis={{ tooltip: message }} className="max-w-xs">
          {message}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: InquiryStatus) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      ),
    },
    {
      title: "Entity",
      dataIndex: "attractionName",
      key: "attractionName",
      render: (attractionName: string | null) => (
        <Text>{attractionName || "-"}</Text>
      ),
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      render: (remarks: string | null) => (
        <Text ellipsis={{ tooltip: remarks || "" }} className="max-w-xs">
          {remarks || "No remarks"}
        </Text>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: string) => {
        const dateObj = new Date(createdAt);
        return (
          <Text className="text-sm">
            {dateObj.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Text>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Inquiry) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "edit",
                icon: <EditOutlined />,
                label: "Edit",
                onClick: () => handleEditInquiry(record),
              },
              {
                key: "delete",
                icon: <DeleteOutlined />,
                label: "Delete",
                onClick: () => handleDeleteInquiry(record),
              },
            ],
          }}
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
        searchPlaceholder="inquiries"
        showAddButton={true}
        showFilter={true}
        hasActiveFilters={hasActiveFilters}
        onFilterClick={handleOpenFilters}
        addButtonOnClick={handleAddInquiry}
        onSearch={handleSearch}
      />
      <div className="bg-white p-2 rounded-lg mb-2 border border-gray-200">
        <Table
          dataSource={response?.data.inquiries || []}
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
      <AddEditInquiry
        key={currentInquiry ? `edit-${currentInquiry.id}` : `new-${formKey}`}
        open={openAddInquiryPanel}
        onClose={() => setOpenAddInquiryPanel(false)}
        onSubmit={handleFormSubmit}
        inquiry={currentInquiry}
        isSaving={isSaving}
      />
      <InquiryFilters
        open={openFiltersPanel}
        onClose={() => setOpenFiltersPanel(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filterParams}
      />
    </div>
  );
};

export default InquiryPage;
