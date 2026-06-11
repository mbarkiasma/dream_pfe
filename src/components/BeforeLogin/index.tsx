'use client'

import React from 'react'

const BeforeLogin: React.FC = () => {
  return (
    <style>{`
      body { background: #f5f3ff !important; margin: 0; }

      .template-minimal {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-height: 100vh !important;
        max-width: none !important;
        padding: 0 !important;
      }

      .template-minimal__wrap {
        width: 100% !important;
        max-width: 420px !important;
        margin: 0 auto !important;
        padding: 48px 40px !important;
        background: #ffffff !important;
        border-radius: 20px !important;
        box-shadow: 0 8px 40px rgba(137, 94, 248, 0.12) !important;
      }

      .template-minimal__wrap input[type="email"],
      .template-minimal__wrap input[type="password"],
      .template-minimal__wrap input[type="text"] {
        border: 1.5px solid #e5e7eb !important;
        border-radius: 10px !important;
        padding: 10px 14px !important;
        font-size: 15px !important;
        width: 100% !important;
        box-sizing: border-box !important;
        outline: none !important;
        transition: border-color 0.15s !important;
      }
      .template-minimal__wrap input:focus {
        border-color: #895ef8 !important;
        box-shadow: 0 0 0 3px rgba(137, 94, 248, 0.12) !important;
      }

      .template-minimal__wrap button[type="submit"] {
        background: #895ef8 !important;
        color: #ffffff !important;
        border: none !important;
        border-radius: 12px !important;
        padding: 12px 24px !important;
        font-size: 15px !important;
        font-weight: 600 !important;
        width: 100% !important;
        cursor: pointer !important;
        transition: background 0.15s, transform 0.1s !important;
      }
      .template-minimal__wrap button[type="submit"]:hover {
        background: #7c3aed !important;
        transform: translateY(-1px) !important;
      }

      .template-minimal__wrap a {
        color: #895ef8 !important;
      }
    `}</style>
  )
}

export default BeforeLogin
