import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start py-8">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <App />
      </div>
    </div>
  </StrictMode>,
)
