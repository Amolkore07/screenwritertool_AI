import React, { useState, useRef, useCallback, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════
   SCREENPLAY EDITOR — Part 1 + Part 2
   Layout Shell + Core Editor Engine with Block Types
   ═══════════════════════════════════════════════════════════════ */

// ── Block type definitions ──
const BLOCK_TYPES = [
  { type: 'SCENE_HEADING',  name: 'Scene Heading', color: '#D97706', shortcut: '⌘1' },
  { type: 'ACTION',         name: 'Action',        color: '#78716C', shortcut: '⌘2' },
  { type: 'CHARACTER',      name: 'Character',     color: '#0F6E56', shortcut: '⌘3' },
  { type: 'PARENTHETICAL',  name: 'Parenthetical', color: '#7C3AED', shortcut: '⌘4' },
  { type: 'DIALOGUE',       name: 'Dialogue',      color: '#0369A1', shortcut: '⌘5' },
  { type: 'TRANSITION',     name: 'Transition',    color: '#C2410C', shortcut: '⌘6' },
];

// ── Font options ──
const FONT_OPTIONS = [
  { name: 'Courier Prime',  value: "'Courier Prime', monospace" },
  { name: 'Courier New',    value: "'Courier New', monospace" },
  { name: 'Special Elite',  value: "'Special Elite', cursive" },
  { name: 'Cutive Mono',    value: "'Cutive Mono', monospace" },
  { name: 'IBM Plex Mono',  value: "'IBM Plex Mono', monospace" },
  { name: 'Source Code Pro', value: "'Source Code Pro', monospace" },
];

// ── Helper: generate unique IDs ──
let blockIdCounter = 100;
const newId = () => `block-${++blockIdCounter}`;

// ── Sample content ──
const SAMPLE_BLOCKS = [
  { id: newId(), type: 'SCENE_HEADING',  text: 'INT. COFFEE SHOP - DAY' },
  { id: newId(), type: 'ACTION',         text: 'A rain-soaked detective pushes through the door. His coat drips onto the linoleum floor. Nobody looks up.' },
  { id: newId(), type: 'CHARACTER',      text: 'MARLOWE' },
  { id: newId(), type: 'DIALOGUE',       text: 'Two sugars. And whatever passes for hope around here.' },
  { id: newId(), type: 'ACTION',         text: "The BARISTA doesn't smile. She's seen his type before." },
  { id: newId(), type: 'CHARACTER',      text: 'BARISTA' },
  { id: newId(), type: 'DIALOGUE',       text: "Hope's extra." },
  { id: newId(), type: 'TRANSITION',     text: 'CUT TO:' },
  { id: newId(), type: 'SCENE_HEADING',  text: 'EXT. RAIN-SLICKED ALLEY - NIGHT' },
  { id: newId(), type: 'ACTION',         text: 'Shadows swallow the mouth of the alley. A single streetlamp flickers, unsure of itself.' },
];

// ── Helper: get display label for block type ──
const getBlockLabel = (type) => {
  const found = BLOCK_TYPES.find(b => b.type === type);
  return found ? found.name.toUpperCase() : type;
};

// ── Helper: count words ──
const countWords = (blocks) => {
  const allText = blocks.map(b => b.text).join(' ');
  const trimmed = allText.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
};

// ── Helper: count scenes ──
const countScenes = (blocks) => {
  return blocks.filter(b => b.type === 'SCENE_HEADING').length;
};

// ── Helper: get scenes list ──
const getScenes = (blocks) => {
  let sceneNum = 0;
  return blocks
    .filter(b => b.type === 'SCENE_HEADING')
    .map(b => {
      sceneNum++;
      return { id: b.id, number: sceneNum, text: b.text };
    });
};

// ═══════════════════════════════════════════════
// BLOCK COMPONENT — single contentEditable block
// ═══════════════════════════════════════════════
const Block = React.memo(({ block, isActive, onFocus, onInput, onKeyDown }) => {
  const ref = useRef(null);

  // Sync text content when block text changes externally
  useEffect(() => {
    if (ref.current && ref.current.textContent !== block.text) {
      ref.current.textContent = block.text;
    }
  }, [block.text]);

  const handleInput = useCallback(() => {
    if (ref.current) {
      onInput(block.id, ref.current.textContent);
    }
  }, [block.id, onInput]);

  const handleKeyDown = useCallback((e) => {
    onKeyDown(e, block.id);
  }, [block.id, onKeyDown]);

  const handleFocus = useCallback(() => {
    onFocus(block.id);
  }, [block.id, onFocus]);

  const blockClass = `block block-${block.type.toLowerCase().replace('_', '-')}${isActive ? ' block-active' : ''}`;

  return (
    <div className="block-wrapper">
      {/* Gutter label — only visible on active block */}
      {isActive && (
        <span className="gutter-label">{getBlockLabel(block.type)}</span>
      )}
      <div
        ref={ref}
        className={blockClass}
        contentEditable
        suppressContentEditableWarning
        spellCheck={true}
        onFocus={handleFocus}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-block-id={block.id}
        data-block-type={block.type}
      />
    </div>
  );
});

// ═══════════════════════════════════════
// MAIN EDITOR COMPONENT
// ═══════════════════════════════════════
const ScreenplayEditor = () => {
  const [title, setTitle] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [blocks, setBlocks] = useState(SAMPLE_BLOCKS);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].value);

  const saveTimerRef = useRef(null);
  const editorRef = useRef(null);

  // ── Derived data ──
  const wordCount = countWords(blocks);
  const sceneCount = countScenes(blocks);
  const scenes = getScenes(blocks);

  // ── Find which scene the active block belongs to ──
  const getActiveSceneId = useCallback(() => {
    if (!activeBlockId) return null;
    const idx = blocks.findIndex(b => b.id === activeBlockId);
    for (let i = idx; i >= 0; i--) {
      if (blocks[i].type === 'SCENE_HEADING') return blocks[i].id;
    }
    return null;
  }, [activeBlockId, blocks]);

  const activeSceneId = getActiveSceneId();

  // ── Auto-save indicator ──
  const triggerSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaved(false);
    saveTimerRef.current = setTimeout(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 300);
  }, []);

  // ── Focus a block by ID ──
  const focusBlock = useCallback((blockId) => {
    requestAnimationFrame(() => {
      const el = editorRef.current?.querySelector(`[data-block-id="${blockId}"]`);
      if (el) {
        el.focus();
        // Place cursor at end
        const range = document.createRange();
        const sel = window.getSelection();
        if (el.childNodes.length > 0) {
          range.selectNodeContents(el);
          range.collapse(false);
        } else {
          range.setStart(el, 0);
          range.collapse(true);
        }
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
  }, []);

  // ── Handle block text input ──
  const handleBlockInput = useCallback((blockId, newText) => {
    setBlocks(prev => prev.map(b =>
      b.id === blockId ? { ...b, text: newText } : b
    ));
    triggerSave();
  }, [triggerSave]);

  // ── Handle block focus ──
  const handleBlockFocus = useCallback((blockId) => {
    setActiveBlockId(blockId);
  }, []);

  // ── Handle key events on blocks ──
  const handleBlockKeyDown = useCallback((e, blockId) => {
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    const currentBlock = blocks[blockIndex];

    // ENTER — create new block below
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const id = newId();
      const newBlock = { id, type: 'ACTION', text: '' };

      setBlocks(prev => {
        const updated = [...prev];
        updated.splice(blockIndex + 1, 0, newBlock);
        return updated;
      });

      setTimeout(() => focusBlock(id), 0);
      triggerSave();
      return;
    }

    // BACKSPACE on empty block — delete and focus previous
    if (e.key === 'Backspace' && currentBlock.text === '' && blocks.length > 1) {
      e.preventDefault();
      const prevId = blockIndex > 0 ? blocks[blockIndex - 1].id : null;

      setBlocks(prev => prev.filter(b => b.id !== blockId));

      if (prevId) {
        setTimeout(() => focusBlock(prevId), 0);
      }
      triggerSave();
      return;
    }

    // ARROW DOWN at end of block — move to next block
    if (e.key === 'ArrowDown') {
      const sel = window.getSelection();
      const el = e.target;
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (range.collapsed && range.endOffset === (el.textContent || '').length) {
          if (blockIndex < blocks.length - 1) {
            e.preventDefault();
            focusBlock(blocks[blockIndex + 1].id);
          }
        }
      }
    }

    // ARROW UP at start of block — move to previous block
    if (e.key === 'ArrowUp') {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (range.collapsed && range.startOffset === 0) {
          if (blockIndex > 0) {
            e.preventDefault();
            focusBlock(blocks[blockIndex - 1].id);
          }
        }
      }
    }
  }, [blocks, focusBlock, triggerSave]);

  // ── Change block type (from format buttons) ──
  const changeBlockType = useCallback((newType) => {
    if (!activeBlockId) return;
    setBlocks(prev => prev.map(b =>
      b.id === activeBlockId ? { ...b, type: newType } : b
    ));
    triggerSave();
    // Re-focus the block
    setTimeout(() => focusBlock(activeBlockId), 0);
  }, [activeBlockId, focusBlock, triggerSave]);

  // ── Scroll to a scene ──
  const scrollToScene = useCallback((sceneBlockId) => {
    const el = editorRef.current?.querySelector(`[data-block-id="${sceneBlockId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveBlockId(sceneBlockId);
      setTimeout(() => focusBlock(sceneBlockId), 300);
    }
  }, [focusBlock]);

  // ── Get active block type ──
  const activeBlock = blocks.find(b => b.id === activeBlockId);
  const activeBlockType = activeBlock?.type || null;

  return (
    <>
      {/* ── ALL CSS ── */}
      <style>{`
        /* ═══ GOOGLE FONTS ═══ */
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=Special+Elite&family=Cutive+Mono&family=IBM+Plex+Mono:wght@400;700&family=Source+Code+Pro:wght@400;700&display=swap');

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
          align-items: flex-start;
          padding: 40px 20px 120px;
          background: var(--desk-bg);
          transition: background 200ms ease;
        }

        .page-card {
          width: 100%;
          max-width: 640px;
          min-height: 1056px;
          background: var(--page-bg);
          border: 1px solid var(--page-border);
          box-shadow: 0 4px 48px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
          border-radius: 2px;
          padding: 72px 80px;
          font-size: 13px;
          line-height: 1.9;
          color: var(--page-text);
          position: relative;
          animation: float-page 5s ease-in-out infinite;
          transition: background 200ms ease, border-color 200ms ease, 
                      box-shadow 300ms ease, max-width 200ms ease,
                      transform 300ms ease;

          /* ── Infinite page: repeating page-break line every 1056px ── */
          background-image: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 1055px,
            var(--panel-border) 1055px,
            var(--panel-border) 1056px
          );
          background-color: var(--page-bg);
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

        /* ═══ FONT SELECTOR ═══ */
        .font-selector-section {
          margin-top: 0;
        }

        .font-select {
          width: 100%;
          padding: 7px 10px;
          border: 1px solid var(--panel-border);
          border-radius: 6px;
          background: var(--card-bg);
          color: var(--body-text);
          font-family: var(--font-ui);
          font-size: 12px;
          cursor: pointer;
          outline: none;
          transition: border-color 150ms ease, box-shadow 150ms ease;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239C9590'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          padding-right: 28px;
        }

        .font-select:hover {
          border-color: var(--amber);
        }

        .font-select:focus {
          border-color: var(--amber);
          box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.15);
        }

        .font-preview {
          margin-top: 6px;
          padding: 8px 10px;
          border-radius: 6px;
          background: var(--active-wash);
          font-size: 12px;
          line-height: 1.6;
          color: var(--body-text);
        }

        /* ═══ BLOCK STYLES ═══ */
        .block-wrapper {
          position: relative;
        }

        .block {
          outline: none;
          border: none;
          padding: 2px 4px;
          border-radius: 3px;
          min-height: 1.9em;
          transition: background 150ms ease;
          cursor: text;
        }

        .block:empty::before {
          content: attr(data-placeholder);
          color: var(--gutter-label);
          pointer-events: none;
        }

        .block-active {
          background: var(--active-wash);
        }

        /* ── Scene Heading ── */
        .block-scene-heading {
          text-transform: uppercase;
          font-weight: 700;
          border-left: 3px solid var(--amber);
          padding-left: 10px;
          margin-top: 24px;
        }

        .block-wrapper:first-child .block-scene-heading {
          margin-top: 0;
        }

        /* ── Action ── */
        .block-action {
          margin-top: 12px;
        }

        .block-wrapper:first-child .block-action {
          margin-top: 0;
        }

        /* ── Character ── */
        .block-character {
          text-transform: uppercase;
          margin-left: 40%;
          margin-top: 16px;
          color: var(--page-text);
        }

        /* ── Parenthetical ── */
        .block-parenthetical {
          margin-left: 35%;
          margin-right: 35%;
          font-style: italic;
          color: var(--muted-text);
        }

        .dark-mode .block-parenthetical {
          color: #8A857E;
        }

        /* ── Dialogue ── */
        .block-dialogue {
          margin-left: 25%;
          margin-right: 25%;
          margin-top: 4px;
          color: var(--page-text);
        }

        /* ── Transition ── */
        .block-transition {
          text-transform: uppercase;
          text-align: right;
          color: var(--muted-text);
          margin-top: 16px;
        }

        .dark-mode .block-transition {
          color: #8A857E;
        }

        /* ── Gutter Label ── */
        .gutter-label {
          position: absolute;
          left: -90px;
          top: 50%;
          transform: translateY(-50%);
          font-family: var(--font-ui);
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--gutter-label);
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
        }

        /* ═══ PLACEHOLDER (shown when editor is empty) ═══ */
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
            <span>{wordCount} words · {sceneCount} scenes</span>
            <div className={`save-indicator${saved ? ' visible' : ''}`}>
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
              {BLOCK_TYPES.map((fmt) => (
                <button
                  key={fmt.type}
                  className={`format-btn${activeBlockType === fmt.type ? ' active' : ''}`}
                  style={{ borderLeftColor: activeBlockType === fmt.type ? fmt.color : 'transparent' }}
                  onClick={() => changeBlockType(fmt.type)}
                >
                  <span className="format-btn-name">
                    <span className="format-dot" style={{ background: fmt.color }} />
                    {fmt.name}
                  </span>
                  <span className="format-shortcut">{fmt.shortcut}</span>
                </button>
              ))}
            </div>

            {/* FONT section */}
            <div className="font-selector-section">
              <div className="panel-section-label">Font</div>
              <select
                className="font-select"
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.name} value={f.value} style={{ fontFamily: f.value }}>
                    {f.name}
                  </option>
                ))}
              </select>
              <div className="font-preview" style={{ fontFamily: selectedFont }}>
                INT. PREVIEW - DAY
              </div>
            </div>

            {/* JUMP TO section */}
            <div>
              <div className="panel-section-label">Jump To</div>
              <div className="scene-list">
                {scenes.length === 0 ? (
                  <p className="scene-empty">No scenes yet</p>
                ) : (
                  scenes.map((scene) => (
                    <button
                      key={scene.id}
                      className={`scene-item${activeSceneId === scene.id ? ' active' : ''}`}
                      onDoubleClick={() => scrollToScene(scene.id)}
                      onClick={() => scrollToScene(scene.id)}
                    >
                      <span className="scene-number-pill">{scene.number}</span>
                      <span className="scene-name">{scene.text || 'Untitled Scene'}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* ── WRITING AREA ── */}
          <main className="writing-area">
            <div
              ref={editorRef}
              className={`page-card${focusMode ? ' focus-expanded' : ''}`}
              style={{ fontFamily: selectedFont }}
            >
              {blocks.length === 0 ? (
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
              ) : (
                blocks.map((block) => (
                  <Block
                    key={block.id}
                    block={block}
                    isActive={activeBlockId === block.id}
                    onFocus={handleBlockFocus}
                    onInput={handleBlockInput}
                    onKeyDown={handleBlockKeyDown}
                  />
                ))
              )}
            </div>
          </main>

          {/* ── RIGHT PANEL ── */}
          <aside className={`right-panel${focusMode ? ' collapsed' : ''}`}>
            <div className="panel-section-label">Scene Notes</div>

            {scenes.length === 0 ? (
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
            ) : (
              scenes.map((scene) => (
                <div
                  key={scene.id}
                  className={`note-card${activeSceneId === scene.id ? ' active' : ''}`}
                  onClick={() => scrollToScene(scene.id)}
                >
                  <div className="note-card-header">
                    <span className="note-card-badge">S{scene.number}</span>
                    <span className="note-card-scene-name">{scene.text}</span>
                  </div>
                  <textarea
                    className="note-card-textarea"
                    placeholder="Notes for this scene..."
                    onClick={(e) => e.stopPropagation()}
                    rows={2}
                  />
                </div>
              ))
            )}
          </aside>

        </div>
      </div>
    </>
  );
};

export default ScreenplayEditor;
