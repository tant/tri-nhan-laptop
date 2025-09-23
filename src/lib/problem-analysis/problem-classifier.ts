export interface ProblemClassification {
	category: string;
	subcategory: string;
	urgencyLevel: "low" | "medium" | "high" | "urgent";
	estimatedTime: string;
	estimatedCost: number | null;
	requiresSpecialist: boolean;
	commonCauses: string[];
	diagnosticSteps: string[];
	potentialSolutions: string[];
	partsNeeded: string[];
	riskFactors: string[];
}

export interface ProblemKeywords {
	[key: string]: {
		category: string;
		subcategory: string;
		weight: number;
		indicators: string[];
	};
}

const vietnameseProblemKeywords: ProblemKeywords = {
	// Màn hình
	màn_hình_đen: {
		category: "screen",
		subcategory: "display_failure",
		weight: 10,
		indicators: [
			"màn hình đen",
			"không hiển thị",
			"tối đen",
			"không có hình",
			"blank screen",
		],
	},
	màn_hình_vỡ: {
		category: "screen",
		subcategory: "physical_damage",
		weight: 10,
		indicators: [
			"màn hình vỡ",
			"nứt màn hình",
			"bể màn hình",
			"cracked screen",
			"broken display",
		],
	},
	màn_hình_nhấp_nháy: {
		category: "screen",
		subcategory: "display_instability",
		weight: 8,
		indicators: [
			"nhấp nháy",
			"chớp chớp",
			"flickering",
			"nháy màn hình",
			"screen flicker",
		],
	},
	màn_hình_mờ: {
		category: "screen",
		subcategory: "backlight_issue",
		weight: 7,
		indicators: [
			"màn hình mờ",
			"tối màn hình",
			"dim screen",
			"backlight",
			"không sáng",
		],
	},

	// Bàn phím
	bàn_phím_không_gõ: {
		category: "keyboard",
		subcategory: "key_failure",
		weight: 9,
		indicators: [
			"bàn phím không gõ được",
			"phím không hoạt động",
			"keyboard not working",
			"keys not responding",
		],
	},
	phím_dính: {
		category: "keyboard",
		subcategory: "key_stuck",
		weight: 6,
		indicators: [
			"phím dính",
			"phím bị kẹt",
			"stuck keys",
			"key stuck",
			"phím không nhả",
		],
	},
	bàn_phím_bị_nước: {
		category: "keyboard",
		subcategory: "liquid_damage",
		weight: 8,
		indicators: [
			"bàn phím bị nước",
			"đổ nước lên bàn phím",
			"liquid spill",
			"water damage keyboard",
		],
	},

	// Pin
	pin_không_sạc: {
		category: "battery",
		subcategory: "charging_failure",
		weight: 9,
		indicators: [
			"pin không sạc",
			"battery not charging",
			"không sạc được pin",
			"sạc không vào",
		],
	},
	pin_hết_nhanh: {
		category: "battery",
		subcategory: "battery_degradation",
		weight: 7,
		indicators: [
			"pin hết nhanh",
			"pin yếu",
			"battery drain",
			"fast battery drain",
			"pin không trụ",
		],
	},
	pin_phồng: {
		category: "battery",
		subcategory: "battery_swelling",
		weight: 10,
		indicators: [
			"pin phồng",
			"pin cầu",
			"swollen battery",
			"battery bloated",
			"pin bị phồng",
		],
	},

	// Sạc
	adapter_hỏng: {
		category: "charging",
		subcategory: "adapter_failure",
		weight: 8,
		indicators: [
			"adapter hỏng",
			"sạc hỏng",
			"charger broken",
			"power adapter failure",
			"nguồn sạc hỏng",
		],
	},
	cổng_sạc_lỏng: {
		category: "charging",
		subcategory: "charging_port",
		weight: 7,
		indicators: [
			"cổng sạc lỏng",
			"jack sạc lỏng",
			"charging port loose",
			"loose charging port",
		],
	},

	// Phần mềm
	máy_chậm: {
		category: "performance",
		subcategory: "slow_performance",
		weight: 6,
		indicators: [
			"máy chậm",
			"chạy chậm",
			"slow computer",
			"lag",
			"treo máy",
			"đơ máy",
		],
	},
	blue_screen: {
		category: "software",
		subcategory: "system_crash",
		weight: 9,
		indicators: [
			"blue screen",
			"màn hình xanh",
			"BSOD",
			"restart liên tục",
			"tự khởi động lại",
		],
	},
	không_khởi_động: {
		category: "software",
		subcategory: "boot_failure",
		weight: 10,
		indicators: [
			"không khởi động được",
			"không vào được windows",
			"boot failure",
			"startup error",
		],
	},
	virus: {
		category: "virus",
		subcategory: "malware_infection",
		weight: 8,
		indicators: [
			"virus",
			"malware",
			"bị hack",
			"quảng cáo spam",
			"trojan",
			"spyware",
		],
	},

	// Phần cứng
	ổ_cứng_hỏng: {
		category: "hardware",
		subcategory: "hard_drive_failure",
		weight: 9,
		indicators: [
			"ổ cứng hỏng",
			"hard drive failure",
			"HDD error",
			"SSD lỗi",
			"mất dữ liệu",
		],
	},
	ram_lỗi: {
		category: "hardware",
		subcategory: "memory_error",
		weight: 8,
		indicators: [
			"RAM lỗi",
			"memory error",
			"lỗi bộ nhớ",
			"memory failure",
			"blue screen memory",
		],
	},
	quạt_ồn: {
		category: "hardware",
		subcategory: "cooling_issue",
		weight: 6,
		indicators: [
			"quạt ồn",
			"fan noise",
			"tiếng ồn quạt",
			"máy nóng",
			"overheating",
		],
	},

	// Âm thanh
	không_có_âm_thanh: {
		category: "audio",
		subcategory: "no_sound",
		weight: 7,
		indicators: [
			"không có âm thanh",
			"mất tiếng",
			"no sound",
			"audio not working",
			"loa không hoạt động",
		],
	},
	âm_thanh_rè: {
		category: "audio",
		subcategory: "audio_distortion",
		weight: 6,
		indicators: [
			"âm thanh rè",
			"tiếng rè",
			"audio distortion",
			"crackling sound",
			"loa bị rè",
		],
	},

	// Kết nối
	wifi_không_kết_nối: {
		category: "connectivity",
		subcategory: "wifi_failure",
		weight: 7,
		indicators: [
			"wifi không kết nối",
			"không bắt được wifi",
			"wifi not working",
			"no internet connection",
		],
	},
	bluetooth_lỗi: {
		category: "connectivity",
		subcategory: "bluetooth_failure",
		weight: 6,
		indicators: [
			"bluetooth lỗi",
			"bluetooth not working",
			"không kết nối bluetooth",
			"bluetooth failure",
		],
	},
};

const problemSolutions: Record<string, ProblemClassification> = {
	screen_display_failure: {
		category: "screen",
		subcategory: "display_failure",
		urgencyLevel: "high",
		estimatedTime: "2-4 giờ",
		estimatedCost: 2000000,
		requiresSpecialist: true,
		commonCauses: [
			"Card đồ họa bị lỗi",
			"Cáp màn hình bị lỏng hoặc hỏng",
			"Inverter màn hình hỏng",
			"Mainboard bị lỗi",
			"Driver màn hình bị conflict",
		],
		diagnosticSteps: [
			"Kiểm tra kết nối cáp màn hình",
			"Test với màn hình ngoài",
			"Kiểm tra driver card đồ họa",
			"Chạy chẩn đoán phần cứng",
			"Kiểm tra inverter và backlight",
		],
		potentialSolutions: [
			"Thay cáp màn hình",
			"Cập nhật driver card đồ họa",
			"Thay inverter màn hình",
			"Sửa chữa hoặc thay mainboard",
			"Thay màn hình mới",
		],
		partsNeeded: ["Cáp màn hình", "Inverter", "Màn hình LCD/LED"],
		riskFactors: [
			"Có thể cần thay toàn bộ màn hình",
			"Chi phí cao nếu lỗi mainboard",
		],
	},

	screen_physical_damage: {
		category: "screen",
		subcategory: "physical_damage",
		urgencyLevel: "medium",
		estimatedTime: "1-2 giờ",
		estimatedCost: 1500000,
		requiresSpecialist: false,
		commonCauses: [
			"Va đập vật lý",
			"Áp lực lên màn hình",
			"Rơi laptop",
			"Đóng laptop khi có vật lạ trên bàn phím",
		],
		diagnosticSteps: [
			"Kiểm tra mức độ vỡ màn hình",
			"Test tính năng touch (nếu có)",
			"Kiểm tra khả năng hiển thị",
			"Đánh giá tình trạng khung màn hình",
		],
		potentialSolutions: [
			"Thay màn hình mới",
			"Sửa chữa khung màn hình nếu cần",
			"Cập nhật driver nếu cần thiết",
		],
		partsNeeded: ["Màn hình LCD/LED mới", "Khung màn hình (nếu cần)"],
		riskFactors: ["Chi phí thay màn hình cao", "Khó tìm màn hình cho model cũ"],
	},

	battery_charging_failure: {
		category: "battery",
		subcategory: "charging_failure",
		urgencyLevel: "high",
		estimatedTime: "1-3 giờ",
		estimatedCost: 800000,
		requiresSpecialist: false,
		commonCauses: [
			"Pin bị chai",
			"Adapter sạc hỏng",
			"Cổng sạc bị lỏng",
			"IC sạc trên mainboard hỏng",
			"Cáp sạc bên trong bị đứt",
		],
		diagnosticSteps: [
			"Kiểm tra adapter sạc với đồng hồ vạn năng",
			"Test với adapter khác cùng thông số",
			"Kiểm tra cổng sạc có lỏng không",
			"Chạy battery report trên Windows",
			"Kiểm tra IC sạc trên mainboard",
		],
		potentialSolutions: [
			"Thay pin mới",
			"Thay adapter sạc",
			"Sửa cổng sạc",
			"Thay IC sạc trên mainboard",
			"Thay cáp sạc bên trong",
		],
		partsNeeded: ["Pin laptop", "Adapter sạc", "IC sạc", "Cáp sạc nội bộ"],
		riskFactors: [
			"Pin phồng có thể gây hư hại mainboard",
			"IC sạc hỏng chi phí cao",
		],
	},

	keyboard_key_failure: {
		category: "keyboard",
		subcategory: "key_failure",
		urgencyLevel: "medium",
		estimatedTime: "1-2 giờ",
		estimatedCost: 500000,
		requiresSpecialist: false,
		commonCauses: [
			"Bàn phím bị nước",
			"Bụi bẩn tích tụ",
			"Màng bàn phím hỏng",
			"Kết nối bàn phím lỏng",
			"Driver bàn phím lỗi",
		],
		diagnosticSteps: [
			"Test bàn phím bằng on-screen keyboard",
			"Kiểm tra Device Manager",
			"Test từng vùng phím",
			"Kiểm tra kết nối cáp bàn phím",
			"Vệ sinh bàn phím",
		],
		potentialSolutions: [
			"Vệ sinh bàn phím",
			"Cập nhật driver bàn phím",
			"Thay màng bàn phím",
			"Thay toàn bộ bàn phím",
			"Sửa kết nối cáp",
		],
		partsNeeded: ["Bàn phím thay thế", "Màng bàn phím", "Cáp kết nối"],
		riskFactors: ["Bàn phím laptop khó tháo", "Model cũ khó tìm linh kiện"],
	},

	software_boot_failure: {
		category: "software",
		subcategory: "boot_failure",
		urgencyLevel: "urgent",
		estimatedTime: "2-6 giờ",
		estimatedCost: 300000,
		requiresSpecialist: false,
		commonCauses: [
			"File hệ thống bị corrupt",
			"Ổ cứng bị bad sector",
			"Virus phá hoại bootloader",
			"Cập nhật Windows lỗi",
			"Hardware incompatibility",
		],
		diagnosticSteps: [
			"Boot từ USB/CD cứu hộ",
			"Chạy chkdsk để kiểm tra ổ cứng",
			"Scan virus với antivirus rescue disk",
			"Kiểm tra BIOS/UEFI settings",
			"Test RAM với MemTest86",
		],
		potentialSolutions: [
			"Repair Windows bằng Installation Media",
			"Restore từ System Restore Point",
			"Chạy SFC và DISM commands",
			"Format và cài đặt lại Windows",
			"Thay ổ cứng nếu bị bad sector",
		],
		partsNeeded: ["USB cứu hộ", "Ổ cứng mới (nếu cần)", "Windows license"],
		riskFactors: ["Có thể mất dữ liệu", "Cần backup trước khi sửa chữa"],
	},

	performance_slow_performance: {
		category: "performance",
		subcategory: "slow_performance",
		urgencyLevel: "low",
		estimatedTime: "1-3 giờ",
		estimatedCost: 200000,
		requiresSpecialist: false,
		commonCauses: [
			"Ổ cứng HDD cũ",
			"RAM không đủ",
			"Nhiều startup programs",
			"Virus/malware",
			"Registry bị bloat",
		],
		diagnosticSteps: [
			"Kiểm tra Task Manager",
			"Chạy Performance Monitor",
			"Scan virus/malware",
			"Kiểm tra Startup programs",
			"Test tốc độ ổ cứng",
		],
		potentialSolutions: [
			"Upgrade SSD thay cho HDD",
			"Tăng RAM",
			"Disable startup programs không cần",
			"Dọn dẹp registry",
			"Format và cài lại Windows",
		],
		partsNeeded: ["SSD", "RAM", "Phần mềm tối ưu"],
		riskFactors: [
			"Có thể cần upgrade phần cứng",
			"Chi phí tăng nếu cần nhiều linh kiện",
		],
	},
};

export function classifyProblem(
	problemDescription: string,
	deviceBrand: string,
	deviceModel: string,
): ProblemClassification {
	const description = problemDescription.toLowerCase();
	let bestMatch = "";
	let bestScore = 0;

	// Tính điểm cho từng keyword
	for (const [key, keyword] of Object.entries(vietnameseProblemKeywords)) {
		let score = 0;
		for (const indicator of keyword.indicators) {
			if (description.includes(indicator.toLowerCase())) {
				score += keyword.weight;
			}
		}

		if (score > bestScore) {
			bestScore = score;
			bestMatch = key;
		}
	}

	// Nếu không tìm thấy match tốt, trả về default
	if (!bestMatch || bestScore < 5) {
		return getDefaultClassification();
	}

	const keyword = vietnameseProblemKeywords[bestMatch];
	const solutionKey = `${keyword.category}_${keyword.subcategory}`;
	const solution = problemSolutions[solutionKey];

	if (solution) {
		return {
			...solution,
			// Điều chỉnh chi phí dựa trên thương hiệu và model
			estimatedCost: adjustCostForDevice(
				solution.estimatedCost,
				deviceBrand,
				deviceModel,
			),
		};
	}

	return getDefaultClassification();
}

function adjustCostForDevice(
	baseCost: number | null,
	deviceBrand: string,
	deviceModel: string,
): number | null {
	if (!baseCost) return null;

	// Điều chỉnh giá dựa trên thương hiệu
	const brandMultipliers: Record<string, number> = {
		Apple: 1.5,
		Microsoft: 1.3,
		ASUS: 1.1,
		Dell: 1.1,
		HP: 1.0,
		Lenovo: 1.0,
		Acer: 0.9,
		MSI: 1.2,
	};

	const multiplier = brandMultipliers[deviceBrand] || 1.0;

	// Điều chỉnh thêm cho model cao cấp
	const isHighEndModel =
		deviceModel.toLowerCase().includes("pro") ||
		deviceModel.toLowerCase().includes("gaming") ||
		deviceModel.toLowerCase().includes("workstation");

	const finalMultiplier = isHighEndModel ? multiplier * 1.2 : multiplier;

	return Math.round(baseCost * finalMultiplier);
}

function getDefaultClassification(): ProblemClassification {
	return {
		category: "other",
		subcategory: "unknown",
		urgencyLevel: "medium",
		estimatedTime: "1-2 giờ",
		estimatedCost: 300000,
		requiresSpecialist: false,
		commonCauses: ["Cần chẩn đoán thêm để xác định nguyên nhân"],
		diagnosticSteps: [
			"Thu thập thêm thông tin từ khách hàng",
			"Kiểm tra tình trạng phần cứng",
			"Chạy diagnostic tools",
			"Test các tính năng cơ bản",
		],
		potentialSolutions: [
			"Chẩn đoán chi tiết hơn",
			"Tham khảo manual của thiết bị",
			"Liên hệ support từ nhà sản xuất",
		],
		partsNeeded: [],
		riskFactors: ["Cần chẩn đoán thêm để đánh giá rủi ro"],
	};
}

export function generateDiagnosticReport(
	classification: ProblemClassification,
	deviceInfo: any,
): string {
	const report = `
BÁO CÁO CHẨN ĐOÁN SƠ BỘ
========================

Thiết bị: ${deviceInfo.brand} ${deviceInfo.model}
Loại vấn đề: ${classification.category} - ${classification.subcategory}
Mức độ ưu tiên: ${classification.urgencyLevel.toUpperCase()}
Thời gian ước tính: ${classification.estimatedTime}
Chi phí ước tính: ${classification.estimatedCost ? `${classification.estimatedCost.toLocaleString("vi-VN")} VNĐ` : "Chưa xác định"}
Cần chuyên gia: ${classification.requiresSpecialist ? "Có" : "Không"}

NGUYÊN NHÂN THƯỜNG GẶP:
${classification.commonCauses.map((cause) => `- ${cause}`).join("\n")}

CÁC BƯỚC CHẨN ĐOÁN:
${classification.diagnosticSteps.map((step) => `- ${step}`).join("\n")}

GIẢI PHÁP KHẢ THI:
${classification.potentialSolutions.map((solution) => `- ${solution}`).join("\n")}

LINH KIỆN CẦN THIẾT:
${
	classification.partsNeeded.length > 0
		? classification.partsNeeded.map((part) => `- ${part}`).join("\n")
		: "- Chưa xác định"
}

YẾU TỐ RỦI RO:
${classification.riskFactors.map((risk) => `- ${risk}`).join("\n")}

========================
Báo cáo được tạo tự động dựa trên mô tả vấn đề.
Vui lòng chẩn đoán trực tiếp để có kết quả chính xác nhất.
`;

	return report;
}

export function suggestQuestions(
	classification: ProblemClassification,
): string[] {
	const baseQuestions = [
		"Vấn đề này xảy ra từ khi nào?",
		"Có hiện tượng gì khác bất thường không?",
		"Máy có bị rơi hoặc va đập gần đây không?",
		"Có cài đặt phần mềm mới nào gần đây không?",
	];

	const categorySpecificQuestions: Record<string, string[]> = {
		screen: [
			"Màn hình có hiển thị gì không khi bật máy?",
			"Có thể thấy hình ảnh mờ mờ không?",
			"Có ánh sáng từ màn hình không?",
		],
		battery: [
			"Khi nào lần cuối sạc đầy pin?",
			"Máy có hoạt động khi cắm sạc không?",
			"Pin có bị phồng hoặc nóng bất thường không?",
		],
		keyboard: [
			"Tất cả phím đều không hoạt động hay chỉ một số phím?",
			"Có đổ nước hoặc chất lỏng lên bàn phím không?",
			"Bàn phím có bị dính hay kẹt không?",
		],
		software: [
			"Có thông báo lỗi nào hiện ra không?",
			"Vấn đề xảy ra trong Safe Mode không?",
			"Có backup dữ liệu gần đây không?",
		],
	};

	const specificQuestions =
		categorySpecificQuestions[classification.category] || [];
	return [...baseQuestions, ...specificQuestions];
}
