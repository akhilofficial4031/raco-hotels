import { InfoCircleOutlined } from "@ant-design/icons";
import { Card, Typography } from "antd";
import React from "react";

const { Paragraph } = Typography;

interface InternalNotesProps {
  notes: string;
}

const InternalNotes: React.FC<InternalNotesProps> = ({ notes }) => {
  if (!notes) return null;

  return (
    <Card
      title={
        <>
          <InfoCircleOutlined /> Internal Notes
        </>
      }
      className="mb-6"
    >
      <Paragraph className="italic">{notes}</Paragraph>
    </Card>
  );
};

export default InternalNotes;
