import React from 'react'

export function Card({ className = '', ...props }) {
  return <div className={`rounded-xl border bg-white dark:bg-gray-800 ${className}`} {...props} />
}

export function CardHeader({ className = '', ...props }) {
  return <div className={`p-4 border-b dark:border-gray-700 ${className}`} {...props} />
}

export function CardTitle({ className = '', ...props }) {
  return <h3 className={`text-lg font-semibold dark:text-white ${className}`} {...props} />
}

export function CardContent({ className = '', ...props }) {
  return <div className={`p-4 ${className}`} {...props} />
}
