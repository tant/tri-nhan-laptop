import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

function ClearCachePage() {
	const [cleared, setCleared] = useState(false);
	const [cacheInfo, setCacheInfo] = useState<any>(null);

	useEffect(() => {
		// Show current cache info
		const cached = localStorage.getItem("user_profile_cache");
		setCacheInfo({
			hasCache: !!cached,
			cachedUser: cached ? JSON.parse(cached) : null,
			allLocalStorageKeys: Object.keys(localStorage),
			storageSize: JSON.stringify(localStorage).length
		});
	}, []);

	const clearAllCache = () => {
		try {
			console.log('🧹 Clearing all browser storage...');

			// Get all localStorage keys
			const keys = Object.keys(localStorage);
			console.log('LocalStorage keys:', keys);

			// Clear everything
			localStorage.clear();
			sessionStorage.clear();

			// Clear any Supabase-specific items that might remain
			const supabaseKeys = [
				"user_profile_cache",
				"sb-127.0.0.1:54321-auth-token",
				"supabase.auth.token",
				"sb-localhost-auth-token"
			];

			supabaseKeys.forEach(key => {
				try {
					localStorage.removeItem(key);
					sessionStorage.removeItem(key);
				} catch (e) {
					console.log('Could not remove', key, e);
				}
			});

			// Clear IndexedDB if available
			if ('indexedDB' in window) {
				try {
					indexedDB.deleteDatabase('supabase-cache');
				} catch (e) {
					console.log('Could not clear IndexedDB:', e);
				}
			}


			setCleared(true);

			// Force reload after clearing
			setTimeout(() => {
				window.location.replace("/login");
			}, 1500);

		} catch (error) {
			console.error("Error clearing cache:", error);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<Card className="w-full max-w-lg">
				<CardHeader>
					<CardTitle className="text-center">🧹 Clear Browser Cache</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{cacheInfo && (
						<div className="bg-gray-100 p-3 rounded text-xs">
							<p><strong>Cached User ID:</strong> {cacheInfo.cachedUser?.id || 'None'}</p>
							<p><strong>Expected ID:</strong> 8a478035-fd6e-49d9-8332-3ecb487ee129</p>
							<p><strong>Cache Keys:</strong> {cacheInfo.allLocalStorageKeys.length} items</p>
							<p className="text-red-600">
								{cacheInfo.cachedUser?.id !== '8a478035-fd6e-49d9-8332-3ecb487ee129' ?
									'❌ ID Mismatch - Need to clear cache!' :
									'✅ IDs match'
								}
							</p>
						</div>
					)}

					<div className="text-center">
						{!cleared ? (
							<>
								<p className="text-gray-600 mb-4">
									Clear cached authentication data to fix login issues.
								</p>
								<Button onClick={clearAllCache} className="w-full mb-2">
									🗑️ Clear Cache & Reload
								</Button>
								<p className="text-sm text-gray-500">
									This will clear all browser storage and redirect to login.
								</p>
								<div className="mt-4 p-3 bg-blue-50 rounded text-sm">
									<p className="font-medium">Login Credentials:</p>
									<p>📧 Email: admin@gmail.com</p>
									<p>🔑 Password: aDmin1234!</p>
								</div>
							</>
						) : (
							<>
								<p className="text-green-600 font-semibold">
									✅ Cache cleared successfully!
								</p>
								<p className="text-gray-600">Redirecting to login...</p>
							</>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export const Route = createFileRoute("/clear-cache")({
	component: ClearCachePage,
});