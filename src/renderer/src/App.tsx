import './i18n'
import { useTranslation } from 'react-i18next'
import { Dialog } from './components/RadixUI'
import { useState } from 'react'
import { UploadButton } from './components/UploadButton'

function App(): React.JSX.Element {
  const { i18n } = useTranslation()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [model, setModel] = useState<'gemini' | 'ollama'>('gemini')
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  const handlePdfUpload = (file: File): void => {
    setPdfFile(file)
    console.log('PDF File uploaded:', file.name)
  }

  return (
    <div
      style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f7fafd' }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          background: '#fff',
          borderBottom: '1px solid #e5e7eb'
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 24,
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="#2563eb"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2L2 7L12 12L22 7L12 2Z" />
            <path d="M2 17L12 22L22 17" />
            <path d="M2 12L12 17L22 12" />
          </svg>
          Juanipis PDF&apos;s translator
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Model Select */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f1f5f9',
              borderRadius: 4,
              padding: 2
            }}
          >
            <button
              style={{
                padding: '4px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: model === 'gemini' ? '#2563eb' : 'transparent',
                color: model === 'gemini' ? '#fff' : '#64748b',
                border: 'none',
                borderRadius: 4,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer'
              }}
              onClick={() => setModel('gemini')}
            >
              Gemini
            </button>
            <button
              style={{
                padding: '4px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: model === 'ollama' ? '#2563eb' : 'transparent',
                color: model === 'ollama' ? '#fff' : '#64748b',
                border: 'none',
                borderRadius: 4,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer'
              }}
              onClick={() => setModel('ollama')}
            >
              Ollama
            </button>
          </div>

          <button
            style={{
              padding: '6px 12px',
              background: 'transparent',
              color: '#64748b',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
            onClick={() => {}}
          >
            Clear
          </button>

          <button
            style={{
              padding: '6px 12px',
              background: 'transparent',
              color: '#64748b',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', gap: 24, padding: 24, overflow: 'hidden' }}>
        {/* PDF Viewer */}
        <div
          style={{
            flex: 1,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 350,
            overflow: 'hidden'
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <UploadButton onUpload={handlePdfUpload} />
          </div>

          {!pdfFile ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                borderRadius: 8,
                padding: 40
              }}
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.5"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
              <div
                style={{ marginTop: 16, fontWeight: 600, color: '#64748b', textAlign: 'center' }}
              >
                No PDF Loaded
              </div>
              <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: 4, maxWidth: 300 }}>
                Click "Upload PDF" to select a document, then select text or images for AI-powered
                translation.
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, background: '#f8fafc', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{pdfFile.name}</div>
              <div style={{ color: '#64748b' }}>[PDF Viewer will be displayed here]</div>
            </div>
          )}
        </div>

        {/* Translated Content */}
        <div
          style={{
            flex: 1,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 350,
            overflow: 'hidden'
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#334155' }}>
            Translated Content
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8fafc',
              borderRadius: 8,
              padding: 24
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: 350 }}>
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M7 7h10M7 12h10M7 17h5" />
              </svg>
              <div style={{ marginTop: 16, fontWeight: 600, color: '#64748b' }}>
                No content to translate
              </div>
              <div style={{ color: '#94a3b8', marginTop: 4 }}>
                Select a region from the PDF document to extract text or capture an image for AI
                analysis.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <Dialog.Root open={settingsOpen} onOpenChange={setSettingsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ background: 'rgba(0,0,0,0.4)', position: 'fixed', inset: 0 }} />
          <Dialog.Content
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 32,
              minWidth: 400,
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
          >
            <Dialog.Title
              style={{ fontWeight: 700, fontSize: 22, marginBottom: 16, color: '#334155' }}
            >
              Settings
            </Dialog.Title>
            <Dialog.Description style={{ color: '#64748b', marginBottom: 24 }}>
              Configure your application preferences.
            </Dialog.Description>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: '#334155' }}>
                Default Language
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  style={{
                    padding: '6px 16px',
                    background: '#2563eb',
                    color: '#fff',
                    borderRadius: 4,
                    border: 'none',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                  onClick={() => i18n.changeLanguage('en')}
                >
                  English
                </button>
                <button
                  style={{
                    padding: '6px 16px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    borderRadius: 4,
                    border: 'none',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                  onClick={() => i18n.changeLanguage('es')}
                >
                  Español
                </button>
              </div>
            </div>

            <button
              onClick={() => setSettingsOpen(false)}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '8px 24px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

export default App
