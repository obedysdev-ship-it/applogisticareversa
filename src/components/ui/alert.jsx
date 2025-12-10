import React from 'react'

export function Alert({ className = '', ...props }) {
  return <div className={`rounded-lg border p-4 bg-yellow-50 border-yellow-200 ${className}`} {...props} />
}

export function AlertDescription({ className = '', ...props }) {
  return <div className={`text-sm text-yellow-800 ${className}`} {...props} />
}

