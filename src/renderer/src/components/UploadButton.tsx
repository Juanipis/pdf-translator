import React from 'react'

interface UploadButtonProps {
  onUpload: (file: File) => void
}

export function UploadButton({ onUpload }: UploadButtonProps): React.JSX.Element {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="application/pdf"
        id="file-upload"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      <label htmlFor="file-upload">
        <button
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '10px 16px',
            borderRadius: '4px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ color: 'white' }}
          >
            <path
              d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Upload PDF
        </button>
      </label>
    </div>
  )
}
