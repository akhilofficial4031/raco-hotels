/* eslint-disable no-unused-vars */

import {
  Alert,
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

import { DATE_FORMAT_API, TAX_RATES } from "@shared/constants/app";

import { type AddonInBooking } from "../../addon/types/addon";
import { validatePromoCode } from "../../promo-code/services/promoCodeService";
import { type PromoCode } from "../../promo-code/types/promoCode";
import { type RoomTypeWithRelations } from "../../room-type/types/roomType";
import { type BookingRoomTypeRooms } from "../../rooms/types/rooms";
import { type CustomerData } from "../types/schemas";

const { Title, Text } = Typography;

// Utility function to get effective room price (offer price if valid, otherwise base price)
const getEffectiveRoomPrice = (roomTypeDetails: any): number => {
  if (
    roomTypeDetails &&
    roomTypeDetails.offerPrice &&
    roomTypeDetails.offerPrice > 0 &&
    roomTypeDetails.offerStartDate &&
    roomTypeDetails.offerEndDate
  ) {
    try {
      // Use date-only comparison (ignore time component)
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      const offerStart = new Date(roomTypeDetails.offerStartDate);
      offerStart.setHours(0, 0, 0, 0);

      const offerEnd = new Date(roomTypeDetails.offerEndDate);
      offerEnd.setHours(23, 59, 59, 999);

      // Validate dates and check if current date is within offer period (inclusive)
      if (!isNaN(offerStart.getTime()) && !isNaN(offerEnd.getTime())) {
        if (currentDate >= offerStart && currentDate <= offerEnd) {
          return roomTypeDetails.offerPrice;
        }
      }
    } catch (error) {
      console.error("Error parsing offer dates:", error);
    }
  }

  // Fall back to base price
  return roomTypeDetails?.basePriceCents ?? 0;
};

interface BookingData {
  bookingDetails?: {
    hotelId?: number;
    roomTypeId?: number;
    numAdults: number;
    numChildren: number;
    childrenAges?: { age: number | undefined }[];
    numRooms?: number;
    dateRange?: any;
    checkInDate?: any;
    checkOutDate?: any;
    status?: string;
    amountPaidCents?: number;
  };
  selectedRooms?: BookingRoomTypeRooms[];
  selectedAddons?: AddonInBooking[];
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

  // Calculate pricing for both create and edit modes using effective price
  const effectivePrice =
    (mode === "create" || mode === "edit") && roomTypeDetails
      ? getEffectiveRoomPrice(roomTypeDetails)
      : 0;

  // Resolve room count: prefer explicitly selected rooms, fall back to form input
  const numRooms =
    (selectedRooms?.length ?? 0) > 0
      ? (selectedRooms?.length ?? 0)
      : (bookingDetails?.numRooms ?? 0);

  const roomTotal =
    (mode === "create" || mode === "edit") && roomTypeDetails
      ? effectivePrice * nights * numRooms
      : 0;

  const addOnsTotal =
    (mode === "create" || mode === "edit") && selectedAddons && roomTypeDetails
      ? (selectedAddons || []).reduce((total, addon) => {
        const roomTypeAddon = roomTypeDetails.addons?.find(
          (a: any) => a.addonId === addon.id,
        );
        return total + (roomTypeAddon?.priceCents ?? 0);
      }, 0)
      : 0;

  const subtotal = roomTotal + addOnsTotal;

  // Occupancy policy — children strictly over 10 count as adults
  const numAdults = bookingDetails?.numAdults ?? 0;
  const numChildren = bookingDetails?.numChildren ?? 0;
  const childrenAgesList = bookingDetails?.childrenAges ?? [];
  const childrenOver10 = childrenAgesList.filter(
    (c) => (c.age ?? 0) > 10,
  ).length;
  const childrenUnder10 = numChildren - childrenOver10;
  const effectiveAdults = numAdults + childrenOver10;

  const maxOccupancy = roomTypeDetails?.maxOccupancy ?? 0;
  const maxStandard = maxOccupancy * numRooms;
  const maxWithExtra = maxStandard + numRooms;
  const extraAdults = Math.max(0, effectiveAdults - maxStandard);
  const isOccupancyBlocked = effectiveAdults > maxWithExtra;
  const hasExtraAdult = extraAdults > 0 && !isOccupancyBlocked;

  const extraAdultChargeCents = hasExtraAdult
    ? extraAdults * (roomTypeDetails?.extraAdultChargeCents ?? 100000)
    : 0;
  const extraAdultTaxCents = Math.round(
    extraAdultChargeCents * TAX_RATES.EXTRA_ADULT_TAX,
  );

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
      // Ensure discount doesn't exceed subtotal
      calculatedDiscount = Math.min(calculatedDiscount, subtotal);
      setDiscount(Math.round(calculatedDiscount));
    } else {
      setDiscount(0);
    }
  }, [appliedPromoCode, subtotal]);

  // Apply discount to subtotal, calculate room tax, then add extra adult charge + tax
  const subtotalAfterDiscount = Math.max(0, subtotal - discount);
  const roomTax = subtotalAfterDiscount * TAX_RATES.ROOM_TAX;
  const taxes = roomTax + extraAdultTaxCents;
  const total = subtotalAfterDiscount + taxes + extraAdultChargeCents;

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const [amountPaid, setAmountPaid] = useState(0);

  useEffect(() => {
    if (mode === "create") {
      setAmountPaid(total / 100);
    } else if (mode === "edit" && bookingDetails?.amountPaidCents) {
      // For edit mode, keep the existing amount paid initially
      setAmountPaid(bookingDetails.amountPaidCents / 100);
    }
  }, [mode, bookingDetails]); // Removed total dependency for edit mode to prevent auto-updating amount paid

  const handleAmountPaidChange = (value: number | null) => {
    setAmountPaid(value || 0);
  };

  const remainingAmount = total / 100 - amountPaid;

  const handleFinalSubmit = () => {
    if (isOccupancyBlocked) return;
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

  if (mode === "checkin") {
    // Simplified view for checkin mode
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
                {childrenOver10 > 0 && (
                  <Text
                    type="secondary"
                    style={{ marginLeft: 8, fontSize: 12 }}
                  >
                    ({childrenOver10} over 10, counted as adults)
                  </Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Effective Adults">
                <Text strong>{effectiveAdults}</Text>
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

  // Full view for create and edit modes
  if (!selectedRooms || !customerData || !roomTypeDetails) {
    return <div>Loading...</div>;
  }

  return (
    <Card
      title={
        mode === "edit"
          ? "Review and Update Booking"
          : "Review and Submit Booking"
      }
    >
      <Row gutter={32}>
        <Col span={14}>
          <Title level={4}>Booking Summary</Title>
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Room Type">
              {roomTypeDetails.name}
            </Descriptions.Item>
            <Descriptions.Item label="Stay">{`${nights} nights`}</Descriptions.Item>
            <Descriptions.Item label="Number of Rooms">
              <Text strong>{numRooms}</Text>
              {selectedRooms.length > 0 && (
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  ({selectedRooms.map((room) => room.roomNumber).join(", ")})
                </Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Max Occupancy per Room">
              {maxOccupancy} {maxOccupancy === 1 ? "adult" : "adults"}
            </Descriptions.Item>
            <Descriptions.Item label="Room Price">
              {(() => {
                const displayPrice = getEffectiveRoomPrice(roomTypeDetails);
                const isOfferPrice =
                  displayPrice !== (roomTypeDetails.basePriceCents ?? 0);
                return (
                  <span>
                    {isOfferPrice && (
                      <span
                        style={{
                          textDecoration: "line-through",
                          marginRight: 8,
                          color: "#999",
                        }}
                      >
                        ₹
                        {(
                          (roomTypeDetails.basePriceCents ?? 0) / 100
                        ).toLocaleString()}
                      </span>
                    )}
                    <span
                      style={{
                        color: isOfferPrice ? "#52c41a" : "inherit",
                        fontWeight: isOfferPrice ? "bold" : "normal",
                      }}
                    >
                      ₹{(displayPrice / 100).toLocaleString()} / night
                    </span>
                    {isOfferPrice && (
                      <Tag color="green" style={{ marginLeft: 8 }}>
                        OFFER
                      </Tag>
                    )}
                  </span>
                );
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Adults (from form)">
              <Text>{numAdults}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Children (total)">
              <Text>{numChildren}</Text>
              {numChildren > 0 && (
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                  (age ≤ 10: {childrenUnder10} free &nbsp;|&nbsp; age &gt; 10:{" "}
                  {childrenOver10} count as adults)
                </Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Effective Adults (for occupancy)">
              <Text strong style={{ color: "#1677ff" }}>
                {effectiveAdults}
              </Text>
              {childrenOver10 > 0 && (
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                  ({numAdults} adults + {childrenOver10} child
                  {childrenOver10 > 1 ? "ren" : ""} over 10)
                </Text>
              )}
            </Descriptions.Item>
            {hasExtraAdult && !isOccupancyBlocked && (
              <Descriptions.Item label="Extra Persons in Room">
                <Tag color="orange">
                  {extraAdults} extra adult{extraAdults > 1 ? "s" : ""}{" "}
                  (charged)
                </Tag>
              </Descriptions.Item>
            )}
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
          {isOccupancyBlocked && (
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              message="Maximum occupancy exceeded"
              description={`${effectiveAdults} effective adults cannot be accommodated in ${numRooms} room(s) even with extra adult allowance (max ${maxOccupancy + 1} per room). Please add more rooms.`}
            />
          )}

          {hasExtraAdult && !isOccupancyBlocked && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16, marginTop: 38 }}
              message={`Extra adult charge applies (${extraAdults} extra adult${extraAdults > 1 ? "s" : ""})`}
              description={`₹${(extraAdultChargeCents / 100).toLocaleString()} extra adult charge + ${TAX_RATES.EXTRA_ADULT_TAX * 100}% tax (₹${(extraAdultTaxCents / 100).toLocaleString()}) will be added.`}
            />
          )}

          <Card>
            <Title level={4}>Price Details</Title>
            <Descriptions column={1} size="middle">
              <Descriptions.Item
                label={
                  <Text type="secondary">
                    {`Room Charge (₹${(effectivePrice / 100).toLocaleString()} × ${nights} nights × ${numRooms} room${numRooms > 1 ? "s" : ""})`}
                  </Text>
                }
              >
                <Text>{`₹${(roomTotal / 100).toLocaleString()}`}</Text>
              </Descriptions.Item>
              {addOnsTotal > 0 && (
                <Descriptions.Item label="Add-ons Total">
                  <Text>{`₹${(addOnsTotal / 100).toLocaleString()}`}</Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Subtotal">
                <Text strong>{`₹${(subtotal / 100).toLocaleString()}`}</Text>
              </Descriptions.Item>
              {appliedPromoCode && (
                <Descriptions.Item
                  label={
                    <Text style={{ color: "green" }}>
                      Promo Discount ({appliedPromoCode.code})
                    </Text>
                  }
                >
                  <Text
                    strong
                    style={{ color: "green" }}
                  >{`-₹${(discount / 100).toLocaleString()}`}</Text>
                </Descriptions.Item>
              )}
              {appliedPromoCode && (
                <Descriptions.Item label="Subtotal After Discount">
                  <Text
                    strong
                  >{`₹${(subtotalAfterDiscount / 100).toLocaleString()}`}</Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item
                label={`Room Tax (${TAX_RATES.ROOM_TAX * 100}%)`}
              >
                <Text>{`₹${(roomTax / 100).toLocaleString()}`}</Text>
              </Descriptions.Item>
              {hasExtraAdult && (
                <>
                  <Descriptions.Item
                    label={
                      <Text type="secondary">
                        {`Extra Adult Charge (${extraAdults} adult${extraAdults > 1 ? "s" : ""} × ₹${((roomTypeDetails?.extraAdultChargeCents ?? 100000) / 100).toLocaleString()})`}
                      </Text>
                    }
                  >
                    <Text
                      style={{ color: "#fa8c16" }}
                    >{`₹${(extraAdultChargeCents / 100).toLocaleString()}`}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={`Extra Adult Tax (${TAX_RATES.EXTRA_ADULT_TAX * 100}%)`}
                  >
                    <Text
                      style={{ color: "#fa8c16" }}
                    >{`₹${(extraAdultTaxCents / 100).toLocaleString()}`}</Text>
                  </Descriptions.Item>
                </>
              )}
              <Descriptions.Item label={<Text strong>Total Amount</Text>}>
                <Title
                  level={3}
                  style={{ margin: 0 }}
                >{`₹${(total / 100).toLocaleString()}`}</Title>
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
                    isSubmitting ||
                    isOccupancyBlocked ||
                    amountPaid > total / 100 ||
                    amountPaid < 0
                  }
                >
                  {mode === "edit" ? "Update Booking" : "Complete Booking"}
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
