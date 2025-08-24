import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Form,
  InputNumber,
  Menu,
  Modal,
  Pagination,
  Table,
  message,
} from "antd";
import { type ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { useParams } from "react-router";
import useSWR, { mutate } from "swr";

import TableHeader from "../shared/components/TableHeader";
import {
  type AddonConfiguration,
  type AddonConfigurationListParamStructure,
  type AddonConfigurationListResponse,
  type UpdateAddonConfigurationPayload,
  type AddonResponse,
} from "../shared/models";
import { convertJsonToQueryParams } from "../shared/utils";
import { fetcher, mutationFetcher } from "../utils/swrFetcher";

const { confirm } = Modal;

const AddonConfigurationPage = () => {
  const { id: addonId } = useParams<{ id: string }>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedConfig, setSelectedConfig] =
    useState<AddonConfiguration | null>(null);
  const [form] = Form.useForm();
  const [isSaving, setIsSaving] = useState(false);

  const [filterParams, setFilterParams] =
    useState<AddonConfigurationListParamStructure>({
      page: 1,
      limit: 10,
    });

  const queryString = useMemo(
    () => convertJsonToQueryParams(filterParams),
    [filterParams],
  );

  const {
    data: response,
    isLoading,
    error,
  } = useSWR(
    addonId ? `/addons/${addonId}/configurations${queryString}` : null,
    fetcher<AddonConfigurationListResponse>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  const { data: addonResponse } = useSWR(
    addonId ? `/addons/${addonId}` : null,
    fetcher<AddonResponse>,
  );

  const handlePageChange = (page: number, pageSize: number) => {
    setFilterParams((prev) => ({ ...prev, page, limit: pageSize }));
  };

  const handleEdit = (record: AddonConfiguration) => {
    setSelectedConfig(record);
    form.setFieldsValue({ priceCents: record.priceCents / 100 });
    setIsModalVisible(true);
  };

  const handleDelete = (record: AddonConfiguration) => {
    confirm({
      title: "Are you sure you want to delete this configuration?",
      icon: <ExclamationCircleOutlined />,
      content: `This action will permanently delete the configuration for ${record.roomType.name}.`,
      onOk: async () => {
        try {
          await mutationFetcher(`/addons/configurations/${record.id}`, {
            arg: { method: "DELETE" },
          });
          message.success("Configuration deleted successfully");
          mutate(`/addons/${addonId}/configurations${queryString}`);
        } catch (_error) {
          if (_error) {
            message.error("Failed to delete configuration");
          }
        }
      },
    });
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSaving(true);

      if (selectedConfig) {
        const updatePayload: UpdateAddonConfigurationPayload = {
          priceCents: values.priceCents * 100,
        };

        await mutationFetcher(`/addons/configurations/${selectedConfig.id}`, {
          arg: {
            method: "PUT",
            body: updatePayload,
          },
        });
        message.success("Configuration updated successfully");
        mutate(`/addons/${addonId}/configurations${queryString}`);
        setIsModalVisible(false);
        setSelectedConfig(null);
      }
    } catch (_error) {
      if (_error) {
        message.error("Failed to update configuration");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedConfig(null);
  };

  const handleSearch = (value: string) => {
    setFilterParams((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const columns: ColumnsType<AddonConfiguration> = [
    {
      title: "Room Type",
      dataIndex: ["roomType", "name"],
      key: "roomTypeName",
    },
    {
      title: "Price",
      dataIndex: "priceCents",
      key: "priceCents",
      render: (price: number) => `$${(price / 100).toFixed(2)}`,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: AddonConfiguration) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="edit"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
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
        title={`${addonResponse?.data.addon.name} Configurations`}
        searchPlaceholder="configurations"
        showAddButton={false}
        showFilter={false}
        onFilterClick={() => {}}
        onSearch={handleSearch}
      />
      <div className="bg-white p-2 rounded-lg mb-2 border border-gray-200">
        <Table
          dataSource={response?.data.configurations}
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
            total={response?.data.pagination.total}
            onChange={handlePageChange}
          />
        </div>
      </div>

      <Modal
        title="Edit Configuration"
        open={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmLoading={isSaving}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="priceCents"
            label="Price"
            rules={[{ required: true, message: "Please enter a price" }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(value) =>
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddonConfigurationPage;
