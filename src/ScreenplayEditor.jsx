import React, { useState } from 'react';


const ScreenplayEditor = () => {
  const [title, setTitle] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  return (
    <>
      {/* ── ALL CSS ── */}
      <style>{`
        /* ═══ GOOGLE FONTS ═══ */
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap');

        /* ═══ RESET ═══ */
        *, *::before, *::after {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body, #root {
          height: 100%;
          overflow: hidden;
        }

        /* ═══ DESIGN TOKENS — LIGHT MODE ═══ */
        :root {
          --font-mono: 'Courier Prime', 'Courier New', monospace;
          --font-ui: system-ui, -apple-system, 'Segoe UI', sans-serif;

          --desk-bg: #F5F2ED;
          --page-bg: #FFFFFF;
          --page-text: #1A1917;
          --page-border: #F0EDE8;
          --panel-bg: #FAF8F4;
          --panel-border: #EDE9E3;
          --topbar-bg: #FFFFFF;
          --topbar-border: #EDE9E3;
          --card-bg: #FFFFFF;
          --card-border: #EDE9E3;
          --gutter-label: #C4BDB5;
          --active-wash: #FFFBF2;
          --muted-text: #9C9590;
          --body-text: #6B6460;
          --heading-text: #3D3833;

          --amber: #D97706;
          --amber-hover: #B45309;
          --green: #22C55E;
          --stone: #78716C;
          --teal: #0F6E56;
          --violet: #7C3AED;
          --blue: #0369A1;
          --orange-red: #C2410C;
        }

        /* ═══ DESIGN TOKENS — DARK MODE ═══ */
        .dark-mode {
          --desk-bg: #171412;
          --page-bg: #1E1C1A;
          --page-text: #F0EBE3;
          --page-border: #2E2B28;
          --panel-bg: #171412;
          --panel-border: #2E2B28;
          --topbar-bg: #171412;
          --topbar-border: #2E2B28;
          --card-bg: #1E1C1A;
          --card-border: #2E2B28;
          --gutter-label: #4A4540;
          --active-wash: #2A2520;
          --muted-text: #6B6460;
          --body-text: #A39E98;
          --heading-text: #E8E3DB;
        }

        /* ═══ MAIN LAYOUT ═══ */
        .app-shell {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--desk-bg);
          color: var(--page-text);
          transition: background 200ms ease, color 200ms ease;
        }

        /* ═══ TOPBAR ═══ */
        .topbar {
          height: 48px;
          min-height: 48px;
          background: var(--topbar-bg);
          border-bottom: 1px solid var(--topbar-border);
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 100;
          transition: background 200ms ease, border-color 200ms ease;
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .topbar-logo {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 15px;
          color: var(--heading-text);
          white-space: nowrap;
          user-select: none;
          cursor: default;
          transition: opacity 200ms ease;
        }

        .topbar-logo:hover {
          opacity: 0.8;
        }

        .topbar-logo-icon {
          font-size: 18px;
          transition: transform 300ms ease;
        }

        .topbar-logo:hover .topbar-logo-icon {
          transform: rotate(-8deg) scale(1.1);
        }

        .topbar-separator {
          width: 1px;
          height: 20px;
          background: var(--panel-border);
          flex-shrink: 0;
        }

        .topbar-title-input {
          border: none;
          outline: none;
          background: transparent;
          font-family: var(--font-ui);
          font-size: 14px;
          color: var(--heading-text);
          min-width: 140px;
          max-width: 240px;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background 200ms ease, box-shadow 200ms ease;
        }

        .topbar-title-input:hover {
          background: var(--active-wash);
        }

        .topbar-title-input:focus {
          background: var(--active-wash);
          box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.15);
        }

        .topbar-title-input::placeholder {
          color: var(--muted-text);
        }

        .topbar-center {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-ui);
          font-size: 12px;
          color: var(--muted-text);
          white-space: nowrap;
        }

        .topbar-center.focus-hidden {
          opacity: 1;
        }

        .save-indicator {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: var(--green);
          opacity: 0;
          transition: opacity 300ms ease;
        }

        .save-indicator.visible {
          opacity: 1;
        }

        .save-dot {
          width: 6px;
          height: 6px;
          background: var(--green);
          border-radius: 50%;
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* ═══ FLOATING PAGE ANIMATION ═══ */
        @keyframes float-page {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .topbar-btn {
          background: none;
          border: 1px solid transparent;
          cursor: pointer;
          font-family: var(--font-ui);
          font-size: 14px;
          color: var(--body-text);
          padding: 6px 10px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: background 150ms ease, color 150ms ease, 
                      transform 150ms ease, box-shadow 150ms ease;
        }

        .topbar-btn:hover {
          background: var(--active-wash);
          color: var(--heading-text);
          transform: translateY(-1px);
        }

        .topbar-btn:active {
          transform: translateY(0px) scale(0.97);
        }

        .topbar-btn-export {
          background: var(--amber);
          color: #FFFFFF;
          font-size: 13px;
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-family: var(--font-ui);
          font-weight: 500;
          transition: background 150ms ease, transform 150ms ease, 
                      box-shadow 150ms ease;
        }

        .topbar-btn-export:hover {
          background: var(--amber-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(217, 119, 6, 0.35);
        }

        .topbar-btn-export:active {
          transform: translateY(0px) scale(0.97);
          box-shadow: 0 2px 6px rgba(217, 119, 6, 0.2);
        }

        /* ═══ BODY LAYOUT ═══ */
        .body-layout {
          display: flex;
          flex: 1;
          overflow: hidden;
          transition: all 200ms ease;
        }

        /* ═══ LEFT PANEL ═══ */
        .left-panel {
          width: 180px;
          min-width: 180px;
          background: var(--panel-bg);
          border-right: 1px solid var(--panel-border);
          padding: 16px 10px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
          transition: width 200ms ease, min-width 200ms ease, 
                      opacity 200ms ease, padding 200ms ease,
                      background 200ms ease, border-color 200ms ease;
        }

        .left-panel.collapsed {
          width: 0;
          min-width: 0;
          padding: 0;
          opacity: 0;
          overflow: hidden;
        }

        .panel-section-label {
          font-family: var(--font-ui);
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: var(--muted-text);
          margin-bottom: 8px;
        }

        .format-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 7px 10px;
          margin-bottom: 2px;
          background: transparent;
          border: none;
          border-left: 3px solid transparent;
          border-radius: 6px;
          cursor: pointer;
          font-family: var(--font-ui);
          font-size: 12px;
          font-weight: 500;
          color: var(--body-text);
          transition: background 120ms ease, border-color 120ms ease,
                      transform 120ms ease, padding-left 120ms ease;
          text-align: left;
        }

        .format-btn:hover {
          background: #F2EFE9;
          padding-left: 13px;
        }

        .format-btn:active {
          transform: scale(0.98);
        }

        .dark-mode .format-btn:hover {
          background: #2A2520;
          padding-left: 13px;
        }

        .format-btn.active {
          background: #FEF9EE;
          border-left-color: var(--amber);
          color: var(--heading-text);
        }

        .dark-mode .format-btn.active {
          background: #2A2520;
        }

        .format-btn-name {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .format-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: transform 150ms ease, box-shadow 150ms ease;
        }

        .format-btn:hover .format-dot {
          transform: scale(1.4);
          box-shadow: 0 0 6px currentColor;
        }

        .format-shortcut {
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--muted-text);
          background: var(--panel-border);
          padding: 2px 5px;
          border-radius: 4px;
          white-space: nowrap;
          transition: background 150ms ease, color 150ms ease;
        }

        .format-btn:hover .format-shortcut {
          background: var(--amber);
          color: #FFFFFF;
        }

        .scene-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .scene-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 120ms ease, transform 120ms ease,
                      padding-left 120ms ease;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
        }

        .scene-item:hover {
          background: #F2EFE9;
          padding-left: 11px;
        }

        .scene-item:active {
          transform: scale(0.98);
        }

        .dark-mode .scene-item:hover {
          background: #2A2520;
          padding-left: 11px;
        }

        .scene-item.active {
          background: #FEF9EE;
        }

        .dark-mode .scene-item.active {
          background: #2A2520;
        }

        .scene-number-pill {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 700;
          color: var(--amber);
          background: #FEF3E2;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
          min-width: 20px;
          text-align: center;
        }

        .dark-mode .scene-number-pill {
          background: #2A2520;
        }

        .scene-name {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--body-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .scene-empty {
          font-family: var(--font-ui);
          font-size: 11px;
          font-style: italic;
          color: var(--muted-text);
          padding: 8px 4px;
        }

        /* ═══ WRITING AREA ═══ */
        .writing-area {
          flex: 1;
          overflow-y: auto;
          display: flex;
          justify-content: center;
          padding: 40px 20px 80px;
          background: var(--desk-bg);
          transition: background 200ms ease;
        }

        .page-card {
          width: 100%;
          max-width: 640px;
          min-height: calc(100vh - 128px);
          background: var(--page-bg);
          border: 1px solid var(--page-border);
          box-shadow: 0 4px 48px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
          border-radius: 2px;
          padding: 72px 80px;
          font-family: var(--font-mono);
          font-size: 13px;
          line-height: 1.9;
          color: var(--page-text);
          position: relative;
          animation: float-page 5s ease-in-out infinite;
          transition: background 200ms ease, border-color 200ms ease, 
                      box-shadow 300ms ease, max-width 200ms ease,
                      transform 300ms ease;
        }

        .page-card:hover {
          box-shadow: 0 8px 60px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06);
        }

        .page-card.focus-expanded {
          max-width: 680px;
        }

        .dark-mode .page-card {
          box-shadow: 0 4px 48px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.2);
        }

        .dark-mode .page-card:hover {
          box-shadow: 0 8px 60px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3);
        }

        .page-placeholder {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: var(--muted-text);
          pointer-events: none;
          user-select: none;
        }

        .page-placeholder-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .page-placeholder-text {
          font-family: var(--font-ui);
          font-size: 14px;
          line-height: 1.7;
        }

        .page-placeholder-hint {
          font-family: var(--font-mono);
          font-size: 11px;
          margin-top: 8px;
          color: var(--gutter-label);
        }

        /* ═══ RIGHT PANEL ═══ */
        .right-panel {
          width: 260px;
          min-width: 260px;
          background: var(--panel-bg);
          border-left: 1px solid var(--panel-border);
          padding: 16px 12px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: width 200ms ease, min-width 200ms ease,
                      opacity 200ms ease, padding 200ms ease,
                      background 200ms ease, border-color 200ms ease;
        }

        .right-panel.collapsed {
          width: 0;
          min-width: 0;
          padding: 0;
          opacity: 0;
          overflow: hidden;
        }

        /* ── Note Cards ── */
        .note-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 10px;
          padding: 12px 14px;
          position: relative;
          border-left: 3px solid transparent;
          cursor: pointer;
          transition: border-color 200ms ease, background 200ms ease,
                      transform 200ms ease, box-shadow 200ms ease;
        }

        .note-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }

        .dark-mode .note-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
        }

        .note-card.active {
          border-left-color: var(--amber);
        }

        /* folded corner */
        .note-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 16px;
          height: 16px;
          background: linear-gradient(225deg, var(--panel-bg) 50%, var(--card-border) 50%);
          border-bottom-left-radius: 4px;
        }

        .note-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .note-card-badge {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 700;
          color: #FFFFFF;
          background: var(--amber);
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
        }

        .note-card-scene-name {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--body-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .note-card-textarea {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          resize: none;
          font-family: var(--font-ui);
          font-size: 12px;
          color: var(--body-text);
          line-height: 1.6;
          min-height: 36px;
        }

        .note-card-textarea::placeholder {
          color: var(--muted-text);
        }

        /* ── Notes Empty State ── */
        .notes-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
          text-align: center;
        }

        .notes-empty svg {
          width: 64px;
          height: 64px;
          margin-bottom: 16px;
          opacity: 0.35;
        }

        .notes-empty-text {
          font-family: var(--font-ui);
          font-size: 12px;
          color: var(--muted-text);
          line-height: 1.6;
        }

        /* ═══ SCROLLBAR STYLING ═══ */
        .writing-area::-webkit-scrollbar,
        .left-panel::-webkit-scrollbar,
        .right-panel::-webkit-scrollbar {
          width: 5px;
        }

        .writing-area::-webkit-scrollbar-track,
        .left-panel::-webkit-scrollbar-track,
        .right-panel::-webkit-scrollbar-track {
          background: transparent;
        }

        .writing-area::-webkit-scrollbar-thumb,
        .left-panel::-webkit-scrollbar-thumb,
        .right-panel::-webkit-scrollbar-thumb {
          background: var(--panel-border);
          border-radius: 4px;
        }

        .writing-area::-webkit-scrollbar-thumb:hover,
        .left-panel::-webkit-scrollbar-thumb:hover,
        .right-panel::-webkit-scrollbar-thumb:hover {
          background: var(--muted-text);
        }
      `}</style>

      {/* ── APP SHELL ── */}
      <div className={`app-shell${darkMode ? ' dark-mode' : ''}`}>

        {/* ══ TOPBAR ══ */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-logo">
              <span className="topbar-logo-icon">🎬</span>
              <span>FADE IN.</span>
            </div>
            <div className="topbar-separator" />
            <input
              className="topbar-title-input"
              type="text"
              placeholder="Untitled Screenplay"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className="topbar-center">
            <span>0 words · 0 scenes</span>
            <div className="save-indicator">
              <span className="save-dot" />
              <span>Saved</span>
            </div>
          </div>

          <div className="topbar-right">
            <button
              className="topbar-btn"
              onClick={() => setFocusMode(!focusMode)}
              title="Focus Mode (F11)"
            >
              ✦
            </button>
            <button
              className="topbar-btn"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle Dark Mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button className="topbar-btn-export" title="Export PDF">
              Export PDF
            </button>
          </div>
        </header>

        {/* ══ BODY ══ */}
        <div className="body-layout">

          {/* ── LEFT PANEL ── */}
          <aside className={`left-panel${focusMode ? ' collapsed' : ''}`}>
            {/* FORMAT section */}
            <div>
              <div className="panel-section-label">Format</div>
              {[
                { name: 'Scene Heading', color: '#D97706', shortcut: '⌘1' },
                { name: 'Action',        color: '#78716C', shortcut: '⌘2' },
                { name: 'Character',     color: '#0F6E56', shortcut: '⌘3' },
                { name: 'Parenthetical', color: '#7C3AED', shortcut: '⌘4' },
                { name: 'Dialogue',      color: '#0369A1', shortcut: '⌘5' },
                { name: 'Transition',    color: '#C2410C', shortcut: '⌘6' },
              ].map((fmt, i) => (
                <button
                  key={i}
                  className={`format-btn${i === 0 ? ' active' : ''}`}
                  style={{ borderLeftColor: i === 0 ? fmt.color : 'transparent' }}
                >
                  <span className="format-btn-name">
                    <span className="format-dot" style={{ background: fmt.color }} />
                    {fmt.name}
                  </span>
                  <span className="format-shortcut">{fmt.shortcut}</span>
                </button>
              ))}
            </div>

            {/* JUMP TO section */}
            <div>
              <div className="panel-section-label">Jump To</div>
              <div className="scene-list">
                <p className="scene-empty">No scenes yet</p>
              </div>
            </div>
          </aside>

          {/* ── WRITING AREA ── */}
          <main className="writing-area">
            <div className={`page-card${focusMode ? ' focus-expanded' : ''}`}>
              {/* Placeholder shown when no blocks exist */}
              <div className="page-placeholder">
                <div className="page-placeholder-icon">✍️</div>
                <p className="page-placeholder-text">
                  Start writing your screenplay.<br />
                  The page formats automatically as you type.
                </p>
                <p className="page-placeholder-hint">
                  Type <strong>INT.</strong> or <strong>EXT.</strong> to begin a scene
                </p>
              </div>
            </div>
          </main>

          {/* ── RIGHT PANEL ── */}
          <aside className={`right-panel${focusMode ? ' collapsed' : ''}`}>
            <div className="panel-section-label">Scene Notes</div>

            {/* Empty state */}
            <div className="notes-empty">
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="14" y="8" width="36" height="48" rx="3" 
                      stroke="currentColor" strokeWidth="2" fill="none"/>
                <line x1="22" y1="20" x2="42" y2="20" 
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="22" y1="28" x2="38" y2="28" 
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="22" y1="36" x2="35" y2="36" 
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M44 38L52 30L56 34L48 42H44V38Z" 
                      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <p className="notes-empty-text">
                Start writing to see<br />your scenes here
              </p>
            </div>
          </aside>

        </div>
      </div>
    </>
  );
};

export default ScreenplayEditor;
