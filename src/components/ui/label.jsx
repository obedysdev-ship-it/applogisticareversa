import React from 'react'

export function Label({ className = '', ...props }) {
  return <label className={`text-sm font-medium text-gray-700 dark:text-white ${className}`} {...props} />
}

