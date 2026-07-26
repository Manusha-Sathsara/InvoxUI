import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate, useSearchParams } from 'react-router'
import { Zap, Sun, Moon, ArrowRight, ShieldCheck, Key, Settings2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getSavedAsgardeoSettings, saveAsgardeoSettings } from '../config/asgardeoConfig'

export function LoginPage() {
  const { isDark, toggleDark, login, isAuthenticated, isLoadingAuth, currentTenant, hasAsgardeoConfig } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [settings, setSettings] = useState(getSavedAsgardeoSettings())
  const [showConfig, setShowConfig] = useState(false)
  const [customClientId, setCustomClientId] = useState(settings.clientId === 'PLACEHOLDER_CLIENT_ID' ? '' : settings.clientId)
  const [customBaseUrl, setCustomBaseUrl] = useState(settings.baseUrl)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [asgardeoLoading, setAsgardeoLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      const next = searchParams.get('next')
      navigate(next || `/${currentTenant.slug}/dashboard`, { replace: true })
    }
  }, [isAuthenticated, searchParams, currentTenant.slug, navigate])

  const handleAsgardeoSignIn = async () => {
    setError('')
    setAsgardeoLoading(true)
    try {
      await login()
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Failed to initialize Asgardeo login.')
      setAsgardeoLoading(false)
    }
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    saveAsgardeoSettings(customClientId, customBaseUrl)
    setSaveSuccess(true)
    setTimeout(() => {
      window.location.reload()
    }, 800)
  }

  const glass = isDark
    ? 'bg-slate-950/70 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/60'
    : 'bg-white/80 backdrop-blur-2xl border border-white/80 shadow-2xl shadow-indigo-500/10'

  const inputClass = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
    isDark
      ? 'bg-white/[0.06] border-white/[0.10] text-slate-200 placeholder:text-slate-600 focus:border-amber-500/60 focus:bg-white/[0.09]'
      : 'bg-black/[0.04] border-black/[0.08] text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white/90'
  }`

  return (
    <div className="relative flex items-center justify-center min-h-screen py-8 z-10">
      <button
        onClick={toggleDark}
        className={`fixed top-6 right-6 p-2.5 rounded-xl border transition-all z-20 ${
          isDark
            ? 'border-white/[0.07] bg-white/[0.04] hover:bg-white/[0.08] text-amber-400'
            : 'border-black/[0.07] bg-black/[0.03] hover:bg-black/[0.06] text-slate-600'
        }`}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`w-full max-w-md mx-4 rounded-3xl p-8 ${glass}`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Zap size={20} className="text-white" />
            </div>
            <span className={`text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontWeight: 800, letterSpacing: '-0.04em' }}>
              Invox
            </span>
          </div>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all ${
              showConfig
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                : isDark
                  ? 'border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  : 'border-black/10 text-slate-600 hover:text-slate-900 hover:bg-black/5'
            }`}
            style={{ fontWeight: 600 }}
          >
            <Settings2 size={14} />
            {showConfig ? 'Hide Config' : 'Asgardeo Settings'}
          </button>
        </div>

        <h1 className={`text-2xl mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontWeight: 700, letterSpacing: '-0.03em' }}>
          Welcome back
        </h1>
        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Sign in securely using WSO2 Asgardeo
        </p>

        {/* Configuration Drawer */}
        <AnimatePresence>
          {showConfig && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSaveSettings}
              className={`mb-6 p-4 rounded-2xl border overflow-hidden space-y-3 ${
                isDark ? 'bg-white/[0.03] border-amber-500/20' : 'bg-amber-50/60 border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 text-amber-500 text-xs" style={{ fontWeight: 700 }}>
                <Key size={14} />
                <span>Asgardeo Application Configuration</span>
              </div>

              <div>
                <label className={`text-[11px] mb-1 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`} style={{ fontWeight: 600 }}>
                  Client ID
                </label>
                <input
                  type="text"
                  placeholder="Paste your Asgardeo SPA Client ID here"
                  value={customClientId}
                  onChange={e => setCustomClientId(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={`text-[11px] mb-1 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`} style={{ fontWeight: 600 }}>
                  Base URL (Organization Endpoint)
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://api.asgardeo.io/t/your_org_name"
                  value={customBaseUrl}
                  onChange={e => setCustomBaseUrl(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">Stored locally in browser & .env</span>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow hover:opacity-90 transition-opacity"
                >
                  Save & Apply
                </button>
              </div>

              {saveSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                  <CheckCircle2 size={13} />
                  <span>Saved! Reloading app...</span>
                </div>
              )}
            </motion.form>
          )}
        </AnimatePresence>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Asgardeo Hosted Login Action */}
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAsgardeoSignIn}
            disabled={asgardeoLoading || isLoadingAuth}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl text-sm text-white shadow-xl shadow-orange-500/25 transition-all disabled:opacity-70"
            style={{
              background: 'linear-gradient(135deg, #ff6000 0%, #e65100 50%, #d84315 100%)',
              fontWeight: 700,
            }}
          >
            {asgardeoLoading || isLoadingAuth ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                />
                <span>Redirecting to Asgardeo...</span>
              </>
            ) : (
              <>
                <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  <ShieldCheck size={14} />
                </div>
                <span>Sign in with WSO2 Asgardeo</span>
                <ArrowRight size={16} className="ml-auto" />
              </>
            )}
          </motion.button>

          {!hasAsgardeoConfig && (
            <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${isDark ? 'bg-amber-950/20 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
              <div className="font-semibold flex items-center gap-1.5">
                <AlertCircle size={14} className="text-amber-500" />
                <span>Client ID required for production SSO</span>
              </div>
              <p className="text-[11px] opacity-90">
                Click <strong>Asgardeo Settings</strong> above to enter your Client ID, or set <code>VITE_ASGARDEO_CLIENT_ID</code> in your <code>.env</code> file.
              </p>
            </div>
          )}
        </div>

        <div className={`mt-6 pt-6 border-t text-center text-xs ${isDark ? 'border-white/[0.06] text-slate-500' : 'border-black/[0.06] text-slate-400'}`}>
          Secured with OIDC & OAuth 2.0 PKCE authentication.
        </div>
      </motion.div>
    </div>
  )
}
