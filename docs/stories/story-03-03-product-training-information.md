# Story 03.3: Product & Training Information Pages

## User Story

**As a** website visitor interested in purchasing used laptops or learning repair skills,
**I want** detailed information about available products và training courses,
**So that** tôi có thể make informed decisions về purchasing hoặc enrolling in training programs.

## Story Context

**Business Expansion Content:**
- Showcase used laptop inventory với detailed specifications
- Present training courses để attract aspiring technicians
- Partnership information để expand business network
- Blog content migration từ WordPress để maintain SEO value
- Lead generation for non-repair revenue streams

**Content Strategy:**
- Product catalog với call-to-action to contact shop
- Training course descriptions với enrollment process
- Partnership opportunities để expand repair network
- Technical blog content để establish expertise
- Contact integration cho all business inquiries

## Acceptance Criteria

### **Product Catalog Requirements:**

**AC-PC1: Used Laptop Listings**
```gherkin
GIVEN product catalog page
WHEN laptop listings are displayed
THEN shows available used laptops with:
  - Laptop brand và model
  - Processor, RAM, storage specifications
  - Screen size và resolution
  - Condition assessment (excellent, good, fair)
  - Price range or "Contact for pricing"
  - High-quality product photos
  - Availability status
AND products are categorized by brand/price range
AND search/filter functionality available
```

**AC-PC2: Product Detail Information**
```gherkin
GIVEN individual laptop product page
WHEN product details are displayed
THEN includes comprehensive information:
  - Complete technical specifications
  - Detailed condition description
  - Multiple product photos (different angles)
  - What's included (charger, bag, etc.)
  - Warranty information for used device
  - Purchase process explanation
  - Contact information for inquiries
AND professional product photography
AND honest condition assessment
```

**AC-PC3: Parts & Components Catalog**
```gherkin
GIVEN parts catalog section
WHEN component listings are shown
THEN displays available parts:
  - Laptop parts by category (screens, keyboards, batteries)
  - Compatibility information
  - New vs refurbished condition
  - Price ranges
  - Installation service availability
  - Bulk purchase options
AND technical specifications provided
AND compatibility checker tool
```

### **Training Course Information Requirements:**

**AC-TC1: Course Catalog Display**
```gherkin
GIVEN training courses page
WHEN course information is presented
THEN shows available courses:
  - "Sửa chữa laptop cơ bản" (Basic Laptop Repair)
  - "Chẩn đoán sự cố nâng cao" (Advanced Troubleshooting)
  - "Sửa chữa mainboard" (Motherboard Repair)
  - "Quản lý cửa hàng sửa chữa" (Repair Shop Management)
AND each course includes duration, schedule, price
AND prerequisite requirements specified
AND class size và availability shown
```

**AC-TC2: Detailed Course Information**
```gherkin
GIVEN individual course detail page
WHEN course details are displayed
THEN includes comprehensive course info:
  - Course objectives và learning outcomes
  - Detailed curriculum breakdown
  - Duration (hours/days) và schedule options
  - Instructor qualifications và experience
  - Course materials và tools provided
  - Certification upon completion
  - Course fees và payment options
  - Enrollment process và requirements
AND student testimonials/reviews
AND sample lesson content
```

**AC-TC3: Instructor & Facility Information**
```gherkin
GIVEN training program overview
WHEN instructor/facility info is shown
THEN provides credibility information:
  - Instructor profiles với experience
  - Training facility photos
  - Equipment và tools available
  - Class environment description
  - Safety protocols và procedures
  - Student support services
AND professional presentation
AND contact for course inquiries
```

### **Partnership Information Requirements:**

**AC-PI1: Partnership Program Overview**
```gherkin
GIVEN partnership information page
WHEN partnership details are presented
THEN explains partnership model:
  - Target partners (shops without repair capability)
  - Partnership benefits và value proposition
  - Service level agreements
  - Pricing structure for partners
  - Logistics và device transfer process
  - Communication và reporting procedures
AND partner requirements outlined
AND application process described
```

**AC-PI2: Partner Benefits & Support**
```gherkin
GIVEN partner support information
WHEN benefits are detailed
THEN covers comprehensive support:
  - Technical expertise access
  - Bulk repair pricing
  - Priority service levels
  - Marketing materials provided
  - Training opportunities for partner staff
  - Ongoing technical support
AND partnership success stories
AND testimonials from existing partners
```

**AC-PI3: Partnership Application Process**
```gherkin
GIVEN partnership application section
WHEN application process is explained
THEN outlines clear steps:
  - Eligibility criteria assessment
  - Application form requirements
  - Business verification process
  - Trial period arrangements
  - Contract terms và conditions
  - Onboarding process timeline
AND application contact information
AND expected response timeframes
```

### **Blog & Technical Content Requirements:**

**AC-BT1: Technical Blog Content**
```gherkin
GIVEN blog section
WHEN technical content is displayed
THEN includes valuable articles:
  - Laptop maintenance tips
  - Common repair troubleshooting guides
  - Industry news và trends
  - Repair case studies
  - Technology reviews và comparisons
  - DIY repair tutorials (basic level)
AND content is well-researched và accurate
AND regular publishing schedule maintained
```

**AC-BT2: SEO-Optimized Articles**
```gherkin
GIVEN blog article pages
WHEN SEO optimization is applied
THEN articles include:
  - Keyword-optimized titles và headers
  - Meta descriptions for each article
  - Internal linking to service pages
  - Related article suggestions
  - Social sharing capabilities
  - Reader comments (if applicable)
AND Vietnamese language SEO optimization
AND local repair market focus
```

**AC-BT3: Content Categories & Navigation**
```gherkin
GIVEN blog content organization
WHEN navigation is structured
THEN provides logical categorization:
  - Repair guides by device type
  - Maintenance tips và prevention
  - Industry news và updates
  - Business insights
  - Training và education content
AND search functionality within blog
AND tag-based content filtering
```

### **Call-to-Action & Lead Generation Requirements:**

**AC-CL1: Product Inquiry System**
```gherkin
GIVEN product pages với purchase interest
WHEN inquiry system is used
THEN provides easy contact methods:
  - "Contact for pricing" buttons
  - Phone number với click-to-call
  - WhatsApp integration (if applicable)
  - Email inquiry forms
  - Visit shop appointment scheduling
AND inquiry tracking for follow-up
AND response time commitments
```

**AC-CL2: Training Enrollment Process**
```gherkin
GIVEN training course interest
WHEN enrollment process is initiated
THEN offers convenient enrollment:
  - Online interest registration
  - Course calendar với available dates
  - Enrollment form với requirements
  - Payment options và procedures
  - Confirmation và communication process
AND waiting list for popular courses
AND enrollment status tracking
```

**AC-CL3: Partnership Inquiry Handling**
```gherkin
GIVEN partnership interest
WHEN inquiries are processed
THEN provides professional pathway:
  - Partnership information request form
  - Business qualification questions
  - Contact scheduling for discussions
  - Information packet delivery
  - Follow-up process timeline
AND inquiry prioritization system
AND relationship management tracking
```

### **Mobile & User Experience Requirements:**

**AC-MU1: Mobile-Optimized Product Browsing**
```gherkin
GIVEN mobile device product browsing
WHEN products are viewed
THEN provides excellent mobile experience:
  - Touch-friendly product galleries
  - Easy navigation between products
  - Mobile-optimized image viewing
  - Quick contact actions
  - Readable product specifications
AND fast loading on mobile connections
AND intuitive mobile navigation
```

**AC-MU2: Responsive Content Layout**
```gherkin
GIVEN various screen sizes
WHEN content is displayed
THEN adapts appropriately:
  - Course information readable on all devices
  - Blog articles formatted for mobile reading
  - Contact forms usable on touchscreens
  - Images và media responsive
  - Navigation menus mobile-friendly
```

### **Performance & SEO Requirements:**

**AC-PS1: Page Load Optimization**
```gherkin
GIVEN performance requirements
WHEN pages are optimized
THEN meets performance targets:
  - Product pages load within 3 seconds
  - Image optimization for web delivery
  - Progressive loading for image galleries
  - Minimal external dependencies
  - Efficient caching strategies
```

**AC-PS2: Search Engine Optimization**
```gherkin
GIVEN SEO optimization needs
WHEN SEO implementation is applied
THEN includes comprehensive SEO:
  - Product pages optimized for local search
  - Training course pages target education keywords
  - Blog content targets technical repair terms
  - Structured data for products và courses
  - Local business schema markup
```

## Technical Implementation Details

### **Product Catalog Component:**
```typescript
interface Product {
  id: string;
  type: 'laptop' | 'part';
  brand: string;
  model: string;
  specifications: {
    processor?: string;
    ram?: string;
    storage?: string;
    screen?: string;
    graphics?: string;
  };
  condition: 'excellent' | 'good' | 'fair';
  price?: number;
  priceRange?: string;
  images: string[];
  description: string;
  availability: 'available' | 'sold' | 'reserved';
  warranty: string;
}

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState({
    brand: '',
    priceRange: '',
    condition: '',
    category: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = !filters.brand || product.brand === filters.brand;
      const matchesCondition = !filters.condition || product.condition === filters.condition;

      return matchesSearch && matchesBrand && matchesCondition;
    });
  }, [products, filters, searchTerm]);

  return (
    <div className="product-catalog">
      <ProductFilters filters={filters} onFiltersChange={setFilters} />
      <ProductSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <div className="product-grid">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <NoProductsFound />
      )}
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="product-card">
      <div className="product-images">
        <ProductImageGallery images={product.images} />
        <ConditionBadge condition={product.condition} />
      </div>

      <CardContent>
        <h3 className="product-title">{product.brand} {product.model}</h3>

        <div className="specifications">
          {product.specifications.processor && (
            <SpecItem label="CPU" value={product.specifications.processor} />
          )}
          {product.specifications.ram && (
            <SpecItem label="RAM" value={product.specifications.ram} />
          )}
          {product.specifications.storage && (
            <SpecItem label="Ổ cứng" value={product.specifications.storage} />
          )}
        </div>

        <div className="product-price">
          {product.price ? (
            <span className="price">{formatVNDPrice(product.price)}</span>
          ) : (
            <span className="contact-price">Liên hệ để biết giá</span>
          )}
        </div>

        <div className="product-actions">
          <Button asChild>
            <Link to={`/san-pham/laptop/${product.id}`}>
              Xem chi tiết
            </Link>
          </Button>
          <Button variant="outline" onClick={() => handleContactInquiry(product)}>
            <Phone className="mr-2 h-4 w-4" />
            Liên hệ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### **Training Course Component:**
```typescript
interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  duration: string;
  schedule: {
    startDate: string;
    endDate: string;
    daysOfWeek: string[];
    timeSlot: string;
  };
  curriculum: {
    module: string;
    topics: string[];
    duration: string;
  }[];
  instructor: {
    name: string;
    experience: string;
    qualifications: string[];
  };
  price: number;
  maxStudents: number;
  currentEnrollment: number;
  materials: string[];
  certification: string;
  prerequisites: string[];
}

export function TrainingCoursePage() {
  const courses = [
    {
      id: 'basic-repair',
      title: 'Sửa chữa laptop cơ bản',
      description: 'Khóa học trang bị kiến thức nền tảng về sửa chữa laptop, phù hợp cho người mới bắt đầu.',
      duration: '40 giờ (2 tuần)',
      schedule: {
        startDate: '2025-02-15',
        endDate: '2025-02-28',
        daysOfWeek: ['Thứ 2', 'Thứ 4', 'Thứ 6'],
        timeSlot: '18:00 - 21:00'
      },
      curriculum: [
        {
          module: 'Tuần 1: Kiến thức cơ bản',
          topics: [
            'Cấu trúc và linh kiện laptop',
            'Công cụ sửa chữa cần thiết',
            'An toàn lao động',
            'Chẩn đoán sự cố cơ bản'
          ],
          duration: '20 giờ'
        },
        {
          module: 'Tuần 2: Thực hành sửa chữa',
          topics: [
            'Thay thế linh kiện cơ bản',
            'Sửa chữa phần mềm',
            'Kiểm tra chất lượng',
            'Tương tác với khách hàng'
          ],
          duration: '20 giờ'
        }
      ],
      instructor: {
        name: 'Nguyễn Văn Tài',
        experience: '8 năm kinh nghiệm sửa chữa laptop',
        qualifications: ['Chứng chỉ kỹ thuật viên CNTT', 'Đào tạo tại hãng Dell']
      },
      price: 3500000,
      maxStudents: 12,
      currentEnrollment: 8,
      materials: [
        'Tài liệu học tập đầy đủ',
        'Laptop thực hành',
        'Bộ công cụ sửa chữa',
        'Linh kiện thực hành'
      ],
      certification: 'Chứng chỉ hoàn thành khóa học',
      prerequisites: ['Không yêu cầu kinh nghiệm trước đó']
    }
    // More courses...
  ];

  return (
    <div className="training-courses">
      <PageHeader
        title="Khóa học sửa chữa laptop"
        subtitle="Đào tạo kỹ năng sửa chữa laptop chuyên nghiệp"
      />

      <div className="courses-grid">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      <InstructorProfiles />
      <FacilityInformation />
      <EnrollmentProcess />
    </div>
  );
}
```

### **Blog Content Management:**
```typescript
export function BlogSection() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const featuredArticles = articles.filter(article => article.featured);
  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter(article => article.category === selectedCategory);

  return (
    <div className="blog-section">
      <PageHeader
        title="Blog kỹ thuật"
        subtitle="Kiến thức và kinh nghiệm sửa chữa laptop"
      />

      {featuredArticles.length > 0 && (
        <FeaturedArticlesSection articles={featuredArticles} />
      )}

      <div className="blog-content">
        <aside className="blog-sidebar">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
          <PopularArticles />
          <NewsletterSignup />
        </aside>

        <main className="articles-list">
          {filteredArticles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </main>
      </div>
    </div>
  );
}
```

### **Automated Testing Scenarios:**

**Test Suite: Product & Training Information**
```typescript
describe('Product & Training Information Pages', () => {
  test('AC-PC1: Used laptop listings display correctly', async () => {
    const mockProducts = [
      {
        id: 'laptop-1',
        brand: 'Dell',
        model: 'Inspiron 15 3000',
        condition: 'good',
        price: 8500000,
        specifications: {
          processor: 'Intel Core i5',
          ram: '8GB',
          storage: '256GB SSD'
        }
      }
    ];

    mockFetchProducts.mockResolvedValue(mockProducts);

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Dell Inspiron 15 3000')).toBeInTheDocument();
      expect(screen.getByText('Intel Core i5')).toBeInTheDocument();
      expect(screen.getByText('8GB')).toBeInTheDocument();
      expect(screen.getByText('8,500,000 ₫')).toBeInTheDocument();
    });
  });

  test('AC-PC3: Parts catalog filtering works', async () => {
    render(<ProductCatalog />);

    // Apply category filter
    fireEvent.click(screen.getByText('Linh kiện'));
    fireEvent.click(screen.getByText('Màn hình'));

    await waitFor(() => {
      expect(mockFetchProducts).toHaveBeenCalledWith({
        category: 'parts',
        subcategory: 'screen'
      });
    });
  });

  test('AC-TC1: Course catalog displays all courses', async () => {
    render(<TrainingCoursePage />);

    expect(screen.getByText('Sửa chữa laptop cơ bản')).toBeInTheDocument();
    expect(screen.getByText('Chẩn đoán sự cố nâng cao')).toBeInTheDocument();
    expect(screen.getByText('Sửa chữa mainboard')).toBeInTheDocument();

    // Check course details
    expect(screen.getByText('40 giờ (2 tuần)')).toBeInTheDocument();
    expect(screen.getByText('3,500,000 ₫')).toBeInTheDocument();
  });

  test('AC-TC2: Detailed course information complete', async () => {
    render(<CourseDetailPage courseId="basic-repair" />);

    await waitFor(() => {
      // Check curriculum details
      expect(screen.getByText('Tuần 1: Kiến thức cơ bản')).toBeInTheDocument();
      expect(screen.getByText('Cấu trúc và linh kiện laptop')).toBeInTheDocument();

      // Check instructor info
      expect(screen.getByText('Nguyễn Văn Tài')).toBeInTheDocument();
      expect(screen.getByText('8 năm kinh nghiệm')).toBeInTheDocument();

      // Check enrollment info
      expect(screen.getByText('8/12 học viên')).toBeInTheDocument();
    });
  });

  test('AC-BT1: Technical blog content accessible', async () => {
    render(<BlogSection />);

    await waitFor(() => {
      expect(screen.getByText('Blog kỹ thuật')).toBeInTheDocument();
      expect(screen.getByText('Kiến thức và kinh nghiệm sửa chữa laptop')).toBeInTheDocument();
    });

    // Check for article categories
    expect(screen.getByText('Hướng dẫn sửa chữa')).toBeInTheDocument();
    expect(screen.getByText('Bảo trì laptop')).toBeInTheDocument();
    expect(screen.getByText('Tin tức công nghệ')).toBeInTheDocument();
  });

  test('AC-CL1: Product inquiry system functional', async () => {
    render(<ProductDetailPage productId="laptop-1" />);

    const contactButton = screen.getByText('Liên hệ');
    fireEvent.click(contactButton);

    // Should open contact modal or navigate to contact
    await waitFor(() => {
      expect(screen.getByText('Liên hệ tư vấn sản phẩm')).toBeInTheDocument();
    });

    // Test phone click-to-call
    const phoneLink = screen.getByRole('link', { name: /tel:/ });
    expect(phoneLink).toHaveAttribute('href', 'tel:+84901234567');
  });

  test('AC-MU1: Mobile-optimized product browsing', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', { value: 375 });

    const { container } = render(<ProductCatalog />);

    expect(container.firstChild).toHaveClass('mobile-optimized');

    // Check for mobile-specific layout
    const productGrid = container.querySelector('.product-grid');
    expect(productGrid).toHaveClass('mobile-grid');
  });

  test('AC-PS1: Page load optimization', async () => {
    const startTime = Date.now();

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Sản phẩm laptop cũ')).toBeInTheDocument();
    });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // < 3 seconds requirement
  });
});
```

## Definition of Done

- [ ] **AC-PC1:** Used laptop listings display correctly
- [ ] **AC-PC2:** Product detail information comprehensive
- [ ] **AC-PC3:** Parts & components catalog functional
- [ ] **AC-TC1:** Course catalog display complete
- [ ] **AC-TC2:** Detailed course information provided
- [ ] **AC-TC3:** Instructor & facility information clear
- [ ] **AC-PI1:** Partnership program overview detailed
- [ ] **AC-PI2:** Partner benefits & support outlined
- [ ] **AC-PI3:** Partnership application process clear
- [ ] **AC-BT1:** Technical blog content valuable
- [ ] **AC-BT2:** SEO-optimized articles implemented
- [ ] **AC-BT3:** Content categories & navigation organized
- [ ] **AC-CL1:** Product inquiry system functional
- [ ] **AC-CL2:** Training enrollment process smooth
- [ ] **AC-CL3:** Partnership inquiry handling professional
- [ ] **AC-MU1:** Mobile-optimized product browsing implemented
- [ ] **AC-MU2:** Responsive content layout verified
- [ ] **AC-PS1:** Page load optimization meets requirements
- [ ] **AC-PS2:** Search engine optimization implemented
- [ ] **Content Quality:** All content accurate và engaging
- [ ] **Mobile Testing:** Cross-device compatibility confirmed
- [ ] **SEO Testing:** Search optimization validated

## Risk Mitigation

- **Primary Risk:** Outdated product/course information misleading customers
- **Mitigation:** Regular content update schedule, inventory integration
- **Rollback Plan:** Static content backup, quick information correction process

## Story Dependencies

- **Prerequisites:** Story 03.2 (Service Information Pages)
- **Enables:** Complete business information portal
- **Estimated Effort:** 4-5 days
- **Priority:** Medium (business expansion content)