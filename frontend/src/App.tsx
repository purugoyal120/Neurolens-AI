import { useState } from 'react'
import { SimpleVisionTestPage } from './pages/SimpleVisionTestPage'
import { VisionTestPage } from './pages/VisionTestPage'

type Module = 'simple' | 'extended'

export default function App() {
  const [active, setActive] = useState<Module>('simple')

  return (
    <div>
      <div
        style={{
          position: 'fixed',
          top: 12,
          right: 12,
          zIndex: 10,
          display: 'flex',
          gap: 8,
          fontFamily: 'Inter, Roboto, system-ui, sans-serif',
        }}
      >
        <ModuleButton label="10-Q Test" active={active === 'simple'} onClick={() => setActive('simple')} />
        <ModuleButton label="12-Trial Test" active={active === 'extended'} onClick={() => setActive('extended')} />
      </div>
      {active === 'simple' ? <SimpleVisionTestPage /> : <VisionTestPage />}
    </div>
  )
}

function ModuleButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px',
        borderRadius: 8,
        border: active ? '1.5px solid #4c4ddc' : '1.5px solid #d8d2c2',
        background: active ? '#4c4ddc' : 'white',
        color: active ? 'white' : '#15191e',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}
