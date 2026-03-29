'use client'

interface TimerDisplayProps {
  formattedTime: string
  urgency: 'normal' | 'warning' | 'critical'
  isExpired: boolean
  isLoading: boolean
}

const urgencyConfig = {
  normal:   { bg: 'bg-slate-100',   text: 'text-slate-700', icon: '⏱' },
  warning:  { bg: 'bg-amber-50',    text: 'text-amber-600', icon: '⚠️' },
  critical: { bg: 'bg-red-50',      text: 'text-red-600',   icon: '🔴' },
}

export function TimerDisplay({ formattedTime, urgency, isExpired, isLoading }: TimerDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-sm font-mono">
        <span className="animate-pulse">⏱</span>
        <span>--:--</span>
      </div>
    )
  }

  if (isExpired) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-bold font-mono animate-pulse">
        <span>🔴</span>
        <span>TIEMPO AGOTADO</span>
      </div>
    )
  }

  const config = urgencyConfig[urgency]

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${config.bg} ${config.text} text-sm font-bold font-mono transition-colors duration-500 ${urgency === 'critical' ? 'animate-pulse' : ''}`}>
      <span>{config.icon}</span>
      <span>{formattedTime}</span>
    </div>
  )
}
