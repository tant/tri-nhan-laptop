import { ProtectedRoute } from "@/components/protected-route";
import { createFileRoute } from "@tanstack/react-router";

function StorePage() {
	return (
		<ProtectedRoute>
			<div className="p-6">
				<div className="flex justify-between items-center mb-6">
					<div>
						<h1 className="text-3xl font-bold">Quản lý cửa hàng</h1>
						<p className="text-muted-foreground">
							Quản lý sản phẩm bán (laptop cũ, linh kiện)
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="bg-card p-6 rounded-lg border">
						<h2 className="text-xl font-semibold mb-4">Laptop cũ</h2>
						<p className="text-muted-foreground mb-4">
							Quản lý laptop cũ có sẵn để bán
						</p>
						<div className="text-center py-8">
							<p className="text-sm text-muted-foreground">
								Tính năng đang phát triển
							</p>
						</div>
					</div>

					<div className="bg-card p-6 rounded-lg border">
						<h2 className="text-xl font-semibold mb-4">Linh kiện bán lẻ</h2>
						<p className="text-muted-foreground mb-4">
							Quản lý linh kiện có sẵn để bán
						</p>
						<div className="text-center py-8">
							<p className="text-sm text-muted-foreground">
								Tính năng đang phát triển
							</p>
						</div>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/cua-hang")({
	component: StorePage,
});
