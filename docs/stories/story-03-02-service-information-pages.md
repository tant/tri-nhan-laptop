# Story 03.2: Service Information Pages

## User Story

**As a** potential customer or website visitor,
**I want** comprehensive information about laptop repair services, pricing, và process,
**So that** tôi có thể understand what to expect và make informed decisions about repair services.

## Story Context

**WordPress Replacement Strategy:**
- Migrate essential content từ existing WordPress site
- Static content với CMS-like editing capability for shop owner
- SEO-optimized pages để maintain search rankings
- Professional presentation to compete với other repair shops
- Mobile-first design cho modern user experience

**Business Information Architecture:**
- Service descriptions với clear value propositions
- Transparent pricing để build customer trust
- Process explanation để reduce customer anxiety
- Warranty policy để demonstrate quality commitment

## Acceptance Criteria

### **Service Overview Page Requirements:**

**AC-SO1: Comprehensive Service Description**
```gherkin
GIVEN visitor accessing service overview page
WHEN page content is displayed
THEN shows complete list of repair services:
  - Screen replacement và LCD repair
  - Keyboard repair và replacement
  - Battery replacement và power issues
  - Memory (RAM) upgrades và replacement
  - Hard drive/SSD replacement và data recovery
  - Motherboard repair và component replacement
  - Software troubleshooting và virus removal
  - Operating system installation và updates
AND each service has clear description
AND service benefits are highlighted
```

**AC-SO2: Service Category Organization**
```gherkin
GIVEN service information structure
WHEN content is organized
THEN services grouped by logical categories:
  - Hardware Repairs (physical components)
  - Software Services (OS, applications, security)
  - Upgrades & Improvements (performance enhancements)
  - Data Services (recovery, backup, transfer)
AND categories have visual distinction
AND navigation between categories is smooth
```

**AC-SO3: Value Proposition Messaging**
```gherkin
GIVEN service marketing content
WHEN value propositions are presented
THEN highlights key differentiators:
  - Experienced technicians với certified skills
  - Quality parts và genuine components
  - Comprehensive warranty coverage
  - Fast turnaround time
  - Competitive pricing
  - Free diagnosis và estimates
AND messaging is customer-focused
AND benefits are clearly communicated
```

### **Repair Process Page Requirements:**

**AC-RP1: Step-by-Step Process Explanation**
```gherkin
GIVEN repair process information page
WHEN process steps are displayed
THEN shows complete workflow:
  1. "Tiếp nhận thiết bị" - Initial device assessment
  2. "Chẩn đoán sự cố" - Detailed problem diagnosis
  3. "Báo giá sửa chữa" - Cost estimate và approval
  4. "Thực hiện sửa chữa" - Actual repair work
  5. "Kiểm tra chất lượng" - Quality testing
  6. "Bàn giao thiết bị" - Device return và warranty
AND each step has detailed explanation
AND expected timeframes are provided
AND customer responsibilities are clear
```

**AC-RP2: Timeline & Expectations Management**
```gherkin
GIVEN process timeline information
WHEN timing expectations are set
THEN provides realistic timeframes:
  - Simple repairs: 1-2 days
  - Complex repairs: 3-5 days
  - Parts ordering: Additional 2-7 days
  - Rush service: Same day (if available)
AND factors affecting timeline explained
AND communication schedule outlined
AND customer notification process described
```

**AC-RP3: Customer Communication Process**
```gherkin
GIVEN customer communication explanation
WHEN process is described
THEN outlines communication touchpoints:
  - Initial assessment feedback
  - Diagnosis results và cost estimate
  - Approval confirmation process
  - Progress updates during repair
  - Completion notification
  - Pickup scheduling
AND communication methods specified (phone, SMS, website)
AND response time commitments provided
```

### **Pricing Information Page Requirements:**

**AC-PI1: Transparent Pricing Structure**
```gherkin
GIVEN pricing information page
WHEN pricing is displayed
THEN shows clear pricing categories:
  - Diagnostic fee (free or nominal)
  - Labor rates (per hour or fixed service)
  - Common repair price ranges
  - Parts cost estimates
  - Rush service premiums
AND pricing is presented honestly
AND no hidden fees mentioned
AND price validity period specified
```

**AC-PI2: Common Repair Cost Examples**
```gherkin
GIVEN pricing examples section
WHEN cost examples are shown
THEN includes typical repair costs:
  - Screen replacement: 800,000 - 2,500,000 VND
  - Keyboard replacement: 300,000 - 800,000 VND
  - Battery replacement: 400,000 - 1,200,000 VND
  - RAM upgrade: 500,000 - 2,000,000 VND
  - Hard drive replacement: 800,000 - 3,000,000 VND
AND price ranges account for different models
AND factors affecting cost are explained
AND estimate accuracy disclaimer provided
```

**AC-PI3: Payment & Warranty Information**
```gherkin
GIVEN payment và warranty details
WHEN information is displayed
THEN covers payment options:
  - Cash payment accepted
  - Bank transfer options
  - Payment timing (deposit vs full payment)
  - Receipt và invoice policies
AND warranty coverage details:
  - Warranty period for different repairs
  - What's covered vs not covered
  - Warranty claim process
  - Terms và conditions
```

### **Warranty Policy Page Requirements:**

**AC-WP1: Comprehensive Warranty Coverage**
```gherkin
GIVEN warranty policy information
WHEN warranty terms are displayed
THEN outlines warranty coverage:
  - Parts warranty: 6-12 months depending on type
  - Labor warranty: 3-6 months
  - Software service warranty: 30 days
  - Warranty transfer policy (if device sold)
AND coverage limitations clearly stated
AND warranty claim procedures detailed
AND customer responsibilities outlined
```

**AC-WP2: Warranty Claim Process**
```gherkin
GIVEN warranty claim information
WHEN claim process is explained
THEN details step-by-step process:
  - Warranty issue reporting
  - Device re-evaluation
  - Covered vs non-covered determination
  - Repair or replacement options
  - Timeline for warranty service
AND required documentation listed
AND contact information for claims provided
```

**AC-WP3: Terms & Conditions**
```gherkin
GIVEN warranty terms và conditions
WHEN legal aspects are covered
THEN includes important clauses:
  - Warranty void conditions
  - Damage excluded from warranty
  - Customer data responsibility
  - Limitation of liability
  - Dispute resolution process
AND terms are clearly written in Vietnamese
AND legal compliance maintained
```

### **Contact & Location Information Requirements:**

**AC-CL1: Complete Contact Information**
```gherkin
GIVEN contact information section
WHEN contact details are displayed
THEN provides all contact methods:
  - Shop address với map integration
  - Phone number với click-to-call
  - Business hours (daily schedule)
  - Email address (if applicable)
  - Social media links (if applicable)
AND contact information is current
AND accessibility information included
```

**AC-CL2: Location & Directions**
```gherkin
GIVEN location information
WHEN location details are shown
THEN includes helpful location info:
  - Full street address
  - Nearby landmarks
  - Public transportation access
  - Parking availability
  - Interactive map với directions
AND map integration works on mobile
AND location accuracy verified
```

**AC-CL3: Business Hours & Availability**
```gherkin
GIVEN business hours information
WHEN schedule is displayed
THEN shows detailed operating hours:
  - Regular business hours (Monday-Friday)
  - Weekend hours
  - Holiday schedule
  - Emergency service availability
  - Appointment vs walk-in policies
AND current day/status highlighted
AND special closures noted
```

### **Content Management Requirements:**

**AC-CM1: Content Editing Capability**
```gherkin
GIVEN shop owner content management needs
WHEN content editing is required
THEN provides simple editing interface:
  - Rich text editor for page content
  - Image upload và management
  - Price update capabilities
  - Contact information updates
  - Business hours modification
AND changes preview before publishing
AND version history maintained
```

**AC-CM2: SEO Optimization Features**
```gherkin
GIVEN SEO optimization requirements
WHEN pages are optimized
THEN includes SEO elements:
  - Proper meta titles và descriptions
  - Header tag structure (H1, H2, H3)
  - Alt text for all images
  - Structured data markup
  - Clean URL structure
AND Vietnamese language optimization
AND local SEO considerations
```

### **Mobile & Performance Requirements:**

**AC-MP1: Mobile-Optimized Content**
```gherkin
GIVEN mobile device access
WHEN service pages are viewed
THEN content is mobile-optimized:
  - Responsive layout adaptation
  - Touch-friendly navigation
  - Readable typography without zooming
  - Fast loading on mobile connections
  - Optimized images và media
```

**AC-MP2: Page Load Performance**
```gherkin
GIVEN page performance requirements
WHEN performance is measured
THEN meets performance targets:
  - Initial page load under 3 seconds
  - Images optimized for web
  - Minimal external dependencies
  - Progressive loading where applicable
  - CDN usage for static assets
```

## Technical Implementation Details

### **Service Pages Component Structure:**
```typescript
export function ServiceInformationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="service-layout">
      <ServiceHeader />
      <ServiceNavigation />
      <main className="service-content">
        {children}
      </main>
      <ServiceFooter />
    </div>
  );
}

// Service Overview Page
export function ServiceOverviewPage() {
  const serviceCategories = [
    {
      id: 'hardware',
      title: 'Sửa chữa phần cứng',
      services: [
        {
          name: 'Thay màn hình laptop',
          description: 'Thay thế màn hình bị vỡ, sọc, hoặc không hiển thị',
          priceRange: '800,000 - 2,500,000 VND',
          duration: '1-2 ngày'
        },
        {
          name: 'Sửa chữa bàn phím',
          description: 'Thay thế phím bị liệt, bàn phím không phản hồi',
          priceRange: '300,000 - 800,000 VND',
          duration: '1 ngày'
        }
        // ... more services
      ]
    },
    {
      id: 'software',
      title: 'Dịch vụ phần mềm',
      services: [
        // Software services
      ]
    }
  ];

  return (
    <ServiceInformationLayout>
      <SEOHead
        title="Dịch vụ sửa chữa laptop chuyên nghiệp"
        description="Dịch vụ sửa chữa laptop uy tín với đội ngũ kỹ thuật viên chuyên nghiệp, bảo hành chính hãng, giá cả hợp lý."
        keywords="sửa chữa laptop, thay màn hình laptop, sửa bàn phím laptop"
      />

      <PageHeader
        title="Dịch vụ sửa chữa laptop"
        subtitle="Giải pháp chuyên nghiệp cho mọi vấn đề laptop của bạn"
      />

      <div className="service-categories">
        {serviceCategories.map(category => (
          <ServiceCategorySection
            key={category.id}
            category={category}
          />
        ))}
      </div>

      <CallToActionSection />
    </ServiceInformationLayout>
  );
}
```

### **Repair Process Page:**
```typescript
export function RepairProcessPage() {
  const processSteps = [
    {
      step: 1,
      title: 'Tiếp nhận thiết bị',
      description: 'Khách hàng mang thiết bị đến cửa hàng, chúng tôi thực hiện kiểm tra ban đầu và tạo phiếu tiếp nhận.',
      duration: '15-30 phút',
      customerAction: 'Mang thiết bị và mô tả tình trạng',
      icon: 'device-receive'
    },
    {
      step: 2,
      title: 'Chẩn đoán sự cố',
      description: 'Kỹ thuật viên thực hiện chẩn đoán chi tiết để xác định nguyên nhân và phạm vi sự cố.',
      duration: '2-4 giờ',
      customerAction: 'Chờ thông báo kết quả chẩn đoán',
      icon: 'diagnostic'
    },
    {
      step: 3,
      title: 'Báo giá sửa chữa',
      description: 'Cung cấp báo giá chi tiết chi phí sửa chữa và thời gian hoàn thành dự kiến.',
      duration: '30 phút',
      customerAction: 'Xem xét và phê duyệt báo giá',
      icon: 'quote'
    },
    {
      step: 4,
      title: 'Thực hiện sửa chữa',
      description: 'Tiến hành sửa chữa sau khi nhận được sự đồng ý từ khách hàng.',
      duration: '1-5 ngày',
      customerAction: 'Theo dõi tiến độ qua website',
      icon: 'repair'
    },
    {
      step: 5,
      title: 'Kiểm tra chất lượng',
      description: 'Thực hiện kiểm tra toàn diện để đảm bảo thiết bị hoạt động ổn định.',
      duration: '2-4 giờ',
      customerAction: 'Không cần thực hiện hành động',
      icon: 'testing'
    },
    {
      step: 6,
      title: 'Bàn giao thiết bị',
      description: 'Thông báo hoàn thành và bàn giao thiết bị cùng với chứng từ bảo hành.',
      duration: '15 phút',
      customerAction: 'Nhận thiết bị và thanh toán',
      icon: 'delivery'
    }
  ];

  return (
    <ServiceInformationLayout>
      <SEOHead
        title="Quy trình sửa chữa laptop chuyên nghiệp - 6 bước chuẩn"
        description="Tìm hiểu quy trình sửa chữa laptop 6 bước chuẩn của chúng tôi từ tiếp nhận đến bàn giao thiết bị."
      />

      <PageHeader
        title="Quy trình sửa chữa"
        subtitle="6 bước chuẩn đảm bảo chất lượng và minh bạch"
      />

      <ProcessTimeline steps={processSteps} />

      <ProcessExpectations />
      <CommunicationPlan />
    </ServiceInformationLayout>
  );
}
```

### **Content Management Integration:**
```typescript
// Simple content management for shop owner
export function ContentEditor({ pageId }: { pageId: string }) {
  const [content, setContent] = useState<PageContent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { user } = useAuth();
  const isShopOwner = user?.role === 'shop_owner';

  const handleContentChange = (newContent: Partial<PageContent>) => {
    setContent(prev => ({ ...prev, ...newContent }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updatePageContent(pageId, content);
      setHasChanges(false);
      setIsEditing(false);
      toast.success('Đã lưu thay đổi');
    } catch (error) {
      toast.error('Không thể lưu thay đổi');
    }
  };

  if (!isShopOwner) {
    return <StaticContentView content={content} />;
  }

  return (
    <div className="content-editor">
      {isEditing ? (
        <RichTextEditor
          content={content}
          onChange={handleContentChange}
          onSave={handleSave}
          onCancel={() => {
            setIsEditing(false);
            setHasChanges(false);
          }}
        />
      ) : (
        <div className="content-view">
          <StaticContentView content={content} />
          <div className="editor-controls">
            <Button onClick={() => setIsEditing(true)}>
              Chỉnh sửa nội dung
            </Button>
          </div>
        </div>
      )}

      {hasChanges && (
        <UnsavedChangesWarning onSave={handleSave} />
      )}
    </div>
  );
}
```

### **Automated Testing Scenarios:**

**Test Suite: Service Information Pages**
```typescript
describe('Service Information Pages', () => {
  test('AC-SO1: Comprehensive service description', async () => {
    render(<ServiceOverviewPage />);

    // Check for main service categories
    expect(screen.getByText('Sửa chữa phần cứng')).toBeInTheDocument();
    expect(screen.getByText('Dịch vụ phần mềm')).toBeInTheDocument();

    // Check for specific services
    expect(screen.getByText('Thay màn hình laptop')).toBeInTheDocument();
    expect(screen.getByText('Sửa chữa bàn phím')).toBeInTheDocument();

    // Check for service descriptions
    expect(screen.getByText(/Thay thế màn hình bị vỡ/)).toBeInTheDocument();
  });

  test('AC-RP1: Step-by-step process explanation', async () => {
    render(<RepairProcessPage />);

    // Check for all process steps
    expect(screen.getByText('1. Tiếp nhận thiết bị')).toBeInTheDocument();
    expect(screen.getByText('2. Chẩn đoán sự cố')).toBeInTheDocument();
    expect(screen.getByText('3. Báo giá sửa chữa')).toBeInTheDocument();
    expect(screen.getByText('4. Thực hiện sửa chữa')).toBeInTheDocument();
    expect(screen.getByText('5. Kiểm tra chất lượng')).toBeInTheDocument();
    expect(screen.getByText('6. Bàn giao thiết bị')).toBeInTheDocument();
  });

  test('AC-PI1: Transparent pricing structure', async () => {
    render(<PricingInformationPage />);

    // Check for pricing categories
    expect(screen.getByText(/Phí chẩn đoán/)).toBeInTheDocument();
    expect(screen.getByText(/Chi phí nhân công/)).toBeInTheDocument();
    expect(screen.getByText(/Chi phí linh kiện/)).toBeInTheDocument();

    // Check for price ranges
    expect(screen.getByText(/800,000 - 2,500,000 VND/)).toBeInTheDocument();
  });

  test('AC-WP1: Comprehensive warranty coverage', async () => {
    render(<WarrantyPolicyPage />);

    // Check warranty periods
    expect(screen.getByText(/6-12 tháng/)).toBeInTheDocument();
    expect(screen.getByText(/3-6 tháng/)).toBeInTheDocument();

    // Check warranty types
    expect(screen.getByText('Bảo hành linh kiện')).toBeInTheDocument();
    expect(screen.getByText('Bảo hành dịch vụ')).toBeInTheDocument();
  });

  test('AC-CL1: Complete contact information', async () => {
    render(<ContactInformationPage />);

    // Check contact details
    expect(screen.getByText(/Địa chỉ:/)).toBeInTheDocument();
    expect(screen.getByText(/Điện thoại:/)).toBeInTheDocument();
    expect(screen.getByText(/Giờ làm việc:/)).toBeInTheDocument();

    // Check click-to-call functionality
    const phoneLink = screen.getByRole('link', { name: /tel:/ });
    expect(phoneLink).toHaveAttribute('href', 'tel:+84901234567');
  });

  test('AC-CM1: Content editing capability', async () => {
    // Mock shop owner user
    const mockUser = { role: 'shop_owner', id: 'owner-123' };
    mockUseAuth.mockReturnValue({ user: mockUser });

    render(<ContentEditor pageId="service-overview" />);

    // Should show edit button for shop owner
    expect(screen.getByText('Chỉnh sửa nội dung')).toBeInTheDocument();

    // Click edit button
    fireEvent.click(screen.getByText('Chỉnh sửa nội dung'));

    // Should show rich text editor
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Lưu thay đổi')).toBeInTheDocument();
  });

  test('AC-MP1: Mobile-optimized content', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', { value: 375 });

    const { container } = render(<ServiceOverviewPage />);

    expect(container.firstChild).toHaveClass('mobile-optimized');

    // Check for mobile-specific layout
    const serviceGrid = container.querySelector('.service-categories');
    expect(serviceGrid).toHaveClass('mobile-layout');
  });

  test('AC-CM2: SEO optimization features', () => {
    render(<ServiceOverviewPage />);

    // Check meta tags
    expect(document.title).toContain('Dịch vụ sửa chữa laptop');

    const metaDescription = document.querySelector('meta[name="description"]');
    expect(metaDescription).toHaveAttribute('content', expect.stringContaining('chuyên nghiệp'));

    // Check header structure
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3);
  });

  test('AC-MP2: Page load performance', async () => {
    const startTime = Date.now();

    render(<ServiceOverviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Dịch vụ sửa chữa laptop')).toBeInTheDocument();
    });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // < 3 seconds requirement
  });
});
```

### **SEO & Performance Optimization:**
```typescript
// SEO Head component
export function SEOHead({ title, description, keywords }: SEOProps) {
  return (
    <Helmet>
      <title>{title} | Laptop Repair Shop</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={window.location.href} />

      {/* Local business structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Laptop Repair Shop",
          "description": description,
          "telephone": "+84901234567",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "123 Main Street",
            "addressLocality": "Ho Chi Minh City",
            "addressCountry": "VN"
          },
          "openingHours": "Mo-Fr 08:00-18:00, Sa 08:00-16:00"
        })}
      </script>
    </Helmet>
  );
}

// Lazy loading for images
export function OptimizedImage({ src, alt, className }: ImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}
```

## Definition of Done

- [ ] **AC-SO1:** Comprehensive service description complete
- [ ] **AC-SO2:** Service category organization implemented
- [ ] **AC-SO3:** Value proposition messaging clear
- [ ] **AC-RP1:** Step-by-step process explanation complete
- [ ] **AC-RP2:** Timeline & expectations management clear
- [ ] **AC-RP3:** Customer communication process outlined
- [ ] **AC-PI1:** Transparent pricing structure implemented
- [ ] **AC-PI2:** Common repair cost examples provided
- [ ] **AC-PI3:** Payment & warranty information complete
- [ ] **AC-WP1:** Comprehensive warranty coverage documented
- [ ] **AC-WP2:** Warranty claim process detailed
- [ ] **AC-WP3:** Terms & conditions clear
- [ ] **AC-CL1:** Complete contact information provided
- [ ] **AC-CL2:** Location & directions functional
- [ ] **AC-CL3:** Business hours & availability current
- [ ] **AC-CM1:** Content editing capability working
- [ ] **AC-CM2:** SEO optimization implemented
- [ ] **AC-MP1:** Mobile-optimized content verified
- [ ] **AC-MP2:** Page load performance meets requirements
- [ ] **Content Review:** All content accurate và professional
- [ ] **SEO Testing:** Search engine optimization validated
- [ ] **Mobile Testing:** Cross-device compatibility confirmed
- [ ] **Accessibility Testing:** Screen reader compatibility verified

## Risk Mitigation

- **Primary Risk:** Outdated or inaccurate information misleading customers
- **Mitigation:** Regular content review schedule, easy editing interface
- **Rollback Plan:** Static content backup, quick content reversion capability

## Story Dependencies

- **Prerequisites:** Basic routing và layout components
- **Enables:** Professional web presence, customer education
- **Estimated Effort:** 3-4 days
- **Priority:** High (customer-facing information critical)