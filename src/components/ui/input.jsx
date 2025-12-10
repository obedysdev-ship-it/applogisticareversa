import React from 'react'

export function Input(props) {
  return <input {...props} className={`w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-900 dark:text-white ${props.className || ''}`} />
}

