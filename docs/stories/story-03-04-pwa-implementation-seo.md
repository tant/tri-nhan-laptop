# Story 03.4: PWA Implementation & SEO Optimization

## User Story

**As a** customer using mobile devices,
**I want** a Progressive Web App experience với offline capability và excellent search engine visibility,
**So that** tôi có thể access repair information easily và discover the shop through search engines.

## Story Context

**PWA Strategy:**
- Customer portal focus với essential offline functionality
- App-like experience cho mobile users
- Fast loading và reliable performance
- Strategic offline content caching
- Native app installation prompts

**SEO Strategy:**
- Replace WordPress SEO performance
- Local business search optimization
- Vietnamese language SEO targeting
- Technical SEO best practices
- Performance optimization cho search rankings

## Acceptance Criteria

### **Progressive Web App Requirements:**

**AC-PWA1: Service Worker Implementation**
```gherkin
GIVEN PWA service worker setup
WHEN application is loaded
THEN service worker registers successfully
AND caches essential app shell resources
AND caches critical pages (home, ticket lookup, contact)
AND implements cache-first strategy for static assets
AND implements network-first strategy for dynamic data
AND provides fallback pages for offline scenarios
```

**AC-PWA2: Web App Manifest**
```gherkin
GIVEN web app manifest configuration
WHEN PWA installation is triggered
THEN manifest includes complete app metadata:
  - App name: "Hệ thống Quản lý Sửa chữa Laptop"
  - Short name: "Laptop Repair"
  - App description in Vietnamese
  - App icons (192x192, 512x512, maskable)
  - Theme color và background color
  - Display mode: "standalone"
  - Start URL với appropriate landing page
AND manifest validates without errors
```

**AC-PWA3: Offline Functionality**
```gherkin
GIVEN offline capability requirements
WHEN network connection is unavailable
THEN cached pages remain accessible:
  - Home page với basic information
  - Ticket lookup page (cached results)
  - Contact information page
  - Service overview page
AND offline indicator displays clearly
AND graceful degradation of dynamic features
AND automatic sync when connection restored
```

**AC-PWA4: Installation Prompts**
```gherkin
GIVEN PWA installation criteria
WHEN installation conditions are met
THEN shows installation prompt:
  - Native browser install banner
  - Custom install prompt for better UX
  - Install prompt timing (after engagement)
  - Multiple entry points for installation
  - Installation success feedback
AND tracks installation analytics
```

### **Performance Optimization Requirements:**

**AC-PO1: Core Web Vitals Optimization**
```gherkin
GIVEN Core Web Vitals metrics
WHEN performance is measured
THEN meets Google's thresholds:
  - Largest Contentful Paint (LCP) < 2.5 seconds
  - First Input Delay (FID) < 100 milliseconds
  - Cumulative Layout Shift (CLS) < 0.1
  - First Contentful Paint (FCP) < 1.8 seconds
AND performance monitored continuously
AND optimization strategies implemented
```

**AC-PO2: Resource Optimization**
```gherkin
GIVEN resource loading optimization
WHEN assets are optimized
THEN implements performance strategies:
  - Image compression và modern formats (WebP, AVIF)
  - CSS và JavaScript minification
  - Resource preloading for critical assets
  - Lazy loading for non-critical images
  - Font optimization và preloading
  - Bundle splitting for better caching
```

**AC-PO3: Caching Strategy**
```gherkin
GIVEN comprehensive caching strategy
WHEN caching is implemented
THEN uses appropriate cache policies:
  - Static assets: Cache-first với long TTL
  - API responses: Stale-while-revalidate
  - Page content: Network-first với fallback
  - Images: Cache-first với expiration
AND cache invalidation strategies
AND cache size management
```

### **SEO Optimization Requirements:**

**AC-SEO1: Technical SEO Implementation**
```gherkin
GIVEN technical SEO requirements
WHEN SEO optimization is applied
THEN includes comprehensive SEO:
  - Semantic HTML structure (header, main, footer)
  - Proper heading hierarchy (H1, H2, H3)
  - Meta titles và descriptions for all pages
  - Open Graph metadata for social sharing
  - Canonical URLs to prevent duplication
  - XML sitemap generation
  - Robots.txt configuration
AND structured data markup implementation
```

**AC-SEO2: Local Business SEO**
```gherkin
GIVEN local business SEO optimization
WHEN local SEO is implemented
THEN targets local search:
  - Google My Business schema markup
  - Local business structured data
  - Location-specific keywords optimization
  - Vietnamese language optimization
  - Service area targeting (Ho Chi Minh City)
  - Contact information consistency (NAP)
AND local search visibility tracking
```

**AC-SEO3: Content SEO Optimization**
```gherkin
GIVEN content SEO requirements
WHEN content is optimized
THEN implements content SEO:
  - Keyword research và targeting
  - Vietnamese repair keywords optimization
  - Internal linking strategy
  - Content freshness và updates
  - Image alt text optimization
  - URL structure optimization
AND content performance tracking
```

### **Mobile Performance Requirements:**

**AC-MP1: Mobile-First Performance**
```gherkin
GIVEN mobile performance requirements
WHEN mobile optimization is applied
THEN achieves mobile performance:
  - Mobile page load speed < 3 seconds
  - Touch-friendly interface elements
  - Viewport optimization for all devices
  - Mobile-specific image optimization
  - Reduced JavaScript execution on mobile
AND mobile usability score > 95
```

**AC-MP2: Progressive Enhancement**
```gherkin
GIVEN progressive enhancement strategy
WHEN features are implemented
THEN provides layered experience:
  - Core functionality works without JavaScript
  - Enhanced features with JavaScript enabled
  - Graceful degradation for older browsers
  - Accessibility maintained across all levels
AND feature detection prevents errors
```

### **Analytics & Monitoring Requirements:**

**AC-AM1: Performance Monitoring**
```gherkin
GIVEN performance monitoring setup
WHEN monitoring is implemented
THEN tracks key metrics:
  - Core Web Vitals real user monitoring
  - Page load times across different devices
  - Service worker performance
  - Cache hit rates
  - Error rates và availability
AND alerting for performance degradation
```

**AC-AM2: SEO Analytics**
```gherkin
GIVEN SEO analytics requirements
WHEN analytics are implemented
THEN monitors SEO performance:
  - Search engine ranking positions
  - Organic traffic growth
  - Keyword performance tracking
  - Click-through rates from search
  - Local search visibility metrics
AND monthly SEO reporting
```

**AC-AM3: User Experience Analytics**
```gherkin
GIVEN UX analytics setup
WHEN user behavior is tracked
THEN monitors user experience:
  - PWA installation rates
  - Offline usage patterns
  - Mobile vs desktop usage
  - Page engagement metrics
  - Conversion funnel analysis
AND privacy-compliant tracking
```

### **Security & Compliance Requirements:**

**AC-SC1: HTTPS và Security**
```gherkin
GIVEN security requirements
WHEN security measures are implemented
THEN ensures secure communication:
  - HTTPS enforced for all pages
  - Security headers implementation
  - Content Security Policy (CSP)
  - Secure cookie configurations
  - HTTPS redirect implementation
AND security vulnerability scanning
```

**AC-SC2: Privacy Compliance**
```gherkin
GIVEN privacy compliance requirements
WHEN privacy measures are implemented
THEN complies với privacy regulations:
  - Cookie consent implementation
  - Privacy policy accessibility
  - Data collection transparency
  - User consent management
  - GDPR compliance considerations
AND privacy audit completion
```

### **Browser Compatibility Requirements:**

**AC-BC1: Cross-Browser Support**
```gherkin
GIVEN browser compatibility requirements
WHEN cross-browser testing is performed
THEN supports major browsers:
  - Chrome (mobile và desktop)
  - Firefox (mobile và desktop)
  - Safari (mobile và desktop)
  - Edge (desktop)
  - Samsung Internet (mobile)
AND graceful fallbacks for unsupported features
```

**AC-BC2: Feature Detection**
```gherkin
GIVEN feature detection requirements
WHEN modern features are used
THEN implements proper detection:
  - Service Worker support detection
  - Intersection Observer fallbacks
  - CSS Grid/Flexbox fallbacks
  - JavaScript feature detection
  - Progressive enhancement patterns
AND no broken functionality on older browsers
```

## Technical Implementation Details

### **Service Worker Implementation:**
```typescript
// service-worker.ts
const CACHE_NAME = 'laptop-repair-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/sua-laptop/tra-cuu',
  '/lien-he',
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/images/logo.png'
];

const DYNAMIC_CACHE_NAME = 'laptop-repair-dynamic-v1';

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;

  // Handle API requests (network-first)
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE_NAME)
            .then(cache => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Handle static assets (cache-first)
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => cache.put(request, responseToCache));

            return response;
          });
      })
  );
});
```

### **Web App Manifest:**
```json
{
  "name": "Hệ thống Quản lý Sửa chữa Laptop",
  "short_name": "Laptop Repair",
  "description": "Tra cứu phiếu sửa chữa và thông tin dịch vụ laptop",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait",
  "scope": "/",
  "lang": "vi",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/mobile-home.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshots/desktop-home.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ]
}
```

### **SEO Components:**
```typescript
// SEO optimization component
export function SEOOptimizer({ page }: { page: PageSEOData }) {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{page.title}</title>
      <meta name="description" content={page.description} />
      <meta name="keywords" content={page.keywords} />
      <link rel="canonical" href={page.canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={page.title} />
      <meta property="og:description" content={page.description} />
      <meta property="og:type" content={page.type || 'website'} />
      <meta property="og:url" content={page.canonicalUrl} />
      <meta property="og:image" content={page.image} />
      <meta property="og:locale" content="vi_VN" />
      <meta property="og:site_name" content="Laptop Repair Shop" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={page.title} />
      <meta name="twitter:description" content={page.description} />
      <meta name="twitter:image" content={page.image} />

      {/* Local Business Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": "https://laptop-repair-shop.local/#business",
          "name": "Laptop Repair Shop",
          "description": page.description,
          "url": "https://laptop-repair-shop.local",
          "telephone": "+84901234567",
          "priceRange": "$$",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "123 Main Street",
            "addressLocality": "Ho Chi Minh City",
            "addressRegion": "Ho Chi Minh",
            "postalCode": "70000",
            "addressCountry": "VN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "10.8231",
            "longitude": "106.6297"
          },
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "08:00",
              "closes": "18:00"
            },
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": "Saturday",
              "opens": "08:00",
              "closes": "16:00"
            }
          ],
          "serviceArea": {
            "@type": "City",
            "name": "Ho Chi Minh City"
          }
        })}
      </script>

      {/* Breadcrumb Schema */}
      {page.breadcrumbs && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": page.breadcrumbs.map((crumb, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": crumb.name,
              "item": crumb.url
            }))
          })}
        </script>
      )}
    </Helmet>
  );
}
```

### **Performance Optimization:**
```typescript
// Image optimization component
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Generate optimized image URLs
    const webpSrc = generateWebPUrl(src, width, height);
    const fallbackSrc = generateOptimizedUrl(src, width, height);

    // Check WebP support
    const supportsWebP = checkWebPSupport();
    setImageSrc(supportsWebP ? webpSrc : fallbackSrc);
  }, [src, width, height]);

  // Lazy loading implementation
  useEffect(() => {
    if (!priority && imgRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              img.src = imageSrc;
              observer.unobserve(img);
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(imgRef.current);
      return () => observer.disconnect();
    }
  }, [imageSrc, priority]);

  return (
    <img
      ref={imgRef}
      src={priority ? imageSrc : undefined}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setIsLoading(false)}
      style={{
        aspectRatio: `${width}/${height}`,
        opacity: isLoading ? 0 : 1,
        transition: 'opacity 0.3s'
      }}
    />
  );
}

// Critical CSS inlining
export function CriticalCSS() {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        /* Critical above-the-fold styles */
        body { margin: 0; font-family: system-ui; }
        .header { background: #3b82f6; color: white; padding: 1rem; }
        .hero { padding: 2rem; text-align: center; }
        .loading { display: flex; justify-content: center; padding: 2rem; }
      `
    }} />
  );
}
```

### **Automated Testing Scenarios:**

**Test Suite: PWA Implementation & SEO**
```typescript
describe('PWA Implementation & SEO Optimization', () => {
  test('AC-PWA1: Service worker registers successfully', async () => {
    // Mock service worker
    const mockServiceWorker = {
      register: jest.fn().mockResolvedValue({ scope: '/' })
    };
    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockServiceWorker,
      writable: true
    });

    render(<App />);

    await waitFor(() => {
      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js');
    });
  });

  test('AC-PWA2: Web app manifest is valid', async () => {
    const manifestResponse = await fetch('/manifest.json');
    const manifest = await manifestResponse.json();

    expect(manifest.name).toBe('Hệ thống Quản lý Sửa chữa Laptop');
    expect(manifest.short_name).toBe('Laptop Repair');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons).toHaveLength(2);
    expect(manifest.lang).toBe('vi');
  });

  test('AC-PWA3: Offline functionality works', async () => {
    // Mock offline network
    mockNetworkStatus(false);

    render(<TicketLookupPage />);

    // Should show offline indicator
    expect(screen.getByText(/Đang offline/)).toBeInTheDocument();

    // Should show cached content
    expect(screen.getByText('Tra cứu phiếu sửa chữa')).toBeInTheDocument();
  });

  test('AC-PO1: Core Web Vitals optimization', async () => {
    const performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcpEntry = entries.find(entry => entry.entryType === 'largest-contentful-paint');

      if (lcpEntry) {
        expect(lcpEntry.startTime).toBeLessThan(2500); // < 2.5s LCP
      }
    });

    performanceObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Dịch vụ sửa chữa laptop')).toBeInTheDocument();
    });
  });

  test('AC-SEO1: Technical SEO implementation', () => {
    render(<HomePage />);

    // Check meta tags
    expect(document.title).toContain('Laptop Repair');
    expect(document.querySelector('meta[name="description"]')).toBeTruthy();
    expect(document.querySelector('link[rel="canonical"]')).toBeTruthy();

    // Check heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();
  });

  test('AC-SEO2: Local business SEO structured data', () => {
    render(<HomePage />);

    const structuredData = document.querySelector('script[type="application/ld+json"]');
    expect(structuredData).toBeTruthy();

    const data = JSON.parse(structuredData!.textContent!);
    expect(data['@type']).toBe('LocalBusiness');
    expect(data.address.addressLocality).toBe('Ho Chi Minh City');
    expect(data.telephone).toBe('+84901234567');
  });

  test('AC-MP1: Mobile-first performance', async () => {
    // Mock mobile device
    Object.defineProperty(window, 'innerWidth', { value: 375 });
    Object.defineProperty(navigator, 'connection', {
      value: { effectiveType: '3g' }
    });

    const startTime = Date.now();
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Dịch vụ sửa chữa laptop')).toBeInTheDocument();
    });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // < 3s on mobile
  });

  test('AC-AM1: Performance monitoring setup', () => {
    const mockAnalytics = jest.fn();
    window.gtag = mockAnalytics;

    render(<App />);

    // Should track Core Web Vitals
    expect(mockAnalytics).toHaveBeenCalledWith('event', 'web_vitals',
      expect.objectContaining({
        metric_name: expect.any(String),
        metric_value: expect.any(Number)
      })
    );
  });

  test('AC-BC1: Cross-browser support', () => {
    // Test different user agents
    const browsers = [
      'Chrome/91.0',
      'Firefox/89.0',
      'Safari/14.1',
      'Edge/91.0'
    ];

    browsers.forEach(browser => {
      Object.defineProperty(navigator, 'userAgent', {
        value: `Mozilla/5.0 (${browser})`,
        configurable: true
      });

      const { container } = render(<App />);
      expect(container.firstChild).toBeTruthy();
    });
  });
});
```

### **Performance Budget Configuration:**
```json
{
  "budget": [
    {
      "type": "initial",
      "maximumWarning": "1mb",
      "maximumError": "2mb"
    },
    {
      "type": "anyComponentStyle",
      "maximumWarning": "50kb",
      "maximumError": "100kb"
    },
    {
      "type": "bundle",
      "name": "main",
      "maximumWarning": "500kb",
      "maximumError": "1mb"
    }
  ],
  "lighthouse": {
    "performance": 90,
    "accessibility": 95,
    "best-practices": 90,
    "seo": 95,
    "pwa": 90
  }
}
```

## Definition of Done

- [ ] **AC-PWA1:** Service worker implementation functional
- [ ] **AC-PWA2:** Web app manifest complete và valid
- [ ] **AC-PWA3:** Offline functionality working
- [ ] **AC-PWA4:** Installation prompts implemented
- [ ] **AC-PO1:** Core Web Vitals optimization achieved
- [ ] **AC-PO2:** Resource optimization implemented
- [ ] **AC-PO3:** Caching strategy functional
- [ ] **AC-SEO1:** Technical SEO implementation complete
- [ ] **AC-SEO2:** Local business SEO optimized
- [ ] **AC-SEO3:** Content SEO optimization implemented
- [ ] **AC-MP1:** Mobile-first performance achieved
- [ ] **AC-MP2:** Progressive enhancement implemented
- [ ] **AC-AM1:** Performance monitoring active
- [ ] **AC-AM2:** SEO analytics implemented
- [ ] **AC-AM3:** User experience analytics functional
- [ ] **AC-SC1:** HTTPS và security implemented
- [ ] **AC-SC2:** Privacy compliance achieved
- [ ] **AC-BC1:** Cross-browser support verified
- [ ] **AC-BC2:** Feature detection implemented
- [ ] **Lighthouse Audit:** All scores > 90
- [ ] **PWA Audit:** All PWA criteria met
- [ ] **SEO Audit:** Technical SEO validated
- [ ] **Performance Testing:** Load testing completed

## Risk Mitigation

- **Primary Risk:** Performance degradation affecting user experience và SEO
- **Mitigation:** Continuous monitoring, performance budgets, automated testing
- **Rollback Plan:** Service worker bypass, fallback to standard web app

## Story Dependencies

- **Prerequisites:** Story 03.3 (Product & Training Information)
- **Enables:** Complete customer portal với optimal performance
- **Estimated Effort:** 4-5 days
- **Priority:** High (performance và discoverability critical)