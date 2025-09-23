import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCustomerPortal } from "@/hooks/use-customer-portal";
import { AlertCircle, CheckCircle, Heart, Star, X } from "lucide-react";
import { useState } from "react";

interface FeedbackDialogProps {
	repairId: string;
	customerPhone: string;
	onClose: () => void;
	onSubmitSuccess: () => void;
}

export function FeedbackDialog({
	repairId,
	customerPhone,
	onClose,
	onSubmitSuccess,
}: FeedbackDialogProps) {
	const [rating, setRating] = useState(0);
	const [hoveredRating, setHoveredRating] = useState(0);
	const [comments, setComments] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const { submitFeedback } = useCustomerPortal();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (rating === 0) {
			setError("Vui lòng chọn số sao đánh giá");
			return;
		}

		if (!comments.trim()) {
			setError("Vui lòng nhập nhận xét");
			return;
		}

		try {
			setSubmitting(true);
			setError("");

			await submitFeedback(repairId, customerPhone, rating, comments.trim());

			setSuccess(true);
			setTimeout(() => {
				onSubmitSuccess();
			}, 2000);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setSubmitting(false);
		}
	};

	const getRatingText = (stars: number) => {
		const ratingTexts = {
			1: "Rất không hài lòng",
			2: "Không hài lòng",
			3: "Bình thường",
			4: "Hài lòng",
			5: "Rất hài lòng",
		};
		return ratingTexts[stars as keyof typeof ratingTexts] || "";
	};

	if (success) {
		return (
			<Dialog open={true} onOpenChange={onClose}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-green-600">
							<CheckCircle className="h-5 w-5" />
							Gửi thành công!
						</DialogTitle>
					</DialogHeader>

					<div className="text-center py-6">
						<Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
						<p className="text-lg font-medium mb-2">Cảm ơn bạn đã đánh giá!</p>
						<p className="text-muted-foreground">
							Phản hồi của bạn sẽ giúp chúng tôi cải thiện chất lượng dịch vụ.
						</p>
					</div>

					<Button onClick={onClose} className="w-full">
						Đóng
					</Button>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Star className="h-5 w-5 text-[#299fce]" />
						Đánh Giá Dịch Vụ
					</DialogTitle>
					<DialogClose asChild>
						<Button
							variant="ghost"
							size="sm"
							className="absolute right-4 top-4"
						>
							<X className="h-4 w-4" />
						</Button>
					</DialogClose>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Rating Section */}
					<div className="space-y-3">
						<Label className="text-base font-medium">
							Bạn hài lòng như thế nào với dịch vụ của chúng tôi?
						</Label>

						<div className="flex items-center gap-2">
							{[1, 2, 3, 4, 5].map((star) => (
								<button
									key={star}
									type="button"
									onClick={() => setRating(star)}
									onMouseEnter={() => setHoveredRating(star)}
									onMouseLeave={() => setHoveredRating(0)}
									className="p-1 rounded-full transition-transform hover:scale-110"
								>
									<Star
										className={`h-8 w-8 transition-colors ${
											star <= (hoveredRating || rating)
												? "text-yellow-400 fill-yellow-400"
												: "text-gray-300"
										}`}
									/>
								</button>
							))}
						</div>

						{(hoveredRating || rating) > 0 && (
							<p className="text-sm text-muted-foreground">
								{getRatingText(hoveredRating || rating)}
							</p>
						)}
					</div>

					{/* Comments Section */}
					<div className="space-y-2">
						<Label htmlFor="comments" className="text-base font-medium">
							Nhận xét chi tiết
						</Label>
						<Textarea
							id="comments"
							placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ sửa chữa..."
							value={comments}
							onChange={(e) => setComments(e.target.value)}
							rows={4}
							className="resize-none"
						/>
						<p className="text-xs text-muted-foreground">
							Nhận xét của bạn sẽ giúp chúng tôi cải thiện chất lượng dịch vụ
						</p>
					</div>

					{error && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{/* Action Buttons */}
					<div className="flex gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							className="flex-1"
							disabled={submitting}
						>
							Hủy
						</Button>
						<Button
							type="submit"
							disabled={submitting || rating === 0 || !comments.trim()}
							className="flex-1 bg-[#299fce] hover:bg-[#299fce]/90"
						>
							{submitting ? "Đang gửi..." : "Gửi đánh giá"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
