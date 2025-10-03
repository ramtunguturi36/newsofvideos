import * as React from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/40 ${className}`}
      {...props}
    />
  )
)
Input.displayName = 'Input'




