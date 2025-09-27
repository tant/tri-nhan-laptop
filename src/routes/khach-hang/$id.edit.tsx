import type { CustomerProfileData } from "@/components/customers/CustomerProfileForm";
import { Suspense, lazy } from "react";

// Lazy load the heavy form component
const CustomerProfileForm = lazy(() =>
	import("@/components/customers/CustomerProfileForm").then((m) => ({
		default: m.CustomerProfileForm,
	})),
);
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCustomerCrud } from "@/hooks/use-customer-crud";
import { useCustomerSearch } from "@/hooks/use-customer-search";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

function ProtectedCustomerEdit() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const { updateCustomer } = useCustomerCrud();
	const { findCustomerByPhone } = useCustomerSearch();
	const [customerData, setCustomerData] = useState<CustomerProfileData | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadCustomer() {
			try {
				setLoading(true);
				// Use phone as id since customers are keyed by phone
				const data = await findCustomerByPhone(id);
				// Convert database customer to profile data format
				const profileData: CustomerProfileData = {
					phone: data.phone,
					fullName: data.full_name || "",
					address: data.address || "",
				};
				setCustomerData(profileData);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Không thể tải thông tin khách hàng",
				);
			} finally {
				setLoading(false);
			}
		}

		loadCustomer();
	}, [id, findCustomerByPhone]);

	const handleSave = async (profile: CustomerProfileData) => {
		try {
			setSaving(true);
			setError(null);

			await updateCustomer(id, {
				full_name: profile.fullName,
				address: profile.address,
			});

			console.log("Customer updated:", id);
			// Navigate back to customer detail
			navigate({ to: "/khach-hang/$id", params: { id } });
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Không thể cập nhật khách hàng",
			);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto py-6">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded mb-4" />
					<div className="h-64 bg-gray-200 rounded" />
				</div>
			</div>
		);
	}

	if (error || !customerData) {
		return (
			<div className="container mx-auto py-6">
				<Card>
					<CardContent className="p-6">
						<p className="text-red-500">
							{error || "Không thể tải thông tin khách hàng"}
						</p>
						<Button
							onClick={() => navigate({ to: "/khach-hang" })}
							className="mt-4"
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Quay lại danh sách
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<ProtectedRoute>
			<div className="container mx-auto py-6 space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								navigate({ to: "/khach-hang/$id", params: { id } })
							}
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Quay lại
						</Button>
						<div>
							<h1 className="text-2xl font-bold">Chỉnh sửa khách hàng</h1>
							<p className="text-muted-foreground">
								Cập nhật thông tin khách hàng {customerData.fullName}
							</p>
						</div>
					</div>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-md p-4">
						<p className="text-red-700">{error}</p>
					</div>
				)}

				<Card>
					<CardContent className="p-6">
						<Suspense
							fallback={
								<div className="h-96 animate-pulse bg-gray-100 rounded" />
							}
						>
							<CustomerProfileForm
								value={customerData}
								onChange={setCustomerData}
								onSave={handleSave}
								disabled={saving}
								mode="edit"
							/>
						</Suspense>
					</CardContent>
				</Card>
			</div>
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/khach-hang/$id/edit")({
	component: ProtectedCustomerEdit,
});
