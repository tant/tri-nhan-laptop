import { createClient } from "@supabase/supabase-js";
// Admin Panel Component - Example Usage
import { useEffect, useState } from "react";

const supabase = createClient(
	"http://localhost:8000",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
);

interface UserProfile {
	id: string;
	full_name: string;
	role: "shop_owner" | "manager" | "technician" | "staff";
	phone?: string;
	is_active: boolean;
	can_create_users: boolean;
	can_manage_inventory: boolean;
	can_view_financials: boolean;
	can_delete_repairs: boolean;
	created_at: string;
}

export function AdminPanel() {
	const [users, setUsers] = useState<UserProfile[]>([]);
	const [currentUser, setCurrentUser] = useState<{
		email?: string;
		role?: string;
	} | null>(null);
	const [loading, setLoading] = useState(true);
	const [showCreateForm, setShowCreateForm] = useState(false);

	// Form state for creating new user
	const [newUser, setNewUser] = useState({
		email: "",
		password: "",
		full_name: "",
		role: "staff" as const,
		phone: "",
		can_manage_inventory: false,
		can_view_financials: false,
		can_delete_repairs: false,
	});

	useEffect(() => {
		checkUser();
		fetchUsers();
	}, []);

	const checkUser = async () => {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (user) {
			const { data: profile } = await supabase
				.from("user_profiles")
				.select("*")
				.eq("id", user.id)
				.single();

			setCurrentUser({ ...user, profile });
		}
		setLoading(false);
	};

	const fetchUsers = async () => {
		const { data, error } = await supabase.functions.invoke("user-management", {
			method: "GET",
		});

		if (!error && data?.users) {
			setUsers(data.users);
		}
	};

	const createUser = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		const { error } = await supabase.functions.invoke("user-management", {
			body: newUser,
		});

		if (!error) {
			alert("User created successfully!");
			setShowCreateForm(false);
			setNewUser({
				email: "",
				password: "",
				full_name: "",
				role: "staff",
				phone: "",
				can_manage_inventory: false,
				can_view_financials: false,
				can_delete_repairs: false,
			});
			fetchUsers();
		} else {
			alert(`Error: ${error.message}`);
		}

		setLoading(false);
	};

	const handleLogin = async (email: string, password: string) => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (!error) {
			checkUser();
		} else {
			alert(`Login failed: ${error.message}`);
		}
	};

	const handleLogout = async () => {
		await supabase.auth.signOut();
		setCurrentUser(null);
		setUsers([]);
	};

	if (loading) {
		return <div className="p-4">Loading...</div>;
	}

	if (!currentUser) {
		return (
			<div className="p-4">
				<h2 className="text-2xl font-bold mb-4">Admin Login</h2>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						const formData = new FormData(e.target as HTMLFormElement);
						handleLogin(
							formData.get("email") as string,
							formData.get("password") as string,
						);
					}}
				>
					<div className="mb-4">
						<label
							htmlFor="admin-email"
							className="block text-sm font-medium text-gray-700"
						>
							Email
						</label>
						<input
							id="admin-email"
							type="email"
							name="email"
							defaultValue="admin@laptop-repair-shop.local"
							className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
							required
						/>
					</div>
					<div className="mb-4">
						<label
							htmlFor="admin-password"
							className="block text-sm font-medium text-gray-700"
						>
							Password
						</label>
						<input
							id="admin-password"
							type="password"
							name="password"
							defaultValue="AdminPass123!"
							className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
							required
						/>
					</div>
					<button
						type="submit"
						className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
					>
						Login
					</button>
				</form>
			</div>
		);
	}

	const canManageUsers =
		currentUser.profile?.can_create_users ||
		["shop_owner", "manager"].includes(currentUser.profile?.role);

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Laptop Repair Shop - Admin Panel</h1>
				<div className="flex items-center gap-4">
					<span>
						Welcome, {currentUser.profile?.full_name} (
						{currentUser.profile?.role})
					</span>
					<button
						type="button"
						onClick={handleLogout}
						className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
					>
						Logout
					</button>
				</div>
			</div>

			{canManageUsers && (
				<div className="mb-6">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-2xl font-semibold">User Management</h2>
						<button
							type="button"
							onClick={() => setShowCreateForm(!showCreateForm)}
							className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
						>
							{showCreateForm ? "Cancel" : "Create User"}
						</button>
					</div>

					{showCreateForm && (
						<form
							onSubmit={createUser}
							className="bg-gray-50 p-4 rounded-lg mb-4"
						>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label
										htmlFor="new-user-email"
										className="block text-sm font-medium text-gray-700"
									>
										Email
									</label>
									<input
										id="new-user-email"
										type="email"
										value={newUser.email}
										onChange={(e) =>
											setNewUser({ ...newUser, email: e.target.value })
										}
										className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
										required
									/>
								</div>
								<div>
									<label
										htmlFor="new-user-password"
										className="block text-sm font-medium text-gray-700"
									>
										Password
									</label>
									<input
										id="new-user-password"
										type="password"
										value={newUser.password}
										onChange={(e) =>
											setNewUser({ ...newUser, password: e.target.value })
										}
										className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
										required
									/>
								</div>
								<div>
									<label
										htmlFor="new-user-full-name"
										className="block text-sm font-medium text-gray-700"
									>
										Full Name
									</label>
									<input
										id="new-user-full-name"
										type="text"
										value={newUser.full_name}
										onChange={(e) =>
											setNewUser({ ...newUser, full_name: e.target.value })
										}
										className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
										required
									/>
								</div>
								<div>
									<label
										htmlFor="new-user-role"
										className="block text-sm font-medium text-gray-700"
									>
										Role
									</label>
									<select
										id="new-user-role"
										value={newUser.role}
										onChange={(e) =>
											setNewUser({
												...newUser,
												role: e.target.value as
													| "staff"
													| "technician"
													| "manager",
											})
										}
										className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
									>
										<option value="staff">Staff</option>
										<option value="technician">Technician</option>
										<option value="manager">Manager</option>
									</select>
								</div>
								<div>
									<label
										htmlFor="new-user-phone"
										className="block text-sm font-medium text-gray-700"
									>
										Phone
									</label>
									<input
										id="new-user-phone"
										type="tel"
										value={newUser.phone}
										onChange={(e) =>
											setNewUser({ ...newUser, phone: e.target.value })
										}
										className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
									/>
								</div>
							</div>

							<div className="mt-4">
								<h3 className="block text-sm font-medium text-gray-700 mb-2">
									Permissions
								</h3>
								<div className="space-y-2">
									<label className="flex items-center">
										<input
											type="checkbox"
											checked={newUser.can_manage_inventory}
											onChange={(e) =>
												setNewUser({
													...newUser,
													can_manage_inventory: e.target.checked,
												})
											}
											className="mr-2"
										/>
										Can manage inventory
									</label>
									<label className="flex items-center">
										<input
											type="checkbox"
											checked={newUser.can_view_financials}
											onChange={(e) =>
												setNewUser({
													...newUser,
													can_view_financials: e.target.checked,
												})
											}
											className="mr-2"
										/>
										Can view financials
									</label>
									<label className="flex items-center">
										<input
											type="checkbox"
											checked={newUser.can_delete_repairs}
											onChange={(e) =>
												setNewUser({
													...newUser,
													can_delete_repairs: e.target.checked,
												})
											}
											className="mr-2"
										/>
										Can delete repairs
									</label>
								</div>
							</div>

							<button
								type="submit"
								disabled={loading}
								className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
							>
								{loading ? "Creating..." : "Create User"}
							</button>
						</form>
					)}

					<div className="bg-white rounded-lg shadow overflow-hidden">
						<table className="min-w-full">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Name
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Role
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Phone
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Permissions
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{users.map((user) => (
									<tr key={user.id}>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{user.full_name}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{user.role}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{user.phone || "-"}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											<div className="space-y-1">
												{user.can_create_users && (
													<span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
														Create Users
													</span>
												)}
												{user.can_manage_inventory && (
													<span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
														Inventory
													</span>
												)}
												{user.can_view_financials && (
													<span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
														Financials
													</span>
												)}
												{user.can_delete_repairs && (
													<span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
														Delete Repairs
													</span>
												)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
													user.is_active
														? "bg-green-100 text-green-800"
														: "bg-red-100 text-red-800"
												}`}
											>
												{user.is_active ? "Active" : "Inactive"}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-white p-6 rounded-lg shadow">
					<h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
					<p className="text-gray-600">Total Users: {users.length}</p>
					<p className="text-gray-600">
						Your Role: {currentUser.profile?.role}
					</p>
				</div>

				<div className="bg-white p-6 rounded-lg shadow">
					<h3 className="text-lg font-semibold mb-2">Your Permissions</h3>
					<div className="space-y-1">
						{currentUser.profile?.can_create_users && (
							<p className="text-green-600">✓ Create Users</p>
						)}
						{currentUser.profile?.can_manage_inventory && (
							<p className="text-green-600">✓ Manage Inventory</p>
						)}
						{currentUser.profile?.can_view_financials && (
							<p className="text-green-600">✓ View Financials</p>
						)}
						{currentUser.profile?.can_delete_repairs && (
							<p className="text-green-600">✓ Delete Repairs</p>
						)}
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow">
					<h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
					<div className="space-y-2">
						<button
							type="button"
							className="block w-full text-left text-blue-600 hover:underline"
						>
							View Repairs
						</button>
						<button
							type="button"
							className="block w-full text-left text-blue-600 hover:underline"
						>
							Manage Customers
						</button>
						{currentUser.profile?.can_manage_inventory && (
							<button
								type="button"
								className="block w-full text-left text-blue-600 hover:underline"
							>
								Inventory
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
