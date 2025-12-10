import React from 'react'

export function Switch({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} className={`w-12 h-6 rounded-full ${checked ? 'bg-green-600' : 'bg-gray-300'} relative`}>
      <span className={`block w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

