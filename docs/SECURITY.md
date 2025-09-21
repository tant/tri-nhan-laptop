# 🔐 Security Management Guide
# Hệ thống Quản lý Sửa chữa Laptop

## 📋 Overview / Tổng quan

This document outlines security best practices and secret management for the Vietnamese Laptop Repair Shop management system.

Tài liệu này mô tả các thực hành bảo mật tốt nhất và quản lý bí mật cho hệ thống quản lý cửa hàng sửa chữa laptop.

## 🚨 Current Security Status

### ✅ **Working (Development)**
- JWT authentication through Kong gateway
- Database schema with proper RLS policies
- Anonymous access for customer portal
- Environment variable consolidation

### ⚠️ **Needs Attention (Production)**
- Demo/weak secrets currently in use
- No production environment configuration
- JWT tokens use Supabase demo values
- Admin credentials are predictable

## 🔑 Secret Categories

### 1. **Database Secrets**
```bash
POSTGRES_PASSWORD=          # Database master password
SUPABASE_AUTH_ADMIN_PASSWORD=   # Auth service database user
SUPABASE_STORAGE_ADMIN_PASSWORD= # Storage service database user
AUTHENTICATOR_PASSWORD=     # API database user
```

### 2. **JWT Configuration**
```bash
JWT_SECRET=                 # Master JWT signing secret
ANON_KEY=                  # Public API access token
SERVICE_ROLE_KEY=          # Admin/service access token
```

### 3. **Application Secrets**
```bash
SECRET_KEY_BASE=           # Base encryption key
SHOP_ADMIN_PASSWORD=       # Shop owner/manager password
```

### 4. **External Services**
```bash
SMTP_PASS=                 # Email service password
```

## 🛡️ Security Best Practices

### 1. **Secret Generation**
```bash
# Database passwords (32 bytes)
openssl rand -base64 32

# JWT secrets (64 bytes minimum)
openssl rand -base64 64

# Admin passwords (strong + memorable)
# Use a password manager to generate
```

### 2. **Environment Separation**
- **Development**: Use current `.env` (demo secrets OK)
- **Staging**: Use `.env.staging` (production-like secrets)
- **Production**: Use `.env.production` (secure secrets only)

### 3. **JWT Token Management**
```bash
# Generate new JWT tokens with your secret:
# 1. Use https://jwt.io/
# 2. Or Supabase CLI: supabase gen keys

# Payload for ANON_KEY:
{
  "iss": "your-laptop-repair-shop",
  "role": "anon",
  "exp": 2147483647
}

# Payload for SERVICE_ROLE_KEY:
{
  "iss": "your-laptop-repair-shop",
  "role": "service_role",
  "exp": 2147483647
}
```

## 📁 File Structure

```
/home/tan/work/try-vite/
├── .env                          # Current development (demo secrets)
├── .env.production.template      # Production template (secure)
├── .env.local                    # Local overrides (gitignored)
├── docs/
│   └── SECURITY.md              # This file
└── scripts/
    └── generate-secrets.sh      # Secret generation script
```

## 🔧 Production Deployment Checklist

### Before Going Live:
- [ ] Generate all production secrets using OpenSSL
- [ ] Create new JWT tokens with production JWT_SECRET
- [ ] Update all domain references (localhost → your-domain.com)
- [ ] Configure real SMTP credentials
- [ ] Test authentication flows
- [ ] Backup configuration securely
- [ ] Remove/disable demo admin accounts
- [ ] Enable audit logging
- [ ] Set up SSL certificates
- [ ] Configure firewall rules

### Security Validation:
- [ ] No demo/weak passwords in production
- [ ] JWT tokens signed with production secret
- [ ] Database accessible only to application
- [ ] HTTPS enforced for all connections
- [ ] Admin panel restricted to authorized IPs
- [ ] Regular security backups configured

## 🚀 Quick Deployment

### 1. **Generate Production Secrets**
```bash
# Run the secret generation script
./scripts/generate-secrets.sh

# Or manually:
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32)"
echo "JWT_SECRET=$(openssl rand -base64 64)"
echo "SECRET_KEY_BASE=$(openssl rand -base64 64)"
```

### 2. **Create Production Environment**
```bash
# Copy template
cp .env.production.template .env.production

# Fill in your values
nano .env.production

# Test with production environment
make up ENVIRONMENT=production
```

### 3. **Generate JWT Tokens**
Use your production `JWT_SECRET` to create new tokens at https://jwt.io/

## 📞 Contact / Liên hệ

For security concerns or questions about this setup:
- Check the project documentation in `/docs/`
- Review the code in the repository
- Follow Vietnamese cybersecurity best practices

Đối với các vấn đề bảo mật hoặc câu hỏi về cài đặt này:
- Kiểm tra tài liệu dự án trong `/docs/`
- Xem lại mã nguồn trong kho lưu trữ
- Tuân theo các thực hành bảo mật tốt nhất của Việt Nam

## 📚 Additional Resources

- [OWASP Security Guidelines](https://owasp.org/)
- [Supabase Security Documentation](https://supabase.com/docs/guides/auth)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)

---

**⚠️ Remember: Never commit real production secrets to version control!**

**⚠️ Lưu ý: Không bao giờ commit các bí mật production thật vào version control!**