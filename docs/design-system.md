# Local Note Design System

## 1. Overview

### 1.1 Design Philosophy
- **Dark First**: Default dark theme to minimize eye strain during extended use
- **Minimal & Clean**: Remove unnecessary elements and focus on content with a clean interface
- **Accessibility First**: Inclusive design accessible to all users
- **Productivity Focused**: Function-centered design supporting efficient workflows

### 1.2 Design Principles
1. **Consistency**: All elements follow consistent patterns and rules
2. **Readability**: Optimal readability as a text-centered service
3. **Efficiency**: Intuitive interface for fast navigation and task completion
4. **Scalability**: Flexible system considering future feature expansion

## 2. Color System

### 2.1 Primary Color Palette

#### Dark Theme (Default)
```css
:root {
  /* Primary Colors */
  --color-primary-50: #f0f9ff;
  --color-primary-100: #e0f2fe;
  --color-primary-200: #bae6fd;
  --color-primary-300: #7dd3fc;
  --color-primary-400: #38bdf8;
  --color-primary-500: #0ea5e9;
  --color-primary-600: #0284c7;
  --color-primary-700: #0369a1;
  --color-primary-800: #075985;
  --color-primary-900: #0c4a6e;
  
  /* Background Colors */
  --color-bg-primary: #0a0a0a;      /* Main background */
  --color-bg-secondary: #161616;    /* Card, panel background */
  --color-bg-tertiary: #262626;     /* Hover, selected state */
  --color-bg-elevated: #1e1e1e;     /* Modal, dropdown */
  
  /* Text Colors */
  --color-text-primary: #ffffff;    /* Primary text */
  --color-text-secondary: #a3a3a3;  /* Secondary text */
  --color-text-tertiary: #737373;   /* Inactive text */
  --color-text-inverse: #0a0a0a;    /* Inverse text */
  
  /* Border Colors */
  --color-border-primary: #404040;  /* Default border */
  --color-border-secondary: #262626; /* Secondary border */
  --color-border-focus: #0ea5e9;    /* Focus border */
}
```

#### Light Theme (Optional)
```css
[data-theme="light"] {
  /* Primary Colors - Same as above */
  
  /* Background Colors */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  --color-bg-elevated: #ffffff;
  
  /* Text Colors */
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-tertiary: #94a3b8;
  --color-text-inverse: #ffffff;
  
  /* Border Colors */
  --color-border-primary: #e2e8f0;
  --color-border-secondary: #f1f5f9;
  --color-border-focus: #0ea5e9;
}
```

### 2.2 State Colors

```css
:root {
  /* Success */
  --color-success-50: #f0fdf4;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  --color-success-900: #14532d;
  
  /* Warning */
  --color-warning-50: #fffbeb;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  --color-warning-900: #78350f;
  
  /* Error */
  --color-error-50: #fef2f2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  --color-error-900: #7f1d1d;
  
  /* Info */
  --color-info-50: #eff6ff;
  --color-info-500: #3b82f6;
  --color-info-600: #2563eb;
  --color-info-900: #1e3a8a;
}
```

### 2.3 Color Usage Guidelines

- **Primary Blue**: Action buttons, links, active states
- **Background Hierarchy**: primary → secondary → tertiary for layer composition
- **Text Hierarchy**: primary → secondary → tertiary for importance expression
- **State Colors**: Clear distinction between success, warning, error, and info states

## 3. Typography

### 3.1 Font Families

```css
:root {
  /* Primary Font (UI) */
  --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                      'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  
  /* Monospace Font (Code) */
  --font-family-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 
                      'SF Mono', 'Monaco', 'Inconsolata', monospace;
  
  /* Reading Font (Content) */
  --font-family-serif: 'Charter', 'Georgia', 'Times New Roman', serif;
}
```

### 3.2 Font Sizes and Line Heights

```css
:root {
  /* Font Sizes */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  
  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
  
  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### 3.3 Text Style Classes

```css
/* Headings */
.text-h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  color: var(--color-text-primary);
}

.text-h2 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  color: var(--color-text-primary);
}

.text-h3 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
}

/* Body Text */
.text-body-lg {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
}

.text-body {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
}

.text-body-sm {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: var(--color-text-secondary);
}

/* Code Text */
.text-code {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  background: var(--color-bg-tertiary);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  color: var(--color-text-primary);
}
```

## 4. Spacing System

### 4.1 Base Spacing Units

```css
:root {
  /* Base unit: 4px */
  --space-0: 0;
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
  --space-24: 6rem;    /* 96px */
}
```

### 4.2 Component Spacing Guidelines

- **Button internal padding**: `--space-3 --space-4` (12px 16px)
- **Card padding**: `--space-6` (24px)
- **Section spacing**: `--space-12` (48px)
- **Default element spacing**: `--space-4` (16px)
- **Text line spacing**: `--space-2` (8px)

## 5. Component System

### 5.1 Buttons

#### Primary Button
```css
.btn-primary {
  background: var(--color-primary-600);
  color: var(--color-text-inverse);
  border: 1px solid var(--color-primary-600);
  padding: var(--space-3) var(--space-4);
  border-radius: 0.375rem;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  transition: all 0.2s ease;
  cursor: pointer;
  font-family: var(--font-family-sans);
}

.btn-primary:hover {
  background: var(--color-primary-700);
  border-color: var(--color-primary-700);
  transform: translateY(-1px);
}

.btn-primary:focus {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
  padding: var(--space-3) var(--space-4);
  border-radius: 0.375rem;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  transition: all 0.2s ease;
  cursor: pointer;
  font-family: var(--font-family-sans);
}

.btn-secondary:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-focus);
}
```

#### Ghost Button
```css
.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border: none;
  padding: var(--space-2) var(--space-3);
  border-radius: 0.375rem;
  font-weight: var(--font-weight-normal);
  font-size: var(--font-size-sm);
  transition: all 0.2s ease;
  cursor: pointer;
  font-family: var(--font-family-sans);
}

.btn-ghost:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}
```

### 5.2 Input Fields

```css
.input {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-secondary);
  color: var(--color-text-primary);
  padding: var(--space-3) var(--space-4);
  border-radius: 0.375rem;
  font-size: var(--font-size-sm);
  transition: all 0.2s ease;
  width: 100%;
  font-family: var(--font-family-sans);
}

.input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.input::placeholder {
  color: var(--color-text-tertiary);
}

.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 5.3 Cards

```css
.card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-secondary);
  border-radius: 0.5rem;
  padding: var(--space-6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-elevated {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-primary);
  border-radius: 0.5rem;
  padding: var(--space-6);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}
```

### 5.4 Tab System

```css
.tab-bar {
  display: flex;
  align-items: center;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-secondary);
  overflow-x: auto;
  padding: 0 var(--space-4);
  gap: var(--space-2);
}

.tab {
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  padding: var(--space-3) var(--space-4);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0.375rem 0.375rem 0 0;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  min-width: 120px;
  max-width: 200px;
  position: relative;
}

.tab:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-tertiary);
}

.tab.active {
  color: var(--color-primary-400);
  background: var(--color-bg-primary);
  border-bottom-color: var(--color-primary-400);
}

.tab.dirty::after {
  content: '•';
  color: var(--color-warning-500);
  margin-left: var(--space-1);
  font-size: var(--font-size-lg);
}

.tab-close {
  margin-left: var(--space-2);
  padding: var(--space-1);
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
}

.tab-close:hover {
  background: var(--color-error-500);
  color: var(--color-text-inverse);
}

.tab-add {
  background: transparent;
  border: 1px dashed var(--color-border-primary);
  color: var(--color-text-secondary);
  padding: var(--space-2);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-add:hover {
  border-color: var(--color-primary-400);
  color: var(--color-primary-400);
  background: var(--color-bg-tertiary);
}
```

### 5.5 Dialogs and Modals

```css
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.dialog {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-primary);
  border-radius: 0.75rem;
  padding: var(--space-6);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.dialog-header {
  margin-bottom: var(--space-4);
}

.dialog-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.dialog-content {
  margin-bottom: var(--space-6);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

.dialog-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}

/* Confirm Dialog Variants */
.dialog.danger .dialog-title {
  color: var(--color-error-500);
}

.dialog.warning .dialog-title {
  color: var(--color-warning-500);
}

.dialog.info .dialog-title {
  color: var(--color-info-500);
}
```

## 6. Editor Components

### 6.1 Markdown Editor Styles

```css
.markdown-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg-primary);
  border-radius: 0.5rem;
  overflow: hidden;
}

.markdown-editor-toolbar {
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-primary);
  padding: var(--space-2);
  display: flex;
  gap: var(--space-1);
  flex-wrap: wrap;
}

.markdown-editor-content {
  flex: 1;
  display: flex;
  min-height: 0;
}

.markdown-editor-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.markdown-textarea {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: var(--space-6);
  color: var(--color-text-primary);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  resize: none;
}

.markdown-textarea::placeholder {
  color: var(--color-text-tertiary);
  font-style: italic;
}

.markdown-preview {
  flex: 1;
  padding: var(--space-6);
  overflow-y: auto;
  border-left: 1px solid var(--color-border-primary);
  background: var(--color-bg-primary);
}
```

### 6.2 SimpleMDE Editor Customization

```css
/* SimpleMDE Dark Theme Customization */
.dark-theme .EasyMDEContainer {
  background: var(--color-bg-primary);
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border-secondary);
  border-radius: 0.5rem;
  overflow: hidden;
}

.dark-theme .EasyMDEContainer .editor-toolbar {
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-primary);
  border-top: none;
  border-left: none;
  border-right: none;
  padding: var(--space-2);
}

.dark-theme .EasyMDEContainer .editor-toolbar button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  padding: var(--space-2);
  margin: 0 var(--space-1);
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.dark-theme .EasyMDEContainer .editor-toolbar button:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.dark-theme .EasyMDEContainer .editor-toolbar button.active {
  background: var(--color-primary-600);
  color: var(--color-text-inverse);
}

.dark-theme .EasyMDEContainer .CodeMirror {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: none;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  height: 100%;
  flex: 1;
}

.dark-theme .EasyMDEContainer .CodeMirror .CodeMirror-cursor {
  border-left: 1px solid var(--color-text-primary);
}

.dark-theme .EasyMDEContainer .CodeMirror .CodeMirror-selected {
  background: var(--color-bg-tertiary);
}

.dark-theme .EasyMDEContainer .CodeMirror-placeholder {
  color: var(--color-text-tertiary) !important;
  font-style: italic;
}

.dark-theme .EasyMDEContainer .editor-preview {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  border-left: 1px solid var(--color-border-primary);
  padding: var(--space-6);
  flex: 1;
  overflow-y: auto;
}

.dark-theme .EasyMDEContainer .editor-preview h1,
.dark-theme .EasyMDEContainer .editor-preview h2,
.dark-theme .EasyMDEContainer .editor-preview h3,
.dark-theme .EasyMDEContainer .editor-preview h4,
.dark-theme .EasyMDEContainer .editor-preview h5,
.dark-theme .EasyMDEContainer .editor-preview h6 {
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border-primary);
  padding-bottom: var(--space-2);
  margin-bottom: var(--space-4);
}

.dark-theme .EasyMDEContainer .editor-preview pre {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: 0.375rem;
  padding: var(--space-4);
  color: var(--color-text-primary);
  overflow-x: auto;
}

.dark-theme .EasyMDEContainer .editor-preview code {
  background: var(--color-bg-tertiary);
  color: var(--color-primary-400);
  padding: var(--space-1) var(--space-2);
  border-radius: 0.25rem;
  font-family: var(--font-family-mono);
}
```

## 7. PWA Components

### 7.1 Install Prompt

```css
.install-prompt {
  position: fixed;
  bottom: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
}

.install-content {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-primary);
  color: var(--color-text-primary);
  padding: var(--space-6);
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  text-align: center;
}

.install-content h3 {
  margin: 0 0 var(--space-4) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.install-content p {
  margin: 0 0 var(--space-6) 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

.install-buttons {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
}

.install-btn {
  background: var(--color-primary-600);
  color: var(--color-text-inverse);
  border: none;
  padding: var(--space-3) var(--space-5);
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  transition: all 0.2s ease;
  font-family: var(--font-family-sans);
}

.install-btn:hover {
  background: var(--color-primary-700);
}

.dismiss-btn {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-primary);
  padding: var(--space-3) var(--space-5);
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  transition: all 0.2s ease;
  font-family: var(--font-family-sans);
}

.dismiss-btn:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}
```

### 7.2 PWA Status Indicator

```css
.pwa-status {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-secondary);
  border-radius: 0.5rem;
  padding: var(--space-4);
  margin-top: var(--space-4);
}

.pwa-status h4 {
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

.status-grid {
  display: grid;
  gap: var(--space-2);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-1) 0;
}

.status-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.status-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.status-value.online { color: var(--color-success-500); }
.status-value.offline { color: var(--color-error-500); }
.status-value.installed { color: var(--color-info-500); }
.status-value.browser { color: var(--color-text-tertiary); }
.status-value.active { color: var(--color-success-500); }
.status-value.inactive { color: var(--color-warning-500); }
```

## 8. Layout System

### 8.1 Grid System

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.grid {
  display: grid;
  gap: var(--space-4);
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

/* Responsive breakpoints */
@media (max-width: 768px) {
  .grid-cols-2,
  .grid-cols-3 {
    grid-template-columns: 1fr;
  }
}
```

### 8.2 Flex Utilities

```css
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.flex-1 {
  flex: 1;
}

.items-center {
  align-items: center;
}

.items-start {
  align-items: flex-start;
}

.items-end {
  align-items: flex-end;
}

.justify-between {
  justify-content: space-between;
}

.justify-center {
  justify-content: center;
}

.justify-start {
  justify-content: flex-start;
}

.justify-end {
  justify-content: flex-end;
}

.gap-1 { gap: var(--space-1); }
.gap-2 { gap: var(--space-2); }
.gap-3 { gap: var(--space-3); }
.gap-4 { gap: var(--space-4); }
.gap-6 { gap: var(--space-6); }
```

### 8.3 Main Application Layout

```css
.app-layout {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100vh;
  background: var(--color-bg-primary);
  overflow: hidden;
}

.app-header {
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-secondary);
  padding: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-main {
  display: grid;
  grid-template-columns: 320px 1fr;
  overflow: hidden;
  min-height: 0;
}

.app-sidebar {
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-bg-primary);
}

/* Responsive layout */
@media (max-width: 768px) {
  .app-main {
    grid-template-columns: 1fr;
  }
  
  .app-sidebar {
    display: none;
  }
  
  .app-sidebar.mobile-open {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
  }
}
```

## 9. Animation System

### 9.1 Base Transitions

```css
:root {
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s ease;
  --transition-slow: 0.3s ease;
  --transition-bounce: 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.transition-fast {
  transition: all var(--transition-fast);
}

.transition-normal {
  transition: all var(--transition-normal);
}

.transition-slow {
  transition: all var(--transition-slow);
}

.transition-bounce {
  transition: all var(--transition-bounce);
}
```

### 9.2 Animation Keyframes

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-0.5rem);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

.fade-out {
  animation: fadeOut 0.3s ease-out;
}

.slide-up {
  animation: slideUp 0.3s ease-out;
}

.spin {
  animation: spin 1s linear infinite;
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### 9.3 Interactive States

```css
.hover-lift {
  transition: transform var(--transition-normal);
}

.hover-lift:hover {
  transform: translateY(-1px);
}

.hover-scale {
  transition: transform var(--transition-normal);
}

.hover-scale:hover {
  transform: scale(1.02);
}

.hover-bg {
  transition: background-color var(--transition-normal);
}

.hover-bg:hover {
  background: var(--color-bg-tertiary);
}

.focus-ring {
  outline: 2px solid transparent;
  outline-offset: 2px;
  transition: outline var(--transition-fast);
}

.focus-ring:focus {
  outline: 2px solid var(--color-primary-500);
}

.focus-ring:focus:not(:focus-visible) {
  outline: none;
}
```

## 10. Loading and State Components

### 10.1 Loading States

```css
.loading {
  position: relative;
  color: transparent;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1rem;
  height: 1rem;
  margin: -0.5rem 0 0 -0.5rem;
  border: 2px solid var(--color-border-secondary);
  border-top-color: var(--color-primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--color-border-secondary);
  border-top-color: var(--color-primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.save-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.save-indicator.saving {
  color: var(--color-warning-500);
}

.save-indicator.saved {
  color: var(--color-success-500);
}

.save-indicator.error {
  color: var(--color-error-500);
}
```

### 10.2 Empty States

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--space-4);
  opacity: 0.7;
}

.empty-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.empty-subtext {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-6);
}

.empty-action {
  /* Use button styles */
}
```

## 11. Responsive Design

### 11.1 Breakpoints

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### 11.2 Responsive Utilities

```css
/* Mobile First Approach */
.hidden {
  display: none;
}

@media (min-width: 640px) {
  .sm\:block { display: block; }
  .sm\:flex { display: flex; }
  .sm\:hidden { display: none; }
  .sm\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 768px) {
  .md\:block { display: block; }
  .md\:flex { display: flex; }
  .md\:hidden { display: none; }
  .md\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1024px) {
  .lg\:block { display: block; }
  .lg\:flex { display: flex; }
  .lg\:hidden { display: none; }
  .lg\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
}
```

### 11.3 Mobile Optimizations

```css
/* Touch-friendly button sizes */
@media (max-width: 768px) {
  .btn-primary,
  .btn-secondary,
  .btn-ghost {
    min-height: 44px;
    padding: var(--space-3) var(--space-4);
  }
  
  .tab {
    min-height: 44px;
    padding: var(--space-3) var(--space-4);
  }
  
  /* Larger text for readability */
  .text-body {
    font-size: var(--font-size-lg);
  }
  
  /* Increased spacing for touch */
  .gap-2 { gap: var(--space-3); }
  .gap-3 { gap: var(--space-4); }
}
```

## 12. Accessibility Guidelines

### 12.1 Color Contrast

- **AA Level**: Maintain contrast ratio of 4.5:1 or higher
- **AAA Level**: Maintain contrast ratio of 7:1 or higher for important text
- **No Color-Only Information**: Use icons, patterns, or additional indicators

### 12.2 Keyboard Navigation

```css
/* Keyboard focus indicators */
.keyboard-only:focus {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Hide outline for mouse users */
.no-outline:focus:not(:focus-visible) {
  outline: none;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  border: 1px solid var(--color-border-focus);
  z-index: 1001;
}

.skip-link:focus {
  top: 6px;
}
```

### 12.3 Screen Reader Support

```css
/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Screen reader only, but focusable */
.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: 0;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

## 13. Dark Theme Optimization

### 13.1 Dark Mode Considerations

- **Eye Strain Reduction**: Use soft dark colors instead of pure black (#000000)
- **Text Readability**: Sufficient contrast ratios and appropriate font weights
- **Color Temperature**: Warm-toned colors for comfortable extended use
- **Blue Light Reduction**: Minimize harsh blue components in the color palette

### 13.2 Dark Mode Specific Styles

```css
/* Dark mode auto-detection */
@media (prefers-color-scheme: dark) {
  .auto-theme {
    /* Automatically apply dark theme styles */
  }
}

/* Dark mode image optimizations */
.dark-mode img {
  filter: brightness(0.8) contrast(1.2);
}

.dark-mode .invert-on-dark {
  filter: invert(1);
}

/* Dark mode specific shadows */
.dark-mode .shadow-sm {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.dark-mode .shadow-md {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.dark-mode .shadow-lg {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.3);
}
```

## 14. Implementation Guidelines

### 14.1 CSS Variables Usage

All design tokens are defined as CSS variables to ensure consistency and maintainability. Use semantic naming conventions and avoid hard-coded values.

### 14.2 Component-Based Approach

Example implementation in Svelte:

```svelte
<script>
  export let variant = 'primary';
  export let size = 'md';
  export let disabled = false;
</script>

<button 
  class="btn btn-{variant} btn-{size}" 
  class:disabled
  {disabled}
  on:click
>
  <slot />
</button>

<style>
  .btn {
    /* Base button styles using CSS variables */
    font-family: var(--font-family-sans);
    border-radius: 0.375rem;
    transition: var(--transition-normal);
    /* ... other base styles */
  }
  
  .btn-primary {
    background: var(--color-primary-600);
    color: var(--color-text-inverse);
    /* ... */
  }
  
  .btn-md {
    padding: var(--space-3) var(--space-4);
    font-size: var(--font-size-sm);
    /* ... */
  }
  
  .disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
</style>
```

### 14.3 Theme Switching

```javascript
// Theme switching utility
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Initialize theme on page load
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
}
```

## 15. Performance Considerations

### 15.1 CSS Optimization

- Use CSS custom properties for efficient theme switching
- Minimize repaints and reflows with transform-based animations
- Optimize selectors for better performance
- Use `contain` property for isolated components

### 15.2 Critical CSS

Load critical CSS inline and defer non-critical styles:

```css
/* Critical above-the-fold styles */
.critical-layout {
  /* Essential layout styles */
}

/* Non-critical styles can be loaded asynchronously */
@import url('non-critical.css') print;
```

## 16. Conclusion

This design system provides a comprehensive foundation for the Local Note service, ensuring consistent user experience across all components. Built with dark mode as the default, it's optimized for extended use while maintaining accessibility and usability standards.

The system is designed to be scalable and maintainable, with clear guidelines for implementation and future expansion. All components are thoroughly tested and follow modern web development best practices.

Key benefits of this design system:
- **Consistency**: Unified visual language across all components
- **Accessibility**: WCAG 2.1 AA compliant design
- **Performance**: Optimized for fast loading and smooth interactions
- **Maintainability**: CSS variable-based architecture for easy updates
- **Scalability**: Flexible system that grows with feature requirements 