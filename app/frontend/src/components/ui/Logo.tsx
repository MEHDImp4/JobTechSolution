import { cn } from '@/lib/utils'

interface LogoProps {
  collapsed?: boolean
  className?: string
}

export function Logo({ collapsed = false, className }: LogoProps) {
  if (collapsed) {
    return (
      <svg
        viewBox="0 0 70 70"
        className={cn('h-8 w-8 transition-all duration-200', className)}
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          x="35"
          y="58"
          fontFamily="system-ui, -apple-system, Arial, sans-serif"
          fontSize="68"
          fontWeight="bold"
          fill="currentColor"
          textAnchor="middle"
          className="text-brand-900 dark:text-slate-100 transition-colors"
        >
          J
        </text>
      </svg>
    )
  }

  return (
    <svg
      viewBox="5 35 300 120"
      className={cn('h-11 w-auto transition-all duration-200', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(10, 0)">
        {/* Texte "Job" */}
        <text
          x="10"
          y="110"
          fontFamily="system-ui, -apple-system, Arial, sans-serif"
          fontSize="68"
          fontWeight="bold"
          fill="currentColor"
          letterSpacing="-1.5"
          className="text-brand-900 dark:text-slate-100 transition-colors"
        >
          Job
        </text>

        {/* Texte "Tech" */}
        <text
          x="130"
          y="110"
          fontFamily="system-ui, -apple-system, Arial, sans-serif"
          fontSize="68"
          fontWeight="bold"
          fill="currentColor"
          letterSpacing="-1.5"
          className="text-brand-600 dark:text-brand-400 transition-colors"
        >
          Tech
        </text>

        {/* Texte "Solutions" */}
        <text
          x="15"
          y="145"
          fontFamily="system-ui, -apple-system, Arial, sans-serif"
          fontSize="22"
          fontWeight="500"
          fill="currentColor"
          letterSpacing="2.5"
          className="text-slate-500 dark:text-slate-400 transition-colors"
        >
          SOLUTIONS
        </text>
      </g>
    </svg>
  )
}
