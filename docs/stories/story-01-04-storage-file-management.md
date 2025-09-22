# Story 01.4: Storage & File Management System

## User Story

**As a** repair technician,
**I want** a secure file storage system cho repair ticket photos và documents,
**So that** tôi có thể document repair process và store visual evidence safely.

## Story Context

**File Management Philosophy:**
- Private storage với staff-only access
- Organized folder structure by ticket và date
- Image optimization với imgproxy support
- Secure access qua signed URLs
- No public file access for security

**Technical Requirements:**
- Supabase Storage với private buckets
- Folder structure: `tickets/{ticket_code}/{YYYY-MM-DD}/`
- Image resizing và optimization
- File upload validation và limits
- Access control integration với RLS

## Acceptance Criteria

### **Storage Infrastructure Requirements:**

**AC-S1: Supabase Storage Bucket Setup**
```gherkin
GIVEN Supabase Storage service running
WHEN storage configuration is applied
THEN 'tickets' bucket exists và is private
AND bucket has proper RLS policies for staff access
AND public access is completely disabled
AND bucket allows image file types (jpg, png, webp)
AND file size limits are enforced (max 10MB per file)
```

**AC-S2: Folder Structure Organization**
```gherkin
GIVEN file upload for repair ticket
WHEN files are stored
THEN folder structure follows pattern: tickets/{ticket_code}/{YYYY-MM-DD}/
AND files are named với timestamp: {HH-mm-ss}_{original_name}
AND folder organization is consistent across uploads
AND old files remain accessible via same structure
```

**AC-S3: File Access Security**
```gherkin
GIVEN stored files in private bucket
WHEN file access is requested
THEN only authenticated staff can access files
AND signed URLs expire after configured time (1 hour)
AND direct file URLs are not accessible
AND unauthorized access attempts are blocked
```

### **File Upload Requirements:**

**AC-UP1: File Upload Validation**
```gherkin
GIVEN file upload attempt
WHEN validation occurs
THEN only image files are accepted (jpg, jpeg, png, webp)
AND file size limit (10MB) is enforced
AND malicious file types are rejected
AND upload progress is tracked và displayed
```

**AC-UP2: Multiple File Upload Support**
```gherkin
GIVEN repair ticket documentation need
WHEN multiple files are uploaded
THEN batch upload is supported (up to 10 files at once)
AND individual file validation applies to each file
AND partial upload failures are handled gracefully
AND successful uploads are confirmed individually
```

**AC-UP3: Upload Error Handling**
```gherkin
GIVEN file upload process
WHEN upload errors occur
THEN network failures retry automatically (3 attempts)
AND file size errors show clear message
AND invalid file type errors are descriptive
AND quota exceeded errors are handled gracefully
```

### **Image Processing Requirements:**

**AC-IMG1: Image Optimization Integration**
```gherkin
GIVEN imgproxy service running
WHEN images are displayed
THEN thumbnails are generated automatically (200x200)
AND full-size images can be requested
AND image optimization reduces file size
AND original images are preserved
```

**AC-IMG2: Responsive Image Serving**
```gherkin
GIVEN different display contexts
WHEN images are served
THEN thumbnail URLs for list views
AND medium size (800px) for detail views
AND full resolution for download/print
AND proper image formats (webp preferred, jpg fallback)
```

**AC-IMG3: Image Metadata Preservation**
```gherkin
GIVEN image uploads
WHEN metadata is processed
THEN upload timestamp is preserved
AND original filename is maintained
AND file size information is stored
AND image dimensions are captured
```

### **Access Control Requirements:**

**AC-AC1: Staff File Access**
```gherkin
GIVEN authenticated staff member
WHEN accessing ticket files
THEN can view all files for all tickets
AND can upload files to any ticket
AND can download files với proper signed URLs
AND cannot access other bucket types
```

**AC-AC2: File Permission Integration**
```gherkin
GIVEN RLS policies for storage
WHEN file operations occur
THEN storage policies align với database RLS
AND deactivated staff lose file access immediately
AND role-based access is consistent
AND audit trail for file access exists
```

**AC-AC3: Public Access Prevention**
```gherkin
GIVEN private storage configuration
WHEN public access is attempted
THEN direct file URLs return 403 Forbidden
AND bucket listing is not accessible
AND file discovery through enumeration is prevented
AND no public read permissions exist
```

### **API Integration Requirements:**

**AC-API1: File Upload API**
```gherkin
GIVEN file upload API endpoint
WHEN upload request is made
THEN multipart form data is supported
AND file metadata is returned
AND storage path is generated automatically
AND upload response includes signed URL for immediate access
```

**AC-API2: File Listing API**
```gherkin
GIVEN ticket file listing request
WHEN API is called with ticket_code
THEN all files for that ticket are returned
AND file metadata includes: name, size, upload_date, signed_url
AND files are sorted by upload date (newest first)
AND pagination is supported for tickets với many files
```

**AC-API3: File Management API**
```gherkin
GIVEN file management operations
WHEN API calls are made
THEN files can be deleted by authorized staff
AND file renaming is supported
AND batch operations are available
AND operations are logged for audit
```

### **Performance Requirements:**

**AC-PERF1: Upload Performance**
```gherkin
GIVEN file upload process
WHEN performance is measured
THEN uploads complete within reasonable time (< 30s for 10MB)
AND progress indication is accurate
AND concurrent uploads are supported
AND upload throughput scales với user count
```

**AC-PERF2: Image Serving Performance**
```gherkin
GIVEN image display requests
WHEN images are served
THEN thumbnails load in < 2 seconds
AND image optimization reduces bandwidth
AND CDN-like caching is utilized
AND concurrent image requests are handled efficiently
```

## Technical Implementation Details

### **Storage Bucket Configuration:**
```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tickets',
  'tickets',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- RLS policies for storage
CREATE POLICY "staff_can_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'tickets' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "staff_can_view" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'tickets' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );
```

### **File Management Functions:**
```typescript
// File upload utility
export async function uploadTicketFile(
  ticketCode: string,
  file: File
): Promise<{ path: string; signedUrl: string }> {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const timestamp = new Date().toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-mm-ss
  const fileName = `${timestamp}_${file.name}`;
  const filePath = `tickets/${ticketCode}/${date}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('tickets')
    .upload(filePath, file);

  if (error) throw error;

  const { data: signedUrlData } = await supabase.storage
    .from('tickets')
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  return {
    path: data.path,
    signedUrl: signedUrlData.signedUrl
  };
}

// File listing utility
export async function getTicketFiles(ticketCode: string) {
  const { data, error } = await supabase.storage
    .from('tickets')
    .list(`tickets/${ticketCode}`);

  if (error) throw error;

  // Generate signed URLs for all files
  const filesWithUrls = await Promise.all(
    data.map(async (file) => {
      const { data: signedUrlData } = await supabase.storage
        .from('tickets')
        .createSignedUrl(`tickets/${ticketCode}/${file.name}`, 3600);

      return {
        name: file.name,
        size: file.metadata?.size,
        lastModified: file.updated_at,
        signedUrl: signedUrlData?.signedUrl
      };
    })
  );

  return filesWithUrls;
}
```

### **Automated Testing Scenarios:**

**Test Suite: Storage & File Management**
```typescript
describe('Storage & File Management', () => {
  test('AC-S1: Storage bucket setup correctly', async () => {
    // Check bucket exists và is private
    const { data: buckets } = await supabase.storage.listBuckets();
    const ticketsBucket = buckets.find(b => b.id === 'tickets');

    expect(ticketsBucket).toBeTruthy();
    expect(ticketsBucket.public).toBe(false);
  });

  test('AC-UP1: File upload validation works', async () => {
    const validImageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const invalidFile = new File(['test'], 'test.exe', { type: 'application/exe' });

    // Valid file should upload
    await expect(uploadTicketFile('LRP-2025-000001', validImageFile))
      .resolves.toBeTruthy();

    // Invalid file should reject
    await expect(uploadTicketFile('LRP-2025-000001', invalidFile))
      .rejects.toThrow();
  });

  test('AC-S2: Folder structure is correct', async () => {
    const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const result = await uploadTicketFile('LRP-2025-000001', testFile);

    const expectedPattern = /^tickets\/LRP-2025-000001\/\d{4}-\d{2}-\d{2}\/\d{2}-\d{2}-\d{2}_test\.jpg$/;
    expect(result.path).toMatch(expectedPattern);
  });

  test('AC-AC3: Public access is prevented', async () => {
    // Upload a file first
    const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const { path } = await uploadTicketFile('LRP-2025-000001', testFile);

    // Try to access directly (should fail)
    const directUrl = `${supabaseUrl}/storage/v1/object/public/tickets/${path}`;
    const response = await fetch(directUrl);

    expect(response.status).toBe(403); // Forbidden
  });

  test('AC-PERF1: Upload performance meets requirements', async () => {
    const largeFile = new File([new ArrayBuffer(5 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg'
    }); // 5MB file

    const startTime = Date.now();
    await uploadTicketFile('LRP-2025-000001', largeFile);
    const uploadTime = Date.now() - startTime;

    expect(uploadTime).toBeLessThan(30000); // < 30 seconds
  });
});
```

### **Integration với Imgproxy:**
```typescript
// Image URL generation với optimization
export function getOptimizedImageUrl(
  filePath: string,
  width?: number,
  height?: number
): string {
  const baseUrl = process.env.VITE_IMGPROXY_URL || 'http://localhost:5001';
  const signedFilePath = btoa(filePath).replace(/\+/g, '-').replace(/\//g, '_');

  if (width && height) {
    return `${baseUrl}/resize:fit:${width}:${height}/plain/${signedFilePath}`;
  }

  return `${baseUrl}/plain/${signedFilePath}`;
}

// Usage examples
const thumbnailUrl = getOptimizedImageUrl(filePath, 200, 200);
const mediumUrl = getOptimizedImageUrl(filePath, 800, 600);
```

## Definition of Done

- [ ] **AC-S1:** Storage bucket setup complete với proper configuration
- [ ] **AC-S2:** Folder structure organization working
- [ ] **AC-S3:** File access security enforced
- [ ] **AC-UP1:** File upload validation functional
- [ ] **AC-UP2:** Multiple file upload supported
- [ ] **AC-UP3:** Upload error handling robust
- [ ] **AC-IMG1:** Image optimization integration working
- [ ] **AC-IMG2:** Responsive image serving functional
- [ ] **AC-IMG3:** Image metadata preservation working
- [ ] **AC-AC1:** Staff file access properly controlled
- [ ] **AC-AC2:** File permission integration với RLS
- [ ] **AC-AC3:** Public access completely prevented
- [ ] **AC-API1:** File upload API functional
- [ ] **AC-API2:** File listing API working
- [ ] **AC-API3:** File management API complete
- [ ] **AC-PERF1:** Upload performance meets requirements
- [ ] **AC-PERF2:** Image serving performance acceptable
- [ ] **Security Testing:** File access controls verified
- [ ] **Load Testing:** Performance under concurrent uploads
- [ ] **Documentation:** File management procedures documented

## Risk Mitigation

- **Primary Risk:** File corruption hoặc unauthorized access
- **Mitigation:** Multiple backup strategies, comprehensive access testing
- **Rollback Plan:** Storage bucket reset và file restoration từ backups

## Story Dependencies

- **Prerequisites:** Story 01.3 (Authentication & RLS Policies)
- **Enables:** All file upload features, ticket photo documentation
- **Estimated Effort:** 2-3 days
- **Priority:** High (essential for repair documentation)