import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProtectedLayout from './ProtectedLayout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* PROTECTED */}
        <Route path="/app/*" element={<ProtectedLayout />} />

        {/* FALLBACK */}
        <Route path="*" element={<Landing />} />

      </Routes>
    </BrowserRouter>
  )
}