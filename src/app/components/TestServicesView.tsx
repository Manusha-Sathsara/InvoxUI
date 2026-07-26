import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  FlaskConical, Send, ShieldCheck, CheckCircle2, AlertTriangle, XCircle,
  Copy, Check, ExternalLink, RefreshCw, Key, Server, Terminal, Lock, Code2, AlertCircle,
  Globe, Zap, Users
} from 'lucide-react'
import { useApp } from '../context/AppContext'

interface DetailedError {
  httpStatus: number | null
  httpStatusText: string
  errorCode: string | null
  errorMessage: string | null
  errorDescription: string | null
  rawBody: string
  isNetworkError: boolean
}

export type TestServiceTab = 'auth-service' | 'customer-service'

interface ServiceConfig {
  id: TestServiceTab
  name: string
  version: string
  method: 'GET'
  path: string
  description: string
  icon: any
}

const SERVICES: ServiceConfig[] = [
  {
    id: 'auth-service',
    name: 'Auth Service',
    version: '1.0.0',
    method: 'GET',
    path: '/api/v1/test/auth/1.0.0',
    description: 'Validates Asgardeo Bearer token via WSO2 API Gateway Auth endpoint',
    icon: Lock,
  },
  {
    id: 'customer-service',
    name: 'Customer Service',
    version: '1.0.0',
    method: 'GET',
    path: '/api/v1/test/customer/1.0.0',
    description: 'Validates Asgardeo Bearer token via WSO2 API Gateway Customer endpoint',
    icon: Users,
  },
]

export function TestServicesView() {
  const { isDark, getAccessToken, asgardeoState } = useApp()

  const [activeTab, setActiveTab] = useState<TestServiceTab>('auth-service')
  const [useProxy, setUseProxy] = useState<boolean>(true)
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string>('')
  const [loadingToken, setLoadingToken] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)

  // Response state
  const [responseStatus, setResponseStatus] = useState<number | null>(null)
  const [responseStatusText, setResponseStatusText] = useState<string>('')
  const [responseText, setResponseText] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<DetailedError | null>(null)
  const [responseTime, setResponseTime] = useState<number | null>(null)
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({})
  const [showHeaders, setShowHeaders] = useState(false)

  const currentService = SERVICES.find(s => s.id === activeTab) || SERVICES[0]

  const directUrl = `https://localhost:8243${currentService.path}`
  const proxyUrl = `/api-gateway${currentService.path}`
  const targetUrl = useProxy ? proxyUrl : directUrl

  useEffect(() => {
    fetchAccessToken()
  }, [asgardeoState?.isAuthenticated])

  const handleTabChange = (tabId: TestServiceTab) => {
    setActiveTab(tabId)
    setResponseStatus(null)
    setResponseStatusText('')
    setResponseText(null)
    setErrorDetails(null)
    setResponseTime(null)
    setResponseHeaders({})
  }

  const fetchAccessToken = async () => {
    setLoadingToken(true)
    try {
      const accessToken = await getAccessToken()
      setToken(accessToken || '')
    } catch (err) {
      console.error('Error getting access token:', err)
      setToken('')
    } finally {
      setLoadingToken(false)
    }
  }

  const parseErrorResponse = (status: number, statusText: string, text: string): DetailedError => {
    let errorCode: string | null = null
    let errorMessage: string | null = null
    let errorDescription: string | null = null

    if (text) {
      // 1. Try parsing JSON error payload
      try {
        const json = JSON.parse(text)
        errorCode = json.code ?? json.errorCode ?? json.error ?? json.status ?? null
        errorMessage = json.message ?? json.error_description ?? json.error_message ?? json.error ?? null
        errorDescription = json.description ?? json.detail ?? json.error_description ?? null
      } catch {
        // 2. Try XML or regex extraction
        const codeMatch = text.match(/<(?:[a-zA-Z0-9_-]+:)?code>([^<]+)<\/(?:[a-zA-Z0-9_-]+:)?code>/i) ||
                          text.match(/"code"\s*:\s*"?([A-Za-z0-9_-]+)"?/i)
        if (codeMatch) errorCode = codeMatch[1].trim()

        const messageMatch = text.match(/<(?:[a-zA-Z0-9_-]+:)?message>([^<]+)<\/(?:[a-zA-Z0-9_-]+:)?message>/i) ||
                             text.match(/"message"\s*:\s*"([^"]+)"/i)
        if (messageMatch) errorMessage = messageMatch[1].trim()

        const descMatch = text.match(/<(?:[a-zA-Z0-9_-]+:)?description>([^<]+)<\/(?:[a-zA-Z0-9_-]+:)?description>/i) ||
                          text.match(/"description"\s*:\s*"([^"]+)"/i)
        if (descMatch) errorDescription = descMatch[1].trim()
      }
    }

    if (!errorCode) errorCode = `HTTP_${status}`
    if (!errorMessage) errorMessage = statusText || 'Backend returned error response'

    return {
      httpStatus: status,
      httpStatusText: statusText,
      errorCode: String(errorCode),
      errorMessage: String(errorMessage),
      errorDescription: errorDescription ? String(errorDescription) : null,
      rawBody: text || 'No response body returned from backend.',
      isNetworkError: false,
    }
  }

  const handleTestService = async () => {
    setLoading(true)
    setResponseStatus(null)
    setResponseStatusText('')
    setResponseText(null)
    setErrorDetails(null)
    setResponseTime(null)
    setResponseHeaders({})

    const startTime = performance.now()

    try {
      let currentToken = token
      if (!currentToken) {
        currentToken = await getAccessToken()
        setToken(currentToken || '')
      }

      const headers: Record<string, string> = {
        'Accept': 'text/plain, application/json, */*',
      }

      if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`
      }

      const res = await fetch(targetUrl, {
        method: 'GET',
        headers,
      })

      const endTime = performance.now()
      setResponseTime(Math.round(endTime - startTime))
      setResponseStatus(res.status)
      setResponseStatusText(res.statusText)

      const resHeaders: Record<string, string> = {}
      res.headers.forEach((val, key) => {
        resHeaders[key] = val
      })
      setResponseHeaders(resHeaders)

      const text = await res.text()

      if (res.ok) {
        setResponseText(text)
      } else {
        const parsedError = parseErrorResponse(res.status, res.statusText, text)
        setErrorDetails(parsedError)
      }
    } catch (err: any) {
      const endTime = performance.now()
      setResponseTime(Math.round(endTime - startTime))
      console.error(`${currentService.name} Request Error:`, err)

      const isFailedToFetch = err?.message === 'Failed to fetch' || err?.name === 'TypeError'

      setErrorDetails({
        httpStatus: null,
        httpStatusText: 'Network / SSL / CORS Error',
        errorCode: err?.name || 'TypeError: Failed to fetch',
        errorMessage: err?.message || 'Failed to fetch',
        errorDescription: isFailedToFetch
          ? `Browser blocked direct fetch to ${directUrl}. This occurs because browsers block untrusted self-signed SSL certificates or missing CORS headers.`
          : String(err?.message || 'Network request failed.'),
        rawBody: `TypeError: Failed to fetch\n\nPossible Causes:\n1. Untrusted self-signed SSL certificate on ${directUrl}\n2. Missing CORS headers for origin http://localhost:5173\n3. WSO2 API Manager server is offline on port 8243\n\nRecommendation: Use Vite Dev Proxy mode above or open ${directUrl} in a browser tab once to accept certificate.`,
        isNetworkError: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token)
      setCopiedToken(true)
      setTimeout(() => setCopiedToken(false), 2000)
    }
  }

  const glass = isDark
    ? 'bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/40'
    : 'bg-white/70 backdrop-blur-xl border border-white/80 shadow-xl shadow-black/5'

  const cardInner = isDark
    ? 'bg-white/[0.03] border border-white/[0.06]'
    : 'bg-slate-50/80 border border-slate-200/80'

  const IconComponent = currentService.icon

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <FlaskConical size={20} />
            </div>
            <h1 className={`text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
              Test Services
            </h1>
          </div>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Verify backend API services through WSO2 API Gateway token validation
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${isDark ? 'bg-indigo-950/30 border-indigo-700/40 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
            <Server size={14} />
            <span style={{ fontWeight: 600 }}>API Gateway:</span>
            <code className="text-[11px] bg-black/10 px-1.5 py-0.5 rounded">localhost:8243</code>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
            token ? (isDark ? 'bg-emerald-950/30 border-emerald-700/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700')
                  : (isDark ? 'bg-amber-950/30 border-amber-700/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700')
          }`}>
            <ShieldCheck size={14} />
            <span style={{ fontWeight: 600 }}>Asgardeo Auth:</span>
            <span>{token ? 'Token Ready' : 'Demo / Pending'}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation panel */}
        <div className="lg:col-span-1 space-y-3">
          <div className={`p-4 rounded-2xl ${glass}`}>
            <h2 className={`text-xs uppercase tracking-wider mb-3 px-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontWeight: 700 }}>
              Test Services Navigation
            </h2>

            <nav className="space-y-1.5">
              {SERVICES.map((srv) => {
                const ServiceIcon = srv.icon
                const isActive = activeTab === srv.id
                return (
                  <button
                    key={srv.id}
                    onClick={() => handleTabChange(srv.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all text-left ${
                      isActive
                        ? isDark
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold shadow'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold shadow-sm'
                        : isDark
                          ? 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                          : 'text-slate-600 hover:bg-black/[0.03] hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ServiceIcon size={16} className={isActive ? 'text-indigo-500' : 'opacity-60'} />
                      <span>{srv.name}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-mono">
                      {srv.method}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Request Mode Switcher Card */}
          <div className={`p-4 rounded-2xl border text-xs space-y-2.5 ${isDark ? 'bg-indigo-950/20 border-indigo-700/30 text-indigo-300' : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'}`}>
            <div className="flex items-center gap-1.5 font-bold">
              <Globe size={14} className="text-indigo-500" />
              <span>Request Routing Mode</span>
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed">
              Vite Dev Proxy bypasses browser SSL certificate and CORS errors automatically.
            </p>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={() => setUseProxy(true)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1 border ${
                  useProxy
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                    : isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Zap size={11} />
                <span>Vite Proxy</span>
              </button>
              <button
                onClick={() => setUseProxy(false)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1 border ${
                  !useProxy
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                    : isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Globe size={11} />
                <span>Direct</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Service Test Box */}
          <div className={`p-6 rounded-3xl ${glass} space-y-6`}>
            {/* Header & Description */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500 text-white">
                    {currentService.method}
                  </span>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {currentService.name} Test
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    v{currentService.version}
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {currentService.description}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTestService}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                    />
                    <span>Calling Gateway...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Execute Request</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Request Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Request Target
                </h4>
                <span className="text-[11px] font-mono text-indigo-400">
                  {useProxy ? 'Routed via Vite Dev Server Proxy (secure: false)' : 'Direct Browser Fetch'}
                </span>
              </div>

              <div className={`p-3.5 rounded-xl font-mono text-xs flex items-center justify-between gap-2 ${cardInner}`}>
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-indigo-400 font-bold">{currentService.method}</span>
                  <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                    {useProxy ? `http://localhost:5173${proxyUrl}` : directUrl}
                  </span>
                  {useProxy && (
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      ➜ {directUrl}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Authorization Header Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Authorization Header
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchAccessToken}
                    className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw size={11} className={loadingToken ? 'animate-spin' : ''} />
                    <span>Refresh Token</span>
                  </button>
                  <button
                    onClick={() => setShowToken(!showToken)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 font-semibold"
                  >
                    {showToken ? 'Hide' : 'Reveal Token'}
                  </button>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl font-mono text-xs flex items-center justify-between gap-3 ${cardInner}`}>
                <div className="flex items-center gap-2 overflow-hidden">
                  <Key size={14} className="text-amber-400 flex-shrink-0" />
                  <span className="text-slate-400 font-semibold flex-shrink-0">Authorization:</span>
                  <span className={`truncate ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    Bearer {token ? (showToken ? token : `${token.slice(0, 15)}...${token.slice(-10)}`) : '(No token available - sign in via Asgardeo)'}
                  </span>
                </div>

                {token && (
                  <button
                    onClick={handleCopyToken}
                    className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-black/5 text-slate-600'}`}
                    title="Copy token"
                  >
                    {copiedToken ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>

            {/* Response Output Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal size={16} className="text-indigo-500" />
                  <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Response Output
                  </h4>
                </div>

                <div className="flex items-center gap-3">
                  {Object.keys(responseHeaders).length > 0 && (
                    <button
                      onClick={() => setShowHeaders(!showHeaders)}
                      className="text-xs text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Code2 size={12} />
                      <span>{showHeaders ? 'Hide Headers' : 'View Headers'}</span>
                    </button>
                  )}
                  {responseTime !== null && (
                    <span className="text-xs text-slate-400 font-mono">
                      Time: {responseTime} ms
                    </span>
                  )}
                </div>
              </div>

              {/* Response Headers Collapsible Drawer */}
              <AnimatePresence>
                {showHeaders && Object.keys(responseHeaders).length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1"
                  >
                    <div className="text-slate-400 font-bold mb-1">Response Headers:</div>
                    {Object.entries(responseHeaders).map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="text-indigo-400 font-semibold">{k}:</span>
                        <span className="text-slate-300 break-all">{v}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status Indicators & Error Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {responseStatus !== null && (
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    responseStatus >= 200 && responseStatus < 300
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    HTTP {responseStatus} {responseStatusText}
                  </span>
                )}

                {errorDetails?.errorCode && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>Error Code: {errorDetails.errorCode}</span>
                  </span>
                )}
              </div>

              {/* Output Display Terminal Card */}
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-slate-400 font-mono text-[11px]">
                      {useProxy ? 'Vite Proxy Response' : 'Direct Browser Response'} ({currentService.name})
                    </span>
                  </div>
                  <span className="text-slate-500 text-[10px]">raw / json / text</span>
                </div>

                <div className="p-5 font-mono text-xs overflow-x-auto min-h-[140px]">
                  {loading ? (
                    <div className="flex items-center gap-2 text-slate-400">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 rounded-full border-2 border-indigo-500/30 border-t-indigo-500"
                      />
                      <span>Connecting to {currentService.name} via WSO2 API Gateway...</span>
                    </div>
                  ) : responseText !== null ? (
                    <div className="space-y-2 text-emerald-300">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold pb-2 border-b border-slate-800">
                        <CheckCircle2 size={16} />
                        <span>SUCCESS - {currentService.name} Returned Response Text:</span>
                      </div>
                      <pre className="whitespace-pre-wrap break-words leading-relaxed pt-2 text-slate-100">
                        {responseText}
                      </pre>
                    </div>
                  ) : errorDetails !== null ? (
                    <div className="space-y-4 text-red-400">
                      {/* Structured Error Highlight Card */}
                      <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 space-y-3">
                        <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
                          <div className="flex items-center gap-2 font-bold text-red-400 text-sm">
                            <XCircle size={18} />
                            <span>{errorDetails.isNetworkError ? 'NETWORK / BROWSER FETCH ERROR' : 'BACKEND ERROR RESPONSE'}</span>
                          </div>

                          {errorDetails.isNetworkError && !useProxy && (
                            <button
                              onClick={() => {
                                setUseProxy(true)
                                setTimeout(() => handleTestService(), 100)
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold transition-all shadow"
                            >
                              ⚡ Fix: Switch to Vite Dev Proxy
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                          <div>
                            <span className="text-slate-400 font-semibold block">Error Code:</span>
                            <span className="text-amber-400 font-bold text-sm">{errorDetails.errorCode}</span>
                          </div>

                          <div>
                            <span className="text-slate-400 font-semibold block">HTTP Status:</span>
                            <span className="text-red-300 font-bold">
                              {errorDetails.httpStatus ? `${errorDetails.httpStatus} ${errorDetails.httpStatusText}` : errorDetails.httpStatusText}
                            </span>
                          </div>
                        </div>

                        <div className="pt-1">
                          <span className="text-slate-400 font-semibold block mb-0.5">Error Message:</span>
                          <p className="text-red-200 font-semibold leading-relaxed">
                            {errorDetails.errorMessage}
                          </p>
                        </div>

                        {errorDetails.errorDescription && (
                          <div className="pt-1">
                            <span className="text-slate-400 font-semibold block mb-0.5">Description:</span>
                            <p className="text-slate-300 text-[11px] leading-relaxed">
                              {errorDetails.errorDescription}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Exact Raw Response Body */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-slate-400 font-semibold text-[11px]">
                          <span>EXACT RAW BACKEND RESPONSE BODY:</span>
                        </div>
                        <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
                          {errorDetails.rawBody}
                        </pre>
                      </div>

                      {/* Troubleshooting Checklist */}
                      {errorDetails.isNetworkError && (
                        <div className="pt-2 border-t border-slate-800 text-slate-400 text-[11px] space-y-1">
                          <p className="font-bold text-amber-400">Why did "Failed to fetch" happen?</p>
                          <ol className="list-decimal list-inside space-y-1 opacity-90 leading-relaxed">
                            <li>
                              <strong>Untrusted Self-Signed Certificate:</strong> Browsers block <code>fetch()</code> to <code>https://localhost:8243</code> until you open <a href={directUrl} target="_blank" rel="noreferrer" className="text-indigo-400 underline font-semibold">{directUrl}</a> in a tab and accept the certificate exception.
                            </li>
                            <li>
                              <strong>Easiest Solution:</strong> Switch to <strong>Vite Dev Proxy</strong> (top right button). Vite proxies Node-to-Gateway directly bypassing SSL cert checks!
                            </li>
                          </ol>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-500 flex flex-col items-center justify-center py-8 text-center space-y-2">
                      <Send size={24} className="opacity-40" />
                      <p>Click <strong>Execute Request</strong> above to send GET request to {currentService.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
