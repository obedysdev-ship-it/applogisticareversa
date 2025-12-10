import React from 'react'

export function Select({ value, onValueChange, children, className = '' }) {
  return (
    <select 
      value={value || ''} 
      onChange={e => onValueChange(e.target.value)} 
      className={`w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${className}`}
    >
      {children}
    </select>
  )
}

export function SelectTrigger({ children }) { return children }
export function SelectValue({ children }) { return children }
export function SelectContent({ children }) { return children }
export function SelectItem({ value, children }) { 
  return <option value={value || ''}>{children}</option> 
}

