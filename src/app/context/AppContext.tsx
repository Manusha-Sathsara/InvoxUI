import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from 'react'
import { useAuthContext, type AuthStateInterface } from '@asgardeo/auth-react'
import { TENANTS, APP_USERS } from '../App'
import type { Tenant, AppUser } from '../App'
import { getSavedAsgardeoSettings } from '../config/asgardeoConfig'

interface AppContextValue {
  isDark: boolean
  toggleDark: () => void
  isAuthenticated: boolean
  isLoadingAuth: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  currentUser: AppUser
  setCurrentUser: (u: AppUser) => void
  currentTenant: Tenant
  setCurrentTenant: (t: Tenant) => void
  asgardeoState: AuthStateInterface
  hasAsgardeoConfig: boolean
  getAccessToken: () => Promise<string>
  httpRequest: (config: any) => Promise<any>
}

const AppContext = createContext<AppContextValue>(null!)

export function AppProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false)
  const [currentTenant, setCurrentTenant] = useState<Tenant>(TENANTS[0])
  const [demoAuthenticated, setDemoAuthenticated] = useState(false)
  const [demoUser, setDemoUser] = useState<AppUser>(APP_USERS.Admin)

  const { state: asgardeoState, signIn, signOut, getAccessToken, httpRequest } = useAuthContext()
  const settings = getSavedAsgardeoSettings()
  const hasAsgardeoConfig = Boolean(settings.clientId && settings.clientId !== 'PLACEHOLDER_CLIENT_ID')

  const isAuthenticated = asgardeoState?.isAuthenticated || demoAuthenticated
  const isLoadingAuth = asgardeoState?.isLoading ?? false

  const currentUser = useMemo<AppUser>(() => {
    if (asgardeoState?.isAuthenticated) {
      const name = asgardeoState.displayName || asgardeoState.username || 'Asgardeo User'
      const email = asgardeoState.email || asgardeoState.username || 'user@asgardeo.io'
      const initials = name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'AU'

      return {
        id: asgardeoState.sub || 'asgardeo-user',
        name,
        email,
        role: 'Admin',
        initials,
      }
    }
    return demoUser
  }, [asgardeoState, demoUser])

  const login = async () => {
    if (hasAsgardeoConfig) {
      try {
        await signIn()
      } catch (err) {
        console.error('Asgardeo sign-in error:', err)
        setDemoAuthenticated(true)
      }
    } else {
      setDemoAuthenticated(true)
    }
  }

  const logout = async () => {
    setDemoAuthenticated(false)
    if (asgardeoState?.isAuthenticated) {
      try {
        await signOut()
      } catch (err) {
        console.error('Asgardeo sign-out error:', err)
      }
    }
  }

  return (
    <AppContext.Provider
      value={{
        isDark,
        toggleDark: () => setIsDark(d => !d),
        isAuthenticated,
        isLoadingAuth,
        login,
        logout,
        currentUser,
        setCurrentUser: (u: AppUser) => setDemoUser(u),
        currentTenant,
        setCurrentTenant,
        asgardeoState,
        hasAsgardeoConfig,
        getAccessToken: getAccessToken || (async () => 'demo_access_token'),
        httpRequest: httpRequest || (async () => ({})),
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}

