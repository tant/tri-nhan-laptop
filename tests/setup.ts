import { beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock environment variables
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          maybeSingle: vi.fn(),
        })),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      })),
    })),
  },
  createClient: vi.fn(),
}))

// Mock Next themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useRouter: () => ({
    navigate: vi.fn(),
  }),
  Link: ({ children, ...props }: any) => {
    return { type: 'a', props: { ...props, children } }
  },
  createFileRoute: () => ({
    component: () => null,
  }),
}))

// Vietnamese locale setup for tests
Object.defineProperty(window, 'navigator', {
  value: {
    language: 'vi-VN',
    languages: ['vi-VN', 'vi', 'en-US', 'en'],
  },
  writable: true,
})

// Mock Intl for Vietnamese formatting
global.Intl = {
  ...Intl,
  DateTimeFormat: vi.fn(() => ({
    format: vi.fn(() => '23/09/2025'),
    formatToParts: vi.fn(),
  })),
  NumberFormat: vi.fn(() => ({
    format: vi.fn((num) => num.toLocaleString('vi-VN')),
  })),
} as any

// Cleanup after each test
beforeEach(() => {
  cleanup()
  vi.clearAllMocks()
})