import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, Home, Upload, History, Building } from 'lucide-react'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="border-b bg-white">
      <div className="container mx-auto px-4">
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="h-12 w-full justify-start bg-transparent p-0">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center space-x-2 h-12 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="viviendas" 
              className="flex items-center space-x-2 h-12 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
            >
              <Building className="h-4 w-4" />
              <span>Viviendas</span>
            </TabsTrigger>
            <TabsTrigger 
              value="importar" 
              className="flex items-center space-x-2 h-12 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
            >
              <Upload className="h-4 w-4" />
              <span>Importar</span>
            </TabsTrigger>
            <TabsTrigger 
              value="historial" 
              className="flex items-center space-x-2 h-12 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
            >
              <History className="h-4 w-4" />
              <span>Historial</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}