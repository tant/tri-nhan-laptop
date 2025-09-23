/**
 * Vietnamese Test Helpers for Phase 1 Testing
 * Utilities for testing Vietnamese localization, character handling, and business logic
 */

// Vietnamese test data
export const vietnameseTestData = {
  customerNames: [
    'Nguyễn Văn An',
    'Trần Thị Bình',
    'Lê Hoàng Cường',
    'Phạm Minh Đức',
    'Hoàng Thị Linh',
    'Vũ Đình Nam',
    'Đặng Thu Hà',
    'Bùi Quốc Việt'
  ],

  phoneNumbers: [
    '0901234567',
    '0812345678',
    '0987654321',
    '0123456789',
    '0934567890'
  ],

  addresses: [
    '251 Vườn Lài, Phường An Phú Đông, Quận 12, TP.HCM',
    '123 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM',
    '456 Lê Văn Sỹ, Phường 14, Quận 3, TP.HCM'
  ],

  repairDescriptions: [
    'Máy tính bị chậm, cần nâng cấp RAM',
    'Màn hình laptop bị vỡ, cần thay thế',
    'Bàn phím không hoạt động một số phím',
    'Pin laptop không sạc được',
    'Quạt tản nhiệt kêu to, máy nóng'
  ],

  errorMessages: {
    invalidPhone: 'Số điện thoại không đúng định dạng',
    invalidTicket: 'Số phiếu không đúng định dạng',
    notFound: 'Không tìm thấy phiếu sửa chữa',
    unauthorized: 'Bạn không có quyền truy cập',
    networkError: 'Lỗi kết nối mạng'
  },

  successMessages: {
    loginSuccess: 'Đăng nhập thành công',
    createSuccess: 'Tạo mới thành công',
    updateSuccess: 'Cập nhật thành công',
    deleteSuccess: 'Xóa thành công'
  }
}

// Vietnamese character validation
export const vietnameseCharacters = {
  vowels: 'aăâeêiouưuyoôơ',
  vowelsWithTones: 'àáạảãăằắặẳẵâầấậẩẫèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ',
  consonants: 'bcdđfghjklmnpqrstvwxz',
  specialCombinations: ['ch', 'gh', 'gi', 'kh', 'ng', 'nh', 'ph', 'th', 'tr']
}

// Ticket code generation patterns
export const ticketCodePatterns = {
  lrpFormat: /^LRP-\d{4}-\d{6}$/,
  msFormat: /^MS\d{3}$/,
  tkFormat: /^TK\d{3}$/
}

// Vietnamese phone number validation
export const phoneValidation = {
  validate: (phone: string): boolean => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    return /^(09|08|07|05|03)\d{8}$/.test(cleanPhone)
  },

  format: (phone: string): string => {
    const clean = phone.replace(/[\s\-\(\)]/g, '')
    if (clean.length === 10) {
      return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`
    }
    return phone
  }
}

// Vietnamese text validation helpers
export const vietnameseTextValidation = {
  hasVietnameseCharacters: (text: string): boolean => {
    return /[àáạảãăằắặẳẵâầấậẩẫèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/.test(text)
  },

  isValidVietnameseName: (name: string): boolean => {
    // Vietnamese names can contain letters, spaces, and Vietnamese diacritics
    return /^[a-zA-ZàáạảãăằắặẳẵâầấậẩẫèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ\s]+$/.test(name)
  },

  removeVietnameseTones: (text: string): string => {
    const toneMap: Record<string, string> = {
      'àáạảãăằắặẳẵâầấậẩẫ': 'a',
      'èéẹẻẽêềếệểễ': 'e',
      'ìíịỉĩ': 'i',
      'òóọỏõôồốộổỗơờớợởỡ': 'o',
      'ùúụủũưừứựửữ': 'u',
      'ỳýỵỷỹ': 'y',
      'đ': 'd',
      'Đ': 'D'
    }

    let result = text
    for (const [tones, base] of Object.entries(toneMap)) {
      for (const char of tones) {
        result = result.replace(new RegExp(char, 'g'), base)
      }
    }
    return result
  }
}

// Database test utilities
export const databaseTestUtils = {
  createTestCustomer: () => ({
    id: crypto.randomUUID(),
    phone: vietnameseTestData.phoneNumbers[0],
    name: vietnameseTestData.customerNames[0],
    address: vietnameseTestData.addresses[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }),

  createTestRepairTicket: (customerId: string) => ({
    id: crypto.randomUUID(),
    ticket_code: `LRP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
    customer_id: customerId,
    device_info: 'Laptop Dell Inspiron 15',
    issue_description: vietnameseTestData.repairDescriptions[0],
    status: 'RECEIVED',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
}

// Environment validation
export const environmentValidation = {
  isTestEnvironment: () => process.env.NODE_ENV === 'test',
  hasRequiredEnvVars: () => {
    const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']
    return required.every(key => process.env[key])
  }
}

// Async utilities for testing
export const asyncTestUtils = {
  waitForElement: async (selector: string, timeout = 5000): Promise<Element | null> => {
    return new Promise((resolve) => {
      const element = document.querySelector(selector)
      if (element) {
        resolve(element)
        return
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector)
        if (element) {
          observer.disconnect()
          resolve(element)
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })

      setTimeout(() => {
        observer.disconnect()
        resolve(null)
      }, timeout)
    })
  },

  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
}