import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Clock,
	AlertTriangle,
	CheckCircle,
	XCircle,
	Package,
	User,
	Calendar,
	AlertCircle
} from "lucide-react";
import { usePartsManagement } from "@/hooks/use-parts-management";

interface ReservationStatusModalProps {
	isOpen: boolean;
	onClose: () => void;
	repairId?: string;
	onReservationUpdate?: () => void;
}

export function ReservationStatusModal({
	isOpen,
	onClose,
	repairId,
	onReservationUpdate
}: ReservationStatusModalProps) {
	const [reservations, setReservations] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [processingReservation, setProcessingReservation] = useState<string | null>(null);

	const {
		getRepairReservations,
		getActiveReservations,
		confirmPartsReservation,
		cancelPartsReservation
	} = usePartsManagement();

	// Load reservations when modal opens
	useEffect(() => {
		if (isOpen) {
			loadReservations();
		}
	}, [isOpen]);

	const loadReservations = async () => {
		try {
			setLoading(true);
			let data;

			if (repairId) {
				// Load reservations for specific repair
				data = await getRepairReservations(repairId);
			} else {
				// Load all active reservations
				data = await getActiveReservations();
			}

			setReservations(data || []);
		} catch (error) {
			console.error("Error loading reservations:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleConfirmReservation = async (reservationId: string) => {
		try {
			setProcessingReservation(reservationId);
			await confirmPartsReservation(reservationId, "current-user-id"); // TODO: Get real user ID

			// Reload reservations
			await loadReservations();

			if (onReservationUpdate) {
				onReservationUpdate();
			}
		} catch (error) {
			console.error("Error confirming reservation:", error);
		} finally {
			setProcessingReservation(null);
		}
	};

	const handleCancelReservation = async (reservationId: string) => {
		try {
			setProcessingReservation(reservationId);
			await cancelPartsReservation(reservationId, "current-user-id"); // TODO: Get real user ID

			// Reload reservations
			await loadReservations();

			if (onReservationUpdate) {
				onReservationUpdate();
			}
		} catch (error) {
			console.error("Error cancelling reservation:", error);
		} finally {
			setProcessingReservation(null);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'active':
				return <Badge variant="default" className="bg-blue-100 text-blue-800">Đang đặt trước</Badge>;
			case 'confirmed':
				return <Badge variant="default" className="bg-green-100 text-green-800">Đã xác nhận</Badge>;
			case 'cancelled':
				return <Badge variant="destructive">Đã hủy</Badge>;
			case 'expired':
				return <Badge variant="outline" className="text-orange-600">Đã hết hạn</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const isExpired = (expiresAt: string) => {
		return new Date(expiresAt) < new Date();
	};

	const formatDateTime = (dateString: string) => {
		return new Date(dateString).toLocaleString("vi-VN", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});
	};

	const getTimeRemaining = (expiresAt: string) => {
		const now = new Date();
		const expires = new Date(expiresAt);
		const diff = expires.getTime() - now.getTime();

		if (diff <= 0) return "Đã hết hạn";

		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

		if (hours > 0) {
			return `${hours} giờ ${minutes} phút`;
		} else {
			return `${minutes} phút`;
		}
	};

	if (loading) {
		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Package className="h-5 w-5" />
							Trạng thái đặt trước linh kiện
						</DialogTitle>
					</DialogHeader>
					<div className="flex items-center justify-center py-8">
						<div className="text-muted-foreground">Đang tải...</div>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Package className="h-5 w-5" />
						{repairId ? "Linh kiện đặt trước cho sửa chữa" : "Tất cả linh kiện đặt trước"}
					</DialogTitle>
					<DialogDescription>
						Quản lý trạng thái đặt trước linh kiện và xác nhận sử dụng
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{reservations.length === 0 ? (
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								{repairId
									? "Không có linh kiện nào được đặt trước cho sửa chữa này."
									: "Hiện tại không có linh kiện nào được đặt trước."
								}
							</AlertDescription>
						</Alert>
					) : (
						<div className="grid gap-4">
							{reservations.map((reservation) => (
								<Card key={reservation.id} className={`${isExpired(reservation.expires_at) ? 'border-orange-200 bg-orange-50' : ''}`}>
									<CardHeader className="pb-3">
										<div className="flex items-center justify-between">
											<CardTitle className="text-lg flex items-center gap-2">
												<Package className="h-4 w-4" />
												{reservation.part?.name || 'Linh kiện không xác định'}
											</CardTitle>
											{getStatusBadge(reservation.status)}
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										{/* Part Information */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<div className="text-sm text-muted-foreground">Mã linh kiện</div>
												<div className="font-medium">{reservation.part?.part_number || 'N/A'}</div>
											</div>
											<div>
												<div className="text-sm text-muted-foreground">Số lượng đặt trước</div>
												<div className="font-medium">{reservation.quantity_reserved} cái</div>
											</div>
										</div>

										<Separator />

										{/* Reservation Details */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="flex items-center gap-2">
												<User className="h-4 w-4 text-muted-foreground" />
												<div>
													<div className="text-sm text-muted-foreground">Được đặt bởi</div>
													<div className="font-medium">{reservation.reserved_by_user?.full_name || 'Không xác định'}</div>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Calendar className="h-4 w-4 text-muted-foreground" />
												<div>
													<div className="text-sm text-muted-foreground">Thời gian đặt</div>
													<div className="font-medium">{formatDateTime(reservation.reserved_at)}</div>
												</div>
											</div>
										</div>

										{/* Expiration Info */}
										<div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
											<Clock className="h-4 w-4 text-muted-foreground" />
											<div className="flex-1">
												<div className="text-sm text-muted-foreground">Hết hạn lúc</div>
												<div className="font-medium">{formatDateTime(reservation.expires_at)}</div>
											</div>
											<div className="text-right">
												<div className="text-sm text-muted-foreground">Thời gian còn lại</div>
												<div className={`font-medium ${isExpired(reservation.expires_at) ? 'text-red-600' : 'text-green-600'}`}>
													{getTimeRemaining(reservation.expires_at)}
												</div>
											</div>
										</div>

										{/* Expiration Warning */}
										{isExpired(reservation.expires_at) && (
											<Alert variant="destructive">
												<AlertTriangle className="h-4 w-4" />
												<AlertDescription>
													Đặt trước này đã hết hạn. Linh kiện sẽ được giải phóng để sử dụng cho các sửa chữa khác.
												</AlertDescription>
											</Alert>
										)}

										{/* Notes */}
										{reservation.notes && (
											<div>
												<div className="text-sm text-muted-foreground">Ghi chú</div>
												<div className="text-sm p-2 bg-muted rounded">{reservation.notes}</div>
											</div>
										)}

										{/* Action Buttons */}
										{reservation.status === 'active' && !isExpired(reservation.expires_at) && (
											<div className="flex gap-2 pt-2">
												<Button
													onClick={() => handleConfirmReservation(reservation.id)}
													disabled={processingReservation === reservation.id}
													className="flex-1"
												>
													<CheckCircle className="h-4 w-4 mr-2" />
													{processingReservation === reservation.id ? "Đang xác nhận..." : "Xác nhận sử dụng"}
												</Button>
												<Button
													variant="outline"
													onClick={() => handleCancelReservation(reservation.id)}
													disabled={processingReservation === reservation.id}
													className="flex-1"
												>
													<XCircle className="h-4 w-4 mr-2" />
													{processingReservation === reservation.id ? "Đang hủy..." : "Hủy đặt trước"}
												</Button>
											</div>
										)}
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Đóng
					</Button>
					<Button onClick={loadReservations} disabled={loading}>
						<Package className="h-4 w-4 mr-2" />
						Làm mới
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}