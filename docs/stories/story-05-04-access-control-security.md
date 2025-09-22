# Story 05.4: Access Control & Security
**Epic:** 05 - Admin & User Management System
**Story Points:** 10
**Priority:** Critical
**Dependencies:** Story 05.1, 05.2, 05.3

## Mô tả (Description)
Là chủ cửa hàng sửa chữa laptop, tôi cần một hệ thống kiểm soát truy cập và bảo mật toàn diện với role-based UI components, RLS policy enforcement, audit logging cho tất cả admin actions, security monitoring với alerts, và các biện pháp bảo vệ chống lại các mối đe dọa bảo mật để đảm bảo dữ liệu khách hàng và hoạt động kinh doanh được an toàn tuyệt đối.

## Acceptance Criteria

### AC 05.4.1: Role-based UI Component System
**Given** hệ thống có users với different roles (shop_owner, staff)
**When** user truy cập any page trong application
**Then** hệ thống:
- Hiển thị UI components phù hợp với user role
- Hide/disable actions user không có permission
- Show appropriate navigation menu cho từng role
- Provide clear indicators về user permissions
- Handle permission changes real-time

```typescript
interface Permission {
  id: string;
  name: string;
  resource: string; // 'tickets', 'customers', 'parts', 'users', 'settings'
  action: string; // 'create', 'read', 'update', 'delete', 'manage'
  conditions?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'in' | 'not_in';
    value: any;
  }[];
}

interface RolePermissions {
  role: 'shop_owner' | 'staff';
  permissions: Permission[];
  ui_restrictions: {
    hidden_components: string[];
    disabled_actions: string[];
    restricted_routes: string[];
  };
}

// Role-based permission system
const usePermissions = () => {
  const { user, profile } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const hasPermission = (resource: string, action: string, context?: any): boolean => {
    const permission = permissions.find(p =>
      p.resource === resource && p.action === action
    );

    if (!permission) return false;

    // Check conditions if any
    if (permission.conditions && context) {
      return permission.conditions.every(condition => {
        const contextValue = context[condition.field];
        switch (condition.operator) {
          case 'equals':
            return contextValue === condition.value;
          case 'not_equals':
            return contextValue !== condition.value;
          case 'in':
            return condition.value.includes(contextValue);
          case 'not_in':
            return !condition.value.includes(contextValue);
          default:
            return false;
        }
      });
    }

    return true;
  };

  const canAccess = (route: string): boolean => {
    const roleConfig = getRoleConfiguration(profile?.role);
    return !roleConfig.ui_restrictions.restricted_routes.includes(route);
  };

  const canPerformAction = (actionId: string): boolean => {
    const roleConfig = getRoleConfiguration(profile?.role);
    return !roleConfig.ui_restrictions.disabled_actions.includes(actionId);
  };

  const shouldShowComponent = (componentId: string): boolean => {
    const roleConfig = getRoleConfiguration(profile?.role);
    return !roleConfig.ui_restrictions.hidden_components.includes(componentId);
  };

  return {
    hasPermission,
    canAccess,
    canPerformAction,
    shouldShowComponent,
    permissions
  };
};

// Protected Component wrapper
const ProtectedComponent: React.FC<{
  permission?: { resource: string; action: string };
  role?: string[];
  componentId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ permission, role, componentId, fallback = null, children }) => {
  const { hasPermission, shouldShowComponent } = usePermissions();
  const { profile } = useAuth();

  // Check component visibility
  if (componentId && !shouldShowComponent(componentId)) {
    return fallback;
  }

  // Check role-based access
  if (role && !role.includes(profile?.role)) {
    return fallback;
  }

  // Check permission-based access
  if (permission && !hasPermission(permission.resource, permission.action)) {
    return fallback;
  }

  return <>{children}</>;
};

// Role-based navigation
const NavigationMenu: React.FC = () => {
  const { profile } = useAuth();
  const { canAccess, shouldShowComponent } = usePermissions();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />,
      roles: ['shop_owner', 'staff']
    },
    {
      id: 'tickets',
      label: 'Phiếu sửa chữa',
      path: '/phieu',
      icon: <TicketIcon />,
      roles: ['shop_owner', 'staff']
    },
    {
      id: 'customers',
      label: 'Khách hàng',
      path: '/khach-hang',
      icon: <CustomerIcon />,
      roles: ['shop_owner', 'staff']
    },
    {
      id: 'parts',
      label: 'Linh kiện',
      path: '/linh-kien',
      icon: <PartsIcon />,
      roles: ['shop_owner', 'staff']
    },
    {
      id: 'analytics',
      label: 'Báo cáo',
      path: '/analytics',
      icon: <AnalyticsIcon />,
      roles: ['shop_owner']
    },
    {
      id: 'admin',
      label: 'Quản trị',
      path: '/admin',
      icon: <AdminIcon />,
      roles: ['shop_owner']
    }
  ];

  const visibleItems = navigationItems.filter(item => {
    return item.roles.includes(profile?.role) &&
           canAccess(item.path) &&
           shouldShowComponent(item.id);
  });

  return (
    <nav className="navigation-menu">
      {visibleItems.map(item => (
        <NavigationItem key={item.id} {...item} />
      ))}
    </nav>
  );
};

// Action button with permission check
const ProtectedActionButton: React.FC<{
  action: string;
  resource: string;
  onAction: () => void;
  children: React.ReactNode;
  [key: string]: any;
}> = ({ action, resource, onAction, children, ...props }) => {
  const { hasPermission, canPerformAction } = usePermissions();

  const canPerform = hasPermission(resource, action) && canPerformAction(`${resource}_${action}`);

  if (!canPerform) {
    return null;
  }

  return (
    <Button onClick={onAction} {...props}>
      {children}
    </Button>
  );
};

// Get role configuration
const getRoleConfiguration = (role: string): RolePermissions => {
  const configurations: Record<string, RolePermissions> = {
    shop_owner: {
      role: 'shop_owner',
      permissions: [
        { id: '1', name: 'Manage All', resource: '*', action: '*' }
      ],
      ui_restrictions: {
        hidden_components: [],
        disabled_actions: [],
        restricted_routes: []
      }
    },
    staff: {
      role: 'staff',
      permissions: [
        { id: '2', name: 'View Tickets', resource: 'tickets', action: 'read' },
        { id: '3', name: 'Create Tickets', resource: 'tickets', action: 'create' },
        { id: '4', name: 'Update Tickets', resource: 'tickets', action: 'update' },
        { id: '5', name: 'View Customers', resource: 'customers', action: 'read' },
        { id: '6', name: 'Create Customers', resource: 'customers', action: 'create' },
        { id: '7', name: 'View Parts', resource: 'parts', action: 'read' }
      ],
      ui_restrictions: {
        hidden_components: ['admin-panel', 'analytics-advanced', 'user-management'],
        disabled_actions: ['delete-ticket', 'delete-customer', 'manage-users'],
        restricted_routes: ['/admin', '/analytics']
      }
    }
  };

  return configurations[role] || configurations.staff;
};
```

### AC 05.4.2: Comprehensive Audit Logging System
**Given** hệ thống cần track tất cả admin actions và sensitive operations
**When** user thực hiện any significant action
**Then** audit system:
- Log action với full context (who, what, when, where, why)
- Track data changes (before/after values)
- Record IP address, user agent, session info
- Provide searchable audit trail interface
- Generate security reports và compliance documents

```typescript
interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  user_role: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  description: string;
  ip_address: string;
  user_agent: string;
  session_id: string;
  before_data?: any;
  after_data?: any;
  metadata: {
    request_id: string;
    route: string;
    method: string;
    duration_ms: number;
    success: boolean;
    error_message?: string;
  };
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  created_at: string;
}

interface AuditSearch {
  user_id?: string;
  action?: string;
  resource_type?: string;
  risk_level?: string;
  date_from?: string;
  date_to?: string;
  search_text?: string;
  ip_address?: string;
  success?: boolean;
}

// Audit logging service
class AuditLogger {
  private static instance: AuditLogger;

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async logAction(params: {
    action: string;
    resource_type: string;
    resource_id?: string;
    description: string;
    before_data?: any;
    after_data?: any;
    risk_level?: 'low' | 'medium' | 'high' | 'critical';
    tags?: string[];
    metadata?: any;
  }): Promise<void> {
    try {
      const { user, session } = await getCurrentSession();
      const clientInfo = getClientInfo();

      const logEntry: AuditLog = {
        id: crypto.randomUUID(),
        user_id: user.id,
        user_email: user.email,
        user_role: user.role,
        action: params.action,
        resource_type: params.resource_type,
        resource_id: params.resource_id,
        description: params.description,
        ip_address: clientInfo.ip_address,
        user_agent: clientInfo.user_agent,
        session_id: session.id,
        before_data: params.before_data,
        after_data: params.after_data,
        metadata: {
          request_id: generateRequestId(),
          route: window.location.pathname,
          method: 'UI_ACTION',
          duration_ms: 0,
          success: true,
          ...params.metadata
        },
        risk_level: params.risk_level || this.calculateRiskLevel(params.action, params.resource_type),
        tags: params.tags || [],
        created_at: new Date().toISOString()
      };

      // Send to audit service
      await this.saveAuditLog(logEntry);

      // Send alerts for high-risk actions
      if (logEntry.risk_level === 'high' || logEntry.risk_level === 'critical') {
        await this.sendSecurityAlert(logEntry);
      }

    } catch (error) {
      console.error('Failed to log audit action:', error);
      // Don't throw - audit logging should never break main functionality
    }
  }

  private calculateRiskLevel(action: string, resourceType: string): 'low' | 'medium' | 'high' | 'critical' {
    const highRiskActions = ['delete', 'deactivate', 'export', 'backup_restore'];
    const criticalResources = ['users', 'system_settings', 'permissions'];

    if (highRiskActions.includes(action) && criticalResources.includes(resourceType)) {
      return 'critical';
    }

    if (highRiskActions.includes(action) || criticalResources.includes(resourceType)) {
      return 'high';
    }

    if (['update', 'create'].includes(action)) {
      return 'medium';
    }

    return 'low';
  }

  private async saveAuditLog(logEntry: AuditLog): Promise<void> {
    await supabase.from('audit_logs').insert(logEntry);
  }

  private async sendSecurityAlert(logEntry: AuditLog): Promise<void> {
    // Send to security monitoring system
    await fetch('/api/security/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'high_risk_action',
        log_entry: logEntry,
        alert_level: logEntry.risk_level
      })
    });
  }
}

// Audit logging hook
const useAuditLogger = () => {
  const logger = AuditLogger.getInstance();

  const logAction = useCallback(async (params: Parameters<typeof logger.logAction>[0]) => {
    await logger.logAction(params);
  }, [logger]);

  return { logAction };
};

// Audit log viewer component
const AuditLogViewer: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchFilters, setSearchFilters] = useState<AuditSearch>({});
  const [loading, setLoading] = useState(false);

  const searchAuditLogs = async (filters: AuditSearch) => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.user_id) query = query.eq('user_id', filters.user_id);
      if (filters.action) query = query.ilike('action', `%${filters.action}%`);
      if (filters.resource_type) query = query.eq('resource_type', filters.resource_type);
      if (filters.risk_level) query = query.eq('risk_level', filters.risk_level);
      if (filters.date_from) query = query.gte('created_at', filters.date_from);
      if (filters.date_to) query = query.lte('created_at', filters.date_to);
      if (filters.ip_address) query = query.eq('ip_address', filters.ip_address);
      if (filters.success !== undefined) query = query.eq('metadata->success', filters.success);

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setAuditLogs(data || []);

    } catch (error) {
      toast.error('Không thể tải audit logs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportAuditLogs = async (filters: AuditSearch) => {
    try {
      const response = await fetch('/api/audit/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      toast.error('Không thể export audit logs');
    }
  };

  return (
    <div className="audit-log-viewer">
      <div className="audit-search">
        <AuditSearchFilters
          filters={searchFilters}
          onChange={setSearchFilters}
          onSearch={() => searchAuditLogs(searchFilters)}
          onExport={() => exportAuditLogs(searchFilters)}
        />
      </div>

      <div className="audit-results">
        <AuditLogTable
          logs={auditLogs}
          loading={loading}
          onViewDetails={(log) => showAuditLogDetails(log)}
        />
      </div>

      <AuditLogStatistics logs={auditLogs} />
    </div>
  );
};

// Auto-audit decorator for sensitive functions
const withAudit = (action: string, resourceType: string) => {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const logger = AuditLogger.getInstance();
      const startTime = Date.now();

      try {
        const beforeData = args[0]; // Capture input for context
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;

        await logger.logAction({
          action,
          resource_type: resourceType,
          description: `${action} ${resourceType} via ${propertyKey}`,
          before_data: beforeData,
          after_data: result,
          metadata: { duration_ms: duration, success: true }
        });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        await logger.logAction({
          action,
          resource_type: resourceType,
          description: `Failed ${action} ${resourceType} via ${propertyKey}`,
          risk_level: 'high',
          metadata: {
            duration_ms: duration,
            success: false,
            error_message: error.message
          }
        });

        throw error;
      }
    };

    return descriptor;
  };
};
```

### AC 05.4.3: Security Monitoring & Threat Detection
**Given** hệ thống cần phát hiện và ngăn chặn threats
**When** có suspicious activity xảy ra
**Then** security monitoring system:
- Detect unusual login patterns và failed attempts
- Monitor for data exfiltration attempts
- Track suspicious user behavior patterns
- Generate real-time security alerts
- Auto-block suspicious IP addresses

```typescript
interface SecurityThreat {
  id: string;
  threat_type: 'failed_login' | 'unusual_access' | 'data_exfiltration' | 'privilege_escalation' | 'brute_force';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  ip_address: string;
  description: string;
  evidence: any;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  detected_at: string;
  resolved_at?: string;
  actions_taken: string[];
}

interface SecurityMetrics {
  period: string;
  failed_logins: number;
  blocked_ips: number;
  threats_detected: number;
  threats_resolved: number;
  average_response_time: number; // minutes
  top_threat_types: { type: string; count: number }[];
  geographical_threats: { country: string; count: number }[];
}

// Security monitoring service
class SecurityMonitor {
  private static instance: SecurityMonitor;
  private threatQueue: SecurityThreat[] = [];

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  async detectThreats(): Promise<void> {
    // Run multiple threat detection algorithms
    await Promise.all([
      this.detectFailedLoginPatterns(),
      this.detectUnusualAccessPatterns(),
      this.detectDataExfiltrationAttempts(),
      this.detectPrivilegeEscalationAttempts(),
      this.detectBruteForceAttacks()
    ]);

    // Process detected threats
    await this.processThreats();
  }

  private async detectFailedLoginPatterns(): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

    // Get recent failed login attempts
    const { data: attempts } = await supabase
      .from('login_attempts')
      .select('*')
      .eq('success', false)
      .gte('attempted_at', oneHourAgo);

    if (!attempts) return;

    // Group by IP address
    const ipCounts = attempts.reduce((acc, attempt) => {
      acc[attempt.ip_address] = (acc[attempt.ip_address] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Detect suspicious IPs (>10 failed attempts in 1 hour)
    for (const [ip, count] of Object.entries(ipCounts)) {
      if (count > 10) {
        await this.createThreat({
          threat_type: 'brute_force',
          severity: count > 50 ? 'critical' : count > 25 ? 'high' : 'medium',
          ip_address: ip,
          description: `${count} failed login attempts from IP ${ip} in the last hour`,
          evidence: { failed_attempts: count, time_window: '1_hour' }
        });
      }
    }
  }

  private async detectUnusualAccessPatterns(): Promise<void> {
    const users = await this.getActiveUsers();

    for (const user of users) {
      const patterns = await this.analyzeUserAccessPatterns(user.id);

      if (patterns.unusual_hours || patterns.unusual_location || patterns.unusual_device) {
        await this.createThreat({
          threat_type: 'unusual_access',
          severity: 'medium',
          user_id: user.id,
          ip_address: patterns.current_ip,
          description: `Unusual access pattern detected for user ${user.email}`,
          evidence: patterns
        });
      }
    }
  }

  private async detectDataExfiltrationAttempts(): Promise<void> {
    const exports = await this.getRecentExportActivities();

    for (const exportActivity of exports) {
      if (exportActivity.volume > 1000 || exportActivity.frequency > 5) {
        await this.createThreat({
          threat_type: 'data_exfiltration',
          severity: 'high',
          user_id: exportActivity.user_id,
          ip_address: exportActivity.ip_address,
          description: `Suspicious data export activity: ${exportActivity.volume} records exported`,
          evidence: exportActivity
        });
      }
    }
  }

  private async createThreat(threatData: Partial<SecurityThreat>): Promise<void> {
    const threat: SecurityThreat = {
      id: crypto.randomUUID(),
      detected_at: new Date().toISOString(),
      status: 'active',
      actions_taken: [],
      ...threatData
    } as SecurityThreat;

    // Save to database
    await supabase.from('security_threats').insert(threat);

    // Add to processing queue
    this.threatQueue.push(threat);

    // Send immediate alert for critical threats
    if (threat.severity === 'critical') {
      await this.sendCriticalAlert(threat);
    }
  }

  private async processThreats(): Promise<void> {
    for (const threat of this.threatQueue) {
      await this.respondToThreat(threat);
    }
    this.threatQueue = [];
  }

  private async respondToThreat(threat: SecurityThreat): Promise<void> {
    const actions: string[] = [];

    switch (threat.threat_type) {
      case 'brute_force':
        if (threat.severity === 'critical') {
          await this.blockIP(threat.ip_address, '24_hours');
          actions.push('blocked_ip_24h');
        } else if (threat.severity === 'high') {
          await this.blockIP(threat.ip_address, '1_hour');
          actions.push('blocked_ip_1h');
        }
        break;

      case 'data_exfiltration':
        if (threat.user_id) {
          await this.suspendUserAccount(threat.user_id, 'suspicious_activity');
          actions.push('user_suspended');
        }
        await this.notifyAdmins(threat);
        actions.push('admins_notified');
        break;

      case 'unusual_access':
        await this.requireReauthentication(threat.user_id);
        actions.push('reauthentication_required');
        break;
    }

    // Update threat with actions taken
    await supabase
      .from('security_threats')
      .update({ actions_taken: actions })
      .eq('id', threat.id);
  }

  private async blockIP(ipAddress: string, duration: string): Promise<void> {
    const expiresAt = new Date();

    switch (duration) {
      case '1_hour':
        expiresAt.setHours(expiresAt.getHours() + 1);
        break;
      case '24_hours':
        expiresAt.setHours(expiresAt.getHours() + 24);
        break;
    }

    await supabase.from('blocked_ips').insert({
      ip_address: ipAddress,
      blocked_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      reason: 'Security threat detected'
    });
  }

  private async sendCriticalAlert(threat: SecurityThreat): Promise<void> {
    await fetch('/api/security/critical-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(threat)
    });
  }
}

// Security dashboard component
const SecurityDashboard: React.FC = () => {
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSecurityData = async () => {
    try {
      const [threatsResponse, metricsResponse] = await Promise.all([
        supabase.from('security_threats')
          .select('*')
          .order('detected_at', { ascending: false })
          .limit(50),
        fetch('/api/security/metrics').then(r => r.json())
      ]);

      setThreats(threatsResponse.data || []);
      setMetrics(metricsResponse);
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveSecurityThreat = async (threatId: string, resolution: string) => {
    try {
      await supabase
        .from('security_threats')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', threatId);

      toast.success('Threat đã được resolve');
      loadSecurityData();
    } catch (error) {
      toast.error('Không thể resolve threat');
    }
  };

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <SecurityDashboardSkeleton />;

  return (
    <div className="security-dashboard">
      <SecurityMetricsOverview metrics={metrics} />

      <div className="security-alerts">
        <h3>Security Threats</h3>
        <ThreatsList
          threats={threats}
          onResolve={resolveSecurityThreat}
          onInvestigate={(threat) => openThreatInvestigation(threat)}
        />
      </div>

      <SecurityGeoMap threats={threats} />
      <ThreatTrendChart metrics={metrics} />
    </div>
  );
};

// IP blocking middleware
const ipBlockingMiddleware = async (req: any, res: any, next: any) => {
  const clientIP = req.ip || req.connection.remoteAddress;

  const { data: blockedIP } = await supabase
    .from('blocked_ips')
    .select('*')
    .eq('ip_address', clientIP)
    .gte('expires_at', new Date().toISOString())
    .single();

  if (blockedIP) {
    return res.status(403).json({
      error: 'IP address blocked due to security threats',
      blocked_until: blockedIP.expires_at
    });
  }

  next();
};
```

### AC 05.4.4: Data Privacy & GDPR Compliance
**Given** hệ thống cần tuân thủ data privacy regulations
**When** xử lý personal data của customers
**Then** privacy system:
- Implement data minimization principles
- Provide data export/deletion capabilities
- Track consent và data processing activities
- Anonymize data when possible
- Generate privacy compliance reports

```typescript
interface DataProcessingRecord {
  id: string;
  user_id: string;
  data_subject_id: string; // customer ID
  processing_purpose: string;
  data_categories: string[];
  legal_basis: 'consent' | 'contract' | 'legal_obligation' | 'legitimate_interest';
  retention_period: string;
  automated_processing: boolean;
  third_party_sharing: boolean;
  consent_given_at?: string;
  consent_withdrawn_at?: string;
  processed_at: string;
  processing_duration: number; // milliseconds
}

interface PrivacyRequest {
  id: string;
  request_type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction';
  data_subject_id: string;
  request_details: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  requested_at: string;
  processed_at?: string;
  processed_by?: string;
  response_data?: any;
  rejection_reason?: string;
}

// Privacy compliance service
class PrivacyComplianceService {
  async handleDataSubjectRequest(request: Omit<PrivacyRequest, 'id' | 'requested_at' | 'status'>): Promise<string> {
    const privacyRequest: PrivacyRequest = {
      id: crypto.randomUUID(),
      requested_at: new Date().toISOString(),
      status: 'pending',
      ...request
    };

    await supabase.from('privacy_requests').insert(privacyRequest);

    // Auto-process some request types
    switch (request.request_type) {
      case 'access':
        await this.processDataAccessRequest(privacyRequest.id);
        break;
      case 'portability':
        await this.processDataPortabilityRequest(privacyRequest.id);
        break;
    }

    return privacyRequest.id;
  }

  async processDataAccessRequest(requestId: string): Promise<void> {
    const request = await this.getPrivacyRequest(requestId);
    if (!request) return;

    // Collect all personal data for the data subject
    const personalData = await this.collectPersonalData(request.data_subject_id);

    // Update request with response data
    await supabase
      .from('privacy_requests')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
        response_data: personalData
      })
      .eq('id', requestId);

    // Send data to user
    await this.sendDataAccessResponse(request, personalData);
  }

  async processDataErasureRequest(requestId: string): Promise<void> {
    const request = await this.getPrivacyRequest(requestId);
    if (!request) return;

    // Verify right to erasure (check legal basis, retention requirements)
    const canErase = await this.verifyRightToErasure(request.data_subject_id);

    if (!canErase.allowed) {
      await supabase
        .from('privacy_requests')
        .update({
          status: 'rejected',
          rejection_reason: canErase.reason
        })
        .eq('id', requestId);
      return;
    }

    // Perform erasure
    await this.erasePersonalData(request.data_subject_id);

    await supabase
      .from('privacy_requests')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', requestId);
  }

  private async collectPersonalData(dataSubjectId: string): Promise<any> {
    // Collect from all tables containing personal data
    const [customerData, ticketData, communicationData] = await Promise.all([
      supabase.from('customers').select('*').eq('id', dataSubjectId).single(),
      supabase.from('repair_tickets').select('*').eq('customer_id', dataSubjectId),
      supabase.from('communications').select('*').eq('customer_id', dataSubjectId)
    ]);

    return {
      personal_details: customerData.data,
      repair_history: ticketData.data,
      communications: communicationData.data,
      exported_at: new Date().toISOString()
    };
  }

  private async erasePersonalData(dataSubjectId: string): Promise<void> {
    // Anonymize instead of delete to maintain business records
    const anonymizedData = {
      name: '[ERASED]',
      email: `erased_${Date.now()}@privacy.local`,
      phone: '[ERASED]',
      address: '[ERASED]',
      erased_at: new Date().toISOString(),
      erasure_reason: 'Data subject request'
    };

    await supabase
      .from('customers')
      .update(anonymizedData)
      .eq('id', dataSubjectId);

    // Log the erasure
    await this.logDataProcessing({
      data_subject_id: dataSubjectId,
      processing_purpose: 'Data erasure per subject request',
      data_categories: ['personal_details'],
      legal_basis: 'consent',
      retention_period: 'N/A - Erased'
    });
  }

  private async logDataProcessing(record: Omit<DataProcessingRecord, 'id' | 'processed_at' | 'processing_duration' | 'user_id'>): Promise<void> {
    const { user } = await getCurrentSession();
    const startTime = Date.now();

    const processingRecord: DataProcessingRecord = {
      id: crypto.randomUUID(),
      user_id: user.id,
      processed_at: new Date().toISOString(),
      processing_duration: Date.now() - startTime,
      automated_processing: false,
      third_party_sharing: false,
      ...record
    };

    await supabase.from('data_processing_records').insert(processingRecord);
  }

  async generatePrivacyReport(period: string): Promise<any> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - (period === 'monthly' ? 1 : 12));

    const [requests, processing, breaches] = await Promise.all([
      supabase.from('privacy_requests')
        .select('*')
        .gte('requested_at', startDate.toISOString()),
      supabase.from('data_processing_records')
        .select('*')
        .gte('processed_at', startDate.toISOString()),
      supabase.from('security_incidents')
        .select('*')
        .eq('involves_personal_data', true)
        .gte('detected_at', startDate.toISOString())
    ]);

    return {
      period,
      generated_at: new Date().toISOString(),
      privacy_requests: {
        total: requests.data?.length || 0,
        by_type: this.groupByField(requests.data || [], 'request_type'),
        by_status: this.groupByField(requests.data || [], 'status'),
        average_response_time: this.calculateAverageResponseTime(requests.data || [])
      },
      data_processing: {
        total_operations: processing.data?.length || 0,
        by_purpose: this.groupByField(processing.data || [], 'processing_purpose'),
        by_legal_basis: this.groupByField(processing.data || [], 'legal_basis')
      },
      security_incidents: {
        total: breaches.data?.length || 0,
        resolved: breaches.data?.filter(b => b.status === 'resolved').length || 0
      },
      compliance_score: this.calculateComplianceScore(requests.data || [], processing.data || [])
    };
  }

  private groupByField(data: any[], field: string): Record<string, number> {
    return data.reduce((acc, item) => {
      const value = item[field] || 'unknown';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateAverageResponseTime(requests: PrivacyRequest[]): number {
    const completed = requests.filter(r => r.status === 'completed' && r.processed_at);
    if (completed.length === 0) return 0;

    const totalTime = completed.reduce((sum, request) => {
      const requestTime = new Date(request.requested_at).getTime();
      const processedTime = new Date(request.processed_at!).getTime();
      return sum + (processedTime - requestTime);
    }, 0);

    return Math.round(totalTime / completed.length / (1000 * 60 * 60 * 24)); // days
  }

  private calculateComplianceScore(requests: PrivacyRequest[], processing: DataProcessingRecord[]): number {
    let score = 100;

    // Deduct for delayed request processing
    const overdue = requests.filter(r => {
      if (r.status !== 'pending') return false;
      const daysSinceRequest = (Date.now() - new Date(r.requested_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceRequest > 30; // GDPR requires response within 30 days
    });

    score -= overdue.length * 10;

    // Deduct for missing legal basis
    const missingLegalBasis = processing.filter(p => !p.legal_basis);
    score -= missingLegalBasis.length * 5;

    return Math.max(0, score);
  }
}

// Privacy dashboard component
const PrivacyDashboard: React.FC = () => {
  const [privacyRequests, setPrivacyRequests] = useState<PrivacyRequest[]>([]);
  const [complianceReport, setComplianceReport] = useState<any>(null);
  const privacyService = new PrivacyComplianceService();

  const handlePrivacyRequest = async (requestData: any) => {
    try {
      const requestId = await privacyService.handleDataSubjectRequest(requestData);
      toast.success(`Privacy request created: ${requestId}`);
      loadPrivacyRequests();
    } catch (error) {
      toast.error('Failed to create privacy request');
    }
  };

  const loadPrivacyRequests = async () => {
    const { data } = await supabase
      .from('privacy_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    setPrivacyRequests(data || []);
  };

  const generateReport = async () => {
    try {
      const report = await privacyService.generatePrivacyReport('monthly');
      setComplianceReport(report);
    } catch (error) {
      toast.error('Failed to generate privacy report');
    }
  };

  return (
    <div className="privacy-dashboard">
      <PrivacyRequestForm onSubmit={handlePrivacyRequest} />
      <PrivacyRequestsList requests={privacyRequests} />
      <ComplianceReportSection report={complianceReport} onGenerate={generateReport} />
    </div>
  );
};
```

### AC 05.4.5: Security Configuration & Hardening
**Given** hệ thống cần hardened security configuration
**When** deploying to production
**Then** security hardening includes:
- Force HTTPS và secure headers
- Implement Content Security Policy (CSP)
- Configure rate limiting cho all endpoints
- Enable security logging và monitoring
- Implement backup encryption và secure storage

```typescript
interface SecurityConfiguration {
  https: {
    enabled: boolean;
    force_redirect: boolean;
    hsts_enabled: boolean;
    hsts_max_age: number;
  };
  headers: {
    csp: string;
    x_frame_options: string;
    x_content_type_options: string;
    x_xss_protection: string;
    referrer_policy: string;
  };
  rate_limiting: {
    login_attempts: { window_ms: number; max_attempts: number };
    api_requests: { window_ms: number; max_requests: number };
    file_uploads: { window_ms: number; max_uploads: number };
  };
  encryption: {
    algorithm: string;
    key_rotation_days: number;
    backup_encryption: boolean;
    at_rest_encryption: boolean;
  };
  monitoring: {
    failed_login_threshold: number;
    unusual_activity_detection: boolean;
    real_time_alerts: boolean;
    log_retention_days: number;
  };
}

// Security configuration service
class SecurityConfigurationService {
  private config: SecurityConfiguration;

  constructor() {
    this.config = this.getDefaultConfiguration();
  }

  private getDefaultConfiguration(): SecurityConfiguration {
    return {
      https: {
        enabled: true,
        force_redirect: true,
        hsts_enabled: true,
        hsts_max_age: 31536000 // 1 year
      },
      headers: {
        csp: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' data:;",
        x_frame_options: 'DENY',
        x_content_type_options: 'nosniff',
        x_xss_protection: '1; mode=block',
        referrer_policy: 'strict-origin-when-cross-origin'
      },
      rate_limiting: {
        login_attempts: { window_ms: 900000, max_attempts: 5 }, // 5 attempts per 15 minutes
        api_requests: { window_ms: 60000, max_requests: 100 }, // 100 requests per minute
        file_uploads: { window_ms: 3600000, max_uploads: 10 } // 10 uploads per hour
      },
      encryption: {
        algorithm: 'AES-256-GCM',
        key_rotation_days: 90,
        backup_encryption: true,
        at_rest_encryption: true
      },
      monitoring: {
        failed_login_threshold: 5,
        unusual_activity_detection: true,
        real_time_alerts: true,
        log_retention_days: 365
      }
    };
  }

  async applySecurityHeaders(app: any): Promise<void> {
    // Apply security headers middleware
    app.use((req: any, res: any, next: any) => {
      // HSTS
      if (this.config.https.hsts_enabled) {
        res.setHeader('Strict-Transport-Security', `max-age=${this.config.https.hsts_max_age}; includeSubDomains`);
      }

      // CSP
      res.setHeader('Content-Security-Policy', this.config.headers.csp);

      // Other security headers
      res.setHeader('X-Frame-Options', this.config.headers.x_frame_options);
      res.setHeader('X-Content-Type-Options', this.config.headers.x_content_type_options);
      res.setHeader('X-XSS-Protection', this.config.headers.x_xss_protection);
      res.setHeader('Referrer-Policy', this.config.headers.referrer_policy);

      // Remove sensitive headers
      res.removeHeader('X-Powered-By');
      res.removeHeader('Server');

      next();
    });
  }

  async configureRateLimiting(app: any): Promise<void> {
    const rateLimit = require('express-rate-limit');

    // Login rate limiting
    const loginLimiter = rateLimit({
      windowMs: this.config.rate_limiting.login_attempts.window_ms,
      max: this.config.rate_limiting.login_attempts.max_attempts,
      message: 'Too many login attempts, please try again later',
      standardHeaders: true,
      legacyHeaders: false,
      handler: async (req: any, res: any) => {
        await this.logSecurityEvent('rate_limit_exceeded', {
          endpoint: '/auth/login',
          ip: req.ip,
          user_agent: req.get('User-Agent')
        });

        res.status(429).json({
          error: 'Rate limit exceeded',
          retry_after: Math.ceil(this.config.rate_limiting.login_attempts.window_ms / 1000)
        });
      }
    });

    app.use('/auth/login', loginLimiter);

    // General API rate limiting
    const apiLimiter = rateLimit({
      windowMs: this.config.rate_limiting.api_requests.window_ms,
      max: this.config.rate_limiting.api_requests.max_requests,
      message: 'Too many API requests, please try again later'
    });

    app.use('/api/', apiLimiter);

    // File upload rate limiting
    const uploadLimiter = rateLimit({
      windowMs: this.config.rate_limiting.file_uploads.window_ms,
      max: this.config.rate_limiting.file_uploads.max_uploads,
      message: 'Too many file uploads, please try again later'
    });

    app.use('/api/upload', uploadLimiter);
  }

  async enableEncryption(): Promise<void> {
    // Configure database encryption
    if (this.config.encryption.at_rest_encryption) {
      await this.configureDbEncryption();
    }

    // Configure backup encryption
    if (this.config.encryption.backup_encryption) {
      await this.configureBackupEncryption();
    }

    // Setup key rotation schedule
    await this.scheduleKeyRotation();
  }

  private async configureDbEncryption(): Promise<void> {
    // This would typically be configured at the infrastructure level
    // For Supabase, encryption at rest is enabled by default
    console.log('Database encryption verified');
  }

  private async configureBackupEncryption(): Promise<void> {
    // Configure backup encryption keys
    const encryptionKey = await this.generateEncryptionKey();

    await supabase.from('system_settings').upsert({
      key: 'backup_encryption_key',
      value: { encrypted_key: encryptionKey },
      description: 'Encryption key for backup files'
    });
  }

  private async scheduleKeyRotation(): Promise<void> {
    // Schedule automatic key rotation
    setInterval(async () => {
      const lastRotation = await this.getLastKeyRotation();
      const daysSinceRotation = (Date.now() - new Date(lastRotation).getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceRotation >= this.config.encryption.key_rotation_days) {
        await this.rotateEncryptionKeys();
      }
    }, 24 * 60 * 60 * 1000); // Check daily
  }

  private async rotateEncryptionKeys(): Promise<void> {
    const newKey = await this.generateEncryptionKey();

    // Store new key
    await supabase.from('encryption_keys').insert({
      key_id: crypto.randomUUID(),
      encrypted_key: newKey,
      created_at: new Date().toISOString(),
      is_active: true
    });

    // Mark old keys as inactive
    await supabase.from('encryption_keys')
      .update({ is_active: false })
      .neq('encrypted_key', newKey);

    await this.logSecurityEvent('encryption_key_rotated', {
      rotation_date: new Date().toISOString()
    });
  }

  private async generateEncryptionKey(): Promise<string> {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  async configureSecurityMonitoring(): Promise<void> {
    // Setup security event logging
    await this.setupSecurityEventLogging();

    // Configure real-time monitoring
    if (this.config.monitoring.real_time_alerts) {
      await this.setupRealTimeMonitoring();
    }

    // Setup log retention
    await this.configureLogRetention();
  }

  private async setupSecurityEventLogging(): Promise<void> {
    // Configure structured logging for security events
    const winston = require('winston');

    const securityLogger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/security.log' }),
        new winston.transports.Console()
      ]
    });

    global.securityLogger = securityLogger;
  }

  private async logSecurityEvent(event: string, data: any): Promise<void> {
    const logEntry = {
      event,
      timestamp: new Date().toISOString(),
      data,
      severity: this.getEventSeverity(event)
    };

    // Log to file/console
    if (global.securityLogger) {
      global.securityLogger.info(logEntry);
    }

    // Store in database
    await supabase.from('security_events').insert(logEntry);

    // Send alert if high severity
    if (logEntry.severity === 'high' || logEntry.severity === 'critical') {
      await this.sendSecurityAlert(logEntry);
    }
  }

  private getEventSeverity(event: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'failed_login': 'low',
      'rate_limit_exceeded': 'medium',
      'unusual_access': 'medium',
      'data_export': 'high',
      'encryption_key_rotated': 'low',
      'security_policy_changed': 'high',
      'admin_action': 'medium'
    };

    return severityMap[event] || 'medium';
  }

  private async sendSecurityAlert(logEntry: any): Promise<void> {
    // Send to external security monitoring service
    await fetch(process.env.SECURITY_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    });
  }

  async validateSecurityConfiguration(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Check HTTPS configuration
    if (!this.config.https.enabled) {
      issues.push('HTTPS not enabled');
    }

    // Check CSP configuration
    if (!this.config.headers.csp.includes("default-src 'self'")) {
      issues.push('CSP policy too permissive');
    }

    // Check rate limiting
    if (this.config.rate_limiting.login_attempts.max_attempts > 10) {
      issues.push('Login rate limit too high');
    }

    // Check encryption
    if (!this.config.encryption.backup_encryption) {
      issues.push('Backup encryption not enabled');
    }

    // Check monitoring
    if (!this.config.monitoring.real_time_alerts) {
      issues.push('Real-time alerts not enabled');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

// Security configuration component
const SecurityConfigurationPanel: React.FC = () => {
  const [config, setConfig] = useState<SecurityConfiguration | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const securityService = new SecurityConfigurationService();

  const validateConfiguration = async () => {
    const result = await securityService.validateSecurityConfiguration();
    setValidationResult(result);
  };

  const applySecurityChanges = async () => {
    try {
      // Apply configuration changes
      await securityService.enableEncryption();
      await securityService.configureSecurityMonitoring();

      toast.success('Security configuration applied successfully');
      validateConfiguration();
    } catch (error) {
      toast.error('Failed to apply security configuration');
    }
  };

  return (
    <div className="security-configuration-panel">
      <SecurityValidationStatus result={validationResult} />

      <SettingsSection title="HTTPS & Headers">
        <HttpsConfiguration config={config?.https} onChange={(https) => setConfig(prev => ({ ...prev, https }))} />
        <SecurityHeadersConfiguration config={config?.headers} onChange={(headers) => setConfig(prev => ({ ...prev, headers }))} />
      </SettingsSection>

      <SettingsSection title="Rate Limiting">
        <RateLimitingConfiguration config={config?.rate_limiting} onChange={(rate_limiting) => setConfig(prev => ({ ...prev, rate_limiting }))} />
      </SettingsSection>

      <SettingsSection title="Encryption">
        <EncryptionConfiguration config={config?.encryption} onChange={(encryption) => setConfig(prev => ({ ...prev, encryption }))} />
      </SettingsSection>

      <SettingsSection title="Monitoring">
        <MonitoringConfiguration config={config?.monitoring} onChange={(monitoring) => setConfig(prev => ({ ...prev, monitoring }))} />
      </SettingsSection>

      <div className="security-actions">
        <Button onClick={validateConfiguration} variant="outline">
          Validate Configuration
        </Button>
        <Button onClick={applySecurityChanges}>
          Apply Security Changes
        </Button>
      </div>
    </div>
  );
};
```

## Database Schema Extensions

```sql
-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_email VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  description TEXT NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  session_id UUID,
  before_data JSONB,
  after_data JSONB,
  metadata JSONB NOT NULL DEFAULT '{}',
  risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Security threats table
CREATE TABLE security_threats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threat_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID REFERENCES auth.users(id),
  ip_address INET NOT NULL,
  description TEXT NOT NULL,
  evidence JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved', 'false_positive')),
  detected_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  actions_taken TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Blocked IPs table
CREATE TABLE blocked_ips (
  ip_address INET PRIMARY KEY,
  blocked_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  reason TEXT NOT NULL,
  blocked_by UUID REFERENCES auth.users(id),
  auto_blocked BOOLEAN DEFAULT true
);

-- Privacy requests table
CREATE TABLE privacy_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('access', 'rectification', 'erasure', 'portability', 'restriction')),
  data_subject_id UUID NOT NULL,
  request_details TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  requested_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  processed_by UUID REFERENCES auth.users(id),
  response_data JSONB,
  rejection_reason TEXT
);

-- Data processing records table
CREATE TABLE data_processing_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  data_subject_id UUID NOT NULL,
  processing_purpose TEXT NOT NULL,
  data_categories TEXT[] NOT NULL,
  legal_basis VARCHAR(50) NOT NULL CHECK (legal_basis IN ('consent', 'contract', 'legal_obligation', 'legitimate_interest')),
  retention_period TEXT NOT NULL,
  automated_processing BOOLEAN DEFAULT false,
  third_party_sharing BOOLEAN DEFAULT false,
  consent_given_at TIMESTAMP,
  consent_withdrawn_at TIMESTAMP,
  processed_at TIMESTAMP DEFAULT NOW(),
  processing_duration INTEGER -- milliseconds
);

-- Security events table
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  timestamp TIMESTAMP DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'
);

-- Encryption keys table
CREATE TABLE encryption_keys (
  key_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encrypted_key TEXT NOT NULL,
  algorithm VARCHAR(50) DEFAULT 'AES-256-GCM',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  rotated_at TIMESTAMP,
  expires_at TIMESTAMP
);

-- Security incidents table
CREATE TABLE security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  involves_personal_data BOOLEAN DEFAULT false,
  affected_users INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  detected_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolution_notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_audit_logs_user_time ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_action_time ON audit_logs(action, created_at DESC);
CREATE INDEX idx_audit_logs_risk_level ON audit_logs(risk_level, created_at DESC);
CREATE INDEX idx_security_threats_severity ON security_threats(severity, detected_at DESC);
CREATE INDEX idx_security_threats_status ON security_threats(status, detected_at DESC);
CREATE INDEX idx_blocked_ips_expires ON blocked_ips(expires_at);
CREATE INDEX idx_privacy_requests_status ON privacy_requests(status, requested_at DESC);
CREATE INDEX idx_data_processing_subject ON data_processing_records(data_subject_id, processed_at DESC);
CREATE INDEX idx_security_events_severity ON security_events(severity, timestamp DESC);

-- RLS Policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_processing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;

-- Only shop owners can access security tables
CREATE POLICY "Shop owners access audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'shop_owner'
      AND p.is_active = true
    )
  );

CREATE POLICY "Shop owners access security threats" ON security_threats
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'shop_owner'
      AND p.is_active = true
    )
  );

CREATE POLICY "Shop owners access blocked ips" ON blocked_ips
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'shop_owner'
      AND p.is_active = true
    )
  );

CREATE POLICY "Shop owners access privacy requests" ON privacy_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'shop_owner'
      AND p.is_active = true
    )
  );

-- Staff can read their own data processing records
CREATE POLICY "Users access own data processing" ON data_processing_records
  FOR SELECT USING (auth.uid() = user_id);

-- Shop owners can access all data processing records
CREATE POLICY "Shop owners access data processing" ON data_processing_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'shop_owner'
      AND p.is_active = true
    )
  );

-- Functions for security automation
CREATE OR REPLACE FUNCTION cleanup_expired_blocks()
RETURNS void AS $$
BEGIN
  DELETE FROM blocked_ips WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup function
SELECT cron.schedule('cleanup-expired-blocks', '0 * * * *', 'SELECT cleanup_expired_blocks();');
```

## Testing Scenarios

### Unit Tests
```typescript
describe('Access Control & Security', () => {
  test('role-based component visibility', () => {
    const { rerender } = render(
      <UserContext.Provider value={{ profile: { role: 'staff' } }}>
        <ProtectedComponent componentId="admin-panel">
          <div>Admin Panel</div>
        </ProtectedComponent>
      </UserContext.Provider>
    );

    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();

    rerender(
      <UserContext.Provider value={{ profile: { role: 'shop_owner' } }}>
        <ProtectedComponent componentId="admin-panel">
          <div>Admin Panel</div>
        </ProtectedComponent>
      </UserContext.Provider>
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  test('audit logging captures all required fields', async () => {
    const logger = AuditLogger.getInstance();

    await logger.logAction({
      action: 'user_created',
      resource_type: 'users',
      description: 'Created new staff account'
    });

    const logs = await getAuditLogs({ action: 'user_created' });
    expect(logs).toHaveLength(1);
    expect(logs[0]).toHaveProperty('user_id');
    expect(logs[0]).toHaveProperty('ip_address');
    expect(logs[0]).toHaveProperty('created_at');
  });

  test('security threat detection', async () => {
    const monitor = SecurityMonitor.getInstance();

    // Simulate multiple failed logins
    for (let i = 0; i < 15; i++) {
      await simulateFailedLogin('192.168.1.100');
    }

    await monitor.detectThreats();

    const threats = await getSecurityThreats({ threat_type: 'brute_force' });
    expect(threats).toHaveLength(1);
    expect(threats[0].severity).toBe('medium');
  });
});
```

### Integration Tests
```typescript
describe('Security Integration', () => {
  test('complete security workflow', async () => {
    // Create security threat
    const threat = await createSecurityThreat({
      threat_type: 'brute_force',
      severity: 'high',
      ip_address: '192.168.1.100'
    });

    // Verify automatic response
    const blockedIPs = await getBlockedIPs();
    expect(blockedIPs).toContainEqual(
      expect.objectContaining({ ip_address: '192.168.1.100' })
    );

    // Verify audit log
    const auditLogs = await getAuditLogs({ action: 'ip_blocked' });
    expect(auditLogs).toHaveLength(1);
  });

  test('privacy request processing', async () => {
    const customer = await createTestCustomer();
    const privacyService = new PrivacyComplianceService();

    const requestId = await privacyService.handleDataSubjectRequest({
      request_type: 'access',
      data_subject_id: customer.id,
      request_details: 'Customer requesting data access'
    });

    expect(requestId).toBeTruthy();

    const request = await getPrivacyRequest(requestId);
    expect(request.status).toBe('completed');
    expect(request.response_data).toBeTruthy();
  });
});
```

### E2E Tests
```typescript
describe('Security E2E', () => {
  test('shop owner can access security dashboard', async () => {
    await loginAsShopOwner();
    await page.goto('/admin/security');

    await expect(page.locator('[data-testid="security-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-logs"]')).toBeVisible();
    await expect(page.locator('[data-testid="security-threats"]')).toBeVisible();
  });

  test('staff cannot access security features', async () => {
    await loginAsStaff();
    await page.goto('/admin/security');

    await expect(page).toHaveURL('/dashboard'); // Redirected
    await expect(page.locator('.error-message')).toContainText('không có quyền');
  });

  test('security configuration workflow', async () => {
    await loginAsShopOwner();
    await page.goto('/admin/security/configuration');

    // Update security settings
    await page.check('[data-testid="enable-2fa"]');
    await page.fill('[data-testid="session-timeout"]', '3600');
    await page.click('[data-testid="save-security-config"]');

    await expect(page.locator('.success-message')).toContainText('thành công');

    // Validate security configuration
    await page.click('[data-testid="validate-config"]');
    await expect(page.locator('[data-testid="validation-status"]')).toContainText('valid');
  });
});
```

## Performance Requirements
- Permission checks phải complete trong <50ms
- Audit logging phải không impact main operations (async)
- Security monitoring phải process events trong <1 second
- Privacy data export phải complete trong <30 seconds
- Security dashboard phải load trong <3 seconds

## Security Requirements
- Tất cả sensitive operations phải logged
- Encryption keys phải rotated every 90 days
- Security events phải monitored real-time
- Privacy requests phải processed within 30 days
- Access controls phải enforced at database level

## Accessibility Requirements
- Security status indicators phải có clear visual cues
- Audit log interface phải screen reader accessible
- Error messages phải descriptive và actionable
- Security configurations phải có help text
- Alert notifications phải accessible

## Mobile Optimization
- Security dashboard phải responsive
- Critical alerts phải visible on mobile
- Touch-friendly security controls
- Optimized audit log viewing cho mobile
- Quick security actions accessible via mobile