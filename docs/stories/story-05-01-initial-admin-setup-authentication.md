# Story 05.1: Initial Admin Setup & Authentication
**Epic:** 05 - Admin & User Management System
**Story Points:** 8
**Priority:** Critical
**Dependencies:** Story 01.3

## Mô tả (Description)
Là một chủ cửa hàng sửa chữa laptop mới bắt đầu sử dụng hệ thống, tôi cần một quy trình setup ban đầu đơn giản và an toàn để tạo tài khoản admin đầu tiên từ environment variables, thiết lập authentication system với role-based access control, và đảm bảo security cho toàn bộ hệ thống quản lý cửa hàng.

## Acceptance Criteria

### AC 05.1.1: Environment-based Admin Account Creation
**Given** hệ thống mới được deploy lần đầu
**When** Docker containers khởi động với environment variables được cấu hình
**Then** hệ thống tự động:
- Tạo admin account đầu tiên từ `ADMIN_EMAIL` và `ADMIN_PASSWORD` environment variables
- Assign role 'shop_owner' cho admin account
- Tạo user profile trong bảng `user_profiles`
- Log việc tạo admin account thành công
- Không cho phép tạo duplicate admin accounts

```typescript
interface InitialAdminSetup {
  admin_email: string; // từ ADMIN_EMAIL env var
  admin_password: string; // từ ADMIN_PASSWORD env var
  shop_name: string; // từ SHOP_NAME env var
  phone: string; // từ SHOP_PHONE env var
  setup_completed: boolean;
  created_at: string;
}

// Docker initialization script
const setupInitialAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const shopName = process.env.SHOP_NAME || 'Cửa hàng sửa chữa laptop';

  if (!adminEmail || !adminPassword) {
    console.error('ADMIN_EMAIL và ADMIN_PASSWORD phải được cấu hình');
    process.exit(1);
  }

  // Check if admin already exists
  const existingAdmin = await supabase.auth.admin.listUsers({
    filter: `email.eq.${adminEmail}`
  });

  if (existingAdmin.data.users.length === 0) {
    // Create admin user
    const { data: user, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true
    });

    if (user) {
      // Create profile
      await supabase.from('user_profiles').insert({
        id: user.user.id,
        email: adminEmail,
        full_name: 'Chủ cửa hàng',
        role: 'shop_owner',
        is_active: true,
        created_at: new Date().toISOString()
      });

      // Create shop settings
      await supabase.from('system_settings').insert({
        key: 'shop_name',
        value: shopName,
        created_by: user.user.id
      });

      console.log('✅ Admin account tạo thành công:', adminEmail);
    }
  }
};
```

### AC 05.1.2: Secure Login System với Role-based Redirects
**Given** admin account đã được tạo
**When** user truy cập login page và nhập credentials
**Then** hệ thống:
- Validate email/password với Supabase Auth
- Check user profile và role từ database
- Redirect shop_owner đến `/dashboard`
- Redirect staff đến `/phieu` (tickets page)
- Block access cho deactivated accounts
- Store session với role information

```typescript
interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  redirectPath: string;
}

const LoginPage: React.FC = () => {
  const { signIn, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      const response = await signIn(credentials);

      if (response.profile?.is_active === false) {
        toast.error('Tài khoản đã bị vô hiệu hóa. Liên hệ quản lý.');
        return;
      }

      // Role-based redirect
      const redirectPath = response.profile?.role === 'shop_owner'
        ? '/dashboard'
        : '/phieu';

      navigate(redirectPath);
      toast.success(`Chào mừng ${response.profile?.full_name}`);
    } catch (error) {
      toast.error('Email hoặc mật khẩu không đúng');
    }
  };

  return (
    <div className="login-container">
      <LoginForm onSubmit={handleLogin} loading={loading} />
      <ForgotPasswordLink />
    </div>
  );
};

// Auth Hook
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error) throw error;

    // Fetch user profile
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    setUser(data.user);
    setProfile(profileData);

    return {
      user: data.user,
      profile: profileData,
      session: data.session,
      redirectPath: profileData?.role === 'shop_owner' ? '/dashboard' : '/phieu'
    };
  };

  return { user, profile, signIn, loading };
};
```

### AC 05.1.3: Session Management & Security
**Given** user đã login thành công
**When** user sử dụng hệ thống
**Then** session management system:
- Tự động refresh tokens khi gần expired
- Track user activity để extend session
- Auto-logout sau 8 hours inactivity
- Store session state trong localStorage với encryption
- Validate session trên mỗi sensitive operation

```typescript
interface SessionManager {
  session: Session | null;
  lastActivity: number;
  sessionTimeout: number; // 8 hours = 28800000ms
  refreshTokenBeforeExpiry: number; // 5 minutes = 300000ms
}

const useSessionManager = () => {
  const [sessionState, setSessionState] = useState<SessionManager>({
    session: null,
    lastActivity: Date.now(),
    sessionTimeout: 28800000, // 8 hours
    refreshTokenBeforeExpiry: 300000 // 5 minutes
  });

  // Auto-refresh token
  useEffect(() => {
    const interval = setInterval(async () => {
      const session = await supabase.auth.getSession();

      if (session.data.session) {
        const expiresAt = new Date(session.data.session.expires_at || 0).getTime();
        const now = Date.now();

        // Refresh if expires within 5 minutes
        if (expiresAt - now < sessionState.refreshTokenBeforeExpiry) {
          await supabase.auth.refreshSession();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Track user activity
  const updateActivity = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      lastActivity: Date.now()
    }));
  }, []);

  // Auto-logout on inactivity
  useEffect(() => {
    const checkInactivity = setInterval(() => {
      const timeSinceLastActivity = Date.now() - sessionState.lastActivity;

      if (timeSinceLastActivity > sessionState.sessionTimeout) {
        supabase.auth.signOut();
        toast.info('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
        window.location.href = '/login';
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInactivity);
  }, [sessionState.lastActivity]);

  return { updateActivity, sessionState };
};

// Activity tracker component
const ActivityTracker: React.FC = () => {
  const { updateActivity } = useSessionManager();

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    const handleActivity = () => updateActivity();

    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [updateActivity]);

  return null;
};
```

### AC 05.1.4: Password Security & Policies
**Given** hệ thống cần đảm bảo security
**When** user tạo hoặc thay đổi password
**Then** password policy system:
- Enforce minimum 8 characters với complexity requirements
- Require combination of uppercase, lowercase, numbers, special chars
- Prevent common passwords và dictionary words
- Force password change every 90 days cho admin accounts
- Track failed login attempts và implement lockout

```typescript
interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number; // days
  preventReuse: number; // last N passwords
  maxFailedAttempts: number;
  lockoutDuration: number; // minutes
}

interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  score: number; // 0-100
}

const passwordPolicy: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxAge: 90,
  preventReuse: 5,
  maxFailedAttempts: 5,
  lockoutDuration: 15
};

const validatePassword = (password: string): PasswordValidation => {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < passwordPolicy.minLength) {
    errors.push(`Mật khẩu phải có ít nhất ${passwordPolicy.minLength} ký tự`);
  } else {
    score += 20;
  }

  // Character requirements
  if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
  } else {
    score += 20;
  }

  if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
  } else {
    score += 20;
  }

  if (passwordPolicy.requireNumbers && !/\d/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 số');
  } else {
    score += 20;
  }

  if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
  } else {
    score += 20;
  }

  // Common password check
  const commonPasswords = ['123456', 'password', 'admin', 'qwerty'];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Mật khẩu quá đơn giản');
    score = Math.min(score, 30);
  }

  const strength = score >= 80 ? 'strong' : score >= 60 ? 'medium' : 'weak';

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score
  };
};

// Password change form component
const PasswordChangeForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const validation = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validation.isValid) {
      toast.error('Mật khẩu không đáp ứng yêu cầu bảo mật');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Xác nhận mật khẩu không khớp');
      return;
    }

    try {
      await supabase.auth.updateUser({ password });
      toast.success('Đổi mật khẩu thành công');
    } catch (error) {
      toast.error('Lỗi khi đổi mật khẩu');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PasswordInput
        value={password}
        onChange={setPassword}
        validation={validation}
      />
      <PasswordStrengthIndicator validation={validation} />
      <ConfirmPasswordInput
        value={confirmPassword}
        onChange={setConfirmPassword}
        match={password === confirmPassword}
      />
      <button type="submit" disabled={!validation.isValid}>
        Đổi mật khẩu
      </button>
    </form>
  );
};
```

### AC 05.1.5: Failed Login Tracking & Account Lockout
**Given** hệ thống cần ngăn chặn brute force attacks
**When** có nhiều lần đăng nhập sai liên tiếp
**Then** security system:
- Track failed attempts per email address
- Lock account sau 5 failed attempts
- Lockout duration: 15 minutes
- Send email notification về suspicious activity
- Admin có thể unlock accounts manually

```typescript
interface LoginAttempt {
  id: string;
  email: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  attempted_at: string;
  lockout_until?: string;
}

interface AccountLockout {
  email: string;
  failed_attempts: number;
  locked_until: string | null;
  last_attempt: string;
}

const useAccountLockout = () => {
  const trackLoginAttempt = async (
    email: string,
    success: boolean,
    ipAddress: string,
    userAgent: string
  ) => {
    // Log attempt
    await supabase.from('login_attempts').insert({
      email,
      ip_address: ipAddress,
      user_agent: userAgent,
      success,
      attempted_at: new Date().toISOString()
    });

    if (!success) {
      // Check failed attempts in last hour
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

      const { data: recentAttempts } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('email', email)
        .eq('success', false)
        .gte('attempted_at', oneHourAgo);

      if (recentAttempts && recentAttempts.length >= passwordPolicy.maxFailedAttempts) {
        // Lock account
        const lockoutUntil = new Date(Date.now() + passwordPolicy.lockoutDuration * 60000);

        await supabase.from('account_lockouts').upsert({
          email,
          failed_attempts: recentAttempts.length,
          locked_until: lockoutUntil.toISOString(),
          last_attempt: new Date().toISOString()
        });

        // Send notification email
        await sendSecurityAlert(email, 'account_locked', {
          failed_attempts: recentAttempts.length,
          locked_until: lockoutUntil,
          ip_address: ipAddress
        });

        throw new Error(`Tài khoản bị khóa do quá nhiều lần đăng nhập sai. Thử lại sau ${passwordPolicy.lockoutDuration} phút.`);
      }
    } else {
      // Clear lockout on successful login
      await supabase.from('account_lockouts').delete().eq('email', email);
    }
  };

  const checkAccountLockout = async (email: string): Promise<boolean> => {
    const { data: lockout } = await supabase
      .from('account_lockouts')
      .select('*')
      .eq('email', email)
      .single();

    if (lockout && lockout.locked_until) {
      const lockoutTime = new Date(lockout.locked_until).getTime();
      const now = Date.now();

      if (now < lockoutTime) {
        const remainingMinutes = Math.ceil((lockoutTime - now) / 60000);
        throw new Error(`Tài khoản bị khóa. Thử lại sau ${remainingMinutes} phút.`);
      } else {
        // Lockout expired, remove it
        await supabase.from('account_lockouts').delete().eq('email', email);
      }
    }

    return false;
  };

  return { trackLoginAttempt, checkAccountLockout };
};

// Enhanced login with security
const LoginForm: React.FC = () => {
  const { trackLoginAttempt, checkAccountLockout } = useAccountLockout();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (credentials: LoginCredentials) => {
    setLoading(true);
    const ipAddress = await fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => data.ip);

    try {
      // Check if account is locked
      await checkAccountLockout(credentials.email);

      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword(credentials);

      if (error) {
        // Track failed attempt
        await trackLoginAttempt(
          credentials.email,
          false,
          ipAddress,
          navigator.userAgent
        );
        throw error;
      }

      // Track successful attempt
      await trackLoginAttempt(
        credentials.email,
        true,
        ipAddress,
        navigator.userAgent
      );

      toast.success('Đăng nhập thành công');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <EmailInput />
      <PasswordInput />
      <LoginButton loading={loading} />
      <SecurityNotice />
    </form>
  );
};
```

### AC 05.1.6: Setup Completion Verification
**Given** initial setup process đã hoàn tất
**When** hệ thống khởi động lần tiếp theo
**Then** verification system:
- Check admin account tồn tại và active
- Verify database schema và initial data
- Confirm environment variables configured correctly
- Display setup status trên admin dashboard
- Provide troubleshooting guides nếu có issues

```typescript
interface SetupStatus {
  admin_account_created: boolean;
  database_initialized: boolean;
  environment_configured: boolean;
  initial_settings_created: boolean;
  overall_status: 'complete' | 'incomplete' | 'error';
  issues: string[];
  recommendations: string[];
}

const useSetupVerification = () => {
  const verifySetup = async (): Promise<SetupStatus> => {
    const status: SetupStatus = {
      admin_account_created: false,
      database_initialized: false,
      environment_configured: false,
      initial_settings_created: false,
      overall_status: 'incomplete',
      issues: [],
      recommendations: []
    };

    try {
      // Check admin account
      const { data: adminProfiles } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'shop_owner')
        .eq('is_active', true);

      status.admin_account_created = adminProfiles && adminProfiles.length > 0;
      if (!status.admin_account_created) {
        status.issues.push('Không tìm thấy tài khoản admin');
        status.recommendations.push('Kiểm tra ADMIN_EMAIL và ADMIN_PASSWORD trong environment variables');
      }

      // Check database tables
      const tables = ['user_profiles', 'repair_tickets', 'customers', 'parts'];
      let tablesExist = true;

      for (const table of tables) {
        const { error } = await supabase.from(table).select('id').limit(1);
        if (error) {
          tablesExist = false;
          status.issues.push(`Bảng ${table} không tồn tại hoặc không accessible`);
        }
      }
      status.database_initialized = tablesExist;

      // Check environment variables
      const requiredEnvVars = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'SHOP_NAME'];
      status.environment_configured = requiredEnvVars.every(envVar =>
        process.env[envVar] && process.env[envVar].length > 0
      );

      if (!status.environment_configured) {
        status.issues.push('Environment variables chưa được cấu hình đầy đủ');
      }

      // Check initial settings
      const { data: settings } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', 'shop_name');

      status.initial_settings_created = settings && settings.length > 0;

      // Overall status
      const allChecks = [
        status.admin_account_created,
        status.database_initialized,
        status.environment_configured,
        status.initial_settings_created
      ];

      if (allChecks.every(check => check)) {
        status.overall_status = 'complete';
      } else if (status.issues.length > 0) {
        status.overall_status = 'error';
      }

    } catch (error) {
      status.overall_status = 'error';
      status.issues.push(`Lỗi kiểm tra setup: ${error.message}`);
    }

    return status;
  };

  return { verifySetup };
};

// Setup status dashboard component
const SetupStatusDashboard: React.FC = () => {
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { verifySetup } = useSetupVerification();

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const status = await verifySetup();
        setSetupStatus(status);
      } finally {
        setLoading(false);
      }
    };

    checkSetup();
  }, []);

  if (loading) return <SetupStatusSkeleton />;

  return (
    <div className="setup-status-dashboard">
      <SetupStatusOverview status={setupStatus} />
      {setupStatus?.issues.length > 0 && (
        <IssuesPanel issues={setupStatus.issues} />
      )}
      {setupStatus?.recommendations.length > 0 && (
        <RecommendationsPanel recommendations={setupStatus.recommendations} />
      )}
      <TroubleshootingGuide />
    </div>
  );
};
```

## Database Schema Extensions

```sql
-- User profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('shop_owner', 'staff')),
  is_active BOOLEAN DEFAULT true,
  phone VARCHAR(20),
  avatar_url TEXT,
  last_login TIMESTAMP,
  password_changed_at TIMESTAMP DEFAULT NOW(),
  password_expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '90 days'),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Login attempts tracking
CREATE TABLE login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  attempted_at TIMESTAMP DEFAULT NOW(),
  session_id UUID
);

-- Account lockouts
CREATE TABLE account_lockouts (
  email VARCHAR(255) PRIMARY KEY,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMP,
  last_attempt TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- System settings
CREATE TABLE system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin action logs
CREATE TABLE admin_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_login_attempts_email_time ON login_attempts(email, attempted_at DESC);
CREATE INDEX idx_login_attempts_ip_time ON login_attempts(ip_address, attempted_at DESC);
CREATE INDEX idx_user_profiles_role ON user_profiles(role, is_active);
CREATE INDEX idx_admin_logs_admin_time ON admin_action_logs(admin_id, created_at DESC);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_lockouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_action_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Only shop owners can read all profiles
CREATE POLICY "Shop owners read all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'shop_owner'
      AND p.is_active = true
    )
  );

-- Only shop owners can manage user profiles
CREATE POLICY "Shop owners manage profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'shop_owner'
      AND p.is_active = true
    )
  );

-- Login attempts readable by admins only
CREATE POLICY "Admins read login attempts" ON login_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'shop_owner'
      AND p.is_active = true
    )
  );

-- System settings readable by authenticated users
CREATE POLICY "Read system settings" ON system_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only shop owners can modify system settings
CREATE POLICY "Shop owners modify settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'shop_owner'
      AND p.is_active = true
    )
  );
```

## Testing Scenarios

### Unit Tests
```typescript
describe('Initial Admin Setup & Authentication', () => {
  test('creates admin account from environment variables', async () => {
    process.env.ADMIN_EMAIL = 'admin@laptop-shop.com';
    process.env.ADMIN_PASSWORD = 'SecurePass123!';

    await setupInitialAdmin();

    const { data: users } = await supabase.auth.admin.listUsers();
    expect(users.users).toContainEqual(
      expect.objectContaining({ email: 'admin@laptop-shop.com' })
    );
  });

  test('validates password complexity', () => {
    const weakPassword = validatePassword('123');
    expect(weakPassword.isValid).toBe(false);
    expect(weakPassword.strength).toBe('weak');

    const strongPassword = validatePassword('SecurePass123!');
    expect(strongPassword.isValid).toBe(true);
    expect(strongPassword.strength).toBe('strong');
  });

  test('tracks failed login attempts', async () => {
    await trackLoginAttempt('user@test.com', false, '192.168.1.1', 'test-agent');

    const { data: attempts } = await supabase
      .from('login_attempts')
      .select('*')
      .eq('email', 'user@test.com');

    expect(attempts).toHaveLength(1);
    expect(attempts[0].success).toBe(false);
  });
});
```

### Integration Tests
```typescript
describe('Authentication Integration', () => {
  test('complete login flow with role-based redirect', async () => {
    // Create test admin
    const admin = await createTestUser('admin@test.com', 'shop_owner');

    // Login
    const response = await signIn({
      email: 'admin@test.com',
      password: 'TestPass123!'
    });

    expect(response.user).toBeTruthy();
    expect(response.profile.role).toBe('shop_owner');
    expect(response.redirectPath).toBe('/dashboard');
  });

  test('account lockout after failed attempts', async () => {
    const email = 'test@lockout.com';

    // Simulate 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await trackLoginAttempt(email, false, '192.168.1.1', 'test');
    }

    // 6th attempt should be blocked
    await expect(checkAccountLockout(email)).rejects.toThrow('Tài khoản bị khóa');
  });
});
```

### E2E Tests
```typescript
describe('Admin Setup E2E', () => {
  test('initial admin setup and first login', async () => {
    // Visit login page
    await page.goto('/login');

    // Enter admin credentials
    await page.fill('[data-testid="email-input"]', 'admin@laptop-shop.com');
    await page.fill('[data-testid="password-input"]', 'AdminPass123!');
    await page.click('[data-testid="login-button"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Chào mừng');
  });

  test('password change flow', async () => {
    await loginAsAdmin();
    await page.goto('/admin/profile');

    await page.click('[data-testid="change-password-button"]');
    await page.fill('[data-testid="new-password"]', 'NewSecurePass123!');
    await page.fill('[data-testid="confirm-password"]', 'NewSecurePass123!');

    await page.click('[data-testid="save-password"]');
    await expect(page.locator('.success-message')).toContainText('thành công');
  });
});
```

## Performance Requirements
- Admin account creation phải complete trong <2 seconds
- Login authentication phải respond trong <1 second
- Session validation phải complete trong <200ms
- Password validation phải instant (<100ms)
- Failed attempt tracking phải không ảnh hưởng login speed

## Security Requirements
- Passwords phải encrypted với bcrypt (>= 12 rounds)
- Sessions phải have secure HttpOnly cookies
- Login attempts phải logged với IP tracking
- Account lockouts phải prevent brute force attacks
- Admin actions phải có comprehensive audit trail

## Accessibility Requirements
- Login form phải keyboard navigable
- Screen reader support cho error messages
- Clear focus indicators trên tất cả input fields
- High contrast support cho security warnings
- Alternative text cho security status indicators

## Mobile Optimization
- Login form phải responsive trên mobile
- Touch-friendly input fields và buttons
- Proper viewport configuration
- Fast loading trên slow connections
- Offline error handling