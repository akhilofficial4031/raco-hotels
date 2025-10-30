/* eslint-disable no-unused-vars */

import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  List,
  Row,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { DATE_FORMAT_API } from "@shared/constants/app";

import { type Addon } from "../../addon/types/addon";
import { validatePromoCode } from "../../promo-code/services/promoCodeService";
import { type PromoCode } from "../../promo-code/types/promoCode";
import { type RoomTypeWithRelations } from "../../room-type/types/roomType";
import { type IRoom } from "../../rooms/types/rooms";
import { type CustomerData } from "../types/schemas";

const { Title, Text } = Typography;

interface BookingData {
  bookingDetails?: {
    hotelId?: number;
    roomTypeId?: number;
    numAdults: number;
    numChildren: number;
    numRooms?: number;
    dateRange?: any;
    checkInDate?: any;
    checkOutDate?: any;
    status?: string;
    amountPaidCents?: number;
  };
  selectedRooms?: IRoom[];
  selectedAddons?: Addon[];
  customerData?: CustomerData;
  roomTypeDetails?: RoomTypeWithRelations;
}

interface ReviewAndSubmitProps {
  bookingData: BookingData;
  onBack: () => void;
  onSubmit: (details: {
    amountPaidCents: number;
    taxAmountCents: number;
    totalAmountCents: number;
  }) => void;
  isSubmitting: boolean;
  mode?: "create" | "edit" | "checkin";
  appliedPromoCode?: PromoCode | null;
  onPromoCodeChange: (promoCode: PromoCode | null) => void;
}

const ReviewAndSubmit = ({
  bookingData,
  onBack,
  onSubmit,
  isSubmitting,
  mode = "create",
  appliedPromoCode,
  onPromoCodeChange,
}: ReviewAndSubmitProps) => {
  const {
    bookingDetails,
    selectedRooms,
    customerData,
    roomTypeDetails,
    selectedAddons,
  } = bookingData;

  // For edit mode, use the existing dates; for create mode, use dateRange
  const checkInDate =
    mode === "edit"
      ? bookingDetails?.checkInDate
      : bookingDetails?.dateRange?.[0];
  const checkOutDate =
    mode === "edit"
      ? bookingDetails?.checkOutDate
      : bookingDetails?.dateRange?.[1];

  const nights =
    checkInDate && checkOutDate
      ? dayjs(checkOutDate).diff(dayjs(checkInDate), "day")
      : 0;

  // Calculate booking status for create mode
  const calculateBookingStatus = () => {
    if (mode !== "create" || !checkInDate) return null;
    const today = dayjs().startOf("day");
    const isCheckInToday = dayjs(checkInDate).startOf("day").isSame(today);
    return isCheckInToday ? "CHECKED IN" : "CONFIRMED";
  };

  const bookingStatus = calculateBookingStatus();

  // Calculate pricing for create mode
  const roomTotal =
    mode === "create" && roomTypeDetails && selectedRooms
      ? (roomTypeDetails.basePriceCents ?? 0) * nights * selectedRooms.length
      : 0;

  const addOnsTotal =
    mode === "create" && selectedAddons && roomTypeDetails
      ? (selectedAddons || []).reduce((total, addon) => {
          const roomTypeAddon = roomTypeDetails.addons?.find(
            (a: any) => a.addonId === addon.id,
          );
          return total + (roomTypeAddon?.priceCents ?? 0);
        }, 0)
      : 0;

  const subtotal = roomTotal + addOnsTotal;
  const taxes = subtotal * 0.18; // Example tax rate

  const [discount, setDiscount] = useState(0);
  useEffect(() => {
    if (appliedPromoCode) {
      let calculatedDiscount = 0;
      if (appliedPromoCode.type === "fixed") {
        calculatedDiscount = appliedPromoCode.value;
      } else if (appliedPromoCode.type === "percent") {
        calculatedDiscount = (subtotal * appliedPromoCode.value) / 100;
        if (
          appliedPromoCode.maxDiscountCents &&
          calculatedDiscount > appliedPromoCode.maxDiscountCents
        ) {
          calculatedDiscount = appliedPromoCode.maxDiscountCents;
        }
      }
      setDiscount(Math.round(calculatedDiscount));
    } else {
      setDiscount(0);
    }
  }, [appliedPromoCode, subtotal]);

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const total = subtotal + taxes - discount;

  const [amountPaid, setAmountPaid] = useState(0);

  useEffect(() => {
    if (mode === "create") {
      setAmountPaid(total / 100);
    } else if (mode === "edit" && bookingDetails?.amountPaidCents) {
      setAmountPaid(bookingDetails.amountPaidCents / 100);
    }
  }, [total, mode, bookingDetails]);

  const handleAmountPaidChange = (value: number | null) => {
    setAmountPaid(value || 0);
  };

  const remainingAmount = total / 100 - amountPaid;

  const handleFinalSubmit = () => {
    onSubmit({
      amountPaidCents: Math.round(amountPaid * 100),
      taxAmountCents: Math.round(taxes),
      totalAmountCents: Math.round(total),
    });
  };

  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim() || !bookingDetails?.hotelId) return;
    setIsApplying(true);
    try {
      const validPromoCode = await validatePromoCode(
        bookingDetails.hotelId,
        promoCodeInput,
      );
      onPromoCodeChange(validPromoCode);
      setPromoCodeInput("");
      void message.success("Promo code applied successfully!");
    } catch {
      void message.error("Invalid or expired promo code.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemovePromoCode = () => {
    onPromoCodeChange(null);
  };

  if (mode === "edit" || mode === "checkin") {
    // Simplified view for edit and checkin mode
    return (
      <Card>
        <Title level={4}>
          {mode === "checkin"
            ? "Review and Confirm Check-In"
            : "Review and Confirm Changes"}
        </Title>
        <Row gutter={32}>
          <Col span={24}>
            <Title level={5}>Booking Details</Title>
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Check-in Date">
                {dayjs(checkInDate).format(DATE_FORMAT_API)}
              </Descriptions.Item>
              <Descriptions.Item label="Check-out Date">
                {dayjs(checkOutDate).format(DATE_FORMAT_API)}
              </Descriptions.Item>
              <Descriptions.Item label="Adults">
                {bookingDetails?.numAdults}
              </Descriptions.Item>
              <Descriptions.Item label="Children">
                {bookingDetails?.numChildren}
              </Descriptions.Item>
              {bookingDetails?.status && (
                <Descriptions.Item label="Status">
                  {bookingDetails.status}
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedRooms && selectedRooms.length > 0 && (
              <>
                <Divider />
                <Title level={5}>Selected Rooms</Title>
                <List
                  dataSource={selectedRooms}
                  renderItem={(room) => (
                    <List.Item>
                      <List.Item.Meta
                        title={`Room ${room.roomNumber}`}
                        description={`Floor: ${room.floor || "N/A"} | Status: ${room.status}`}
                      />
                    </List.Item>
                  )}
                />
              </>
            )}

            <Divider />

            <Title level={5}>Customer Details</Title>
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Full Name">
                {customerData?.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {customerData?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {customerData?.phone}
              </Descriptions.Item>
              {customerData?.idType && (
                <Descriptions.Item label="ID Type">
                  {customerData.idType}
                </Descriptions.Item>
              )}
              {customerData?.idNumber && (
                <Descriptions.Item label="ID Number">
                  {customerData.idNumber}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Col>
        </Row>
        <div className="mt-8 flex justify-end gap-4">
          <Button onClick={onBack}>Back</Button>
          <Button
            type="primary"
            onClick={handleFinalSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {mode === "checkin" ? "Check In" : "Save Changes"}
          </Button>
        </div>
      </Card>
    );
  }

  // Full view for create mode
  if (!selectedRooms || !customerData || !roomTypeDetails) {
    return <div>Loading...</div>;
  }

  return (
    <Card title="Review and Submit Booking">
      <Row gutter={32}>
        <Col span={14}>
          <Title level={4}>Booking Summary</Title>
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Room Type">
              {roomTypeDetails.name}
            </Descriptions.Item>
            <Descriptions.Item label="Stay">{`${nights} nights`}</Descriptions.Item>
            <Descriptions.Item label="Rooms">
              {selectedRooms.map((room) => room.roomNumber).join(", ")}
            </Descriptions.Item>
            <Descriptions.Item label="Room Price">
              {`₹${((roomTypeDetails.basePriceCents ?? 0) / 100).toLocaleString()} / night`}
            </Descriptions.Item>
            <Descriptions.Item label="Adults">
              {bookingDetails?.numAdults}
            </Descriptions.Item>
            <Descriptions.Item label="Children">
              {bookingDetails?.numChildren}
            </Descriptions.Item>
            {bookingStatus && (
              <Descriptions.Item label="Booking Status">
                <Tag color={bookingStatus === "CHECKED IN" ? "blue" : "green"}>
                  {bookingStatus}
                </Tag>
              </Descriptions.Item>
            )}
          </Descriptions>

          <Divider />

          <Title level={5}>Add-ons</Title>
          <List
            dataSource={selectedAddons || []}
            renderItem={(item) => {
              const roomTypeAddon = roomTypeDetails.addons?.find(
                (a: any) => a.addonId === item.id,
              );
              return (
                <List.Item>
                  <List.Item.Meta title={item.name} />
                  <div>{`₹${((roomTypeAddon?.priceCents ?? 0) / 100).toLocaleString()}`}</div>
                </List.Item>
              );
            }}
          />

          <Divider />

          <Title level={4}>Customer Details</Title>
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Full Name">
              {customerData.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {customerData.email}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {customerData.phone}
            </Descriptions.Item>
            <Descriptions.Item label="ID Type">
              {customerData.idType}
            </Descriptions.Item>
            <Descriptions.Item label="ID Number">
              {customerData.idNumber}
            </Descriptions.Item>
          </Descriptions>
        </Col>

        <Col span={10}>
          <Card>
            <Title level={4}>Price Details</Title>
            <Descriptions column={1} size="middle">
              <Descriptions.Item label="Room Total">
                <Text>{`₹${(roomTotal / 100).toLocaleString()}`}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Add-ons Total">
                <Text>{`₹${(addOnsTotal / 100).toLocaleString()}`}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Subtotal">
                <Text strong>{`₹${(subtotal / 100).toLocaleString()}`}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Taxes & Fees (18%)">
                <Text>{`₹${(taxes / 100).toLocaleString()}`}</Text>
              </Descriptions.Item>
              {appliedPromoCode && (
                <Descriptions.Item label="Discount">
                  <Text
                    strong
                    style={{ color: "green" }}
                  >{`-₹${(discount / 100).toLocaleString()}`}</Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Total Amount">
                <Title level={3}>{`₹${(total / 100).toLocaleString()}`}</Title>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Form layout="vertical">
              <Form.Item label="Promo Code">
                {!appliedPromoCode ? (
                  <Space.Compact style={{ width: "100%" }}>
                    <Input
                      placeholder="Enter promo code"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      disabled={isApplying}
                    />
                    <Button
                      type="default"
                      onClick={handleApplyPromoCode}
                      loading={isApplying}
                    >
                      Apply
                    </Button>
                  </Space.Compact>
                ) : (
                  <Tag closable onClose={handleRemovePromoCode}>
                    {appliedPromoCode.code}
                  </Tag>
                )}
              </Form.Item>

              <Form.Item
                label="Amount Paid"
                validateStatus={
                  amountPaid > total / 100 || amountPaid < 0 ? "error" : ""
                }
                help={
                  amountPaid > total / 100
                    ? "Amount paid cannot be more than the total amount."
                    : amountPaid < 0
                      ? "Amount paid cannot be negative."
                      : ""
                }
              >
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value ? parseFloat(value.replace(/₹\s?|(,*)/g, "")) || 0 : 0
                  }
                  value={amountPaid}
                  onChange={handleAmountPaidChange}
                />
              </Form.Item>
              <Form.Item label="Remaining Amount">
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value ? parseFloat(value.replace(/₹\s?|(,*)/g, "")) || 0 : 0
                  }
                  value={parseFloat(remainingAmount.toFixed(2))}
                  disabled
                />
              </Form.Item>
            </Form>

            <Divider />

            <Row justify="end">
              <Space>
                <Button onClick={onBack}>Back</Button>
                <Button
                  type="primary"
                  onClick={handleFinalSubmit}
                  loading={isSubmitting}
                  disabled={
                    isSubmitting || amountPaid > total / 100 || amountPaid < 0
                  }
                >
                  Complete Booking
                </Button>
              </Space>
            </Row>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default ReviewAndSubmit;
