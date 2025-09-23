import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
	FileText,
	Send,
	Download,
	Eye,
	Clock,
	CheckCircle,
	XCircle,
	AlertCircle,
	Calendar,
	DollarSign,
	Printer,
	Mail
} from "lucide-react";
import { useCostTracking, type CustomerQuote, type CostSummary } from "@/hooks/use-cost-tracking";
import { formatVND, formatVNDDetailed } from "@/lib/currency";

interface QuoteGenerationModalProps {
	isOpen: boolean;
	onClose: () => void;
	repairId?: string;
	onQuoteUpdate?: () => void;
}

export function QuoteGenerationModal({
	isOpen,
	onClose,
	repairId,
	onQuoteUpdate
}: QuoteGenerationModalProps) {
	const [quotes, setQuotes] = useState<CustomerQuote[]>([]);
	const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
	const [loading, setLoading] = useState(false);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [createForm, setCreateForm] = useState({
		terms_conditions: 'Báo giá có hiệu lực trong 30 ngày. Giá không bao gồm VAT.\nThời gian thực hiện: 3-5 ngày làm việc.\nQuy định thanh toán: 50% trước khi thực hiện, 50% khi hoàn thành.',
		valid_days: 30,
		notes: '',
		discount_amount: 0,
		tax_amount: 0
	});

	const {
		calculateRepairCosts,
		generateCustomerQuote,
		getCustomerQuotes,
		updateQuoteStatus
	} = useCostTracking();

	// Load quotes when modal opens
	useEffect(() => {
		if (isOpen && repairId) {
			loadQuotes();
		}
	}, [isOpen, repairId]);

	const loadQuotes = async () => {
		if (!repairId) return;

		try {
			setLoading(true);

			// Load existing quotes
			const quotesData = await getCustomerQuotes(repairId);
			setQuotes(quotesData);

			// Load cost summary for quote generation
			const summary = await calculateRepairCosts(repairId);
			setCostSummary(summary);
		} catch (error) {
			console.error('Error loading quotes:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateQuote = async () => {
		if (!repairId) return;

		try {
			setLoading(true);

			const quoteId = await generateCustomerQuote(
				repairId,
				'current-user-id', // TODO: Get real user ID
				createForm.terms_conditions,
				createForm.valid_days
			);

			if (quoteId) {
				// Reload quotes
				await loadQuotes();

				// Reset form
				setCreateForm({
					terms_conditions: 'Báo giá có hiệu lực trong 30 ngày. Giá không bao gồm VAT.\nThời gian thực hiện: 3-5 ngày làm việc.\nQuy định thanh toán: 50% trước khi thực hiện, 50% khi hoàn thành.',
					valid_days: 30,
					notes: '',
					discount_amount: 0,
					tax_amount: 0
				});

				setShowCreateForm(false);

				if (onQuoteUpdate) {
					onQuoteUpdate();
				}
			}
		} catch (error) {
			console.error('Error creating quote:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateQuoteStatus = async (quoteId: string, status: CustomerQuote['status'], customerResponse?: string) => {
		try {
			setLoading(true);

			const success = await updateQuoteStatus(quoteId, status, customerResponse);
			if (success) {
				// Reload quotes
				await loadQuotes();

				if (onQuoteUpdate) {
					onQuoteUpdate();
				}
			}
		} catch (error) {
			console.error('Error updating quote status:', error);
		} finally {
			setLoading(false);
		}
	};

	const getStatusBadge = (status: CustomerQuote['status']) => {
		const badges = {
			draft: <Badge variant="outline" className="text-gray-600">Nháp</Badge>,
			sent: <Badge variant="default" className="bg-blue-100 text-blue-800">Đã gửi</Badge>,
			approved: <Badge variant="default" className="bg-green-100 text-green-800">Đã duyệt</Badge>,
			rejected: <Badge variant="destructive">Từ chối</Badge>,
			expired: <Badge variant="outline" className="text-orange-600">Hết hạn</Badge>
		};

		return badges[status] || <Badge variant="outline">{status}</Badge>;
	};

	const getStatusIcon = (status: CustomerQuote['status']) => {
		switch (status) {
			case 'draft':
				return <FileText className="h-4 w-4" />;
			case 'sent':
				return <Send className="h-4 w-4" />;
			case 'approved':
				return <CheckCircle className="h-4 w-4" />;
			case 'rejected':
				return <XCircle className="h-4 w-4" />;
			case 'expired':
				return <Clock className="h-4 w-4" />;
			default:
				return <FileText className="h-4 w-4" />;
		}
	};

	const isExpired = (validUntil?: string) => {
		if (!validUntil) return false;
		return new Date(validUntil) < new Date();
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

	const getTimeRemaining = (validUntil?: string) => {
		if (!validUntil) return null;

		const now = new Date();
		const expires = new Date(validUntil);
		const diff = expires.getTime() - now.getTime();

		if (diff <= 0) return "Đã hết hạn";

		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

		if (days > 0) {
			return `${days} ngày ${hours} giờ`;
		} else {
			return `${hours} giờ`;
		}
	};

	if (loading && quotes.length === 0) {
		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							Quản lý báo giá
						</DialogTitle>
					</DialogHeader>
					<div className="flex items-center justify-center py-8">
						<div className="text-muted-foreground">Đang tải báo giá...</div>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Quản lý báo giá khách hàng
					</DialogTitle>
					<DialogDescription>
						Tạo và quản lý báo giá cho phiếu sửa chữa này
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Cost Summary for Quote */}
					{costSummary && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<DollarSign className="h-4 w-4" />
									Chi phí cho báo giá
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="text-center p-4 bg-muted rounded-lg">
										<div className="text-sm text-muted-foreground">Chi phí linh kiện</div>
										<div className="text-lg font-semibold">{formatVNDDetailed(costSummary.parts_revenue)}</div>
									</div>
									<div className="text-center p-4 bg-muted rounded-lg">
										<div className="text-sm text-muted-foreground">Chi phí công</div>
										<div className="text-lg font-semibold">{formatVNDDetailed(costSummary.labor_revenue)}</div>
									</div>
									<div className="text-center p-4 bg-muted rounded-lg">
										<div className="text-sm text-muted-foreground">Tổng báo giá</div>
										<div className="text-lg font-semibold text-green-600">
											{formatVNDDetailed(costSummary.parts_revenue + costSummary.labor_revenue)}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Create Quote Form */}
					{showCreateForm && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FileText className="h-4 w-4" />
									Tạo báo giá mới
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label htmlFor="valid_days">Hiệu lực (số ngày)</Label>
										<Input
											id="valid_days"
											type="number"
											min="1"
											max="365"
											value={createForm.valid_days}
											onChange={(e) => setCreateForm(prev => ({ ...prev, valid_days: parseInt(e.target.value) || 30 }))}
										/>
									</div>
									<div>
										<Label htmlFor="discount_amount">Giảm giá (₫)</Label>
										<Input
											id="discount_amount"
											type="number"
											min="0"
											value={createForm.discount_amount}
											onChange={(e) => setCreateForm(prev => ({ ...prev, discount_amount: parseFloat(e.target.value) || 0 }))}
										/>
									</div>
								</div>

								<div>
									<Label htmlFor="terms_conditions">Điều khoản và điều kiện</Label>
									<Textarea
										id="terms_conditions"
										value={createForm.terms_conditions}
										onChange={(e) => setCreateForm(prev => ({ ...prev, terms_conditions: e.target.value }))}
										rows={4}
										placeholder="Điều khoản và điều kiện của báo giá..."
									/>
								</div>

								<div>
									<Label htmlFor="notes">Ghi chú thêm (tùy chọn)</Label>
									<Textarea
										id="notes"
										value={createForm.notes}
										onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
										rows={2}
										placeholder="Ghi chú thêm cho báo giá..."
									/>
								</div>

								{/* Quote Preview */}
								{costSummary && (
									<div className="p-4 bg-muted rounded-lg">
										<div className="text-sm text-muted-foreground mb-2">Xem trước báo giá:</div>
										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span>Linh kiện:</span>
												<span>{formatVND(costSummary.parts_revenue)}</span>
											</div>
											<div className="flex justify-between">
												<span>Công lao động:</span>
												<span>{formatVND(costSummary.labor_revenue)}</span>
											</div>
											<div className="flex justify-between">
												<span>Tạm tính:</span>
												<span>{formatVND(costSummary.parts_revenue + costSummary.labor_revenue)}</span>
											</div>
											{createForm.discount_amount > 0 && (
												<div className="flex justify-between text-red-600">
													<span>Giảm giá:</span>
													<span>-{formatVND(createForm.discount_amount)}</span>
												</div>
											)}
											<Separator />
											<div className="flex justify-between font-semibold">
												<span>Tổng cộng:</span>
												<span>{formatVND(costSummary.parts_revenue + costSummary.labor_revenue - createForm.discount_amount)}</span>
											</div>
											<div className="text-xs text-muted-foreground">
												Hiệu lực đến: {new Date(Date.now() + createForm.valid_days * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}
											</div>
										</div>
									</div>
								)}

								<div className="flex gap-2 justify-end">
									<Button variant="outline" onClick={() => setShowCreateForm(false)} disabled={loading}>
										Hủy
									</Button>
									<Button
										onClick={handleCreateQuote}
										disabled={loading || !createForm.terms_conditions}
									>
										{loading ? 'Đang tạo...' : 'Tạo báo giá'}
									</Button>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Existing Quotes */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold">Báo giá đã tạo ({quotes.length})</h3>
							{!showCreateForm && (
								<Button onClick={() => setShowCreateForm(true)} disabled={loading}>
									<FileText className="h-4 w-4 mr-2" />
									Tạo báo giá mới
								</Button>
							)}
						</div>

						{quotes.length === 0 ? (
							<Alert>
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									Chưa có báo giá nào cho phiếu sửa chữa này. Nhấn "Tạo báo giá mới" để tạo báo giá đầu tiên.
								</AlertDescription>
							</Alert>
						) : (
							<div className="space-y-4">
								{quotes.map((quote) => (
									<Card key={quote.id} className={`${isExpired(quote.valid_until) ? 'border-orange-200 bg-orange-50' : ''}`}>
										<CardHeader>
											<div className="flex items-center justify-between">
												<CardTitle className="flex items-center gap-2">
													{getStatusIcon(quote.status)}
													<span className="font-mono text-lg">{quote.quote_number}</span>
													<span className="text-sm text-muted-foreground">v{quote.quote_version}</span>
												</CardTitle>
												{getStatusBadge(quote.status)}
											</div>
										</CardHeader>
										<CardContent className="space-y-4">
											{/* Quote Summary */}
											<div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 bg-muted rounded-lg">
												<div className="text-center">
													<div className="text-sm text-muted-foreground">Linh kiện</div>
													<div className="font-semibold">{formatVND(quote.subtotal_parts)}</div>
												</div>
												<div className="text-center">
													<div className="text-sm text-muted-foreground">Công lao động</div>
													<div className="font-semibold">{formatVND(quote.subtotal_labor)}</div>
												</div>
												<div className="text-center">
													<div className="text-sm text-muted-foreground">Giảm giá</div>
													<div className="font-semibold text-red-600">
														{quote.discount_amount > 0 ? `-${formatVND(quote.discount_amount)}` : formatVND(0)}
													</div>
												</div>
												<div className="text-center">
													<div className="text-sm text-muted-foreground">Tổng cộng</div>
													<div className="font-bold text-lg text-green-600">{formatVND(quote.total_amount)}</div>
												</div>
											</div>

											{/* Quote Details */}
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
												<div className="flex items-center gap-2">
													<Calendar className="h-4 w-4 text-muted-foreground" />
													<div>
														<div className="text-muted-foreground">Ngày tạo</div>
														<div className="font-medium">{formatDateTime(quote.created_at)}</div>
													</div>
												</div>
												{quote.valid_until && (
													<div className="flex items-center gap-2">
														<Clock className="h-4 w-4 text-muted-foreground" />
														<div>
															<div className="text-muted-foreground">Hiệu lực đến</div>
															<div className={`font-medium ${isExpired(quote.valid_until) ? 'text-red-600' : 'text-green-600'}`}>
																{formatDateTime(quote.valid_until)}
																{quote.valid_until && (
																	<div className="text-xs">
																		{getTimeRemaining(quote.valid_until)}
																	</div>
																)}
															</div>
														</div>
													</div>
												)}
											</div>

											{/* Terms and Conditions */}
											{quote.terms_conditions && (
												<div>
													<div className="text-sm text-muted-foreground mb-1">Điều khoản và điều kiện:</div>
													<div className="text-sm p-2 bg-muted rounded whitespace-pre-wrap">
														{quote.terms_conditions}
													</div>
												</div>
											)}

											{/* Customer Response */}
											{quote.customer_response && (
												<div>
													<div className="text-sm text-muted-foreground mb-1">Phản hồi khách hàng:</div>
													<div className="text-sm p-2 bg-blue-50 border-l-4 border-blue-200 rounded">
														{quote.customer_response}
														{quote.customer_responded_at && (
															<div className="text-xs text-muted-foreground mt-1">
																{formatDateTime(quote.customer_responded_at)}
															</div>
														)}
													</div>
												</div>
											)}

											{/* Expiration Warning */}
											{isExpired(quote.valid_until) && quote.status !== 'expired' && (
												<Alert variant="destructive">
													<AlertCircle className="h-4 w-4" />
													<AlertDescription>
														Báo giá này đã hết hạn. Cần tạo báo giá mới hoặc gia hạn báo giá hiện tại.
													</AlertDescription>
												</Alert>
											)}

											{/* Action Buttons */}
											<div className="flex flex-wrap gap-2">
												{quote.status === 'draft' && (
													<>
														<Button
															size="sm"
															onClick={() => handleUpdateQuoteStatus(quote.id, 'sent')}
															disabled={loading}
														>
															<Send className="h-4 w-4 mr-1" />
															Gửi báo giá
														</Button>
													</>
												)}

												{quote.status === 'sent' && !isExpired(quote.valid_until) && (
													<>
														<Button
															size="sm"
															variant="default"
															onClick={() => handleUpdateQuoteStatus(quote.id, 'approved', 'Khách hàng đã chấp thuận báo giá')}
															disabled={loading}
														>
															<CheckCircle className="h-4 w-4 mr-1" />
															Đánh dấu đã duyệt
														</Button>
														<Button
															size="sm"
															variant="outline"
															onClick={() => handleUpdateQuoteStatus(quote.id, 'rejected', 'Khách hàng từ chối báo giá')}
															disabled={loading}
														>
															<XCircle className="h-4 w-4 mr-1" />
															Đánh dấu từ chối
														</Button>
													</>
												)}

												<Button size="sm" variant="outline" disabled={loading}>
													<Eye className="h-4 w-4 mr-1" />
													Xem báo giá
												</Button>
												<Button size="sm" variant="outline" disabled={loading}>
													<Download className="h-4 w-4 mr-1" />
													Tải PDF
												</Button>
												<Button size="sm" variant="outline" disabled={loading}>
													<Printer className="h-4 w-4 mr-1" />
													In
												</Button>
												<Button size="sm" variant="outline" disabled={loading}>
													<Mail className="h-4 w-4 mr-1" />
													Gửi email
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Đóng
					</Button>
					<Button onClick={loadQuotes} disabled={loading}>
						<FileText className="h-4 w-4 mr-2" />
						{loading ? 'Đang tải...' : 'Làm mới'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}