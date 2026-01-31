import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Form, Input, InputNumber, Modal, Typography, Alert, message } from 'antd'
import { useState, useEffect } from 'react'

import type { Booking, CancelBookingRequest } from '../types/bookings'

const { Text } = Typography

interface CancellationModalProps {
	open: boolean
	booking: Booking | null
	onCancel: () => void
	onConfirm: (data: CancelBookingRequest) => Promise<void>
	loading?: boolean
	isPendingCancellation?: boolean
}

function CancellationModal({
	open,
	booking,
	onCancel,
	onConfirm,
	loading = false,
	isPendingCancellation = false,
}: CancellationModalProps) {
	const [form] = Form.useForm()
	const [refundAmount, setRefundAmount] = useState<number>(0)

	useEffect(() => {
		if (booking && open) {
			const amountPaid = booking.amountPaidCents || 0
			const refundInRupees = amountPaid / 100
			
			// Validate and sanitize the refund amount
			const safeRefundAmount = Number.isFinite(refundInRupees) && refundInRupees >= 0
				? refundInRupees
				: 0

			form.setFieldsValue({
				refundAmountCents: safeRefundAmount,
				cancellationReason: '',
			})
			setRefundAmount(safeRefundAmount)
		}
	}, [booking, open, form])

	const handleOk = async () => {
		try {
			const values = await form.validateFields()
			
			// Additional client-side validation
			if (values.refundAmountCents !== undefined && values.refundAmountCents !== null) {
				if (!Number.isFinite(values.refundAmountCents) || values.refundAmountCents < 0) {
					message.error('Invalid refund amount')
					return
				}
				
				if (values.refundAmountCents > maxRefundRupees) {
					message.error('Refund amount cannot exceed amount paid')
					return
				}
			}

			const data: CancelBookingRequest = {
				refundAmountCents: values.refundAmountCents
					? Math.round(values.refundAmountCents * 100)
					: undefined,
				cancellationReason: values.cancellationReason?.trim()?.substring(0, 500),
			}
			await onConfirm(data)
			form.resetFields()
		} catch (error) {
			console.error('Validation failed:', error)
		}
	}

	const handleCancel = () => {
		form.resetFields()
		onCancel()
	}

	if (!booking) return null

	const amountPaid = booking.amountPaidCents || 0
	const maxRefundRupees = amountPaid / 100
	const totalAmount = booking.totalAmountCents / 100
	const currencySymbol = booking.currencyCode === 'INR' ? '₹' : booking.currencyCode

	const hasPayment = amountPaid > 0

	return (
		<Modal
			title={
				<span>
					<ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
					Cancel Booking
				</span>
			}
			open={open}
			onOk={handleOk}
			onCancel={handleCancel}
			okText="Cancel Booking"
			cancelText="Go Back"
			confirmLoading={loading}
			okButtonProps={{ danger: true }}
			width={600}
		>
			<div style={{ marginBottom: 16 }}>
				<Text strong>Booking Reference: </Text>
				<Text>{booking.referenceCode}</Text>
			</div>

			{isPendingCancellation && (
				<Alert
					message="Customer Cancellation Request"
					description="The customer has requested to cancel this booking through the public cancellation system. Please review and process the refund."
					type="info"
					showIcon
					style={{ marginBottom: 16 }}
				/>
			)}

			<div style={{ marginBottom: 16 }}>
				<Text strong>Total Amount: </Text>
				<Text>
					{currencySymbol}
					{totalAmount.toFixed(2)}
				</Text>
			</div>

			<div style={{ marginBottom: 24 }}>
				<Text strong>Amount Paid: </Text>
				<Text>
					{currencySymbol}
					{maxRefundRupees.toFixed(2)}
				</Text>
			</div>

			{!hasPayment && (
				<Alert
					message="No Payment"
					description="This booking has no payment recorded. No refund will be processed."
					type="info"
					showIcon
					style={{ marginBottom: 16 }}
				/>
			)}

			{hasPayment && (
				<Alert
					message="Refund will be processed"
					description="The specified refund amount will be processed via Razorpay and credited to the customer's original payment method."
					type="warning"
					showIcon
					style={{ marginBottom: 16 }}
				/>
			)}

			<Form form={form} layout="vertical">
				{hasPayment && (
					<Form.Item
						label="Refund Amount"
						name="refundAmountCents"
						rules={[
							{
								type: 'number',
								min: 0,
								max: maxRefundRupees,
								message: `Refund amount must be between 0 and ${currencySymbol}${maxRefundRupees.toFixed(2)}`,
							},
						]}
						extra={`Maximum refundable: ${currencySymbol}${maxRefundRupees.toFixed(2)}`}
					>
						<InputNumber
							style={{ width: '100%' }}
							prefix={currencySymbol}
							min={0}
							max={maxRefundRupees}
							step={0.01}
							precision={2}
							placeholder="Enter refund amount"
							onChange={(value) => setRefundAmount(value || 0)}
						/>
					</Form.Item>
				)}

				<Form.Item
					label="Cancellation Reason (Optional)"
					name="cancellationReason"
				>
					<Input.TextArea
						rows={4}
						placeholder="Enter reason for cancellation"
						maxLength={500}
						showCount
					/>
				</Form.Item>
			</Form>

			{hasPayment && refundAmount > maxRefundRupees && (
				<Alert
					message="Invalid Refund Amount"
					description={`Refund amount cannot exceed the amount paid (${currencySymbol}${maxRefundRupees.toFixed(2)})`}
					type="error"
					showIcon
				/>
			)}
		</Modal>
	)
}

export default CancellationModal
