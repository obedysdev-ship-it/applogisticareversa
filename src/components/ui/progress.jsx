import React from 'react'

export function Progress({ value = 0 }) {
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full">
      <div className="h-2 bg-green-600 rounded-full" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

