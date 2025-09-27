# Troubleshooting Guide for Vietnamese Laptop Repair Shop Management System

This comprehensive troubleshooting guide helps developers quickly identify and resolve common issues when working with the Vietnamese Laptop Repair Shop Management System.

## Table of Contents

1. [Environment Setup Issues](#environment-setup-issues)
2. [Database Connection Problems](#database-connection-problems)
3. [Vietnamese Data Validation Errors](#vietnamese-data-validation-errors)
4. [Authentication and Authorization Issues](#authentication-and-authorization-issues)
5. [Component Rendering Problems](#component-rendering-problems)
6. [Type Safety and TypeScript Errors](#type-safety-and-typescript-errors)
7. [Testing Issues](#testing-issues)
8. [Build and Deployment Problems](#build-and-deployment-problems)
9. [Performance Issues](#performance-issues)
10. [Vietnamese Locale Issues](#vietnamese-locale-issues)

## Environment Setup Issues

### Problem: Supabase fails to start

**Symptoms:**
```bash
pnpm run db:start
Error: Docker daemon is not running
```

**Solutions:**

1. **Check Docker status:**
   ```bash
   docker --version
   docker info
   ```

2. **Start Docker service:**
   ```bash
   # On macOS/Windows
   # Start Docker Desktop application

   # On Linux
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

3. **Check Docker memory allocation:**
   - Docker needs at least 7GB RAM for Supabase
   - Increase Docker memory in Docker Desktop settings

4. **Reset Docker if corrupted:**
   ```bash
   docker system prune -a --volumes
   pnpm run db:stop
   pnpm run db:start
   ```

### Problem: Environment variables not loading

**Symptoms:**
```
Error: VITE_SUPABASE_URL is not defined
```

**Solutions:**

1. **Check environment file exists:**
   ```bash
   ls -la .env.local
   # Should show .env.local file
   ```

2. **Verify environment variables format:**
   ```env
   # Correct format (no quotes for Vite)
   VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_ANON_KEY=your_anon_key_here

   # Incorrect format
   VITE_SUPABASE_URL="http://127.0.0.1:54321"  # Remove quotes
   ```

3. **Restart development server after changes:**
   ```bash
   # Stop current server (Ctrl+C)
   pnpm run dev
   ```

4. **Check Supabase keys:**
   ```bash
   pnpm run db:start
   # Copy the keys shown in terminal output
   ```

### Problem: Port conflicts

**Symptoms:**
```
Error: Port 5173 is already in use
Error: Port 54321 is already in use
```

**Solutions:**

1. **Kill processes using ports:**
   ```bash
   # Find process using port
   lsof -i :5173
   lsof -i :54321

   # Kill process
   kill -9 <PID>
   ```

2. **Use different ports:**
   ```bash
   # For Vite dev server
   pnpm run dev -- --port 5174

   # For Supabase (in supabase/config.toml)
   [api]
   port = 54322
   ```

## Database Connection Problems

### Problem: Database connection refused

**Symptoms:**
```
Error: Connection refused at 127.0.0.1:54321
FetchError: Invalid URL
```

**Solutions:**

1. **Verify Supabase is running:**
   ```bash
   pnpm run db:status
   # Should show all services as "RUNNING"
   ```

2. **Check Docker containers:**
   ```bash
   docker ps
   # Should show supabase containers running
   ```

3. **Reset Supabase completely:**
   ```bash
   pnpm run db:stop
   docker system prune -f
   pnpm run db:start
   ```

4. **Check firewall/antivirus:**
   - Ensure ports 54321, 54322, 54323 are not blocked
   - Add Docker to firewall exceptions

### Problem: Database schema out of sync

**Symptoms:**
```
Error: relation "repair_tickets" does not exist
Error: column "customer_description" does not exist
```

**Solutions:**

1. **Reset database with migrations:**
   ```bash
   pnpm run db:reset
   ```

2. **Check migration files:**
   ```bash
   ls supabase/migrations/
   # Ensure all .sql files are present
   ```

3. **Manual database reset:**
   ```bash
   pnpx supabase db reset --local
   ```

4. **Verify schema in Supabase Studio:**
   - Open http://127.0.0.1:54323
   - Check Tables tab for correct schema

### Problem: RLS policies blocking queries

**Symptoms:**
```
Error: Row Level Security policy violation
Error: new row violates row-level security policy
```

**Solutions:**

1. **Check RLS policies in Supabase Studio:**
   - Go to Authentication > Policies
   - Ensure public access policies exist for required tables

2. **Temporary disable RLS for testing:**
   ```sql
   -- In Supabase Studio SQL editor
   ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
   ALTER TABLE repair_tickets DISABLE ROW LEVEL SECURITY;
   ```

3. **Re-apply seed data:**
   ```bash
   pnpm run db:reset
   ```

## Vietnamese Data Validation Errors

### Problem: Vietnamese phone number validation fails

**Symptoms:**
```
Error: Invalid Vietnamese phone number
Error: Số điện thoại không hợp lệ
```

**Solutions:**

1. **Check phone number format:**
   ```typescript
   // Correct formats
   const validPhones = [
     "0901234567",  // 10 digits starting with 0
     "84901234567", // International format
   ];

   // Incorrect formats
   const invalidPhones = [
     "090 123 4567", // Has spaces
     "090-123-4567", // Has dashes
     "123456789",    // Wrong length
     "0201234567",   // Invalid prefix
   ];
   ```

2. **Use validation helper:**
   ```typescript
   import { isValidVietnamesePhone } from '@/lib/type-guards';

   const phone = "0901234567";
   if (!isValidVietnamesePhone(phone)) {
     console.error('Invalid phone format');
   }
   ```

3. **Normalize phone numbers:**
   ```typescript
   import { normalizePhoneNumber } from '@/lib/validation/phone-vietnamese';

   const userInput = "090 123 4567";
   const normalized = normalizePhoneNumber(userInput); // "0901234567"
   ```

### Problem: Vietnamese currency validation errors

**Symptoms:**
```
Error: Invalid currency amount
Error: Số tiền không hợp lệ
```

**Solutions:**

1. **Check currency format requirements:**
   ```typescript
   // Valid VND amounts
   const validAmounts = [
     0,           // Free service
     50000,       // 50K VND
     150000,      // 150K VND
     1000000,     // 1M VND
   ];

   // Invalid amounts
   const invalidAmounts = [
     -100000,     // Negative
     150000.50,   // Has decimals
     99999999999, // Too large
   ];
   ```

2. **Use currency validation:**
   ```typescript
   import { validateRepairPrice } from '@/lib/validation/currency-vietnamese';

   const amount = 150000;
   const validation = validateRepairPrice(amount);
   if (!validation.isValid) {
     console.error(validation.error);
   }
   ```

### Problem: Vietnamese character encoding issues

**Symptoms:**
```
Display: "NguyÃªn VÄn An" instead of "Nguyễn Văn An"
Storage: Corrupted Vietnamese characters in database
```

**Solutions:**

1. **Ensure UTF-8 encoding:**
   ```html
   <!-- In index.html -->
   <meta charset="UTF-8" />
   ```

2. **Check database encoding:**
   ```sql
   -- In Supabase Studio
   SHOW server_encoding;
   -- Should return "UTF8"
   ```

3. **Verify API headers:**
   ```typescript
   // In Supabase client configuration
   const supabase = createClient(url, key, {
     db: {
       schema: 'public',
     },
     // Ensure UTF-8 encoding
   });
   ```

## Authentication and Authorization Issues

### Problem: Admin user creation fails

**Symptoms:**
```bash
pnpm run create-admin
Error: User already exists
Error: Failed to create admin user
```

**Solutions:**

1. **Check environment variables:**
   ```bash
   echo $SHOP_ADMIN_EMAIL
   echo $SHOP_ADMIN_PASSWORD
   # Should show your admin credentials
   ```

2. **Delete existing admin user:**
   ```sql
   -- In Supabase Studio SQL editor
   DELETE FROM auth.users WHERE email = 'admin@laptop-repair-shop.local';
   DELETE FROM user_profiles WHERE email = 'admin@laptop-repair-shop.local';
   ```

3. **Recreate admin user:**
   ```bash
   pnpm run create-admin
   ```

### Problem: Role-based access not working

**Symptoms:**
```
Error: Access denied for staff user
User can access admin-only features
```

**Solutions:**

1. **Check user profile creation:**
   ```sql
   -- Verify user_profiles table has data
   SELECT * FROM user_profiles;
   ```

2. **Verify role validation:**
   ```typescript
   import { useAuth } from '@/contexts/auth-context';

   const { isRole } = useAuth();
   const isShopOwner = isRole('shop_owner');
   ```

3. **Clear authentication cache:**
   ```typescript
   // In browser console
   localStorage.clear();
   // Then reload page
   ```

### Problem: Authentication state not persisting

**Symptoms:**
```
User gets logged out on page refresh
Authentication state resets randomly
```

**Solutions:**

1. **Check localStorage permissions:**
   ```javascript
   // In browser console
   try {
     localStorage.setItem('test', 'test');
     localStorage.removeItem('test');
     console.log('localStorage works');
   } catch (e) {
     console.error('localStorage blocked:', e);
   }
   ```

2. **Verify Supabase session persistence:**
   ```typescript
   // Check if session is being restored
   supabase.auth.onAuthStateChange((event, session) => {
     console.log('Auth state changed:', event, session);
   });
   ```

## Component Rendering Problems

### Problem: Vietnamese text not displaying correctly

**Symptoms:**
```
Text shows as "????" or empty
Vietnamese characters appear as boxes
```

**Solutions:**

1. **Check font support:**
   ```css
   /* Ensure fonts support Vietnamese characters */
   body {
     font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
   }
   ```

2. **Verify language attribute:**
   ```html
   <html lang="vi-VN">
   ```

3. **Test with Unicode:**
   ```typescript
   // Test Vietnamese characters
   const testText = "Nguyễn Văn An - Laptop sửa chữa";
   console.log(testText); // Should display correctly
   ```

### Problem: Components not updating with Vietnamese data

**Symptoms:**
```
Component shows old data after update
Vietnamese formatting not applied
Currency not displaying as VND
```

**Solutions:**

1. **Check React key props:**
   ```typescript
   // Ensure unique keys for Vietnamese data
   {customers.map(customer => (
     <CustomerRow key={customer.phone} customer={customer} />
   ))}
   ```

2. **Verify formatting functions:**
   ```typescript
   import { formatVND } from '@/lib/validation/currency-vietnamese';

   const amount = 150000;
   const formatted = formatVND(amount); // "150.000 ₫"
   ```

3. **Use Vietnamese locale in formatting:**
   ```typescript
   const date = new Date();
   const vietnameseDate = date.toLocaleDateString('vi-VN');
   ```

## Type Safety and TypeScript Errors

### Problem: TypeScript errors with Vietnamese types

**Symptoms:**
```
Error: Property 'customer_description' does not exist
Error: Type 'string' is not assignable to type 'never'
```

**Solutions:**

1. **Update TypeScript types:**
   ```bash
   # Restart TypeScript server in VSCode
   Ctrl+Shift+P > "TypeScript: Restart TS Server"
   ```

2. **Check type imports:**
   ```typescript
   import type { Customer, RepairTicket } from '@/lib/database-types';
   import { isCustomer } from '@/lib/type-guards';
   ```

3. **Use type guards:**
   ```typescript
   function processCustomer(data: unknown) {
     if (!isCustomer(data)) {
       throw new Error('Invalid customer data');
     }
     // TypeScript now knows data is Customer type
     console.log(data.phone); // Safe to access
   }
   ```

### Problem: Supabase type errors

**Symptoms:**
```
Error: Argument of type 'Database' is not assignable
Error: Property 'customer_description' is missing
```

**Solutions:**

1. **Regenerate database types:**
   ```bash
   pnpx supabase gen types typescript --local > src/lib/database-types.ts
   ```

2. **Check required fields:**
   ```typescript
   // Ensure all required fields are included
   const newTicket = {
     customer_phone: "0901234567",
     issue_description: "Technical diagnosis",
     customer_description: "Customer problem description", // Required!
     priority: "normal", // Required!
     // ... other fields
   };
   ```

## Testing Issues

### Problem: Vietnamese locale tests failing

**Symptoms:**
```
Error: Vietnamese phone validation failed in tests
Error: Currency formatting incorrect in test environment
```

**Solutions:**

1. **Setup Vietnamese test environment:**
   ```typescript
   import { VietnameseTestSetup } from 'tests/utils/vietnamese-locale-testing';

   beforeEach(() => {
     VietnameseTestSetup.createVietnameseTestEnvironment();
   });
   ```

2. **Use Vietnamese test data:**
   ```typescript
   import { VietnameseMockDataGenerator } from 'tests/utils/vietnamese-locale-testing';

   const customer = VietnameseMockDataGenerator.generateCustomer({
     phone: "0901234567",
     full_name: "Nguyễn Văn An"
   });
   ```

3. **Mock Vietnamese APIs:**
   ```typescript
   import { EnhancedSupabaseMock } from 'tests/utils/supabase-mock';

   const mockSupabase = new EnhancedSupabaseMock();
   mockSupabase.mockQueryResponse('customers', customer);
   ```

### Problem: Test timeouts with Supabase mocking

**Symptoms:**
```
Error: Test timeout (5000ms)
Error: Supabase client not responding
```

**Solutions:**

1. **Increase test timeout:**
   ```typescript
   // In test file
   describe('Vietnamese customer tests', () => {
     it('should create customer', async () => {
       // Test code
     }, 10000); // 10 second timeout
   });
   ```

2. **Reset mocks properly:**
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
     mockSupabase.reset();
   });
   ```

## Build and Deployment Problems

### Problem: Build fails with Vietnamese characters

**Symptoms:**
```
Error: Invalid character in string literal
Error: UTF-8 encoding issue during build
```

**Solutions:**

1. **Check build configuration:**
   ```typescript
   // In vite.config.ts
   export default defineConfig({
     // Ensure UTF-8 support
     build: {
       target: 'es2020',
       rollupOptions: {
         output: {
           charset: 'utf8'
         }
       }
     }
   });
   ```

2. **Verify source file encoding:**
   ```bash
   file -I src/components/vietnamese/*.tsx
   # Should show "charset=utf-8"
   ```

### Problem: Build size too large

**Symptoms:**
```
Warning: Build size exceeds recommended limit
Large chunk sizes detected
```

**Solutions:**

1. **Check bundle analyzer:**
   ```bash
   pnpm add -D rollup-plugin-visualizer
   # Add to vite.config.ts and analyze bundle
   ```

2. **Implement code splitting:**
   ```typescript
   // Lazy load heavy components
   const ReportChart = lazy(() => import('./ReportChart'));
   const PrintPreview = lazy(() => import('./PrintPreview'));
   ```

3. **Optimize Vietnamese assets:**
   ```typescript
   // Load Vietnamese locale data only when needed
   const vietnameseLocale = await import('./locales/vi-VN.json');
   ```

## Performance Issues

### Problem: Slow Vietnamese text rendering

**Symptoms:**
```
Lag when typing Vietnamese characters
Slow component updates with Vietnamese data
```

**Solutions:**

1. **Optimize Vietnamese text processing:**
   ```typescript
   // Memoize expensive Vietnamese operations
   const formattedPhone = useMemo(() =>
     formatPhoneForDisplay(customer.phone),
     [customer.phone]
   );
   ```

2. **Use virtualization for large lists:**
   ```typescript
   import { VirtualizedList } from '@/components/data/VirtualizedList';

   <VirtualizedList
     items={vietnameseCustomers}
     itemHeight={60}
     containerHeight={400}
     renderItem={(customer) => <CustomerRow customer={customer} />}
   />
   ```

### Problem: Memory leaks with Vietnamese data

**Symptoms:**
```
Increasing memory usage over time
Browser becomes unresponsive with Vietnamese text
```

**Solutions:**

1. **Clean up event listeners:**
   ```typescript
   useEffect(() => {
     const handleVietnameseInput = (e) => {
       // Process Vietnamese input
     };

     document.addEventListener('input', handleVietnameseInput);

     return () => {
       document.removeEventListener('input', handleVietnameseInput);
     };
   }, []);
   ```

2. **Optimize Vietnamese string operations:**
   ```typescript
   // Avoid creating new strings unnecessarily
   const normalizeVietnameseText = useCallback((text: string) => {
     return text.normalize('NFC'); // Canonical form
   }, []);
   ```

## Vietnamese Locale Issues

### Problem: Date formatting incorrect

**Symptoms:**
```
Dates show as MM/DD/YYYY instead of DD/MM/YYYY
Time zone incorrect for Vietnam
```

**Solutions:**

1. **Use Vietnamese date formatting:**
   ```typescript
   const vietnameseDate = new Date().toLocaleDateString('vi-VN', {
     day: '2-digit',
     month: '2-digit',
     year: 'numeric',
     timeZone: 'Asia/Ho_Chi_Minh'
   });
   ```

2. **Set up Vietnamese locale globally:**
   ```typescript
   import { VietnameseTestSetup } from '@/lib/vietnamese/locale-setup';

   VietnameseTestSetup.setupVietnameseTimezone();
   ```

### Problem: Currency symbol not displaying

**Symptoms:**
```
Shows "$150" instead of "150.000 ₫"
Currency formatting uses wrong locale
```

**Solutions:**

1. **Use Vietnamese currency formatter:**
   ```typescript
   const amount = 150000;
   const vndFormatted = new Intl.NumberFormat('vi-VN', {
     style: 'currency',
     currency: 'VND'
   }).format(amount);
   ```

2. **Check font support for ₫ symbol:**
   ```css
   /* Ensure fonts support Vietnamese dong symbol */
   .currency {
     font-family: 'Inter', 'Arial', sans-serif;
   }
   ```

## Getting Help

### Development Tools

1. **Browser Developer Tools:**
   - Check Console for JavaScript errors
   - Network tab for API call failures
   - Application tab for localStorage issues

2. **VSCode Extensions:**
   - TypeScript and JavaScript Language Features
   - Error Lens (shows errors inline)
   - Vietnamese Language Pack

3. **Database Tools:**
   - Supabase Studio: http://127.0.0.1:54323
   - Check logs in Docker Desktop

### Debugging Vietnamese-Specific Issues

1. **Test Vietnamese characters:**
   ```javascript
   // In browser console
   console.log("Nguyễn Văn An");
   console.log("150.000 ₫");
   // Should display correctly
   ```

2. **Check Unicode normalization:**
   ```javascript
   const text1 = "Nguyễn"; // Composed
   const text2 = "Nguye\u0303n"; // Decomposed
   console.log(text1 === text2); // May be false
   console.log(text1.normalize() === text2.normalize()); // Should be true
   ```

3. **Validate Vietnamese business logic:**
   ```typescript
   import {
     isValidVietnamesePhone,
     validateRepairPrice
   } from '@/lib/type-guards';

   // Test phone validation
   console.log(isValidVietnamesePhone("0901234567")); // true

   // Test currency validation
   console.log(validateRepairPrice(150000)); // { isValid: true }
   ```

### Common Error Messages

| Error Message | Likely Cause | Quick Fix |
|---------------|--------------|-----------|
| "Số điện thoại không hợp lệ" | Invalid Vietnamese phone format | Use 10-digit format starting with 0 |
| "Không thể kết nối cơ sở dữ liệu" | Supabase not running | Run `pnpm run db:start` |
| "Type 'unknown' is not assignable" | Missing type guard | Use `isCustomer()` or similar type guard |
| "customer_description is required" | Missing required field | Include both `issue_description` and `customer_description` |
| "Port already in use" | Service already running | Kill process or use different port |

This troubleshooting guide covers the most common issues developers encounter when working with the Vietnamese Laptop Repair Shop Management System. Keep this guide updated as new issues are discovered and resolved.