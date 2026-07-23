import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { Dashboard } from './components/Dashboard'
import { InvoiceList } from './components/InvoiceList'
import { InvoiceEditor } from './components/InvoiceEditor'
import { CustomersView } from './components/CustomersView'
import { ProductsView } from './components/ProductsView'
import { SettingsView } from './components/SettingsView'
import { LoginPage } from './components/LoginPage'
import { RegisterPage } from './components/RegisterPage'

export type ViewType = 'dashboard' | 'invoices' | 'invoice-editor' | 'customers' | 'products' | 'settings' | 'login' | 'register'

export type UserRole = 'Admin' | 'Accountant' | 'Viewer'

export interface Tenant {
  id: string
  name: string
  plan: string
  initials: string
  color: string
}

export interface AppUser {
  id: string
  name: string
  email: string
  role: UserRole
  initials: string
}

export const TENANTS: Tenant[] = [
  { id: '1', name: 'Acme Corp', plan: 'Pro', initials: 'AC', color: '#6366f1' },
  { id: '2', name: 'TechStart Inc', plan: 'Starter', initials: 'TS', color: '#8b5cf6' },
  { id: '3', name: 'Global Trade Ltd', plan: 'Enterprise', initials: 'GT', color: '#0ea5e9' },
]

export const APP_USERS: Record<UserRole, AppUser> = {
  Admin: { id: '1', name: 'Alex Morgan', email: 'alex@acme.com', role: 'Admin', initials: 'AM' },
  Accountant: { id: '2', name: 'Jamie Lee', email: 'jamie@acme.com', role: 'Accountant', initials: 'JL' },
  Viewer: { id: '3', name: 'Sam Chen', email: 'sam@acme.com', role: 'Viewer', initials: 'SC' },
}

export const CUSTOMERS = [
  { id: '1', name: 'Stripe Inc', email: 'billing@stripe.com', phone: '+1 415 123 4567', totalInvoiced: 45200, outstanding: 0, country: 'USA' },
  { id: '2', name: 'Vercel Corp', email: 'finance@vercel.com', phone: '+1 650 234 5678', totalInvoiced: 28750, outstanding: 5500, country: 'USA' },
  { id: '3', name: 'Linear Labs', email: 'accounts@linear.app', phone: '+1 628 345 6789', totalInvoiced: 18300, outstanding: 3200, country: 'Canada' },
  { id: '4', name: 'Notion HQ', email: 'billing@notion.so', phone: '+1 415 456 7890', totalInvoiced: 32100, outstanding: 8900, country: 'USA' },
  { id: '5', name: 'Figma Corp', email: 'ap@figma.com', phone: '+1 415 567 8901', totalInvoiced: 52400, outstanding: 0, country: 'USA' },
  { id: '6', name: 'Loom Tech', email: 'finance@loom.com', phone: '+44 20 1234 5678', totalInvoiced: 14800, outstanding: 0, country: 'UK' },
  { id: '7', name: 'Webflow Inc', email: 'billing@webflow.com', phone: '+1 888 987 6543', totalInvoiced: 9600, outstanding: 0, country: 'USA' },
]

export const PRODUCTS = [
  { id: '1', name: 'Web Design Services', description: 'Full-stack UI/UX and web design', price: 1500, unit: 'project', taxRate: 10 },
  { id: '2', name: 'Monthly Retainer', description: 'Ongoing monthly support', price: 3000, unit: 'month', taxRate: 10 },
  { id: '3', name: 'SEO Optimization', description: 'Full SEO audit and optimization', price: 800, unit: 'month', taxRate: 10 },
  { id: '4', name: 'Development Hours', description: 'Custom development work', price: 150, unit: 'hour', taxRate: 10 },
  { id: '5', name: 'Consulting Session', description: 'Strategy and consulting calls', price: 350, unit: 'hour', taxRate: 0 },
  { id: '6', name: 'Brand Identity Package', description: 'Logo, colors, typography system', price: 2200, unit: 'project', taxRate: 10 },
]

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue'

export interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
}

export interface Invoice {
  id: string
  number: string
  customerId: string
  customerName: string
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  items: LineItem[]
  notes: string
}

export const INVOICES: Invoice[] = [
  {
    id: '1', number: 'INV-2024-001', customerId: '5', customerName: 'Figma Corp',
    status: 'Paid', issueDate: '2024-01-05', dueDate: '2024-02-05',
    items: [
      { id: '1', description: 'Web Design Services', quantity: 4, unitPrice: 1500, taxRate: 10 },
      { id: '2', description: 'Brand Identity Package', quantity: 1, unitPrice: 2200, taxRate: 10 },
    ], notes: 'Thank you for your business!'
  },
  {
    id: '2', number: 'INV-2024-002', customerId: '2', customerName: 'Vercel Corp',
    status: 'Sent', issueDate: '2024-01-15', dueDate: '2024-02-15',
    items: [
      { id: '1', description: 'Monthly Retainer', quantity: 1, unitPrice: 3000, taxRate: 10 },
      { id: '2', description: 'Development Hours', quantity: 16, unitPrice: 150, taxRate: 10 },
    ], notes: ''
  },
  {
    id: '3', number: 'INV-2023-098', customerId: '3', customerName: 'Linear Labs',
    status: 'Overdue', issueDate: '2023-12-01', dueDate: '2024-01-01',
    items: [
      { id: '1', description: 'SEO Optimization', quantity: 4, unitPrice: 800, taxRate: 10 },
    ], notes: 'Payment is overdue.'
  },
  {
    id: '4', number: 'INV-2024-003', customerId: '4', customerName: 'Notion HQ',
    status: 'Draft', issueDate: '2024-01-20', dueDate: '2024-02-20',
    items: [
      { id: '1', description: 'Consulting Session', quantity: 8, unitPrice: 350, taxRate: 0 },
      { id: '2', description: 'Development Hours', quantity: 20, unitPrice: 150, taxRate: 10 },
    ], notes: 'Draft for review before sending.'
  },
  {
    id: '5', number: 'INV-2024-004', customerId: '1', customerName: 'Stripe Inc',
    status: 'Paid', issueDate: '2024-01-10', dueDate: '2024-02-10',
    items: [
      { id: '1', description: 'Monthly Retainer', quantity: 2, unitPrice: 3000, taxRate: 10 },
      { id: '2', description: 'Brand Identity Package', quantity: 1, unitPrice: 2200, taxRate: 10 },
    ], notes: ''
  },
  {
    id: '6', number: 'INV-2024-005', customerId: '6', customerName: 'Loom Tech',
    status: 'Sent', issueDate: '2024-01-22', dueDate: '2024-02-22',
    items: [
      { id: '1', description: 'Web Design Services', quantity: 1, unitPrice: 1500, taxRate: 10 },
      { id: '2', description: 'SEO Optimization', quantity: 2, unitPrice: 800, taxRate: 10 },
    ], notes: ''
  },
]

export default function App() {
  const [isDark, setIsDark] = useState(false)
  const [currentView, setCurrentView] = useState<ViewType>('login')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentTenant, setCurrentTenant] = useState<Tenant>(TENANTS[0])
  const [currentUser, setCurrentUser] = useState<AppUser>(APP_USERS.Admin)
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const handleCreateInvoice = () => {
    setEditingInvoiceId('new')
    setCurrentView('invoice-editor')
  }

  const handleEditInvoice = (id: string) => {
    setEditingInvoiceId(id)
    setCurrentView('invoice-editor')
  }

  const handleBackToInvoices = () => {
    setCurrentView('invoices')
    setEditingInvoiceId(null)
  }

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view)
    setMobileSidebarOpen(false)
    if (view !== 'invoice-editor') setEditingInvoiceId(null)
  }

  const handleLogin = () => {
    setIsAuthenticated(true)
    setCurrentView('dashboard')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentView('login')
  }

  const bgStyle = {
    background: isDark
      ? 'linear-gradient(135deg, #0a0a1a 0%, #0f1729 50%, #110f2a 100%)'
      : 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #eff6ff 100%)',
  }

  if (!isAuthenticated) {
    return (
      <div className={isDark ? 'dark' : ''}>
        <div className="flex h-screen overflow-hidden transition-colors duration-500" style={bgStyle}>
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-48 -right-48 w-[500px] h-[500px] rounded-full blur-3xl transition-colors duration-500" style={{ background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(139,92,246,0.15)' }} />
            <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full blur-3xl transition-colors duration-500" style={{ background: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(99,102,241,0.12)' }} />
          </div>
          <AnimatePresence mode="wait">
            {currentView === 'login' && (
              <motion.div key="login" className="flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <LoginPage isDark={isDark} onDarkToggle={() => setIsDark(!isDark)} onLogin={handleLogin} onRegister={() => setCurrentView('register')} />
              </motion.div>
            )}
            {currentView === 'register' && (
              <motion.div key="register" className="flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <RegisterPage isDark={isDark} onDarkToggle={() => setIsDark(!isDark)} onRegister={handleLogin} onLogin={() => setCurrentView('login')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <div
        className="flex h-screen overflow-hidden transition-colors duration-500"
        style={bgStyle}
      >
        {/* Background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div
            className="absolute -top-48 -right-48 w-[500px] h-[500px] rounded-full blur-3xl transition-colors duration-500"
            style={{ background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(139,92,246,0.15)' }}
          />
          <div
            className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full blur-3xl transition-colors duration-500"
            style={{ background: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(99,102,241,0.12)' }}
          />
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-3xl opacity-50 transition-colors duration-500"
            style={{ background: isDark ? 'rgba(14,165,233,0.06)' : 'rgba(224,231,255,0.8)' }}
          />
        </div>

        {/* Mobile overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <Sidebar
          isDark={isDark}
          currentView={currentView}
          onViewChange={handleViewChange}
          currentTenant={currentTenant}
          onTenantChange={setCurrentTenant}
          currentUser={currentUser}
          onUserChange={setCurrentUser}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onLogout={handleLogout}
        />

        {/* Main content */}
        <div
          className="flex-1 flex flex-col h-screen overflow-hidden z-10 transition-all duration-300"
          style={{ marginLeft: sidebarCollapsed ? '72px' : '256px' }}
        >
          <TopBar
            isDark={isDark}
            onDarkToggle={() => setIsDark(!isDark)}
            currentView={currentView}
            currentUser={currentUser}
            notificationCount={3}
            onCreateInvoice={handleCreateInvoice}
            onMobileMenuToggle={() => setMobileSidebarOpen(true)}
          />

          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <AnimatePresence mode="wait">
              {currentView === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <Dashboard isDark={isDark} currentUser={currentUser} onNavigate={handleViewChange} onCreateInvoice={handleCreateInvoice} />
                </motion.div>
              )}
              {currentView === 'invoices' && (
                <motion.div
                  key="invoices"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <InvoiceList isDark={isDark} currentUser={currentUser} onEdit={handleEditInvoice} onCreate={handleCreateInvoice} />
                </motion.div>
              )}
              {currentView === 'invoice-editor' && (
                <motion.div
                  key="invoice-editor"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <InvoiceEditor isDark={isDark} invoiceId={editingInvoiceId} currentUser={currentUser} onBack={handleBackToInvoices} />
                </motion.div>
              )}
              {currentView === 'customers' && (
                <motion.div
                  key="customers"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <CustomersView isDark={isDark} currentUser={currentUser} />
                </motion.div>
              )}
              {currentView === 'products' && (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <ProductsView isDark={isDark} currentUser={currentUser} />
                </motion.div>
              )}
              {currentView === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <SettingsView isDark={isDark} currentUser={currentUser} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}
