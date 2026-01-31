import { EyeOutlined } from '@ant-design/icons'
import { Button, Table, Tag, Alert, message, Card, Typography } from 'antd'
import { type ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import useSWR from 'swr'

import { APP_LOCALE } from '@shared/constants/app'
import { fetcher } from '@utils/swrFetcher'

import CancellationModal from '../components/CancellationModal'
import { type Booking, type CancelBookingRequest } from '../types/bookings'

const { Title } = Typography

interface PendingCancellationsResponse {
	success: boolean
	data: {
		bookings: Booking[]
		pagination: {
			page: number
			limit: number
			total: number
			totalPages: number
			hasNext: boolean
			hasPrev: boolean
		}
	}
}

function PendingCancellations() {
	const navigate = useNavigate()
	const [page, setPage] = useState(1)
	const [cancellationModalOpen, setCancellationModalOpen] = useState(false)
	const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
	const [cancelLoading, setCancelLoading] = useState(false)

	const { data: response, isLoading, mutate: mutateList } = useSWR<PendingCancellationsResponse>(
		`/bookings?status=pending_cancellation&page=${page}&limit=20`,
		fetcher,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		}
	)

	const bookings = response?.data?.bookings || []
	const pagination = response?.data?.pagination

	const handleProcessCancellation = (booking: Booking) => {
		setSelectedBooking(booking)
		setCancellationModalOpen(true)
	}

	const handleCancelConfirm = async (data: CancelBookingRequest) => {
		if (!selectedBooking) return

		try {
			setCancelLoading(true)
			const response = await fetch(`/api/bookings/${selectedBooking.id}/cancel`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			})

			if (!response.ok) {
				throw new Error('Failed to process cancellation')
			}

			message.success(
				data.refundAmountCents
					? 'Booking cancelled and refund processed successfully'
					: 'Booking cancelled successfully'
			)
			setCancellationModalOpen(false)
			setSelectedBooking(null)
			mutateList()
		} catch (err) {
			message.error((err as Error).message || 'Failed to process cancellation. Please try again.')
		} finally {
			setCancelLoading(false)
		}
	}

	const columns: ColumnsType<Booking> = [
		{
			title: 'Booking Reference',
			dataIndex: 'referenceCode',
			key: 'referenceCode',
			render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
		},
		{
			title: 'Customer',
			dataIndex: 'customerName',
			key: 'customerName',
		},
		{
			title: 'Hotel',
			dataIndex: 'hotelName',
			key: 'hotelName',
		},
		{
			title: 'Check-in',
			dataIndex: 'checkInDate',
			key: 'checkInDate',
			render: (date: string) => new Date(date).toLocaleDateString(APP_LOCALE),
		},
		{
			title: 'Check-out',
			dataIndex: 'checkOutDate',
			key: 'checkOutDate',
			render: (date: string) => new Date(date).toLocaleDateString(APP_LOCALE),
		},
		{
			title: 'Amount Paid',
			dataIndex: 'amountPaidCents',
			key: 'amountPaidCents',
			render: (amount: number, record: Booking) =>
				new Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: record.currencyCode,
				}).format(amount / 100),
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => <Tag color="orange">{status.toUpperCase()}</Tag>,
		},
		{
			title: 'Actions',
			key: 'actions',
			render: (_: any, record: Booking) => (
				<div style={{ display: 'flex', gap: 8 }}>
					<Button
						type="primary"
						icon={<EyeOutlined />}
						onClick={() => navigate(`/bookings/${record.id}`)}
					>
						View
					</Button>
					<Button onClick={() => handleProcessCancellation(record)}>Process</Button>
				</div>
			),
		},
	]

	return (
		<div>
			<Card>
				<div style={{ marginBottom: 16 }}>
					<Title level={4}>Pending Cancellations</Title>
					{pagination && pagination.total > 0 && (
						<Alert
							message={`${pagination.total} booking(s) pending cancellation approval`}
							type="warning"
							showIcon
							style={{ marginTop: 16 }}
						/>
					)}
				</div>

				<Table
					columns={columns}
					dataSource={bookings}
					rowKey="id"
					loading={isLoading}
					pagination={{
						current: page,
						pageSize: 20,
						total: pagination?.total || 0,
						onChange: setPage,
						showSizeChanger: false,
						showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
					}}
				/>
			</Card>

			{selectedBooking && (
				<CancellationModal
					open={cancellationModalOpen}
					booking={selectedBooking}
					onCancel={() => {
						setCancellationModalOpen(false)
						setSelectedBooking(null)
					}}
					onConfirm={handleCancelConfirm}
					loading={cancelLoading}
					isPendingCancellation={true}
				/>
			)}
		</div>
	)
}

export default PendingCancellations
