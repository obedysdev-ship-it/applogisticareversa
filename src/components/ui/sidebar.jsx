import React, { createContext, useContext, useEffect, useState } from 'react'

const SidebarCtx = createContext()

export function SidebarProvider({ children }) {
  const [open, setOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true)
  useEffect(() => {
    const onResize = () => { setOpen(window.innerWidth >= 1024) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return <SidebarCtx.Provider value={{ open, setOpen }}>{children}</SidebarCtx.Provider>
}

export function SidebarTrigger({ className = '' }) {
  const { setOpen } = useContext(SidebarCtx)
  return <button className={`rounded-md ${className}`} onClick={() => setOpen(v => !v)}>☰</button>
}

export function Sidebar({ className = '', children }) {
  const { open, setOpen } = useContext(SidebarCtx)
  const base = 'transition-all overflow-hidden'
  const mobileOpen = 'fixed left-0 top-0 h-screen w-64 z-50'
  const mobileClosed = 'w-0'
  const desktop = 'lg:static lg:w-64'
  
  return (
    <>
      {/* Overlay para mobile - fecha ao clicar */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside className={`${base} ${open ? mobileOpen : mobileClosed} ${desktop} ${className}`}>{children}</aside>
    </>
  )
}

export function SidebarHeader(props) { return <div {...props} /> }
export function SidebarFooter(props) { return <div {...props} /> }
export function SidebarContent(props) { return <div {...props} /> }
export function SidebarGroup(props) { return <div {...props} /> }
export function SidebarGroupLabel(props) { return <div {...props} /> }
export function SidebarGroupContent(props) { return <div {...props} /> }
export function SidebarMenu(props) { return <ul {...props} /> }
export function SidebarMenuItem(props) { return <li {...props} /> }
export function SidebarMenuButton({ asChild, className = '', children }) { return asChild ? children : <button className={className}>{children}</button> }
export function useSidebar() { return useContext(SidebarCtx) }
