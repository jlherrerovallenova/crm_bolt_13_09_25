import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { Dashboard } from '@/pages/Dashboard'
import { Viviendas } from '@/pages/Viviendas'
import { Importar } from '@/pages/Importar'
import { Historial } from '@/pages/Historial'
import { Toaster } from '@/components/ui/toaster'

function AppContent() {
  const { user, profile, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return <LoginForm />
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'viviendas':
        return <Viviendas />
      case 'importar':
        return <Importar />
      case 'historial':
        return <Historial />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="pb-8">
        {renderContent()}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  )
}

export default App