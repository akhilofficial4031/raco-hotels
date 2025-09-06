import { Button, Form, Input, InputNumber, Modal } from "antd";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

const generateRoomsSchema = z.object({
  prefix: z.string().optional(),
  start: z.number().min(1, "Start number must be at least 1"),
  end: z.number().min(1, "End number must be at least 1"),
  suffix: z.string().optional(),
  exclude: z.string().optional(),
});

interface IGenerateRoomsForm {
  prefix?: string;
  start: number;
  end: number;
  suffix?: string;
  exclude?: string;
}

interface GenerateRoomsModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (roomNumbers: string[]) => void;
}

function GenerateRoomsModal({
  open,
  onClose,
  onGenerate,
}: GenerateRoomsModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IGenerateRoomsForm>({
    resolver: zodResolver(generateRoomsSchema),
    defaultValues: {
      prefix: "",
      start: 1,
      end: 10,
      suffix: "",
      exclude: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const handleGenerate = (data: IGenerateRoomsForm) => {
    const { prefix, start, end, suffix, exclude } = data;
    const excludedNumbers =
      exclude
        ?.split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n)) || [];

    const roomNumbers: string[] = [];
    for (let i = start; i <= end; i++) {
      if (!excludedNumbers.includes(i)) {
        roomNumbers.push(`${prefix || ""}${i}${suffix || ""}`);
      }
    }
    onGenerate(roomNumbers);
    onClose();
  };

  return (
    <Modal
      title="Generate Room Numbers"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit(handleGenerate)}
        >
          Generate
        </Button>,
      ]}
    >
      <Form layout="vertical" onFinish={handleSubmit(handleGenerate)}>
        <Form.Item label="Prefix" help={errors.prefix?.message}>
          <Controller
            name="prefix"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </Form.Item>
        <div className="flex gap-4">
          <Form.Item
            label="Start Number"
            required
            help={errors.start?.message}
            className="flex-1"
          >
            <Controller
              name="start"
              control={control}
              render={({ field }) => (
                <InputNumber {...field} className="w-full" />
              )}
            />
          </Form.Item>
          <Form.Item
            label="End Number"
            required
            help={errors.end?.message}
            className="flex-1"
          >
            <Controller
              name="end"
              control={control}
              render={({ field }) => (
                <InputNumber {...field} className="w-full" />
              )}
            />
          </Form.Item>
        </div>
        <Form.Item label="Suffix" help={errors.suffix?.message}>
          <Controller
            name="suffix"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </Form.Item>
        <Form.Item
          label="Exclude Numbers (comma-separated)"
          help={errors.exclude?.message}
        >
          <Controller
            name="exclude"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default GenerateRoomsModal;
