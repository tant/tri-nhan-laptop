import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRepairTickets } from "@/hooks/use-repair-tickets";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import { Check, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

interface AssignTechnicianDropdownProps {
	ticketId: string;
	currentTechnicianId?: string;
	onAssign: (technicianId: string) => void;
	disabled?: boolean;
}

export function AssignTechnicianDropdown({
	ticketId,
	currentTechnicianId,
	onAssign,
	disabled = false,
}: AssignTechnicianDropdownProps) {
	const [technicians, setTechnicians] = useState<UserProfile[]>([]);
	const [loading, setLoading] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);

	// Fetch available technicians
	useEffect(() => {
		async function fetchTechnicians() {
			try {
				setLoading(true);
				const { data, error } = await supabase
					.from("user_profiles")
					.select("*")
					.eq("is_active", true)
					.order("full_name");

				if (error) {
					console.error("Error fetching technicians:", error);
					return;
				}

				setTechnicians(data || []);
			} catch (error) {
				console.error("Error fetching technicians:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchTechnicians();
	}, []);

	const handleAssign = async (technicianId: string) => {
		try {
			setIsUpdating(true);

			const { error } = await supabase
				.from("repair_tickets")
				.update({
					assigned_technician_id: technicianId,
					updated_at: new Date().toISOString(),
				})
				.eq("id", ticketId);

			if (error) {
				console.error("Error assigning technician:", error);
				return;
			}

			// Call parent callback
			onAssign(technicianId);
		} catch (error) {
			console.error("Error assigning technician:", error);
		} finally {
			setIsUpdating(false);
		}
	};

	const handleUnassign = () => {
		handleAssign("");
	};

	const currentTechnician = technicians.find(
		(t) => t.id === currentTechnicianId,
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					disabled={disabled || isUpdating}
					title={
						currentTechnician
							? `Đã phân công: ${currentTechnician.full_name}`
							: "Phân công kỹ thuật viên"
					}
				>
					<UserPlus className="h-4 w-4" />
					{currentTechnician && (
						<Check className="h-3 w-3 ml-1 text-green-600" />
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-56">
				{loading ? (
					<DropdownMenuItem disabled>Đang tải...</DropdownMenuItem>
				) : (
					<>
						{currentTechnicianId && (
							<>
								<DropdownMenuItem
									onClick={handleUnassign}
									className="text-red-600"
								>
									Bỏ phân công
								</DropdownMenuItem>
								<div className="border-t my-1" />
							</>
						)}
						{technicians.length === 0 ? (
							<DropdownMenuItem disabled>
								Không có kỹ thuật viên
							</DropdownMenuItem>
						) : (
							technicians.map((technician) => (
								<DropdownMenuItem
									key={technician.id}
									onClick={() => handleAssign(technician.id)}
									className={
										currentTechnicianId === technician.id ? "bg-muted" : ""
									}
								>
									<div className="flex items-center justify-between w-full">
										<span>{technician.full_name}</span>
										{currentTechnicianId === technician.id && (
											<Check className="h-4 w-4 text-green-600" />
										)}
									</div>
								</DropdownMenuItem>
							))
						)}
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
