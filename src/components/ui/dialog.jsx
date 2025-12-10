import React from 'react'

export function Dialog({ children }) { return children }
export function DialogContent({ className = '', children, ...props }) {
  return (
    <div className={`fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4`} onClick={(e) => e.target === e.currentTarget && props.onClose?.()}>
      <div className={`rounded-xl p-6 bg-white dark:bg-gray-800 dark:text-gray-100 max-w-2xl max-h-[90vh] overflow-y-auto w-full ${className}`} onClick={(e) => e.stopPropagation()} {...props}>
        {children}
      </div>
    </div>
  )
}
export function DialogHeader({ className = '', ...props }) { return <div className={`mb-4 ${className}`} {...props} /> }
export function DialogTitle({ className = '', ...props }) { return <h2 className={`text-xl font-semibold ${className}`} {...props} /> }

