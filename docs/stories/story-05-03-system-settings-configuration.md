# Story 05.3: System Settings & Configuration
**Epic:** 05 - Admin & User Management System
**Story Points:** 6
**Priority:** Medium
**Dependencies:** Story 05.1, 05.2

## Mô tả (Description)
Là chủ cửa hàng sửa chữa laptop, tôi cần một hệ thống cài đặt tập trung để quản lý thông tin cửa hàng, cấu hình hệ thống (múi giờ, tiền tệ, ngôn ngữ), thiết lập notification preferences, và các công cụ backup/maintenance để đảm bảo hệ thống hoạt động ổn định và phù hợp với nhu cầu kinh doanh của cửa hàng.

## Acceptance Criteria

### AC 05.3.1: Shop Information Management
**Given** tôi là shop owner đã đăng nhập
**When** tôi truy cập System Settings → Shop Information
**Then** hệ thống cho phép:
- Cập nhật tên cửa hàng, địa chỉ, số điện thoại
- Upload và thay đổi logo cửa hàng
- Thiết lập thông tin liên hệ (email, website, social media)
- Cấu hình giờ mở cửa và ngày nghỉ
- Lưu thông tin VAT và business registration

```typescript
interface ShopInformation {
  shop_name: string;
  legal_name: string;
  address: {
    street: string;
    district: string;
    city: string;
    postal_code?: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
    facebook?: string;
    zalo?: string;
  };
  business_info: {
    tax_code: string;
    business_license: string;
    registration_date: string;
    business_type: string;
  };
  operating_hours: {
    monday: { open: string; close: string; is_closed: boolean };
    tuesday: { open: string; close: string; is_closed: boolean };
    wednesday: { open: string; close: string; is_closed: boolean };
    thursday: { open: string; close: string; is_closed: boolean };
    friday: { open: string; close: string; is_closed: boolean };
    saturday: { open: string; close: string; is_closed: boolean };
    sunday: { open: string; close: string; is_closed: boolean };
  };
  holiday_schedule: {
    date: string;
    name: string;
    is_closed: boolean;
  }[];
  logo_url?: string;
  banner_url?: string;
}

const ShopInformationSettings: React.FC = () => {
  const [shopInfo, setShopInfo] = useState<ShopInformation | null>(null);
  const [loading, setLoading] = useState(false);
  const { uploadFile } = useFileUpload();

  const loadShopInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'shop_information')
        .single();

      if (data) {
        setShopInfo(data.value);
      }
    } catch (error) {
      console.error('Failed to load shop information:', error);
    }
  };

  const saveShopInfo = async (updatedInfo: ShopInformation) => {
    setLoading(true);
    try {
      await supabase.from('system_settings').upsert({
        key: 'shop_information',
        value: updatedInfo,
        updated_at: new Date().toISOString()
      });

      // Log admin action
      await logAdminAction('shop_info_updated', 'system_settings', 'shop_information', {
        fields_changed: Object.keys(updatedInfo)
      });

      setShopInfo(updatedInfo);
      toast.success('Thông tin cửa hàng đã được cập nhật');

    } catch (error) {
      toast.error('Không thể cập nhật thông tin cửa hàng');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      const logoUrl = await uploadFile(file, 'shop-assets');

      await saveShopInfo({
        ...shopInfo,
        logo_url: logoUrl
      });

      toast.success('Logo đã được cập nhật');
    } catch (error) {
      toast.error('Không thể upload logo');
    }
  };

  return (
    <div className="shop-information-settings">
      <SettingsSection title="Thông tin cơ bản">
        <div className="basic-info-form">
          <Input
            label="Tên cửa hàng"
            value={shopInfo?.shop_name || ''}
            onChange={(value) => setShopInfo(prev => ({
              ...prev,
              shop_name: value
            }))}
            required
          />

          <Input
            label="Tên pháp lý"
            value={shopInfo?.legal_name || ''}
            onChange={(value) => setShopInfo(prev => ({
              ...prev,
              legal_name: value
            }))}
          />

          <div className="logo-upload">
            <label>Logo cửa hàng</label>
            <LogoUploader
              currentLogo={shopInfo?.logo_url}
              onUpload={handleLogoUpload}
              maxSize={2 * 1024 * 1024} // 2MB
              acceptedTypes={['image/png', 'image/jpeg', 'image/svg+xml']}
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Địa chỉ liên hệ">
        <AddressForm
          address={shopInfo?.address}
          onChange={(address) => setShopInfo(prev => ({
            ...prev,
            address
          }))}
        />

        <ContactForm
          contact={shopInfo?.contact}
          onChange={(contact) => setShopInfo(prev => ({
            ...prev,
            contact
          }))}
        />
      </SettingsSection>

      <SettingsSection title="Thông tin kinh doanh">
        <BusinessInfoForm
          businessInfo={shopInfo?.business_info}
          onChange={(business_info) => setShopInfo(prev => ({
            ...prev,
            business_info
          }))}
        />
      </SettingsSection>

      <SettingsSection title="Giờ hoạt động">
        <OperatingHoursEditor
          hours={shopInfo?.operating_hours}
          onChange={(operating_hours) => setShopInfo(prev => ({
            ...prev,
            operating_hours
          }))}
        />

        <HolidayScheduleManager
          holidays={shopInfo?.holiday_schedule || []}
          onChange={(holiday_schedule) => setShopInfo(prev => ({
            ...prev,
            holiday_schedule
          }))}
        />
      </SettingsSection>

      <div className="settings-actions">
        <Button onClick={() => saveShopInfo(shopInfo)} loading={loading}>
          Lưu thay đổi
        </Button>
        <Button variant="outline" onClick={loadShopInfo}>
          Khôi phục
        </Button>
      </div>
    </div>
  );
};
```

### AC 05.3.2: System Preferences Configuration
**Given** hệ thống cần cấu hình phù hợp với địa phương
**When** tôi thiết lập system preferences
**Then** hệ thống cho phép:
- Chọn múi giờ (Asia/Ho_Chi_Minh default)
- Thiết lập currency và format (VND default)
- Cấu hình date/time display formats
- Language preferences (Vietnamese default)
- Number formatting conventions

```typescript
interface SystemPreferences {
  timezone: string;
  locale: string;
  currency: {
    code: string; // 'VND'
    symbol: string; // '₫'
    position: 'before' | 'after'; // 'after' for VND
    decimal_places: number;
    thousands_separator: string; // ','
    decimal_separator: string; // '.'
  };
  date_format: string; // 'dd/MM/yyyy'
  time_format: '12h' | '24h';
  number_format: {
    thousands_separator: string;
    decimal_separator: string;
    decimal_places: number;
  };
  language: 'vi' | 'en';
  week_start: 'monday' | 'sunday';
  fiscal_year_start: string; // '01-01'
}

const SystemPreferencesSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<SystemPreferences>({
    timezone: 'Asia/Ho_Chi_Minh',
    locale: 'vi-VN',
    currency: {
      code: 'VND',
      symbol: '₫',
      position: 'after',
      decimal_places: 0,
      thousands_separator: ',',
      decimal_separator: '.'
    },
    date_format: 'dd/MM/yyyy',
    time_format: '24h',
    number_format: {
      thousands_separator: ',',
      decimal_separator: '.',
      decimal_places: 2
    },
    language: 'vi',
    week_start: 'monday',
    fiscal_year_start: '01-01'
  });

  const savePreferences = async () => {
    try {
      await supabase.from('system_settings').upsert({
        key: 'system_preferences',
        value: preferences,
        updated_at: new Date().toISOString()
      });

      // Apply preferences globally
      await applySystemPreferences(preferences);

      toast.success('Cài đặt hệ thống đã được cập nhật');
    } catch (error) {
      toast.error('Không thể cập nhật cài đặt');
    }
  };

  const formatPreview = useMemo(() => {
    const now = new Date();
    const currency = 1234567.89;
    const number = 98765.43;

    return {
      date: formatDate(now, preferences.date_format),
      time: formatTime(now, preferences.time_format),
      currency: formatCurrency(currency, preferences.currency),
      number: formatNumber(number, preferences.number_format)
    };
  }, [preferences]);

  return (
    <div className="system-preferences-settings">
      <SettingsSection title="Múi giờ & Ngôn ngữ">
        <Select
          label="Múi giờ"
          value={preferences.timezone}
          onValueChange={(timezone) => setPreferences(prev => ({
            ...prev,
            timezone
          }))}
        >
          <option value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</option>
          <option value="Asia/Bangkok">Thailand (UTC+7)</option>
          <option value="Asia/Singapore">Singapore (UTC+8)</option>
        </Select>

        <Select
          label="Ngôn ngữ"
          value={preferences.language}
          onValueChange={(language) => setPreferences(prev => ({
            ...prev,
            language
          }))}
        >
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
        </Select>
      </SettingsSection>

      <SettingsSection title="Định dạng tiền tệ">
        <CurrencySettings
          currency={preferences.currency}
          onChange={(currency) => setPreferences(prev => ({
            ...prev,
            currency
          }))}
        />
      </SettingsSection>

      <SettingsSection title="Định dạng ngày giờ">
        <Select
          label="Định dạng ngày"
          value={preferences.date_format}
          onValueChange={(date_format) => setPreferences(prev => ({
            ...prev,
            date_format
          }))}
        >
          <option value="dd/MM/yyyy">31/12/2024</option>
          <option value="MM/dd/yyyy">12/31/2024</option>
          <option value="yyyy-MM-dd">2024-12-31</option>
        </Select>

        <Select
          label="Định dạng giờ"
          value={preferences.time_format}
          onValueChange={(time_format) => setPreferences(prev => ({
            ...prev,
            time_format
          }))}
        >
          <option value="24h">24 giờ (14:30)</option>
          <option value="12h">12 giờ (2:30 PM)</option>
        </Select>

        <Select
          label="Tuần bắt đầu"
          value={preferences.week_start}
          onValueChange={(week_start) => setPreferences(prev => ({
            ...prev,
            week_start
          }))}
        >
          <option value="monday">Thứ Hai</option>
          <option value="sunday">Chủ Nhật</option>
        </Select>
      </SettingsSection>

      <SettingsSection title="Xem trước">
        <PreviewPanel formatPreview={formatPreview} />
      </SettingsSection>

      <div className="settings-actions">
        <Button onClick={savePreferences}>
          Lưu cài đặt
        </Button>
      </div>
    </div>
  );
};

// Utility functions for formatting
const formatCurrency = (amount: number, currencySettings: SystemPreferences['currency']) => {
  const formatted = new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: currencySettings.decimal_places,
    maximumFractionDigits: currencySettings.decimal_places
  }).format(amount);

  return currencySettings.position === 'before'
    ? `${currencySettings.symbol}${formatted}`
    : `${formatted}${currencySettings.symbol}`;
};

const applySystemPreferences = async (preferences: SystemPreferences) => {
  // Update global formatting context
  updateGlobalFormatting(preferences);

  // Update document language
  document.documentElement.lang = preferences.language;

  // Apply timezone to all date operations
  setGlobalTimezone(preferences.timezone);
};
```

### AC 05.3.3: Notification Settings & Email Configuration
**Given** hệ thống cần gửi notifications và emails
**When** tôi cấu hình notification settings
**Then** hệ thống cho phép:
- Thiết lập email server (SMTP) configuration
- Configure notification templates
- Set notification frequency và timing
- Enable/disable specific notification types
- Test email configuration

```typescript
interface NotificationSettings {
  email_config: {
    smtp_host: string;
    smtp_port: number;
    smtp_secure: boolean;
    smtp_user: string;
    smtp_password: string;
    from_name: string;
    from_email: string;
    reply_to?: string;
  };
  notification_types: {
    new_ticket_created: {
      enabled: boolean;
      recipients: string[]; // 'shop_owner' | 'assigned_staff' | 'all_staff'
      template: string;
      delay_minutes: number;
    };
    ticket_status_changed: {
      enabled: boolean;
      recipients: string[];
      template: string;
      delay_minutes: number;
    };
    customer_feedback: {
      enabled: boolean;
      recipients: string[];
      template: string;
      delay_minutes: number;
    };
    inventory_alerts: {
      enabled: boolean;
      recipients: string[];
      template: string;
      delay_minutes: number;
    };
    daily_summary: {
      enabled: boolean;
      recipients: string[];
      template: string;
      send_time: string; // 'HH:mm'
      send_days: string[]; // ['monday', 'tuesday', ...]
    };
    payment_received: {
      enabled: boolean;
      recipients: string[];
      template: string;
      delay_minutes: number;
    };
  };
  sms_config?: {
    provider: 'esms' | 'speedsms' | 'brandname';
    api_key: string;
    brand_name: string;
    enabled: boolean;
  };
}

const NotificationSettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const saveNotificationSettings = async () => {
    try {
      await supabase.from('system_settings').upsert({
        key: 'notification_settings',
        value: settings,
        updated_at: new Date().toISOString()
      });

      toast.success('Cài đặt thông báo đã được lưu');
    } catch (error) {
      toast.error('Không thể lưu cài đặt thông báo');
    }
  };

  const testEmailConfiguration = async () => {
    setTestingEmail(true);
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail,
          config: settings.email_config
        })
      });

      if (response.ok) {
        toast.success('Email thử nghiệm đã được gửi thành công');
      } else {
        toast.error('Không thể gửi email thử nghiệm');
      }
    } catch (error) {
      toast.error('Lỗi khi gửi email thử nghiệm');
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <div className="notification-settings">
      <SettingsSection title="Cấu hình Email (SMTP)">
        <div className="email-config-form">
          <Input
            label="SMTP Host"
            value={settings?.email_config.smtp_host || ''}
            onChange={(value) => setSettings(prev => ({
              ...prev,
              email_config: { ...prev.email_config, smtp_host: value }
            }))}
            placeholder="smtp.gmail.com"
          />

          <div className="form-row">
            <Input
              label="Port"
              type="number"
              value={settings?.email_config.smtp_port || ''}
              onChange={(value) => setSettings(prev => ({
                ...prev,
                email_config: { ...prev.email_config, smtp_port: parseInt(value) }
              }))}
              placeholder="587"
            />

            <Checkbox
              label="Sử dụng SSL/TLS"
              checked={settings?.email_config.smtp_secure || false}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                email_config: { ...prev.email_config, smtp_secure: checked }
              }))}
            />
          </div>

          <Input
            label="Username"
            value={settings?.email_config.smtp_user || ''}
            onChange={(value) => setSettings(prev => ({
              ...prev,
              email_config: { ...prev.email_config, smtp_user: value }
            }))}
          />

          <Input
            label="Password"
            type="password"
            value={settings?.email_config.smtp_password || ''}
            onChange={(value) => setSettings(prev => ({
              ...prev,
              email_config: { ...prev.email_config, smtp_password: value }
            }))}
          />

          <div className="form-row">
            <Input
              label="Tên người gửi"
              value={settings?.email_config.from_name || ''}
              onChange={(value) => setSettings(prev => ({
                ...prev,
                email_config: { ...prev.email_config, from_name: value }
              }))}
              placeholder="Cửa hàng sửa chữa laptop"
            />

            <Input
              label="Email người gửi"
              type="email"
              value={settings?.email_config.from_email || ''}
              onChange={(value) => setSettings(prev => ({
                ...prev,
                email_config: { ...prev.email_config, from_email: value }
              }))}
              placeholder="noreply@shop.com"
            />
          </div>

          <div className="test-email-section">
            <h4>Kiểm tra cấu hình</h4>
            <div className="form-row">
              <Input
                label="Email nhận thử nghiệm"
                type="email"
                value={testEmail}
                onChange={setTestEmail}
                placeholder="test@example.com"
              />
              <Button
                onClick={testEmailConfiguration}
                loading={testingEmail}
                disabled={!testEmail || !settings?.email_config.smtp_host}
              >
                Gửi thử nghiệm
              </Button>
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Loại thông báo">
        <NotificationTypesConfig
          notificationTypes={settings?.notification_types}
          onChange={(notification_types) => setSettings(prev => ({
            ...prev,
            notification_types
          }))}
        />
      </SettingsSection>

      <SettingsSection title="SMS Configuration (Tùy chọn)">
        <SMSConfig
          smsConfig={settings?.sms_config}
          onChange={(sms_config) => setSettings(prev => ({
            ...prev,
            sms_config
          }))}
        />
      </SettingsSection>

      <div className="settings-actions">
        <Button onClick={saveNotificationSettings}>
          Lưu cài đặt
        </Button>
      </div>
    </div>
  );
};
```

### AC 05.3.4: Backup & Maintenance Tools
**Given** hệ thống cần được backup và maintain định kỳ
**When** tôi truy cập Backup & Maintenance tools
**Then** hệ thống cung cấp:
- Database backup creation và restoration
- Automated backup scheduling
- System health monitoring
- Log file management
- Cache clearing tools

```typescript
interface BackupConfiguration {
  auto_backup: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // 'HH:mm'
    retention_days: number;
    include_files: boolean;
    compress: boolean;
  };
  backup_storage: {
    local_path: string;
    cloud_provider?: 'aws_s3' | 'google_drive' | 'dropbox';
    cloud_config?: any;
  };
  maintenance: {
    auto_optimize_database: boolean;
    auto_clear_logs: boolean;
    log_retention_days: number;
    auto_clear_cache: boolean;
    maintenance_window: {
      day: string; // 'sunday'
      start_time: string; // '02:00'
      duration_hours: number;
    };
  };
}

interface SystemHealth {
  database: {
    status: 'healthy' | 'warning' | 'error';
    size: number;
    connections: number;
    slow_queries: number;
    last_backup: string;
  };
  storage: {
    total_space: number;
    used_space: number;
    available_space: number;
    usage_percentage: number;
  };
  performance: {
    cpu_usage: number;
    memory_usage: number;
    response_time: number;
    error_rate: number;
  };
  security: {
    last_security_scan: string;
    vulnerabilities: number;
    failed_login_attempts: number;
  };
}

const BackupMaintenancePanel: React.FC = () => {
  const [backupConfig, setBackupConfig] = useState<BackupConfiguration | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [backupHistory, setBackupHistory] = useState([]);

  const createManualBackup = async () => {
    setBackupInProgress(true);
    try {
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          include_files: true,
          compress: true,
          triggered_by: 'manual'
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Backup tạo thành công: ${result.filename}`);
        loadBackupHistory();
      } else {
        toast.error('Không thể tạo backup');
      }
    } catch (error) {
      toast.error('Lỗi khi tạo backup');
    } finally {
      setBackupInProgress(false);
    }
  };

  const restoreFromBackup = async (backupFile: string) => {
    if (!confirm('Bạn có chắc muốn restore từ backup này? Dữ liệu hiện tại sẽ bị ghi đè.')) {
      return;
    }

    try {
      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backup_file: backupFile })
      });

      if (response.ok) {
        toast.success('Restore thành công. Hệ thống sẽ khởi động lại.');
        setTimeout(() => window.location.reload(), 3000);
      } else {
        toast.error('Không thể restore từ backup');
      }
    } catch (error) {
      toast.error('Lỗi khi restore backup');
    }
  };

  const optimizeDatabase = async () => {
    try {
      const response = await fetch('/api/maintenance/optimize-database', {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Database đã được tối ưu hóa');
        loadSystemHealth();
      } else {
        toast.error('Không thể tối ưu hóa database');
      }
    } catch (error) {
      toast.error('Lỗi khi tối ưu hóa database');
    }
  };

  const clearLogs = async () => {
    try {
      const response = await fetch('/api/maintenance/clear-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retention_days: backupConfig?.maintenance.log_retention_days || 30
        })
      });

      if (response.ok) {
        toast.success('Logs cũ đã được xóa');
        loadSystemHealth();
      } else {
        toast.error('Không thể xóa logs');
      }
    } catch (error) {
      toast.error('Lỗi khi xóa logs');
    }
  };

  const loadSystemHealth = async () => {
    try {
      const response = await fetch('/api/system/health');
      const health = await response.json();
      setSystemHealth(health);
    } catch (error) {
      console.error('Failed to load system health:', error);
    }
  };

  const loadBackupHistory = async () => {
    try {
      const response = await fetch('/api/backup/history');
      const history = await response.json();
      setBackupHistory(history);
    } catch (error) {
      console.error('Failed to load backup history:', error);
    }
  };

  useEffect(() => {
    loadSystemHealth();
    loadBackupHistory();
  }, []);

  return (
    <div className="backup-maintenance-panel">
      <SettingsSection title="Tình trạng hệ thống">
        <SystemHealthDashboard health={systemHealth} />
      </SettingsSection>

      <SettingsSection title="Backup">
        <div className="backup-controls">
          <div className="manual-backup">
            <h4>Backup thủ công</h4>
            <Button
              onClick={createManualBackup}
              loading={backupInProgress}
              icon={<DownloadIcon />}
            >
              Tạo backup ngay
            </Button>
          </div>

          <BackupHistoryTable
            backups={backupHistory}
            onRestore={restoreFromBackup}
            onDownload={(backup) => window.open(`/api/backup/download/${backup.filename}`)}
            onDelete={(backup) => deleteBackup(backup.id)}
          />
        </div>

        <BackupScheduleConfig
          config={backupConfig?.auto_backup}
          onChange={(auto_backup) => setBackupConfig(prev => ({
            ...prev,
            auto_backup
          }))}
        />
      </SettingsSection>

      <SettingsSection title="Maintenance">
        <div className="maintenance-tools">
          <div className="tool-card">
            <h4>Tối ưu hóa Database</h4>
            <p>Dọn dẹp và tối ưu hóa cơ sở dữ liệu để cải thiện hiệu suất</p>
            <Button onClick={optimizeDatabase}>
              Tối ưu hóa ngay
            </Button>
          </div>

          <div className="tool-card">
            <h4>Xóa Logs cũ</h4>
            <p>Xóa log files cũ để giải phóng dung lượng</p>
            <Button onClick={clearLogs}>
              Xóa logs cũ
            </Button>
          </div>

          <div className="tool-card">
            <h4>Xóa Cache</h4>
            <p>Xóa cache để đảm bảo dữ liệu mới nhất</p>
            <Button onClick={() => clearCache()}>
              Xóa cache
            </Button>
          </div>
        </div>

        <MaintenanceScheduleConfig
          config={backupConfig?.maintenance}
          onChange={(maintenance) => setBackupConfig(prev => ({
            ...prev,
            maintenance
          }))}
        />
      </SettingsSection>
    </div>
  );
};
```

### AC 05.3.5: Import/Export Tools
**Given** cửa hàng cần migrate data hoặc tạo reports
**When** tôi sử dụng import/export tools
**Then** hệ thống cho phép:
- Export customers, tickets, parts data to CSV/Excel
- Import bulk data từ CSV/Excel files
- Template downloads cho import formats
- Data validation trước khi import
- Import/export history tracking

```typescript
interface ImportExportConfig {
  export_formats: ('csv' | 'excel' | 'json')[];
  import_validation: {
    max_file_size: number; // bytes
    max_rows_per_import: number;
    required_fields: Record<string, string[]>;
    allow_updates: boolean;
    create_missing_references: boolean;
  };
  default_templates: {
    customers: string;
    tickets: string;
    parts: string;
    employees: string;
  };
}

interface ImportJob {
  id: string;
  file_name: string;
  data_type: 'customers' | 'tickets' | 'parts' | 'employees';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_rows: number;
  processed_rows: number;
  success_count: number;
  error_count: number;
  errors: ImportError[];
  started_at: string;
  completed_at?: string;
  imported_by: string;
}

interface ImportError {
  row_number: number;
  field: string;
  value: string;
  error_message: string;
  error_code: string;
}

const ImportExportTools: React.FC = () => {
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [selectedDataType, setSelectedDataType] = useState<'customers' | 'tickets' | 'parts'>('customers');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [exportFilters, setExportFilters] = useState<any>({});

  const downloadTemplate = async (dataType: string) => {
    try {
      const response = await fetch(`/api/import-export/template/${dataType}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataType}_template.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success(`Template ${dataType} đã được tải xuống`);
    } catch (error) {
      toast.error('Không thể tải template');
    }
  };

  const exportData = async (dataType: string, format: string, filters: any) => {
    try {
      const response = await fetch('/api/import-export/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_type: dataType,
          format,
          filters,
          include_headers: true
        })
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataType}_export_${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success(`Đã export ${dataType} thành công`);

      // Log export action
      await logAdminAction('data_exported', 'system', dataType, {
        format,
        filters,
        exported_at: new Date().toISOString()
      });

    } catch (error) {
      toast.error('Không thể export dữ liệu');
    }
  };

  const validateImportFile = async (file: File, dataType: string): Promise<{ valid: boolean; errors: string[] }> => {
    const errors: string[] = [];

    // File size check
    if (file.size > 10 * 1024 * 1024) { // 10MB
      errors.push('File quá lớn (tối đa 10MB)');
    }

    // File type check
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Định dạng file không được hỗ trợ (chỉ CSV, XLS, XLSX)');
    }

    // Content validation (basic)
    try {
      const text = await file.text();
      const lines = text.split('\n');

      if (lines.length < 2) {
        errors.push('File phải có ít nhất 1 dòng dữ liệu (ngoài header)');
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const requiredFields = getRequiredFields(dataType);

      const missingFields = requiredFields.filter(field => !headers.includes(field));
      if (missingFields.length > 0) {
        errors.push(`Thiếu các cột bắt buộc: ${missingFields.join(', ')}`);
      }

    } catch (error) {
      errors.push('Không thể đọc nội dung file');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  };

  const startImport = async () => {
    if (!importFile) {
      toast.error('Vui lòng chọn file để import');
      return;
    }

    // Validate file
    const validation = await validateImportFile(importFile, selectedDataType);
    if (!validation.valid) {
      toast.error(`Validation errors: ${validation.errors.join(', ')}`);
      return;
    }

    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('data_type', selectedDataType);

    try {
      const response = await fetch('/api/import-export/import', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Import job đã được tạo: ${result.job_id}`);
        loadImportJobs();
      } else {
        toast.error(`Không thể bắt đầu import: ${result.error}`);
      }
    } catch (error) {
      toast.error('Lỗi khi import dữ liệu');
    }
  };

  const loadImportJobs = async () => {
    try {
      const response = await fetch('/api/import-export/jobs');
      const jobs = await response.json();
      setImportJobs(jobs);
    } catch (error) {
      console.error('Failed to load import jobs:', error);
    }
  };

  useEffect(() => {
    loadImportJobs();
    const interval = setInterval(loadImportJobs, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="import-export-tools">
      <SettingsSection title="Export dữ liệu">
        <div className="export-section">
          <ExportFilters
            dataType={selectedDataType}
            filters={exportFilters}
            onChange={setExportFilters}
          />

          <div className="export-actions">
            <Button
              onClick={() => exportData(selectedDataType, 'csv', exportFilters)}
              icon={<DownloadIcon />}
            >
              Export CSV
            </Button>
            <Button
              onClick={() => exportData(selectedDataType, 'excel', exportFilters)}
              icon={<DownloadIcon />}
            >
              Export Excel
            </Button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Import dữ liệu">
        <div className="import-section">
          <div className="template-download">
            <h4>Download Template</h4>
            <Select value={selectedDataType} onValueChange={setSelectedDataType}>
              <option value="customers">Khách hàng</option>
              <option value="tickets">Phiếu sửa chữa</option>
              <option value="parts">Linh kiện</option>
            </Select>
            <Button
              onClick={() => downloadTemplate(selectedDataType)}
              variant="outline"
            >
              Tải template
            </Button>
          </div>

          <div className="file-upload">
            <h4>Chọn file để import</h4>
            <FileUploader
              accept=".csv,.xls,.xlsx"
              onFileSelect={setImportFile}
              maxSize={10 * 1024 * 1024}
            />
            {importFile && (
              <div className="file-info">
                <span>File: {importFile.name}</span>
                <span>Size: {(importFile.size / 1024).toFixed(1)} KB</span>
              </div>
            )}
          </div>

          <div className="import-actions">
            <Button
              onClick={startImport}
              disabled={!importFile}
              icon={<UploadIcon />}
            >
              Bắt đầu Import
            </Button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Lịch sử Import">
        <ImportJobsTable
          jobs={importJobs}
          onViewErrors={(job) => showImportErrors(job)}
          onRetry={(job) => retryImport(job)}
        />
      </SettingsSection>
    </div>
  );
};

const getRequiredFields = (dataType: string): string[] => {
  switch (dataType) {
    case 'customers':
      return ['name', 'phone'];
    case 'tickets':
      return ['customer_phone', 'device_info', 'issue_description'];
    case 'parts':
      return ['name', 'sku', 'category', 'price'];
    default:
      return [];
  }
};
```

## Database Schema Extensions

```sql
-- System settings table (already exists, extending usage)
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(50),
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Import/Export jobs tracking
CREATE TABLE import_export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type VARCHAR(20) NOT NULL CHECK (job_type IN ('import', 'export')),
  data_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255),
  file_path TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_rows INTEGER,
  processed_rows INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  errors JSONB,
  configuration JSONB,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  created_by UUID REFERENCES auth.users(id)
);

-- System health logs
CREATE TABLE system_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  metrics JSONB NOT NULL,
  alerts JSONB,
  checked_at TIMESTAMP DEFAULT NOW()
);

-- Backup logs
CREATE TABLE backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type VARCHAR(20) NOT NULL CHECK (backup_type IN ('manual', 'scheduled')),
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  backup_duration INTEGER, -- seconds
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'failed')),
  error_message TEXT,
  includes_files BOOLEAN DEFAULT true,
  compressed BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notification queue
CREATE TABLE notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type VARCHAR(50) NOT NULL,
  recipient_type VARCHAR(20) NOT NULL,
  recipient_id UUID,
  recipient_email VARCHAR(255),
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  template_used VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  scheduled_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_import_export_jobs_status ON import_export_jobs(status, created_at DESC);
CREATE INDEX idx_import_export_jobs_user ON import_export_jobs(created_by, created_at DESC);
CREATE INDEX idx_system_health_logs_type_time ON system_health_logs(check_type, checked_at DESC);
CREATE INDEX idx_backup_logs_time ON backup_logs(created_at DESC);
CREATE INDEX idx_notification_queue_status ON notification_queue(status, scheduled_at);

-- RLS Policies
ALTER TABLE import_export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Only shop owners can access these tables
CREATE POLICY "Shop owners access import export jobs" ON import_export_jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'shop_owner'
      AND p.is_active = true
    )
  );

CREATE POLICY "Shop owners access system health" ON system_health_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'shop_owner'
      AND p.is_active = true
    )
  );

CREATE POLICY "Shop owners access backup logs" ON backup_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'shop_owner'
      AND p.is_active = true
    )
  );

-- Insert default system settings
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
('shop_information', '{}', 'Shop basic information and contact details', 'shop', true),
('system_preferences', '{"timezone":"Asia/Ho_Chi_Minh","locale":"vi-VN","currency":{"code":"VND","symbol":"₫","position":"after","decimal_places":0},"language":"vi"}', 'System locale and formatting preferences', 'system', false),
('notification_settings', '{}', 'Email and notification configuration', 'notifications', false),
('backup_configuration', '{"auto_backup":{"enabled":true,"frequency":"daily","time":"02:00","retention_days":30}}', 'Backup and maintenance settings', 'maintenance', false)
ON CONFLICT (key) DO NOTHING;
```

## Testing Scenarios

### Unit Tests
```typescript
describe('System Settings & Configuration', () => {
  test('saves shop information correctly', async () => {
    const shopInfo = {
      shop_name: 'Test Laptop Shop',
      address: { street: '123 Test St', city: 'Ho Chi Minh' },
      contact: { phone: '0123456789', email: 'test@shop.com' }
    };

    await saveShopInformation(shopInfo);

    const saved = await getSystemSetting('shop_information');
    expect(saved.shop_name).toBe('Test Laptop Shop');
  });

  test('validates email configuration', async () => {
    const emailConfig = {
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_user: 'test@gmail.com',
      smtp_password: 'password'
    };

    const isValid = await validateEmailConfig(emailConfig);
    expect(isValid).toBe(true);
  });

  test('formats currency according to preferences', () => {
    const preferences = {
      currency: { code: 'VND', symbol: '₫', position: 'after', decimal_places: 0 }
    };

    const formatted = formatCurrency(1234567, preferences.currency);
    expect(formatted).toBe('1,234,567₫');
  });
});
```

### Integration Tests
```typescript
describe('System Settings Integration', () => {
  test('notification settings apply to email sending', async () => {
    const notificationSettings = {
      email_config: { smtp_host: 'test.smtp.com' },
      notification_types: { new_ticket_created: { enabled: true } }
    };

    await saveNotificationSettings(notificationSettings);
    await createTestTicket();

    // Check notification was queued
    const notifications = await getNotificationQueue();
    expect(notifications).toHaveLength(1);
  });

  test('backup creation and restoration', async () => {
    const originalData = await getTestData();

    const backup = await createBackup();
    expect(backup.status).toBe('completed');

    await modifyTestData();
    await restoreFromBackup(backup.file_name);

    const restoredData = await getTestData();
    expect(restoredData).toEqual(originalData);
  });
});
```

### E2E Tests
```typescript
describe('System Settings E2E', () => {
  test('shop owner can configure complete system settings', async () => {
    await loginAsShopOwner();
    await page.goto('/admin/settings');

    // Update shop information
    await page.click('[data-testid="shop-info-tab"]');
    await page.fill('[data-testid="shop-name"]', 'Updated Shop Name');
    await page.click('[data-testid="save-shop-info"]');
    await expect(page.locator('.success-message')).toContainText('cập nhật');

    // Configure email settings
    await page.click('[data-testid="notifications-tab"]');
    await page.fill('[data-testid="smtp-host"]', 'smtp.gmail.com');
    await page.fill('[data-testid="smtp-port"]', '587');
    await page.click('[data-testid="test-email-button"]');
    await expect(page.locator('.success-message')).toContainText('thành công');
  });

  test('backup and restore workflow', async () => {
    await loginAsShopOwner();
    await page.goto('/admin/settings/backup');

    // Create manual backup
    await page.click('[data-testid="create-backup"]');
    await expect(page.locator('.success-message')).toContainText('Backup tạo thành công');

    // Verify backup appears in history
    await expect(page.locator('[data-testid="backup-history"]')).toContainText('manual');
  });
});
```

## Performance Requirements
- Settings pages phải load trong <2 seconds
- Save operations phải complete trong <1 second
- Backup creation phải complete trong <30 seconds cho DB < 100MB
- Import/export operations phải có progress indicators
- System health checks phải complete trong <5 seconds

## Security Requirements
- Chỉ shop owners có thể access system settings
- Email passwords phải encrypted trong database
- Backup files phải được encrypt
- Import operations phải validate data integrity
- All admin actions phải logged với audit trail

## Accessibility Requirements
- Settings forms phải keyboard accessible
- Clear section navigation với breadcrumbs
- Screen reader support cho system status indicators
- Error messages phải descriptive và actionable
- Progress indicators cho long-running operations

## Mobile Optimization
- Settings interface phải responsive
- Touch-friendly controls và inputs
- Optimized file upload cho mobile
- Compact layout cho system health status
- Quick access to critical settings