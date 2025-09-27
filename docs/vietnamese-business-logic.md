# Vietnamese Business Logic and Domain Patterns

This document describes the Vietnamese-specific business logic, domain patterns, and cultural considerations implemented in the Laptop Repair Shop Management System.

## Table of Contents

1. [Vietnamese Business Context](#vietnamese-business-context)
2. [Phone Number System](#phone-number-system)
3. [Currency and Pricing](#currency-and-pricing)
4. [Date and Time Handling](#date-and-time-handling)
5. [Customer Management Patterns](#customer-management-patterns)
6. [Repair Workflow Process](#repair-workflow-process)
7. [Inventory and Parts Management](#inventory-and-parts-management)
8. [Communication Patterns](#communication-patterns)
9. [Business Hours and Scheduling](#business-hours-and-scheduling)
10. [Cultural Considerations](#cultural-considerations)

## Vietnamese Business Context

### Market Characteristics

The Vietnamese laptop repair market has unique characteristics that influence the system design:

- **Phone-centric identification**: Vietnamese businesses commonly use phone numbers as primary customer identifiers
- **Cash-heavy transactions**: Many customers prefer cash payments or bank transfers
- **Family-oriented service**: Customers often bring devices on behalf of family members
- **Trust-based relationships**: Long-term customer relationships are highly valued
- **Price sensitivity**: Customers are very price-conscious and expect detailed cost breakdowns

### Business Model Patterns

```typescript
// Vietnamese repair shop business model
interface VietnameseRepairShopModel {
  primaryIdentifier: 'phone_number'; // Not email or ID cards
  paymentMethods: ['cash', 'bank_transfer', 'momo', 'zalopay'];
  customerRetention: 'relationship_based';
  pricingStrategy: 'transparent_breakdown';
  serviceApproach: 'family_friendly';
}
```

## Phone Number System

### Vietnamese Mobile Number Format

Vietnamese mobile numbers follow specific patterns that are critical for business operations:

```typescript
// Valid Vietnamese mobile prefixes (as of 2025)
const VIETNAMESE_MOBILE_PREFIXES = {
  viettel: ['086', '096', '097', '098', '032', '033', '034', '035', '036', '037', '038', '039'],
  vinaphone: ['088', '091', '094', '083', '084', '085', '081', '082'],
  mobifone: ['089', '090', '093', '070', '079', '077', '076', '078'],
  vietnamobile: ['092', '056', '058'],
  gmobile: ['099', '059']
};

// Total format: 10 digits (0 + 2-3 digit prefix + 7-8 digits)
const PHONE_PATTERN = /^(03|05|07|08|09)[0-9]{8}$/;
```

### Business Implementation

#### Storage Format
```typescript
// Always store phone numbers in normalized format
function toStorageFormat(phone: string): string {
  return phone.replace(/\D/g, ''); // Remove all non-digits
}

// Example: "090 123 4567" → "0901234567"
```

#### Display Format
```typescript
// Format for user display
function formatForDisplay(phone: string): string {
  const normalized = phone.replace(/\D/g, '');
  if (normalized.length === 10) {
    return `${normalized.slice(0, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7)}`;
  }
  return phone;
}

// Example: "0901234567" → "0901 234 567"
```

#### Validation Rules
```typescript
interface PhoneValidationRules {
  // Business rules for Vietnamese phone numbers
  mustBe10Digits: true;
  mustStartWithZero: true;
  mustHaveValidPrefix: true;
  allowInternationalFormat: false; // Convert +84 to 0
  allowDuplicates: false; // Each customer must have unique phone
}
```

## Currency and Pricing

### Vietnamese Dong (VND) Characteristics

Vietnamese Dong has specific characteristics that affect system design:

```typescript
interface VNDCharacteristics {
  hasNoDecimals: true; // VND doesn't use cents/decimals
  largeNumbers: true; // Common amounts: 50,000 - 5,000,000 VND
  roundingRule: '1000_increments'; // Prices typically in 1,000 VND increments
  displayFormat: 'decimal_separator_dot'; // 1.500.000 ₫
  symbolPlacement: 'suffix'; // Amount + space + ₫
}
```

### Pricing Patterns

#### Common Repair Price Ranges
```typescript
const REPAIR_PRICE_RANGES = {
  diagnosis: { min: 0, max: 100000 }, // Free to 100K VND
  basicRepair: { min: 50000, max: 500000 }, // 50K to 500K VND
  screenReplacement: { min: 800000, max: 3000000 }, // 800K to 3M VND
  motherboardRepair: { min: 1000000, max: 5000000 }, // 1M to 5M VND
  dataRecovery: { min: 200000, max: 2000000 }, // 200K to 2M VND
};
```

#### Pricing Validation
```typescript
function validateVietnameseRepairPrice(amount: number): ValidationResult {
  const errors: string[] = [];

  if (amount < 0) {
    errors.push('Giá không thể âm');
  }

  if (amount > 10000000) { // 10M VND ceiling
    errors.push('Giá quá cao cho dịch vụ sửa chữa laptop');
  }

  if (amount % 1000 !== 0) {
    errors.push('Giá phải là bội số của 1.000 VND');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

#### Cost Breakdown Structure
```typescript
interface RepairCostBreakdown {
  laborCost: number; // Chi phí nhân công
  partsCost: number; // Chi phí linh kiện
  overheadCost: number; // Chi phí vận hành
  taxAmount: number; // Thuế (if applicable)
  discountAmount: number; // Giảm giá
  totalCost: number; // Tổng chi phí

  // Vietnamese business context
  warrantyPeriod: number; // Thời gian bảo hành (days)
  paymentTerms: 'cash' | 'bank_transfer' | 'installment'; // Hình thức thanh toán
}
```

## Date and Time Handling

### Vietnamese Timezone and Calendar

```typescript
const VIETNAMESE_LOCALE_CONFIG = {
  timezone: 'Asia/Ho_Chi_Minh', // UTC+7
  locale: 'vi-VN',
  dateFormat: 'DD/MM/YYYY', // Day first, common in Vietnam
  timeFormat: '24-hour', // 24-hour clock preferred
  weekStart: 'monday', // Week starts on Monday
};
```

### Business Hours Pattern
```typescript
interface VietnameseBusinessHours {
  weekdays: {
    open: '08:00';
    close: '18:00';
    lunchBreak: { start: '12:00', end: '13:00' }; // Common lunch break
  };

  saturday: {
    open: '08:00';
    close: '17:00';
    halfDay: true;
  };

  sunday: {
    closed: true;
  };

  holidays: {
    tetHoliday: 'variable_dates'; // Lunar New Year (7-10 days)
    nationalDay: '02/09'; // September 2nd
    liberationDay: '30/04'; // April 30th
    laborDay: '01/05'; // May 1st
  };
}
```

### Repair Duration Estimates
```typescript
function calculateVietnameseRepairDuration(
  category: RepairCategory,
  priority: RepairPriority,
  complexity: RepairComplexity
): RepairDurationEstimate {
  const baseDuration = {
    diagnosis: 1, // 1 business day
    software: 2, // 2 business days
    hardware: 3, // 3 business days
    screen: 2, // 2 business days (if parts available)
    motherboard: 5, // 5 business days
    dataRecovery: 7, // 7 business days
  };

  const priorityMultiplier = {
    urgent: 0.5, // Rush service
    high: 0.7,
    normal: 1.0,
    low: 1.5,
  };

  const complexityMultiplier = {
    simple: 1.0,
    moderate: 1.5,
    complex: 2.0,
    extreme: 3.0,
  };

  const businessDays = Math.ceil(
    baseDuration[category] *
    priorityMultiplier[priority] *
    complexityMultiplier[complexity]
  );

  return {
    businessDays,
    excludeWeekends: true,
    excludeHolidays: true,
    estimatedCompletion: calculateBusinessDate(new Date(), businessDays),
  };
}
```

## Customer Management Patterns

### Vietnamese Customer Identification

```typescript
interface VietnameseCustomerProfile {
  // Primary identification (required)
  phone: string; // Primary key - Vietnamese mobile number
  fullName: string; // Full Vietnamese name with diacritics

  // Optional information
  address?: string; // Vietnamese address format
  email?: string; // Often not provided
  idNumber?: string; // Rarely collected for privacy

  // Relationship context
  familyMembers?: string[]; // Other phones in family
  preferredContact: 'phone' | 'sms' | 'zalo' | 'messenger';

  // Business context
  customerSince: Date;
  totalRepairs: number;
  loyaltyLevel: 'new' | 'regular' | 'vip';
  notes?: string; // Important for relationship management
}
```

### Family-oriented Service Pattern

Vietnamese customers often handle devices for family members:

```typescript
interface FamilyServiceContext {
  deviceOwner: string; // Who owns the device
  serviceRequester: string; // Who brought it for repair
  paymentResponsible: string; // Who will pay
  pickupAuthorized: string[]; // Who can pick up the device
  relationshipNotes: string; // "Mẹ mang máy con đến sửa"
}
```

### Customer Communication Preferences

```typescript
const VIETNAMESE_COMMUNICATION_PREFERENCES = {
  // Preferred messaging platforms (in order)
  messaging: ['Zalo', 'Facebook Messenger', 'SMS', 'WhatsApp'],

  // Communication style
  formality: 'respectful', // Use proper Vietnamese honorifics
  language: 'vietnamese_primary', // Vietnamese first, English as backup

  // Notification preferences
  statusUpdates: 'proactive', // Customers expect regular updates
  completionNotice: 'immediate', // Notify immediately when ready
  pickupReminder: 'after_2_days', // Remind if not picked up
};
```

## Repair Workflow Process

### Vietnamese Repair Status Lifecycle

The repair process follows Vietnamese business customs:

```typescript
const VIETNAMESE_REPAIR_STATUSES = {
  // Initial intake
  draft: 'Phiếu nháp', // Draft ticket
  device_received: 'Đã nhận máy', // Device received

  // Diagnosis phase
  initial_diagnosis: 'Chẩn đoán sơ bộ', // Initial diagnosis
  diagnosis_complete: 'Hoàn thành chẩn đoán', // Diagnosis complete

  // Approval phase
  waiting_for_approval: 'Chờ khách phê duyệt', // Waiting for customer approval
  approved: 'Khách đã phê duyệt', // Customer approved

  // Repair phase
  parts_ordered: 'Đã đặt linh kiện', // Parts ordered
  parts_received: 'Đã nhận linh kiện', // Parts received
  in_progress: 'Đang sửa chữa', // Repair in progress
  repair_complete: 'Hoàn thành sửa chữa', // Repair complete

  // Quality and completion
  quality_check: 'Kiểm tra chất lượng', // Quality check
  ready_for_pickup: 'Sẵn sàng giao máy', // Ready for pickup
  completed: 'Đã hoàn thành', // Completed and picked up

  // Cancellation states
  cancelled_by_customer: 'Khách hủy', // Customer cancelled
  cancelled_by_shop: 'Cửa hàng hủy', // Shop cancelled
  abandoned: 'Khách bỏ quên', // Customer abandoned device
};
```

### Status Transition Rules

```typescript
interface StatusTransitionRules {
  // Vietnamese business rules for status changes
  customer_approval_required: [
    'diagnosis_complete' → 'waiting_for_approval',
    'waiting_for_approval' → 'approved' // Requires customer confirmation
  ];

  automatic_transitions: [
    'device_received' → 'initial_diagnosis', // Can start immediately
    'parts_received' → 'in_progress', // Can resume repair
    'repair_complete' → 'quality_check' // Automatic QC process
  ];

  manual_transitions: [
    'quality_check' → 'ready_for_pickup', // Technician approval required
    'ready_for_pickup' → 'completed' // Customer pickup confirmation
  ];

  cancellation_allowed: [
    'draft', 'device_received', 'waiting_for_approval' // Early stages only
  ];
}
```

### Priority Handling

Vietnamese customers have specific expectations for priority handling:

```typescript
interface VietnamesePriorityHandling {
  urgent: {
    description: 'Khẩn cấp'; // Emergency
    maxDuration: '24_hours'; // Same or next day
    surcharge: '50_percent'; // 50% rush fee
    requirements: ['customer_approval', 'parts_available'];
  };

  high: {
    description: 'Ưu tiên cao'; // High priority
    maxDuration: '2_business_days';
    surcharge: '25_percent'; // 25% priority fee
    requirements: ['customer_approval'];
  };

  normal: {
    description: 'Bình thường'; // Normal
    maxDuration: 'standard_estimate';
    surcharge: 'none';
    requirements: [];
  };

  low: {
    description: 'Không gấp'; // No rush
    maxDuration: 'extended_timeline';
    discount: '10_percent'; // 10% discount for flexible timing
    requirements: [];
  };
}
```

## Inventory and Parts Management

### Vietnamese Parts Market

The Vietnamese laptop parts market has unique characteristics:

```typescript
interface VietnamesePartsMarket {
  // Source preferences
  sources: ['official_distributor', 'grey_market', 'refurbished', 'compatible'];

  // Availability patterns
  availability: {
    popular_brands: ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer']; // High availability
    premium_brands: ['Apple', 'Surface', 'ThinkPad']; // Limited availability
    old_models: 'parts_scarce'; // >3 years old
  };

  // Pricing characteristics
  pricing: {
    official_parts: 'expensive_but_warranted';
    compatible_parts: 'affordable_but_risk';
    refurbished_parts: 'middle_ground';
  };

  // Lead times
  leadTimes: {
    inStock: '0_days';
    localSupplier: '1_3_days';
    hanoi_hcm: '3_5_days'; // From major cities
    international: '7_14_days'; // Import required
  };
}
```

### Parts Recommendation Strategy

```typescript
function getVietnamesePartsRecommendation(
  deviceInfo: DeviceInfo,
  customerBudget: number,
  urgency: RepairUrgency
): PartsRecommendation {
  const recommendations = [];

  // Official parts (if budget allows)
  if (customerBudget >= officialPartPrice * 0.8) {
    recommendations.push({
      type: 'official',
      description: 'Linh kiện chính hãng',
      warranty: '12_months',
      price: officialPartPrice,
      availability: checkOfficialAvailability(deviceInfo),
      pros: ['Chất lượng cao', 'Bảo hành dài', 'Tương thích 100%'],
      cons: ['Giá cao', 'Có thể mất thời gian đặt hàng']
    });
  }

  // Compatible parts (good value)
  recommendations.push({
    type: 'compatible',
    description: 'Linh kiện tương thích',
    warranty: '6_months',
    price: compatiblePartPrice,
    availability: 'readily_available',
    pros: ['Giá hợp lý', 'Có sẵn', 'Chất lượng ổn định'],
    cons: ['Bảo hành ngắn hơn', 'Thương hiệu không nổi tiếng']
  });

  // Refurbished parts (budget option)
  if (customerBudget < compatiblePartPrice * 1.2) {
    recommendations.push({
      type: 'refurbished',
      description: 'Linh kiện tân trang',
      warranty: '3_months',
      price: refurbishedPartPrice,
      availability: checkRefurbishedAvailability(deviceInfo),
      pros: ['Giá rẻ nhất', 'Linh kiện gốc'],
      cons: ['Bảo hành ngắn', 'Tuổi thọ không đảm bảo', 'Có thể hết hàng']
    });
  }

  return {
    recommendations,
    suggestion: selectBestOption(recommendations, customerBudget, urgency),
    explanation: generateVietnameseExplanation(recommendations)
  };
}
```

## Communication Patterns

### Vietnamese Customer Communication

Communication with Vietnamese customers follows specific cultural patterns:

#### Respectful Language
```typescript
const VIETNAMESE_COMMUNICATION_PATTERNS = {
  honorifics: {
    male_customer: 'Anh', // For male customers
    female_customer: 'Chị', // For female customers
    elderly_customer: 'Bác', // For elderly customers
    young_customer: 'Em', // For younger customers
  },

  formality_levels: {
    initial_contact: 'formal', // Use proper titles and respectful language
    regular_customer: 'friendly_formal', // Warmer but still respectful
    family_customer: 'familiar', // More casual for family members
  },

  message_structure: {
    greeting: 'Xin chào [honorific] [name]',
    update: 'Cập nhật tình hình sửa chữa',
    request: 'Cần [honorific] xác nhận',
    closing: 'Trân trọng cảm ơn [honorific]',
  }
};
```

#### Status Update Messages
```typescript
const STATUS_UPDATE_TEMPLATES = {
  diagnosis_complete: {
    title: 'Hoàn thành chẩn đoán máy tính',
    message: `Xin chào {honorific} {customerName},

Chúng tôi đã hoàn thành việc chẩn đoán máy tính {deviceInfo} của {honorific}.

🔍 Tình trạng: {diagnosisResult}
💰 Chi phí ước tính: {estimatedCost}
⏱️ Thời gian sửa chữa: {estimatedDuration}

{honorific} có đồng ý cho chúng tôi tiến hành sửa chữa không?

Vui lòng liên hệ: {shopPhone}
Trân trọng,
{shopName}`,
  },

  ready_for_pickup: {
    title: 'Máy tính đã sửa xong - Sẵn sàng giao',
    message: `Xin chào {honorific} {customerName},

🎉 Máy tính {deviceInfo} của {honorific} đã được sửa chữa hoàn thành!

✅ Vấn đề đã khắc phục: {repairedIssues}
💰 Tổng chi phí: {totalCost}
🛡️ Bảo hành: {warrantyPeriod}

{honorific} có thể đến nhận máy trong giờ hành chính:
📍 Địa chỉ: {shopAddress}
🕐 Giờ làm việc: {businessHours}

Trân trọng cảm ơn {honorific}!`,
  }
};
```

### Multi-channel Communication Strategy

```typescript
interface CommunicationChannelStrategy {
  primary: 'phone_call'; // Direct call for important updates
  secondary: 'zalo_message'; // Zalo is very popular in Vietnam
  tertiary: 'sms'; // Fallback for older customers

  channelSelection: {
    urgent_updates: ['phone_call', 'zalo_message'];
    routine_updates: ['zalo_message', 'sms'];
    marketing: ['zalo_official_account', 'facebook_page'];
  };

  timing: {
    business_hours: '08:00-18:00';
    avoid_lunch: '12:00-13:00'; // Don't call during lunch
    weekend_emergency_only: true;
  };
}
```

## Business Hours and Scheduling

### Vietnamese Work Calendar

```typescript
const VIETNAMESE_WORK_CALENDAR = {
  standardWeek: {
    monday: { open: '08:00', close: '18:00', fullDay: true },
    tuesday: { open: '08:00', close: '18:00', fullDay: true },
    wednesday: { open: '08:00', close: '18:00', fullDay: true },
    thursday: { open: '08:00', close: '18:00', fullDay: true },
    friday: { open: '08:00', close: '18:00', fullDay: true },
    saturday: { open: '08:00', close: '17:00', halfDay: true },
    sunday: { closed: true },
  },

  lunchBreak: {
    start: '12:00',
    end: '13:00',
    note: 'Limited service during lunch'
  },

  seasonalAdjustments: {
    summer: { start: '07:30', close: '17:30' }, // Earlier hours in hot weather
    winter: { start: '08:30', close: '18:30' }, // Later start in cold weather
  }
};
```

### Holiday Calendar Integration

```typescript
interface VietnameseHolidayCalendar {
  fixedHolidays: {
    newYear: '01/01',
    liberationDay: '30/04',
    laborDay: '01/05',
    nationalDay: '02/09',
  },

  lunarHolidays: {
    tetHoliday: {
      duration: '7-10_days',
      timing: 'late_january_early_february',
      impact: 'complete_closure',
      preparation: 'finish_all_repairs_before',
    },
    hungKingDay: {
      duration: '1_day',
      timing: 'lunar_march_10',
      impact: 'closed',
    }
  },

  businessImpact: {
    beforeTet: 'rush_to_complete_repairs',
    duringTet: 'emergency_only',
    afterTet: 'gradual_reopening',
  }
}
```

## Cultural Considerations

### Trust and Relationship Building

Vietnamese business culture emphasizes trust and long-term relationships:

```typescript
interface TrustBuildingPatterns {
  transparency: {
    priceBreakdown: 'detailed_explanation_required',
    repairProcess: 'step_by_step_updates',
    timeline: 'realistic_estimates_with_buffer',
  },

  reliability: {
    promises: 'under_promise_over_deliver',
    communication: 'proactive_updates',
    quality: 'thorough_testing_before_return',
  },

  personalTouch: {
    remembering: 'customer_preferences_and_history',
    service: 'family_member_treatment',
    followUp: 'post_repair_check_ins',
  }
}
```

### Face-saving Considerations

Vietnamese culture values "saving face" - avoiding embarrassment:

```typescript
interface FaceSavingProtocols {
  priceNegotiation: {
    approach: 'respectful_discussion',
    options: 'multiple_price_points',
    flexibility: 'reasonable_accommodation',
  },

  qualityIssues: {
    approach: 'collaborative_problem_solving',
    responsibility: 'shared_ownership',
    resolution: 'generous_compensation',
  },

  communication: {
    criticism: 'constructive_and_private',
    suggestions: 'framed_as_requests',
    disagreement: 'indirect_and_respectful',
  }
}
```

### Family-Oriented Service

Vietnamese families often share technology decisions:

```typescript
interface FamilyServiceApproach {
  decisionMaking: {
    expensive_repairs: 'family_consultation_expected',
    urgent_repairs: 'contact_multiple_family_members',
    pickup_authorization: 'flexible_family_member_pickup',
  },

  communication: {
    updates: 'inform_primary_contact_and_device_owner',
    payment: 'clarify_payment_responsibility',
    warranty: 'transferable_to_family_members',
  },

  service_adaptation: {
    scheduling: 'accommodate_family_schedules',
    explanation: 'technical_terms_in_simple_vietnamese',
    documentation: 'clear_written_records_for_family',
  }
}
```

## Implementation Guidelines

### Code Organization

Vietnamese business logic should be organized in dedicated modules:

```
src/
  lib/
    vietnamese/
      phone-validation.ts
      currency-formatting.ts
      date-time-utils.ts
      business-rules.ts
      communication-templates.ts

  hooks/
    vietnamese/
      use-vietnamese-customer.ts
      use-repair-workflow-vi.ts
      use-pricing-calculator.ts

  components/
    vietnamese/
      PhoneInput.tsx
      CurrencyDisplay.tsx
      StatusBadge.tsx
      CustomerForm.tsx
```

### Testing Vietnamese Business Logic

Always test Vietnamese-specific business rules:

```typescript
describe('Vietnamese Business Logic', () => {
  describe('Phone Number Validation', () => {
    it('should accept valid Vietnamese mobile numbers', () => {
      const validPhones = [
        '0901234567', '0912345678', '0987654321',
        '0356789012', '0778901234'
      ];

      validPhones.forEach(phone => {
        expect(isValidVietnamesePhone(phone)).toBe(true);
      });
    });
  });

  describe('Currency Formatting', () => {
    it('should format VND amounts correctly', () => {
      expect(formatVND(1500000)).toBe('1.500.000 ₫');
      expect(formatVND(0)).toBe('Miễn phí');
    });
  });

  describe('Business Hours', () => {
    it('should respect Vietnamese lunch break', () => {
      const lunchTime = new Date('2025-01-15T12:30:00+07:00');
      expect(isBusinessHours(lunchTime)).toBe(false);
    });
  });
});
```

This documentation serves as a comprehensive guide for understanding and implementing Vietnamese business logic in the laptop repair shop management system. Always consider these cultural and business patterns when developing new features or modifying existing functionality.