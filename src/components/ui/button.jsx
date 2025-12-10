import React from 'react'

export function Button({ className = '', variant, size, ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50'
  const variants = {
    default: 'bg-green-600 text-white hover:bg-green-700',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
  }
  const sizes = { sm: 'h-9 text-sm', md: 'h-10', lg: 'h-11 text-lg' }
  const v = variants[variant || 'default']
  const s = sizes[size || 'md']
  return <button className={`${base} ${v} ${s} ${className}`} {...props} />
}

