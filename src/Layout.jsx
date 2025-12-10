import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { createPageUrl } from '@/utils'
import { LayoutDashboard, Plus, CheckSquare, FileText, Settings, Moon, Sun, LogOut } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { ThemeProvider, useTheme } from '@/components/shared/ThemeContext'

const navigationItems = [
  { title: 'Dashboard', url: createPageUrl('Dashboard'), icon: LayoutDashboard },
  { title: 'Registros', url: createPageUrl('Registros'), icon: Plus },
  { title: 'Revisão', url: createPageUrl('Revisao'), icon: CheckSquare },
  { title: 'Resumo', url: createPageUrl('Resumo'), icon: FileText },
  { title: 'Corrigir Registros', url: createPageUrl('CorrigirRegistros'), icon: Settings },
]

function LayoutContent({ children }) {
  const location = useLocation()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()

  return (
    <div className={`min-h-screen flex w-full transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar className={`border-r transition-colors duration-300 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <SidebarHeader className={`border-b p-4 flex justify-center items-center transition-colors duration-300 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/58237d489_logisticareversa.png" alt="Logotipo" className="h-16" />
        </SidebarHeader>
        <SidebarContent className="p-4">
          <SidebarGroup>
            <SidebarGroupLabel className={`text-xs font-semibold uppercase tracking-wider px-2 py-3 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>Menu Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`group transition-all duration-200 rounded-xl ${
                        location.pathname === item.url
                          ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
                          : isDarkMode
                            ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-green-50'
                      }`}
                    >
                      <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                        <item.icon className={`w-5 h-5 ${location.pathname === item.url ? 'text-white' : isDarkMode ? 'text-gray-400 group-hover:text-green-400' : 'text-gray-400 group-hover:text-green-600'}`} />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className={`border-t p-6 transition-colors duration-300 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br rounded-full flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'from-green-800 to-green-900' : 'from-green-100 to-green-200'}`}>
                <span className={`font-semibold text-sm transition-colors duration-300 ${isDarkMode ? 'text-green-100' : 'text-green-700'}`}>U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Usuário</p>
                <p className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sistema GDM</p>
              </div>
            </div>
            <Button onClick={toggleDarkMode} size="sm" variant="ghost" className={`p-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}>
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
          <Button
            onClick={() => { localStorage.removeItem('auth'); navigate('/Login', { replace: true }) }}
            size="sm"
            variant="outline"
            className={`w-full flex items-center justify-center gap-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'border-gray-700 text-red-300 hover:bg-gray-700' : 'border-gray-200 text-red-600 hover:bg-gray-100'}`}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 flex flex-col">
        <header className={`border-b px-4 py-2 lg:hidden transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-4">
            <SidebarTrigger className={`p-2 rounded-lg transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`} />
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/58237d489_logisticareversa.png" alt="Logotipo" className="h-10" />
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function Layout({ children }) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <LayoutContent>{children}</LayoutContent>
      </SidebarProvider>
    </ThemeProvider>
  )
}
