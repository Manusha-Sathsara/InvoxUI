import type { AuthReactConfig } from '@asgardeo/auth-react'

export interface AsgardeoSettings {
  clientId: string
  baseUrl: string
  signInRedirectURL: string
  signOutRedirectURL: string
}

export const getSavedAsgardeoSettings = (): AsgardeoSettings => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
  
  const envClientId = import.meta.env.VITE_ASGARDEO_CLIENT_ID || ''
  const envBaseUrl = import.meta.env.VITE_ASGARDEO_BASE_URL || ''
  const envSignInRedirect = import.meta.env.VITE_ASGARDEO_SIGN_IN_REDIRECT_URL || origin
  const envSignOutRedirect = import.meta.env.VITE_ASGARDEO_SIGN_OUT_REDIRECT_URL || origin

  const localClientId = typeof window !== 'undefined' ? localStorage.getItem('invox_asgardeo_client_id') || '' : ''
  const localBaseUrl = typeof window !== 'undefined' ? localStorage.getItem('invox_asgardeo_base_url') || '' : ''

  return {
    clientId: localClientId || envClientId || 'ngkzdr_MqLyTWSyjV6kh4xyB29wa',
    baseUrl: localBaseUrl || envBaseUrl || 'https://api.asgardeo.io/t/invox',
    signInRedirectURL: envSignInRedirect,
    signOutRedirectURL: envSignOutRedirect,
  }
}

export const saveAsgardeoSettings = (clientId: string, baseUrl: string) => {
  if (typeof window !== 'undefined') {
    if (clientId) localStorage.setItem('invox_asgardeo_client_id', clientId.trim())
    else localStorage.removeItem('invox_asgardeo_client_id')

    if (baseUrl) localStorage.setItem('invox_asgardeo_base_url', baseUrl.trim())
    else localStorage.removeItem('invox_asgardeo_base_url')
  }
}

export const getAsgardeoConfig = (): AuthReactConfig => {
  const settings = getSavedAsgardeoSettings()
  return {
    clientID: settings.clientId,
    baseUrl: settings.baseUrl,
    signInRedirectURL: settings.signInRedirectURL,
    signOutRedirectURL: settings.signOutRedirectURL,
    scope: ['openid', 'profile', 'email'],
  }
}
