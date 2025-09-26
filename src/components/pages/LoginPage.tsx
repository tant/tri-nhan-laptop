import { SupabaseErrorAlert } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { getSuccessMessage, getValidationMessage } from "@/lib/auth-errors";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { LogIn } from "lucide-react";
import { useState } from "react";

function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [validationErrors, setValidationErrors] = useState<{
		email?: string;
		password?: string;
	}>({});
	const { signIn } = useAuth();
	const navigate = useNavigate();
	const { toast } = useToast();

	const validateForm = (): boolean => {
		const errors: { email?: string; password?: string } = {};

		// Email validation
		if (!email.trim()) {
			errors.email = getValidationMessage("emailRequired");
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			errors.email = getValidationMessage("emailInvalid");
		}

		// Password validation
		if (!password) {
			errors.password = getValidationMessage("passwordRequired");
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setValidationErrors({});

		// Client-side validation
		if (!validateForm()) {
			return;
		}

		setIsLoading(true);

		try {
			const { error } = await signIn(email, password);

			if (error) {
				setError(error);
			} else {
				// Show success message
				toast({
					variant: "success",
					title: "Đăng nhập thành công!",
					description: getSuccessMessage("loginSuccess"),
				});

				// Wait a bit for auth state to update, then navigate
				setTimeout(() => {
					navigate({ to: "/dashboard" });
				}, 500);
			}
		} catch (err) {
			setError(err as Error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form
			className={cn("flex flex-col gap-6", className)}
			{...props}
			onSubmit={handleLogin}
		>
			<div className="flex flex-col items-center gap-2 text-center">
				<div className="mb-4">
					<img
						src="/trinhan_logo.svg"
						alt="Trí Nhân Laptop"
						className="h-16 w-auto"
					/>
				</div>
				<h1 className="text-2xl font-bold text-white">Đăng nhập hệ thống</h1>
				<p className="text-gray-300 text-sm text-balance">
					Nhập thông tin đăng nhập để truy cập hệ thống quản lý tiệm sửa laptop
				</p>
			</div>
			{error && (
				<SupabaseErrorAlert
					error={error}
					onDismiss={() => setError(null)}
					onRetry={() => {
						setError(null);
						if (email && password) {
							handleLogin({ preventDefault: () => {} } as React.FormEvent);
						}
					}}
				/>
			)}
			<div className="grid gap-6">
				<div className="grid gap-3">
					<Label htmlFor="email" className="text-white">
						Email
					</Label>
					<Input
						id="email"
						type="email"
						placeholder="admin@trinhanlaptop.vn"
						value={email}
						onChange={(e) => {
							setEmail(e.target.value);
							// Clear validation error when user starts typing
							if (validationErrors.email) {
								setValidationErrors((prev) => ({ ...prev, email: undefined }));
							}
						}}
						className={cn(
							"border-gray-300 focus:border-[#299fce] focus:ring-[#299fce]",
							validationErrors.email &&
								"border-red-500 focus:border-red-500 focus:ring-red-500",
						)}
						required
					/>
					{validationErrors.email && (
						<p className="text-sm text-red-600 mt-1">
							{validationErrors.email}
						</p>
					)}
				</div>
				<div className="grid gap-3">
					<div className="flex items-center">
						<Label htmlFor="password" className="text-white">
							Mật khẩu
						</Label>
						<button
							type="button"
							className="ml-auto text-sm text-[#299fce] underline-offset-4 hover:underline bg-transparent border-none cursor-pointer"
							onClick={() => alert("Tính năng đang phát triển")}
						>
							Quên mật khẩu?
						</button>
					</div>
					<Input
						id="password"
						type="password"
						placeholder="Nhập mật khẩu"
						value={password}
						onChange={(e) => {
							setPassword(e.target.value);
							// Clear validation error when user starts typing
							if (validationErrors.password) {
								setValidationErrors((prev) => ({
									...prev,
									password: undefined,
								}));
							}
						}}
						className={cn(
							"border-gray-300 focus:border-[#299fce] focus:ring-[#299fce]",
							validationErrors.password &&
								"border-red-500 focus:border-red-500 focus:ring-red-500",
						)}
						required
					/>
					{validationErrors.password && (
						<p className="text-sm text-red-600 mt-1">
							{validationErrors.password}
						</p>
					)}
				</div>
				<Button
					type="submit"
					className="w-full bg-[#299fce] hover:bg-[#299fce]/90"
					disabled={!email || !password || isLoading}
				>
					{isLoading ? (
						<>
							<LogIn className="mr-2 h-4 w-4 animate-spin" />
							Đang đăng nhập...
						</>
					) : (
						<>
							<LogIn className="mr-2 h-4 w-4" />
							Đăng nhập
						</>
					)}
				</Button>
			</div>
			<div className="text-center text-sm text-gray-300">
				Bạn là khách hàng?{" "}
				<a
					href="/"
					className="text-[#299fce] underline underline-offset-4 hover:text-[#299fce]/80"
				>
					Tra cứu phiếu sửa chữa
				</a>
			</div>
		</form>
	);
}

export function LoginPage() {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col p-6 md:p-10 bg-[#1E282A]">
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<LoginForm />
					</div>
				</div>
			</div>
			<div className="bg-muted relative hidden lg:block">
				<img
					src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
					alt="Computer repair technician workspace - Professional laptop and computer repair"
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>
		</div>
	);
}
