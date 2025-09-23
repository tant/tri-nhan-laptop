import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, X, Laptop, HardDrive, Cpu, MemoryStick, Monitor, Zap } from "lucide-react";
import type { Database } from "@/lib/supabase";

type Part = Database["public"]["Tables"]["parts"]["Row"];

interface PartsSearchProps {
	parts: Part[];
	onSearchResults: (filteredParts: Part[]) => void;
	loading?: boolean;
}

interface SearchFilters {
	searchTerm: string;
	category: string;
	brand: string;
	stockStatus: "all" | "in_stock" | "low_stock" | "out_of_stock";
	priceRange: [number, number];
	supplier: string;
	modelCompatibility: string;
}

const POPULAR_LAPTOP_MODELS = [
	"Dell Inspiron 15",
	"HP Pavilion 14",
	"Lenovo ThinkPad E14",
	"Asus ROG Strix",
	"Acer Aspire 5",
	"MacBook Pro 13",
	"HP ProBook 450",
	"Dell Latitude 7420"
];

const CATEGORY_ICONS = {
	"Memory": MemoryStick,
	"Storage": HardDrive,
	"Display": Monitor,
	"Battery": Zap,
	"Input": Laptop,
	"Cooling": Cpu,
	"Power": Zap
};

export function PartsSearch({ parts, onSearchResults, loading = false }: PartsSearchProps) {
	const [filters, setFilters] = useState<SearchFilters>({
		searchTerm: "",
		category: "all",
		brand: "all",
		stockStatus: "all",
		priceRange: [0, 10000000], // Max price in VND
		supplier: "all",
		modelCompatibility: ""
	});

	const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
	const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

	// Get unique values for filter dropdowns
	const categories = [...new Set(parts.map(part => part.category).filter(Boolean))];
	const brands = [...new Set(parts.map(part => part.brand).filter(Boolean))];
	// Get unique suppliers for filter dropdown (currently not used but reserved for future)
	// const suppliers = [...new Set(
	// 	parts.map(part => part.supplier_info?.split(" - ")[0]).filter(Boolean)
	// )];

	// Get price range from parts
	const prices = parts.map(part => part.unit_price).filter(Boolean);
	const maxPrice = prices.length > 0 ? Math.max(...prices) : 10000000;
	const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

	// Debounced search function
	const debouncedSearch = useCallback((searchFilters: SearchFilters) => {
		if (searchDebounce) {
			clearTimeout(searchDebounce);
		}

		const timeout = setTimeout(() => {
			const filteredParts = parts.filter(part => {
				// Search across multiple fields with Vietnamese text support
				const searchLower = searchFilters.searchTerm.toLowerCase();
				const matchesSearch = searchFilters.searchTerm === "" || [
					part.name,
					part.brand,
					part.category,
					part.supplier_info,
					...(part.model_compatibility || [])
				].some(field =>
					field?.toLowerCase().includes(searchLower) ||
					// Support Vietnamese diacritical marks by normalizing
					field?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(
						searchLower.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
					)
				);

				// Category filter
				const matchesCategory = searchFilters.category === "all" || part.category === searchFilters.category;

				// Brand filter
				const matchesBrand = searchFilters.brand === "all" || part.brand === searchFilters.brand;

				// Stock status filter with null safety
				const minStock = part.min_stock_level || 5; // fallback to 5 if null
				const matchesStock = searchFilters.stockStatus === "all" ||
					(searchFilters.stockStatus === "in_stock" && part.current_stock > minStock) ||
					(searchFilters.stockStatus === "low_stock" && part.current_stock <= minStock && part.current_stock > 0) ||
					(searchFilters.stockStatus === "out_of_stock" && part.current_stock === 0);

				// Price range filter
				const matchesPrice = part.unit_price >= searchFilters.priceRange[0] &&
					part.unit_price <= searchFilters.priceRange[1];

				// Supplier filter
				const matchesSupplier = searchFilters.supplier === "all" ||
					part.supplier_info?.toLowerCase().includes(searchFilters.supplier.toLowerCase());

				// Model compatibility filter
				const matchesModel = searchFilters.modelCompatibility === "" ||
					part.model_compatibility?.some(model =>
						model.toLowerCase().includes(searchFilters.modelCompatibility.toLowerCase())
					);

				return matchesSearch && matchesCategory && matchesBrand && matchesStock &&
					matchesPrice && matchesSupplier && matchesModel;
			});

			onSearchResults(filteredParts);
		}, 300); // 300ms debounce

		setSearchDebounce(timeout);
	}, [parts, onSearchResults, searchDebounce]);

	// Effect to trigger search when filters change
	useEffect(() => {
		debouncedSearch(filters);
	}, [filters, debouncedSearch]);

	// Cleanup debounce on unmount
	useEffect(() => {
		return () => {
			if (searchDebounce) {
				clearTimeout(searchDebounce);
			}
		};
	}, [searchDebounce]);

	const updateFilter = (key: keyof SearchFilters, value: any) => {
		setFilters(prev => ({ ...prev, [key]: value }));
	};

	const clearAllFilters = () => {
		setFilters({
			searchTerm: "",
			category: "all",
			brand: "all",
			stockStatus: "all",
			priceRange: [minPrice, maxPrice],
			supplier: "all",
			modelCompatibility: ""
		});
	};

	const hasActiveFilters = filters.searchTerm !== "" ||
		filters.category !== "all" ||
		filters.brand !== "all" ||
		filters.stockStatus !== "all" ||
		filters.supplier !== "all" ||
		filters.modelCompatibility !== "";

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(price);
	};

	return (
		<Card className="mb-6">
			<CardContent className="p-6">
				{/* Main Search Bar */}
				<div className="flex flex-col sm:flex-row gap-4 mb-4">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
						<Input
							placeholder="Tìm kiếm linh kiện theo tên, hãng, danh mục..."
							value={filters.searchTerm}
							onChange={(e) => updateFilter("searchTerm", e.target.value)}
							className="pl-10"
							disabled={loading}
						/>
					</div>
					<Button
						variant="outline"
						onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
						className="shrink-0"
					>
						<Filter className="h-4 w-4 mr-2" />
						Bộ lọc {showAdvancedFilters ? "ẩn" : "nâng cao"}
					</Button>
					{hasActiveFilters && (
						<Button
							variant="ghost"
							onClick={clearAllFilters}
							className="shrink-0"
						>
							<X className="h-4 w-4 mr-2" />
							Xóa bộ lọc
						</Button>
					)}
				</div>

				{/* Quick Model Compatibility Search */}
				<div className="mb-4">
					<Label className="text-sm font-medium mb-2 block">Tìm theo mẫu laptop phổ biến:</Label>
					<div className="flex flex-wrap gap-2">
						{POPULAR_LAPTOP_MODELS.map((model) => (
							<Button
								key={model}
								variant={filters.modelCompatibility === model ? "default" : "outline"}
								size="sm"
								onClick={() => updateFilter("modelCompatibility",
									filters.modelCompatibility === model ? "" : model
								)}
							>
								{model}
							</Button>
						))}
					</div>
				</div>

				{/* Advanced Filters */}
				{showAdvancedFilters && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
						{/* Category Filter */}
						<div>
							<Label className="text-sm font-medium mb-2 block">Danh mục:</Label>
							<Select
								value={filters.category}
								onValueChange={(value) => updateFilter("category", value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Chọn danh mục" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tất cả danh mục</SelectItem>
									{categories.map((category) => (
										<SelectItem key={category} value={category}>
											<div className="flex items-center gap-2">
												{CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] && (() => {
													const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
													return <IconComponent className="h-4 w-4" />;
												})()}
												{category}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Brand Filter */}
						<div>
							<Label className="text-sm font-medium mb-2 block">Hãng:</Label>
							<Select
								value={filters.brand}
								onValueChange={(value) => updateFilter("brand", value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Chọn hãng" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tất cả hãng</SelectItem>
									{brands.map((brand) => (
										<SelectItem key={brand} value={brand || ""}>
											{brand || "Không có thương hiệu"}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Stock Status Filter */}
						<div>
							<Label className="text-sm font-medium mb-2 block">Tình trạng tồn kho:</Label>
							<Select
								value={filters.stockStatus}
								onValueChange={(value: typeof filters.stockStatus) => updateFilter("stockStatus", value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Chọn tình trạng" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tất cả</SelectItem>
									<SelectItem value="in_stock">
										<Badge variant="secondary" className="mr-2">Còn hàng</Badge>
									</SelectItem>
									<SelectItem value="low_stock">
										<Badge variant="outline" className="mr-2">Sắp hết</Badge>
									</SelectItem>
									<SelectItem value="out_of_stock">
										<Badge variant="destructive" className="mr-2">Hết hàng</Badge>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Price Range Filter */}
						<div className="md:col-span-2">
							<Label className="text-sm font-medium mb-2 block">
								Khoảng giá: {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
							</Label>
							<Slider
								value={filters.priceRange}
								onValueChange={(value) => updateFilter("priceRange", value)}
								max={maxPrice}
								min={minPrice}
								step={100000}
								className="w-full"
							/>
						</div>

						{/* Custom Model Compatibility */}
						<div>
							<Label className="text-sm font-medium mb-2 block">Tương thích với mẫu:</Label>
							<Input
								placeholder="VD: Dell Inspiron, HP Pavilion..."
								value={filters.modelCompatibility}
								onChange={(e) => updateFilter("modelCompatibility", e.target.value)}
							/>
						</div>
					</div>
				)}

				{/* Active Filters Display */}
				{hasActiveFilters && (
					<div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
						<span className="text-sm text-muted-foreground">Bộ lọc đang áp dụng:</span>
						{filters.searchTerm && (
							<Badge variant="secondary">
								Tìm kiếm: "{filters.searchTerm}"
								<X
									className="h-3 w-3 ml-1 cursor-pointer"
									onClick={() => updateFilter("searchTerm", "")}
								/>
							</Badge>
						)}
						{filters.category !== "all" && (
							<Badge variant="secondary">
								Danh mục: {filters.category}
								<X
									className="h-3 w-3 ml-1 cursor-pointer"
									onClick={() => updateFilter("category", "all")}
								/>
							</Badge>
						)}
						{filters.brand !== "all" && (
							<Badge variant="secondary">
								Hãng: {filters.brand}
								<X
									className="h-3 w-3 ml-1 cursor-pointer"
									onClick={() => updateFilter("brand", "all")}
								/>
							</Badge>
						)}
						{filters.stockStatus !== "all" && (
							<Badge variant="secondary">
								Tồn kho: {filters.stockStatus}
								<X
									className="h-3 w-3 ml-1 cursor-pointer"
									onClick={() => updateFilter("stockStatus", "all")}
								/>
							</Badge>
						)}
						{filters.modelCompatibility && (
							<Badge variant="secondary">
								Tương thích: {filters.modelCompatibility}
								<X
									className="h-3 w-3 ml-1 cursor-pointer"
									onClick={() => updateFilter("modelCompatibility", "")}
								/>
							</Badge>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}