import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout.jsx'
import Splash from './pages/Splash.jsx'
import Login from './pages/Login.jsx'
import Registros from './pages/Registros.jsx'
import Resumo from './pages/Resumo.jsx'
import Revisao from './pages/Revisao.jsx'
import CorrigirRegistros from './pages/CorrigirRegistros.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ResumoPDF from './pages/ResumoPDF.jsx'
import Cadastros from './pages/Cadastros.jsx'

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('auth') === 'true'
  if (!isAuthenticated) {
    return <Navigate to="/Login" replace />
  }
  return children
}

function withLayout(Element, name) {
  return (
    <ProtectedRoute>
      <Layout currentPageName={name}>
        <Element />
      </Layout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/Login" element={<Login />} />
      <Route path="/" element={<Splash />} />
      <Route path="/Dashboard" element={withLayout(Dashboard, 'Dashboard')} />
      <Route path="/Registros" element={withLayout(Registros, 'Registros')} />
      <Route path="/Resumo" element={withLayout(Resumo, 'Resumo')} />
      <Route path="/Cadastros" element={withLayout(Cadastros, 'Cadastros')} />
      <Route path="/Revisao" element={withLayout(Revisao, 'Revisao')} />
      <Route path="/CorrigirRegistros" element={withLayout(CorrigirRegistros, 'CorrigirRegistros')} />
      <Route path="/ResumoPDF" element={<ResumoPDF />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
