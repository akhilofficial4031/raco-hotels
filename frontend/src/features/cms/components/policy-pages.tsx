/* eslint-disable no-unused-vars */
import { Card, Col, Form, Row } from "antd";
import Quill from "quill";
import { useEffect, useRef } from "react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import "quill/dist/quill.snow.css";

interface PolicyPagesFormProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
}

function QuillEditor({
  value,
  onChange,
  placeholder,
  label,
}: QuillEditorProps) {
  const quillRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<Quill | null>(null);

  useEffect(() => {
    if (quillRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(quillRef.current, {
        theme: "snow",
        placeholder: placeholder || `Enter ${label.toLowerCase()}...`,
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ align: [] }],
            ["link"],
            ["clean"],
          ],
        },
      });

      // Set initial content
      if (value) {
        quillInstance.current.root.innerHTML = value;
      }

      // Listen for text changes
      quillInstance.current.on("text-change", () => {
        const html = quillInstance.current?.root.innerHTML || "";
        const text = quillInstance.current?.getText().trim() || "";

        // Only pass empty string if there's no actual text content
        // This helps with form validation
        if (text.length === 0) {
          onChange("");
        } else {
          onChange(html);
        }
      });
    }

    return () => {
      if (quillInstance.current) {
        quillInstance.current.off("text-change");
      }
    };
  }, []);

  // Update content when value prop changes
  useEffect(() => {
    if (
      quillInstance.current &&
      value !== quillInstance.current.root.innerHTML
    ) {
      quillInstance.current.root.innerHTML = value || "";
    }
  }, [value]);

  return (
    <div className="quill-editor-wrapper">
      <div ref={quillRef} style={{ minHeight: "200px" }} />
    </div>
  );
}

function PolicyPagesForm({ control, errors }: PolicyPagesFormProps) {
  const policyErrors = errors.policyPages as any;

  return (
    <Card
      title={<span className="text-lg font-semibold">Policy Pages</span>}
      className="shadow-sm border-gray-200"
    >
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Form.Item
            label={
              <span className="font-medium text-base">Privacy Policy</span>
            }
            validateStatus={policyErrors?.privacyPolicy ? "error" : ""}
            help={policyErrors?.privacyPolicy?.message}
          >
            <Controller
              name="policyPages.privacyPolicy"
              control={control}
              render={({ field: { value, onChange } }) => (
                <QuillEditor
                  value={value || ""}
                  onChange={onChange}
                  label="Privacy Policy"
                  placeholder="Enter your privacy policy content..."
                />
              )}
            />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item
            label={
              <span className="font-medium text-base">
                Terms and Conditions
              </span>
            }
            validateStatus={policyErrors?.termsAndConditions ? "error" : ""}
            help={policyErrors?.termsAndConditions?.message}
          >
            <Controller
              name="policyPages.termsAndConditions"
              control={control}
              render={({ field: { value, onChange } }) => (
                <QuillEditor
                  value={value || ""}
                  onChange={onChange}
                  label="Terms and Conditions"
                  placeholder="Enter your terms and conditions content..."
                />
              )}
            />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item
            label={<span className="font-medium text-base">Cookie Policy</span>}
            validateStatus={policyErrors?.cookiePolicy ? "error" : ""}
            help={policyErrors?.cookiePolicy?.message}
          >
            <Controller
              name="policyPages.cookiePolicy"
              control={control}
              render={({ field: { value, onChange } }) => (
                <QuillEditor
                  value={value || ""}
                  onChange={onChange}
                  label="Cookie Policy"
                  placeholder="Enter your cookie policy content..."
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
}

export default PolicyPagesForm;
