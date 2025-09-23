/**
 * Vietnamese Device Brands Database
 * Comprehensive database of laptop and device brands commonly found in Vietnam
 */

export interface DeviceBrand {
	id: string;
	name: string;
	vietnameseName?: string;
	logo?: string;
	popularity: number; // 1-10 scale, 10 being most popular
	models: DeviceModel[];
	supportLevel: "official" | "authorized" | "third-party" | "limited";
	warrantyPeriod: number; // months
}

export interface DeviceModel {
	id: string;
	name: string;
	series: string;
	year?: number;
	specifications?: {
		processor?: string;
		ram?: string;
		storage?: string;
		display?: string;
		graphics?: string;
	};
	estimatedPrice?: number;
	commonIssues?: string[];
	repairDifficulty: "easy" | "medium" | "hard" | "expert";
}

export interface DeviceSpecs {
	processor: string[];
	ram: string[];
	storage: string[];
	display: string[];
	graphics: string[];
	connectivity: string[];
}

// Popular laptop brands in Vietnam
export const VIETNAMESE_DEVICE_BRANDS: DeviceBrand[] = [
	{
		id: "asus",
		name: "ASUS",
		vietnameseName: "Asus",
		popularity: 10,
		supportLevel: "official",
		warrantyPeriod: 24,
		models: [
			{
				id: "vivobook-15",
				name: "VivoBook 15",
				series: "VivoBook",
				year: 2023,
				specifications: {
					processor: "Intel i5-1135G7 / AMD Ryzen 5 5500U",
					ram: "8GB DDR4",
					storage: "512GB SSD",
					display: '15.6" FHD',
				},
				estimatedPrice: 15000000,
				commonIssues: ["Màn hình nhấp nháy", "Bàn phím dính", "Quạt ồn"],
				repairDifficulty: "medium",
			},
			{
				id: "zenbook-14",
				name: "ZenBook 14",
				series: "ZenBook",
				year: 2023,
				specifications: {
					processor: "Intel i7-1165G7",
					ram: "16GB LPDDR4X",
					storage: "512GB SSD",
					display: '14" FHD OLED',
				},
				estimatedPrice: 25000000,
				commonIssues: ["Pin chai", "Cổng USB lỏng", "Màn hình OLED burn-in"],
				repairDifficulty: "hard",
			},
			{
				id: "rog-strix",
				name: "ROG Strix G15",
				series: "ROG",
				year: 2023,
				specifications: {
					processor: "AMD Ryzen 7 6800H",
					ram: "16GB DDR5",
					storage: "1TB SSD",
					display: '15.6" FHD 144Hz',
					graphics: "RTX 3060",
				},
				estimatedPrice: 35000000,
				commonIssues: ["Quạt ồn", "Nóng máy", "Bàn phím RGB hỏng"],
				repairDifficulty: "expert",
			},
		],
	},
	{
		id: "acer",
		name: "Acer",
		vietnameseName: "Acer",
		popularity: 9,
		supportLevel: "official",
		warrantyPeriod: 24,
		models: [
			{
				id: "aspire-5",
				name: "Aspire 5",
				series: "Aspire",
				year: 2023,
				specifications: {
					processor: "Intel i5-1235U",
					ram: "8GB DDR4",
					storage: "256GB SSD",
					display: '15.6" FHD',
				},
				estimatedPrice: 13000000,
				commonIssues: [
					"Touchpad không nhạy",
					"WiFi ngắt kết nối",
					"Màn hình tối",
				],
				repairDifficulty: "easy",
			},
			{
				id: "nitro-5",
				name: "Nitro 5",
				series: "Nitro",
				year: 2023,
				specifications: {
					processor: "Intel i5-12500H",
					ram: "16GB DDR4",
					storage: "512GB SSD",
					display: '15.6" FHD 144Hz',
					graphics: "GTX 1650",
				},
				estimatedPrice: 20000000,
				commonIssues: ["Quạt ồn", "Pin tụt nhanh", "Bàn phím dính"],
				repairDifficulty: "medium",
			},
		],
	},
	{
		id: "lenovo",
		name: "Lenovo",
		vietnameseName: "Lenovo",
		popularity: 8,
		supportLevel: "official",
		warrantyPeriod: 12,
		models: [
			{
				id: "thinkpad-e14",
				name: "ThinkPad E14",
				series: "ThinkPad",
				year: 2023,
				specifications: {
					processor: "Intel i5-1235U",
					ram: "8GB DDR4",
					storage: "256GB SSD",
					display: '14" FHD',
				},
				estimatedPrice: 18000000,
				commonIssues: [
					"Trackpoint hỏng",
					"Bàn phím cong",
					"Màn hình flickering",
				],
				repairDifficulty: "medium",
			},
			{
				id: "ideapad-3",
				name: "IdeaPad 3",
				series: "IdeaPad",
				year: 2023,
				specifications: {
					processor: "AMD Ryzen 5 5500U",
					ram: "8GB DDR4",
					storage: "512GB SSD",
					display: '15.6" FHD',
				},
				estimatedPrice: 14000000,
				commonIssues: ["Màn hình mờ", "Touchpad lag", "Cổng sạc lỏng"],
				repairDifficulty: "easy",
			},
		],
	},
	{
		id: "hp",
		name: "HP",
		vietnameseName: "HP",
		popularity: 7,
		supportLevel: "authorized",
		warrantyPeriod: 12,
		models: [
			{
				id: "pavilion-15",
				name: "Pavilion 15",
				series: "Pavilion",
				year: 2023,
				specifications: {
					processor: "Intel i5-1235U",
					ram: "8GB DDR4",
					storage: "512GB SSD",
					display: '15.6" FHD',
				},
				estimatedPrice: 16000000,
				commonIssues: ["Pin chai nhanh", "Touchpad nhảy chuột", "Quạt ồn"],
				repairDifficulty: "medium",
			},
			{
				id: "envy-x360",
				name: "ENVY x360",
				series: "ENVY",
				year: 2023,
				specifications: {
					processor: "AMD Ryzen 7 5700U",
					ram: "16GB DDR4",
					storage: "512GB SSD",
					display: '13.3" FHD Touch',
				},
				estimatedPrice: 22000000,
				commonIssues: [
					"Bản lề cảm ứng hỏng",
					"Màn hình cảm ứng không nhạy",
					"Bàn phím backlight lỗi",
				],
				repairDifficulty: "hard",
			},
		],
	},
	{
		id: "dell",
		name: "Dell",
		vietnameseName: "Dell",
		popularity: 6,
		supportLevel: "authorized",
		warrantyPeriod: 12,
		models: [
			{
				id: "inspiron-15",
				name: "Inspiron 15 3000",
				series: "Inspiron",
				year: 2023,
				specifications: {
					processor: "Intel i3-1215U",
					ram: "4GB DDR4",
					storage: "256GB SSD",
					display: '15.6" HD',
				},
				estimatedPrice: 11000000,
				commonIssues: [
					"RAM không đủ",
					"Màn hình độ phân giải thấp",
					"Touchpad cứng",
				],
				repairDifficulty: "easy",
			},
			{
				id: "vostro-14",
				name: "Vostro 14 3000",
				series: "Vostro",
				year: 2023,
				specifications: {
					processor: "Intel i5-1235U",
					ram: "8GB DDR4",
					storage: "512GB SSD",
					display: '14" FHD',
				},
				estimatedPrice: 17000000,
				commonIssues: ["Cổng Ethernet lỏng", "WiFi yếu", "Bàn phím số hỏng"],
				repairDifficulty: "medium",
			},
		],
	},
	{
		id: "msi",
		name: "MSI",
		vietnameseName: "MSI",
		popularity: 7,
		supportLevel: "authorized",
		warrantyPeriod: 24,
		models: [
			{
				id: "gf63",
				name: "GF63 Thin",
				series: "GF",
				year: 2023,
				specifications: {
					processor: "Intel i5-11400H",
					ram: "8GB DDR4",
					storage: "512GB SSD",
					display: '15.6" FHD 144Hz',
					graphics: "GTX 1650",
				},
				estimatedPrice: 19000000,
				commonIssues: ["Nóng máy", "Quạt ồn", "Bàn phím SteelSeries hỏng"],
				repairDifficulty: "medium",
			},
			{
				id: "modern-14",
				name: "Modern 14",
				series: "Modern",
				year: 2023,
				specifications: {
					processor: "AMD Ryzen 5 5500U",
					ram: "8GB DDR4",
					storage: "512GB SSD",
					display: '14" FHD',
				},
				estimatedPrice: 15000000,
				commonIssues: ["Pin tụt nhanh", "Màn hình nhấp nháy", "Trackpad lag"],
				repairDifficulty: "medium",
			},
		],
	},
	{
		id: "apple",
		name: "Apple",
		vietnameseName: "Apple",
		popularity: 8,
		supportLevel: "limited",
		warrantyPeriod: 12,
		models: [
			{
				id: "macbook-air-m1",
				name: "MacBook Air M1",
				series: "MacBook Air",
				year: 2022,
				specifications: {
					processor: "Apple M1",
					ram: "8GB Unified Memory",
					storage: "256GB SSD",
					display: '13.3" Retina',
				},
				estimatedPrice: 28000000,
				commonIssues: [
					"Pin chai",
					"Màn hình có vệt",
					"Bàn phím Magic Keyboard sticky",
				],
				repairDifficulty: "expert",
			},
			{
				id: "macbook-pro-14",
				name: 'MacBook Pro 14"',
				series: "MacBook Pro",
				year: 2023,
				specifications: {
					processor: "Apple M2 Pro",
					ram: "16GB Unified Memory",
					storage: "512GB SSD",
					display: '14.2" Liquid Retina XDR',
				},
				estimatedPrice: 55000000,
				commonIssues: [
					"Touch Bar hỏng",
					"Cổng Thunderbolt lỏng",
					"Màn hình Mini-LED blooming",
				],
				repairDifficulty: "expert",
			},
		],
	},
	{
		id: "surface",
		name: "Microsoft Surface",
		vietnameseName: "Surface",
		popularity: 4,
		supportLevel: "limited",
		warrantyPeriod: 12,
		models: [
			{
				id: "surface-laptop-4",
				name: "Surface Laptop 4",
				series: "Surface Laptop",
				year: 2021,
				specifications: {
					processor: "Intel i5-1135G7",
					ram: "8GB LPDDR4X",
					storage: "256GB SSD",
					display: '13.5" PixelSense',
				},
				estimatedPrice: 25000000,
				commonIssues: [
					"Màn hình cảm ứng không nhạy",
					"Bàn phím Alcantara bẩn",
					"Pin không tháo được",
				],
				repairDifficulty: "expert",
			},
		],
	},
];

// Common device specifications available in Vietnam
export const DEVICE_SPECIFICATIONS: DeviceSpecs = {
	processor: [
		"Intel i3-1215U",
		"Intel i5-1235U",
		"Intel i5-1135G7",
		"Intel i7-1165G7",
		"Intel i5-11400H",
		"Intel i5-12500H",
		"AMD Ryzen 3 5300U",
		"AMD Ryzen 5 5500U",
		"AMD Ryzen 5 5600H",
		"AMD Ryzen 7 5700U",
		"AMD Ryzen 7 6800H",
		"Apple M1",
		"Apple M2",
		"Apple M2 Pro",
	],
	ram: [
		"4GB DDR4",
		"8GB DDR4",
		"16GB DDR4",
		"32GB DDR4",
		"8GB DDR5",
		"16GB DDR5",
		"8GB LPDDR4X",
		"16GB LPDDR4X",
		"8GB Unified Memory",
		"16GB Unified Memory",
	],
	storage: [
		"128GB SSD",
		"256GB SSD",
		"512GB SSD",
		"1TB SSD",
		"2TB SSD",
		"256GB eUFS",
		"512GB eUFS",
		"1TB HDD + 256GB SSD",
		"2TB HDD + 512GB SSD",
	],
	display: [
		'13.3" HD (1366x768)',
		'13.3" FHD (1920x1080)',
		'14" FHD (1920x1080)',
		'15.6" HD (1366x768)',
		'15.6" FHD (1920x1080)',
		'15.6" FHD 144Hz',
		'17.3" FHD (1920x1080)',
		'13.3" Retina (2560x1600)',
		'14.2" Liquid Retina XDR',
		'OLED 14" FHD',
	],
	graphics: [
		"Intel UHD Graphics",
		"Intel Iris Xe Graphics",
		"AMD Radeon Graphics",
		"NVIDIA GeForce GTX 1650",
		"NVIDIA GeForce RTX 3050",
		"NVIDIA GeForce RTX 3060",
		"NVIDIA GeForce RTX 4050",
		"NVIDIA GeForce RTX 4060",
		"Apple M1 GPU",
		"Apple M2 GPU",
	],
	connectivity: [
		"Wi-Fi 6 (802.11ax)",
		"Wi-Fi 5 (802.11ac)",
		"Bluetooth 5.0",
		"Bluetooth 5.1",
		"Bluetooth 5.2",
		"USB-A 3.2",
		"USB-C 3.2",
		"Thunderbolt 4",
		"HDMI 2.0",
		"Ethernet RJ45",
		"SD Card Reader",
		"Audio Jack 3.5mm",
	],
};

// Common repair issues by device type
export const COMMON_ISSUES = {
	laptop: [
		"Màn hình bị vỡ/nứt",
		"Màn hình không sáng",
		"Màn hình nhấp nháy",
		"Bàn phím không hoạt động",
		"Một số phím bàn phím hỏng",
		"Touchpad không nhạy",
		"Pin không sạc được",
		"Pin tụt nhanh",
		"Máy nóng quá mức",
		"Quạt ồn",
		"Không khởi động được",
		"Khởi động chậm",
		"Blue screen (BSOD)",
		"Máy đơ/treo",
		"WiFi không kết nối được",
		"Bluetooth không hoạt động",
		"Cổng USB không nhận",
		"Jack tai nghe không hoạt động",
		"Loa không có tiếng",
		"Webcam không hoạt động",
		"Virus/Malware",
		"Hệ điều hành lỗi",
		"Phần mềm crash thường xuyên",
		"Ổ cứng báo lỗi",
		"RAM lỗi",
		"Card đồ họa lỗi",
	],
	desktop: [
		"Máy không khởi động",
		"Không có tín hiệu màn hình",
		"Restart liên tục",
		"Blue screen (BSOD)",
		"Quạt case ồn",
		"PSU không hoạt động",
		"RAM lỗi",
		"HDD/SSD lỗi",
		"Card đồ họa artifacts",
		"USB ports không hoạt động",
		"Audio không hoạt động",
		"Network không kết nối",
		"Overheating",
	],
	tablet: [
		"Màn hình cảm ứng không nhạy",
		"Màn hình bị vỡ",
		"Pin tụt nhanh",
		"Không sạc được",
		"WiFi yếu",
		"Ứng dụng crash",
		"Bộ nhớ đầy",
		"Camera không hoạt động",
		"Loa nhỏ tiếng",
		"Micro không hoạt động",
	],
	phone: [
		"Màn hình vỡ/nứt",
		"Màn hình cảm ứng không nhạy",
		"Pin chai/tụt nhanh",
		"Không sạc được",
		"Mất sóng",
		"WiFi không kết nối",
		"Camera mờ/lỗi",
		"Loa/mic không hoạt động",
		"Nút nguồn/âm lượng hỏng",
		"Cổng sạc hỏng",
		"Nước vào máy",
		"Máy nóng",
		"Lag/đơ máy",
		"Ứng dụng crash",
	],
};

/**
 * Get device brand by ID
 */
export function getDeviceBrand(brandId: string): DeviceBrand | undefined {
	return VIETNAMESE_DEVICE_BRANDS.find((brand) => brand.id === brandId);
}

/**
 * Get device model by brand and model ID
 */
export function getDeviceModel(
	brandId: string,
	modelId: string,
): DeviceModel | undefined {
	const brand = getDeviceBrand(brandId);
	return brand?.models.find((model) => model.id === modelId);
}

/**
 * Get popular brands sorted by popularity
 */
export function getPopularBrands(limit?: number): DeviceBrand[] {
	const sorted = [...VIETNAMESE_DEVICE_BRANDS].sort(
		(a, b) => b.popularity - a.popularity,
	);
	return limit ? sorted.slice(0, limit) : sorted;
}

/**
 * Search brands and models by name
 */
export function searchDevices(query: string): Array<{
	brand: DeviceBrand;
	model?: DeviceModel;
}> {
	const results: Array<{ brand: DeviceBrand; model?: DeviceModel }> = [];
	const lowerQuery = query.toLowerCase();

	for (const brand of VIETNAMESE_DEVICE_BRANDS) {
		// Search brand name
		if (
			brand.name.toLowerCase().includes(lowerQuery) ||
			brand.vietnameseName?.toLowerCase().includes(lowerQuery)
		) {
			results.push({ brand });
		}

		// Search model names
		for (const model of brand.models) {
			if (
				model.name.toLowerCase().includes(lowerQuery) ||
				model.series.toLowerCase().includes(lowerQuery)
			) {
				results.push({ brand, model });
			}
		}
	}

	return results;
}

/**
 * Get common issues for device type
 */
export function getCommonIssues(
	deviceType: keyof typeof COMMON_ISSUES,
): string[] {
	return COMMON_ISSUES[deviceType] || [];
}

/**
 * Estimate repair difficulty based on device and issue
 */
export function estimateRepairDifficulty(
	brandId: string,
	modelId: string,
	issueDescription: string,
): "easy" | "medium" | "hard" | "expert" {
	const model = getDeviceModel(brandId, modelId);
	const brand = getDeviceBrand(brandId);

	// Base difficulty from model
	let baseDifficulty = model?.repairDifficulty || "medium";

	// Adjust based on brand support level
	if (brand?.supportLevel === "limited") {
		if (baseDifficulty === "easy") baseDifficulty = "medium";
		if (baseDifficulty === "medium") baseDifficulty = "hard";
	}

	// Adjust based on issue type
	const issue = issueDescription.toLowerCase();
	if (
		issue.includes("màn hình") &&
		(issue.includes("vỡ") || issue.includes("thay"))
	) {
		return baseDifficulty === "easy" ? "medium" : baseDifficulty;
	}

	if (
		issue.includes("mainboard") ||
		issue.includes("cpu") ||
		issue.includes("gpu")
	) {
		return "expert";
	}

	if (
		issue.includes("virus") ||
		issue.includes("phần mềm") ||
		issue.includes("windows")
	) {
		return "easy";
	}

	return baseDifficulty;
}
