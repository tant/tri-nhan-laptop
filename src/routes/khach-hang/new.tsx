import {
	CustomerProfileForm,
	type CustomerProfileData,
	createDefaultCustomerProfile,
} from "@/components/customers/CustomerProfileForm";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomers } from "@/hooks/use-customers";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

function ProtectedCreateCustomer() {
	const navigate = useNavigate();
	const { createCustomer } = useCustomers();
	const [customerData, setCustomerData] = useState<CustomerProfileData>(
		createDefaultCustomerProfile()
	);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSave = async (profile: CustomerProfileData) => {
		try {
			setSaving(true);
			setError(null);

			const customerId = await createCustomer(profile);
			console.log("New customer created:", customerId);

			// Navigate back to customers list
			navigate({ to: "/khach-hang" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Không thể tạo khách hàng");
		} finally {
			setSaving(false);
		}
	};

	return (
		<ProtectedRoute>
			<div className="container mx-auto py-6 space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<Button
							variant="outline"
							size="sm"
							onClick={() => navigate({ to: "/khach-hang" })}
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Quay lại
						</Button>
						<div>
							<h1 className="text-2xl font-bold">Tạo hồ sơ khách hàng mới</h1>
							<p className="text-muted-foreground">
								Nhập thông tin để tạo hồ sơ khách hàng
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
							mode="create"
						/>
					</CardContent>
				</Card>
			</div>
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/khach-hang/new")({
	component: ProtectedCreateCustomer,
});