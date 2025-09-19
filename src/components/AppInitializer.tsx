import { useAppInitialization } from '../hooks/useAppInitialization'

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const { isInitialized, isInitializing, error, adminCreated, adminCredentials } = useAppInitialization()

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              🔧 Initializing Laptop Repair Shop
            </h2>
            <p className="text-gray-600">
              Setting up your repair shop management system...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-red-600 text-4xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Initialization Failed
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isInitialized && adminCreated && adminCredentials) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Show admin credentials banner on first setup */}
        <div className="bg-green-600 text-white p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🎉</div>
                <div>
                  <h3 className="font-semibold">Laptop Repair Shop Ready!</h3>
                  <p className="text-sm opacity-90">
                    Shop owner account created. You can now log in with your admin credentials.
                  </p>
                </div>
              </div>
              <div className="bg-green-700 rounded-lg p-3 text-sm">
                <div className="font-mono">
                  <div><strong>Email:</strong> {adminCredentials.email}</div>
                  <div><strong>Password:</strong> {adminCredentials.password}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {children}
      </div>
    )
  }

  return <>{children}</>
}