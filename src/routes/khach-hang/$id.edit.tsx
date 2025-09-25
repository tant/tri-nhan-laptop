import {
	type CustomerProfileData,
	CustomerProfileForm,
} from "@/components/customers/CustomerProfileForm";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCustomers } from "@/hooks/use-customers";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

function ProtectedCustomerEdit() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const { getCustomerById, updateCustomer } = useCustomers();
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
				const data = await getCustomerById(id);
				// Convert database customer to profile data format
				const profileData: CustomerProfileData = {
					// Basic info
					fullName: data.full_name || "",
					phone: data.phone,
					email: data.email || "",
					dateOfBirth: null, // May need conversion
					idCard: null, // May need conversion

					// Address
					address: data.address as string | null, // Type conversion may be needed

					// Category and business info
					category: "individual" as const,
					businessName: "",
					taxId: "",
					businessLicense: "",

					// Contact preferences
					contactPreferences: {
						preferredMethod: "phone" as const,
						allowSMS: true,
						allowEmail: !!data.email,
						allowCall: true,
						preferredTime: "any" as const,
					},

					// Additional info
					notes: data.notes || "",
					tags: [],
					isVip: false,
					loyaltyPoints: 0,

					// Privacy settings
					privacyConsent: {
						dataProcessing: true,
						marketing: false,
						thirdParty: false,
					},
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
	}, [id, getCustomerById]);

	const handleSave = async (profile: CustomerProfileData) => {
		try {
			setSaving(true);
			setError(null);

			await updateCustomer(id, {
				full_name: profile.fullName,
				email: profile.email || null,
				address: profile.address,
				notes: profile.notes,
				updated_at: new Date().toISOString(),
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
						<CustomerProfileForm
							value={customerData}
							onChange={setCustomerData}
							onSave={handleSave}
							disabled={saving}
							mode="edit"
						/>
					</CardContent>
				</Card>
			</div>
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/khach-hang/$id/edit")({
	component: ProtectedCustomerEdit,
});
