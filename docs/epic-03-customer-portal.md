# Epic 03: Customer Portal & Public Ticket Lookup

## Epic Goal

Xây dựng portal công khai cho khách hàng tra cứu trạng thái phiếu sửa chữa và trang thông tin dịch vụ, thay thế WordPress hiện tại.

## Epic Description

**Bối cảnh dự án:**
- Public portal không yêu cầu authentication
- Customer lookup chỉ cần phone number (no OTP)
- PWA-ready với offline support cho static content
- SEO-friendly để thay thế WordPress

**Chi tiết Epic:**
- **Mục tiêu:** Cung cấp customer self-service portal và marketing pages
- **Phạm vi:** Ticket lookup, service info pages, contact information, warranty details
- **Kết quả:** Customers có thể tự tra cứu tickets và shop có web presence mới

## Stories

### 1. **Story 3.1:** Public Ticket Lookup System
- Ticket search by phone number (simple input form)
- Display customer-facing ticket information (filtered data)
- Status translation cho customer-friendly messages
- Warranty information display

### 2. **Story 3.2:** Service Information Pages
- Dịch vụ sửa chữa laptop (service overview)
- Quy trình sửa chữa (process explanation)
- Bảng giá tham khảo (pricing guidelines)
- Chính sách bảo hành (warranty policy)

### 3. **Story 3.3:** Product & Training Information
- Danh mục laptop cũ & linh kiện (product catalog)
- Thông tin khóa đào tạo (training courses)
- Hợp tác sửa chữa (partnership info)
- Blog content migration từ WordPress

### 4. **Story 3.4:** PWA Implementation & SEO
- Progressive Web App setup
- Offline support cho essential pages
- SEO optimization (meta tags, structured data)
- Mobile-first responsive design

## Technical Implementation

**Public Routes Structure:**
```
/ (Homepage - service overview)
├── /sua-laptop (Repair services)
│   ├── /sua-laptop/quy-trinh (Process)
│   ├── /sua-laptop/bang-gia (Pricing)
│   └── /sua-laptop/tra-cuu (Ticket lookup)
├── /san-pham (Products)
│   ├── /san-pham/laptop (Used laptops)
│   └── /san-pham/linh-kien (Parts)
├── /dao-tao (Training courses)
├── /hop-tac (Partnership)
├── /gioi-thieu (About us)
├── /lien-he (Contact)
└── /blog (Blog posts)
```

**Customer Data Display (RLS-filtered):**
```typescript
// Public ticket view (limited data)
interface PublicTicketView {
  ticket_code: string;
  device_type: string;
  status_customer_facing: string; // Translated status
  created_at: string;
  estimated_completion?: string;
  warranty_until?: string;
  // NO: internal notes, cost details, photos, staff info
}
```

**PWA Features:**
- Service Worker cho offline access
- App manifest với shop branding
- Push notifications setup (future use)
- Install prompt cho mobile users

**SEO Optimization:**
- Meta tags cho tất cả pages
- OpenGraph data cho social sharing
- Structured data cho local business
- Sitemap generation

## User Experience Flow

**Customer Lookup Flow:**
1. **Homepage:** Clear CTA to ticket lookup
2. **Search:** Enter phone number (Vietnamese format validation)
3. **Results:** List all tickets for that phone number
4. **Detail:** Click ticket to see status và warranty info
5. **Contact:** Easy access to shop contact nếu có questions

**Information Pages:**
- Clear service descriptions
- Process transparency
- Contact information prominent
- Mobile-optimized navigation

## Definition of Done

- [ ] Ticket lookup hoạt động với phone number search
- [ ] Customer-facing status messages appropriate
- [ ] All service information pages complete
- [ ] PWA functionality working (install, offline)
- [ ] SEO optimization implemented
- [ ] Mobile responsive design verified
- [ ] Vietnamese language content complete
- [ ] Contact information và business hours accurate

## Risk Mitigation

- **Primary Risk:** Customer confusion với technical status names
- **Mitigation:** Clear status translations và explanatory text
- **Rollback Plan:** Static pages backup nếu dynamic lookup fails

## Success Criteria

Customer portal hoàn chỉnh:
1. Customers có thể easily find và understand ticket status
2. Service information comprehensive và accessible
3. PWA functionality provides good mobile experience
4. SEO performance tốt for local search
5. Professional web presence thay thế WordPress effectively