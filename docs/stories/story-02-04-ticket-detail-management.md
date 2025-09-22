# Story 02.4: Ticket Detail Management

## User Story

**As a** repair shop staff member,
**I want** comprehensive ticket detail management với photo documentation, internal communication, và complete repair tracking,
**So that** tôi có thể efficiently manage individual repair cases từ start to finish với full accountability.

## Story Context

**Ticket Detail Philosophy:**
- Single source of truth cho mỗi repair case
- Visual documentation với photo management
- Internal communication cho staff collaboration
- Complete audit trail của all activities
- Customer-focused information organization

**Technical Foundation:**
- Rich form interface với real-time validation
- File upload integration với Supabase Storage
- Real-time comments system cho team collaboration
- Comprehensive edit history tracking
- Mobile-optimized interface cho field work

## Acceptance Criteria

### **Ticket Information Management Requirements:**

**AC-TI1: Complete Ticket Information Display**
```gherkin
GIVEN ticket detail view
WHEN page is loaded
THEN displays all ticket information:
  - Ticket code, status, creation/update timestamps
  - Customer info với click-to-call phone number
  - Device details và condition description
  - Assigned staff member với reassignment option
  - Cost breakdown và payment status
  - Parts used với quantities và pricing
  - Warranty information và expiration date
AND all fields are properly formatted và localized
```

**AC-TI2: Inline Editing Capabilities**
```gherkin
GIVEN staff member có edit permissions
WHEN editing ticket information
THEN can edit device model, issue description
AND can update customer address/notes
AND can modify cost estimates và pricing
AND can add/remove parts từ repair
AND can update warranty period
AND changes save automatically với optimistic updates
AND edit conflicts are handled gracefully
```

**AC-TI3: Cost Management Integration**
```gherkin
GIVEN ticket cost calculations
WHEN cost information is managed
THEN parts cost auto-calculated từ parts_used
AND labor cost can be added manually
AND total cost updates automatically
AND cost history is maintained
AND deposit amount tracking available
AND payment status indicators clear
```

### **Photo Documentation Requirements:**

**AC-PD1: Photo Upload & Management**
```gherkin
GIVEN photo documentation needs
WHEN uploading photos
THEN supports multiple file upload (drag-and-drop)
AND accepts common image formats (jpg, png, webp)
AND file size validation (max 10MB per file)
AND automatic image optimization và thumbnail generation
AND photos organized by upload date
AND bulk photo operations (select, delete, download)
```

**AC-PD2: Photo Gallery Interface**
```gherkin
GIVEN uploaded photos for ticket
WHEN viewing photo gallery
THEN thumbnail grid với hover previews
AND full-size modal viewer với navigation
AND zoom và pan functionality
AND photo metadata display (date, size, uploader)
AND categorization options (before/during/after repair)
AND slideshow mode for presentations
```

**AC-PD3: Photo Security & Access Control**
```gherkin
GIVEN sensitive repair photos
WHEN access control is applied
THEN only staff members can view photos
AND photos not accessible via direct URLs
AND signed URL expiration enforced
AND photo access logged for audit
AND secure deletion when ticket archived
```

### **Internal Communication Requirements:**

**AC-IC1: Comments & Notes System**
```gherkin
GIVEN staff collaboration needs
WHEN using internal comments
THEN threaded comment system available
AND @mention functionality for staff alerts
AND rich text formatting (bold, italic, lists)
AND file attachments to comments
AND comment edit/delete với history
AND real-time comment notifications
```

**AC-IC2: Activity Timeline**
```gherkin
GIVEN ticket activity tracking
WHEN viewing activity timeline
THEN chronological list of all ticket events:
  - Status changes với reason
  - Assignment changes
  - Photo uploads
  - Comment additions
  - Cost updates
  - Customer communications
AND activity filtering by type
AND activity search functionality
```

**AC-IC3: Staff Communication Workflow**
```gherkin
GIVEN multi-staff ticket handling
WHEN communication occurs
THEN notification system for mentions
AND email digests for daily activity
AND urgent priority flagging system
AND handoff notes between shifts
AND escalation procedures documented
```

### **Customer Communication Requirements:**

**AC-CC1: Customer Communication Log**
```gherkin
GIVEN customer interaction tracking
WHEN communications are logged
THEN phone call logs với duration và notes
AND SMS/message history if applicable
AND customer approval records
AND complaint/feedback documentation
AND communication preference tracking
```

**AC-CC2: Customer Information Updates**
```gherkin
GIVEN customer information management
WHEN updates are needed
THEN customer details editable từ ticket view
AND change history maintained
AND duplicate customer detection
AND preferred contact method selection
AND emergency contact information
```

### **Parts & Cost Management Requirements:**

**AC-PC1: Parts Usage Tracking**
```gherkin
GIVEN parts usage in repair
WHEN managing parts
THEN searchable parts catalog integration
AND quantity selection với stock checking
AND unit cost và markup pricing
AND parts substitution tracking
AND vendor information display
AND parts warranty period setting
```

**AC-PC2: Dynamic Cost Calculation**
```gherkin
GIVEN cost components
WHEN calculations are performed
THEN parts cost auto-totaled
AND labor hours × hourly rate calculation
AND tax calculations if applicable
AND discount application options
AND cost breakdown transparency
AND estimate vs actual cost comparison
```

**AC-PC3: Payment Processing Integration**
```gherkin
GIVEN payment requirements
WHEN payment is processed
THEN deposit collection tracking
AND final payment confirmation
AND payment method recording
AND receipt generation capability
AND refund processing if needed
```

### **Quality Assurance Requirements:**

**AC-QA1: Quality Checklist Integration**
```gherkin
GIVEN quality control process
WHEN QA steps are performed
THEN standardized quality checklist available
AND checklist customization by device type
AND QA sign-off requirements
AND quality photos mandatory for completion
AND customer satisfaction survey integration
```

**AC-QA2: Warranty Documentation**
```gherkin
GIVEN warranty requirements
WHEN warranty is set
THEN warranty period auto-calculated based on repair type
AND warranty terms clearly documented
AND warranty certificate generation
AND warranty claim tracking
AND warranty extension options
```

### **Mobile Optimization Requirements:**

**AC-MO1: Mobile Interface Design**
```gherkin
GIVEN mobile device usage
WHEN accessing ticket details
THEN responsive layout adapts to screen size
AND touch-friendly interface elements
AND swipe gestures for photo navigation
AND voice input for comments
AND offline capability for critical data
```

**AC-MO2: Field-Optimized Features**
```gherkin
GIVEN field technician usage
WHEN working away từ shop
THEN photo capture directly từ camera
AND GPS location tagging for photos
AND barcode scanning for parts
AND signature capture for approvals
AND sync when connection restored
```

### **Performance & User Experience Requirements:**

**AC-PU1: Page Load Performance**
```gherkin
GIVEN ticket detail page access
WHEN page loads
THEN initial content loads within 1.5 seconds
AND progressive loading for photos và comments
AND skeleton loading states during fetch
AND error boundaries for partial failures
AND retry mechanisms for failed requests
```

**AC-PU2: Real-time Collaboration**
```gherkin
GIVEN multiple staff working on same ticket
WHEN concurrent editing occurs
THEN real-time cursor indicators
AND collaborative editing conflict resolution
AND live comment updates
AND presence indicators (who's viewing)
AND edit locking for critical fields
```

## Technical Implementation Details

### **Ticket Detail Component:**
```typescript
export function TicketDetailView({ ticketId }: { ticketId: string }) {
  const { ticket, isLoading, error, refetch } = useTicket(ticketId);
  const { comments, addComment } = useTicketComments(ticketId);
  const { photos, uploadPhoto, deletePhoto } = useTicketPhotos(ticketId);
  const { activities } = useTicketActivities(ticketId);

  const [editMode, setEditMode] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState<Partial<RepairTicket>>({});

  const handleInlineEdit = async (field: string, value: any) => {
    try {
      // Optimistic update
      setUnsavedChanges(prev => ({ ...prev, [field]: value }));

      // Auto-save với debounce
      await debouncedSave(ticketId, { [field]: value });

      // Clear unsaved changes on success
      setUnsavedChanges(prev => {
        const { [field]: removed, ...rest } = prev;
        return rest;
      });

    } catch (error) {
      // Revert optimistic update
      setUnsavedChanges(prev => {
        const { [field]: removed, ...rest } = prev;
        return rest;
      });
      toast.error('Không thể lưu thay đổi');
    }
  };

  if (isLoading) return <TicketDetailSkeleton />;
  if (error) return <ErrorBoundary error={error} onRetry={refetch} />;

  return (
    <div className="ticket-detail-container">
      {/* Header với ticket info */}
      <TicketHeader
        ticket={ticket}
        unsavedChanges={unsavedChanges}
        onEdit={handleInlineEdit}
      />

      <div className="ticket-content-grid">
        {/* Left column: Main ticket info */}
        <div className="ticket-main-content">
          <CustomerInfoSection
            ticket={ticket}
            onEdit={handleInlineEdit}
          />

          <DeviceInfoSection
            ticket={ticket}
            onEdit={handleInlineEdit}
          />

          <PartsUsageSection
            ticket={ticket}
            onPartsUpdate={(parts) => handleInlineEdit('parts_used', parts)}
          />

          <CostBreakdownSection
            ticket={ticket}
            onCostUpdate={(cost) => handleInlineEdit('total_cost', cost)}
          />
        </div>

        {/* Right column: Photos, comments, activity */}
        <div className="ticket-sidebar">
          <PhotoGallerySection
            photos={photos}
            onUpload={uploadPhoto}
            onDelete={deletePhoto}
          />

          <InternalCommentsSection
            comments={comments}
            onAddComment={addComment}
          />

          <ActivityTimelineSection
            activities={activities}
          />
        </div>
      </div>

      {/* Status update widget */}
      <StatusUpdateWidget ticket={ticket} />

      {/* Unsaved changes indicator */}
      {Object.keys(unsavedChanges).length > 0 && (
        <UnsavedChangesIndicator
          onSave={() => handleSaveAll(unsavedChanges)}
          onDiscard={() => setUnsavedChanges({})}
        />
      )}
    </div>
  );
}
```

### **Photo Management Component:**
```typescript
export function PhotoGallerySection({ photos, onUpload, onDelete }: PhotoGalleryProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handleDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const uploadPromises = acceptedFiles.map(file => onUpload(file));
      await Promise.all(uploadPromises);
      toast.success(`Đã upload ${acceptedFiles.length} ảnh thành công`);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi upload ảnh');
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  return (
    <Card className="photo-gallery-section">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Ảnh sửa chữa ({photos.length})
          {selectedPhotos.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkDelete(selectedPhotos)}
            >
              Xóa đã chọn ({selectedPhotos.length})
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Upload area */}
        <div
          {...getRootProps()}
          className={`upload-dropzone ${isDragActive ? 'drag-active' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="upload-content">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p>
              {isDragActive
                ? 'Thả ảnh vào đây...'
                : 'Kéo thả ảnh hoặc click để chọn'
              }
            </p>
          </div>
        </div>

        {/* Photo grid */}
        {photos.length > 0 && (
          <div className="photo-grid">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className={`photo-thumbnail ${
                  selectedPhotos.includes(photo.id) ? 'selected' : ''
                }`}
              >
                <img
                  src={photo.thumbnailUrl}
                  alt={`Repair photo ${index + 1}`}
                  onClick={() => {
                    setCurrentPhotoIndex(index);
                    setViewerOpen(true);
                  }}
                />
                <div className="photo-overlay">
                  <Checkbox
                    checked={selectedPhotos.includes(photo.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPhotos(prev => [...prev, photo.id]);
                      } else {
                        setSelectedPhotos(prev => prev.filter(id => id !== photo.id));
                      }
                    }}
                  />
                  <span className="photo-date">
                    {formatDate(photo.uploadedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo viewer modal */}
        <PhotoViewer
          isOpen={viewerOpen}
          photos={photos}
          currentIndex={currentPhotoIndex}
          onClose={() => setViewerOpen(false)}
          onIndexChange={setCurrentPhotoIndex}
        />
      </CardContent>
    </Card>
  );
}
```

### **Internal Comments System:**
```typescript
export function InternalCommentsSection({ comments, onAddComment }: CommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment({
        content: newComment,
        author_id: user.id,
        created_at: new Date().toISOString()
      });
      setNewComment('');
      toast.success('Đã thêm ghi chú');
    } catch (error) {
      toast.error('Không thể thêm ghi chú');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMention = (mention: string) => {
    setNewComment(prev => prev + ` @${mention} `);
  };

  return (
    <Card className="comments-section">
      <CardHeader>
        <CardTitle>Ghi chú nội bộ ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Comment list */}
        <div className="comments-list">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onMention={handleMention}
            />
          ))}
        </div>

        {/* Add comment form */}
        <form onSubmit={handleSubmit} className="add-comment-form">
          <Textarea
            placeholder="Thêm ghi chú nội bộ..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="comment-input"
          />
          <div className="comment-actions">
            <Button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              size="sm"
            >
              {isSubmitting ? 'Đang thêm...' : 'Thêm ghi chú'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

### **Automated Testing Scenarios:**

**Test Suite: Ticket Detail Management**
```typescript
describe('Ticket Detail Management', () => {
  test('AC-TI1: Complete ticket information display', async () => {
    const mockTicket = {
      id: 'ticket-123',
      ticket_code: 'LRP-2025-000001',
      customer: { phone: '0901234567', full_name: 'Nguyễn Văn A' },
      device_type: 'Laptop',
      status: 'in_repair',
      total_cost: 1500000,
      parts_used: [{ name: 'RAM 8GB', quantity: 1, unit_price: 800000 }]
    };

    const { getByTestId } = render(<TicketDetailView ticketId="ticket-123" />);

    await waitFor(() => {
      expect(getByTestId('ticket-code')).toHaveTextContent('LRP-2025-000001');
      expect(getByTestId('customer-name')).toHaveTextContent('Nguyễn Văn A');
      expect(getByTestId('device-type')).toHaveTextContent('Laptop');
      expect(getByTestId('total-cost')).toHaveTextContent('1,500,000 ₫');
    });
  });

  test('AC-TI2: Inline editing capabilities', async () => {
    const { getByTestId } = render(<TicketDetailView ticketId="ticket-123" />);

    // Test inline editing
    const deviceModelField = getByTestId('device-model-field');
    fireEvent.click(deviceModelField);

    const editInput = getByTestId('device-model-input');
    fireEvent.change(editInput, { target: { value: 'Dell Inspiron 15' } });
    fireEvent.blur(editInput);

    // Verify auto-save
    await waitFor(() => {
      expect(mockSupabaseUpdate).toHaveBeenCalledWith({
        device_model: 'Dell Inspiron 15'
      });
    });
  });

  test('AC-PD1: Photo upload & management', async () => {
    const { getByTestId } = render(<PhotoGallerySection photos={[]} onUpload={jest.fn()} />);

    const file = new File(['test'], 'repair-photo.jpg', { type: 'image/jpeg' });
    const dropzone = getByTestId('photo-dropzone');

    // Simulate file drop
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file]
      }
    });

    await waitFor(() => {
      expect(mockUploadPhoto).toHaveBeenCalledWith(file);
    });
  });

  test('AC-IC1: Comments & notes system', async () => {
    const mockComments = [
      {
        id: 'comment-1',
        content: 'Đã kiểm tra, cần thay RAM',
        author: { full_name: 'Nguyễn Văn B' },
        created_at: '2025-01-22T10:00:00Z'
      }
    ];

    const { getByTestId, getByText } = render(
      <InternalCommentsSection
        comments={mockComments}
        onAddComment={jest.fn()}
      />
    );

    expect(getByText('Đã kiểm tra, cần thay RAM')).toBeInTheDocument();
    expect(getByText('Nguyễn Văn B')).toBeInTheDocument();

    // Test adding new comment
    const commentInput = getByTestId('comment-input');
    fireEvent.change(commentInput, {
      target: { value: 'Đã thay RAM mới, test OK' }
    });

    fireEvent.click(getByTestId('add-comment-button'));

    await waitFor(() => {
      expect(mockAddComment).toHaveBeenCalledWith({
        content: 'Đã thay RAM mới, test OK',
        author_id: expect.any(String),
        created_at: expect.any(String)
      });
    });
  });

  test('AC-PC2: Dynamic cost calculation', async () => {
    const { getByTestId } = render(<CostBreakdownSection ticket={mockTicket} />);

    // Add a part
    fireEvent.click(getByTestId('add-part-button'));
    fireEvent.change(getByTestId('part-quantity'), { target: { value: '2' } });
    fireEvent.change(getByTestId('part-price'), { target: { value: '500000' } });

    // Verify total cost auto-calculation
    await waitFor(() => {
      expect(getByTestId('parts-subtotal')).toHaveTextContent('1,000,000 ₫');
      expect(getByTestId('total-cost')).toHaveTextContent('2,500,000 ₫'); // Including existing parts
    });
  });

  test('AC-PU2: Real-time collaboration', async () => {
    const { getByTestId } = render(<TicketDetailView ticketId="ticket-123" />);

    // Simulate another user editing
    act(() => {
      mockSupabaseRealtimeUpdate('repair_tickets', {
        event: 'UPDATE',
        new: { device_model: 'Updated by other user' }
      });
    });

    await waitFor(() => {
      expect(getByTestId('device-model-field')).toHaveTextContent('Updated by other user');
      expect(getByTestId('collaboration-indicator')).toBeInTheDocument();
    });
  });

  test('AC-MO1: Mobile interface design', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', { value: 375 });
    Object.defineProperty(window, 'innerHeight', { value: 667 });

    const { container } = render(<TicketDetailView ticketId="ticket-123" />);

    await waitFor(() => {
      expect(container.firstChild).toHaveClass('mobile-layout');
    });

    // Test swipe gesture on photo gallery
    const photoGallery = container.querySelector('.photo-gallery');
    fireEvent.touchStart(photoGallery, { touches: [{ clientX: 100 }] });
    fireEvent.touchMove(photoGallery, { touches: [{ clientX: 50 }] });
    fireEvent.touchEnd(photoGallery);

    expect(mockPhotoNavigation).toHaveBeenCalledWith('next');
  });
});
```

### **Performance Optimizations:**
```typescript
// Lazy loading for large photo galleries
export const LazyPhotoGrid = React.lazy(() => import('./PhotoGrid'));

// Optimistic updates for better UX
export function useOptimisticTicketUpdate(ticketId: string) {
  const [optimisticData, setOptimisticData] = useState<Partial<RepairTicket>>({});

  const updateOptimistically = async (updates: Partial<RepairTicket>) => {
    // Apply optimistic update immediately
    setOptimisticData(prev => ({ ...prev, ...updates }));

    try {
      await updateTicket(ticketId, updates);
      // Clear optimistic data on success
      setOptimisticData(prev => {
        const result = { ...prev };
        Object.keys(updates).forEach(key => delete result[key]);
        return result;
      });
    } catch (error) {
      // Revert optimistic update on failure
      setOptimisticData(prev => {
        const result = { ...prev };
        Object.keys(updates).forEach(key => delete result[key]);
        return result;
      });
      throw error;
    }
  };

  return { optimisticData, updateOptimistically };
}

// Debounced auto-save
export const debouncedSave = debounce(async (ticketId: string, updates: any) => {
  await updateTicket(ticketId, updates);
}, 2000);
```

## Definition of Done

- [ ] **AC-TI1:** Complete ticket information display functional
- [ ] **AC-TI2:** Inline editing capabilities working
- [ ] **AC-TI3:** Cost management integration complete
- [ ] **AC-PD1:** Photo upload & management functional
- [ ] **AC-PD2:** Photo gallery interface complete
- [ ] **AC-PD3:** Photo security & access control implemented
- [ ] **AC-IC1:** Comments & notes system working
- [ ] **AC-IC2:** Activity timeline functional
- [ ] **AC-IC3:** Staff communication workflow implemented
- [ ] **AC-CC1:** Customer communication log working
- [ ] **AC-CC2:** Customer information updates functional
- [ ] **AC-PC1:** Parts usage tracking complete
- [ ] **AC-PC2:** Dynamic cost calculation working
- [ ] **AC-PC3:** Payment processing integration functional
- [ ] **AC-QA1:** Quality checklist integration working
- [ ] **AC-QA2:** Warranty documentation complete
- [ ] **AC-MO1:** Mobile interface design optimized
- [ ] **AC-MO2:** Field-optimized features functional
- [ ] **AC-PU1:** Page load performance meets requirements
- [ ] **AC-PU2:** Real-time collaboration working
- [ ] **Integration Tests:** End-to-end ticket management flow
- [ ] **Performance Tests:** Page load và real-time updates
- [ ] **Mobile Tests:** Touch interface và offline capability
- [ ] **Security Tests:** Photo access control validation

## Risk Mitigation

- **Primary Risk:** Data loss during inline editing or photo uploads
- **Mitigation:** Auto-save functionality, optimistic updates, comprehensive error handling
- **Rollback Plan:** Edit history allows reverting changes, photo backup procedures

## Story Dependencies

- **Prerequisites:** Story 02.3 (Staff Dashboard & Ticket Listing), Story 01.4 (Storage & File Management)
- **Enables:** Complete ticket management workflow
- **Estimated Effort:** 5-6 days
- **Priority:** Critical (comprehensive ticket management tool)