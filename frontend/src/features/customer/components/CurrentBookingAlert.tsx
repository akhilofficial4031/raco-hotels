import { HomeOutlined } from "@ant-design/icons";
import { Alert, Typography } from "antd";
import React from "react";

import { type CustomerDetailsResponse } from "../../../shared/services/customer.service";
import {
  APP_LOCALE,
  LOCALE_DATE_OPTIONS_SHORT,
} from "../../../shared/constants/app";

const { Text } = Typography;

interface CurrentBookingAlertProps {
  currentBooking: CustomerDetailsResponse["currentBooking"];
}

const CurrentBookingAlert: React.FC<CurrentBookingAlertProps> = ({
  currentBooking,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      APP_LOCALE,
      LOCALE_DATE_OPTIONS_SHORT,
    );
  };

  if (!currentBooking) return null;

  return (
    <Alert
      message="Currently Checked In"
      description={
        <div>
          <Text strong>Room {currentBooking.room.roomNumber}</Text> at{" "}
          <Text strong>{currentBooking.hotel.name}</Text>
          <Text type="secondary"> (Floor: {currentBooking.room.floor})</Text>
          <br />
          <Text>
            Check-in: {formatDate(currentBooking.checkInDate)} - Check-out:{" "}
            {formatDate(currentBooking.checkOutDate)}
          </Text>
        </div>
      }
      type="success"
      showIcon
      icon={<HomeOutlined />}
      className="mb-6"
    />
  );
};

export default CurrentBookingAlert;
