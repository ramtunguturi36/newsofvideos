import * as React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
    
    const variants = {
      default: 'bg-black text-white hover:bg-black/90 focus-visible:ring-black',
      outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus-visible:ring-gray-300',
      ghost: 'hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-300',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-300',
    }
    
    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 px-3 text-xs',
      lg: 'h-11 px-8',
      icon: 'h-10 w-10',
    }
    
    return (
      <button 
        ref={ref} 
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} 
        {...props} 
      />
    )
  }
)
Button.displayName = 'Button'

