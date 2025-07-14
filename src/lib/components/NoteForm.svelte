<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import NoteList from './NoteList.svelte';
  import NoteEditor from './NoteEditor.svelte';
  import { NoteService } from '../services/noteService';
  import { AutoSaveService } from '../services/autoSaveService';
  import { NoteDatabase } from '../database/NoteDatabase';
  import { ShortcutManager } from '../services/ShortcutManager';
  import { DefaultShortcuts } from '../services/DefaultShortcuts';
  import type { Note } from '../database/types';

  let notes: Note[] = [];
  let currentNote: Note = createEmptyNote();
  let saveStatus: 'idle' | 'saving' | 'saved' | 'error' = 'idle';
  
  const db = new NoteDatabase();
  const noteService = new NoteService(db);
  const autoSaveService = new AutoSaveService(noteService);
  
  // 단축키 시스템 초기화
  let shortcutManager: ShortcutManager;
  let defaultShortcuts: DefaultShortcuts;

  function createEmptyNote(): Note {
    return {
      id: '',
      title: '',
      content: '',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async function loadNotes() {
    try {
      notes = await noteService.getAllNotes();
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }

  async function handleNoteChange(updatedNote: Note) {
    currentNote = updatedNote;
    saveStatus = 'saving';
    
    try {
      if (updatedNote.id) {
        // Update existing note
        autoSaveService.scheduleAutoSave(updatedNote.id, {
          title: updatedNote.title,
          content: updatedNote.content
        });
        
        // Wait a bit for auto-save, then update status
        setTimeout(async () => {
          saveStatus = 'saved';
          await loadNotes(); // Refresh the list
          setTimeout(() => saveStatus = 'idle', 2000);
        }, 600);
      } else if (updatedNote.content.trim()) {
        // Create new note if there's content
        const newNote = await noteService.createNote(
          updatedNote.title || '새 메모',
          updatedNote.content
        );
        currentNote = newNote;
        saveStatus = 'saved';
        await loadNotes(); // Refresh the list
        setTimeout(() => saveStatus = 'idle', 2000);
      } else {
        saveStatus = 'idle';
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      saveStatus = 'error';
      setTimeout(() => saveStatus = 'idle', 2000);
    }
  }

  function handleNewNote() {
    currentNote = createEmptyNote();
    saveStatus = 'idle';
  }

  function handleNoteSelect(note: Note) {
    currentNote = note;
    saveStatus = 'idle';
  }

  onMount(() => {
    loadNotes();
    
    // 단축키 시스템 초기화
    try {
      shortcutManager = new ShortcutManager();
      defaultShortcuts = new DefaultShortcuts(shortcutManager);
      
      // 기본 단축키와 액션을 등록 (서비스와 함께)
      defaultShortcuts.registerAll(noteService, autoSaveService);
      
      console.log('단축키 시스템이 초기화되었습니다');
    } catch (error) {
      console.error('단축키 시스템 초기화 실패:', error);
    }
    
    return () => {
      autoSaveService.destroy();
    };
  });

  onDestroy(() => {
    // 단축키 시스템 정리
    if (defaultShortcuts) {
      try {
        defaultShortcuts.unregisterAll();
      } catch (error) {
        console.error('단축키 해제 실패:', error);
      }
    }
    
    if (shortcutManager) {
      try {
        shortcutManager.destroy();
      } catch (error) {
        console.error('단축키 매니저 정리 실패:', error);
      }
    }
  });
</script>

<div class="note-app">
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1 class="app-title">📝 Local Note</h1>
      <button class="new-note-btn" on:click={handleNewNote}>
        <span class="icon">+</span>
        새 메모
      </button>
    </div>
    
    <div class="note-list-container">
      <NoteList {notes} on:noteSelect={(e) => handleNoteSelect(e.detail)} />
    </div>
  </aside>

  <main class="editor-area">
    <div class="editor-container">
      <NoteEditor note={currentNote} onChange={handleNoteChange} />
    </div>
  </main>
</div>

<style>
  .note-app {
    display: flex;
    height: 100vh;
    background: var(--color-bg-primary);
    font-family: var(--font-family-sans);
  }

  .sidebar {
    width: 320px;
    background: var(--color-bg-secondary);
    border-right: 1px solid var(--color-border-primary);
    display: flex;
    flex-direction: column;
  }

  .sidebar-header {
    padding: var(--space-6);
    border-bottom: 1px solid var(--color-border-secondary);
  }

  .app-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-4) 0;
    text-align: center;
  }

  .new-note-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: var(--color-primary-600);
    color: var(--color-text-inverse);
    border: none;
    border-radius: 0.5rem;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: var(--font-family-sans);
  }

  .new-note-btn:hover {
    background: var(--color-primary-700);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
  }

  .new-note-btn:focus {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .icon {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
  }

  .note-list-container {
    flex: 1;
    overflow-y: auto;
  }

  .editor-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--color-bg-primary);
  }

  .editor-header {
    padding: var(--space-4) var(--space-6);
    border-bottom: 1px solid var(--color-border-secondary);
    background: var(--color-bg-secondary);
    display: flex;
    justify-content: flex-end;
    align-items: center;
    min-height: 60px;
  }

  .save-status {
    font-size: var(--font-size-sm);
  }

  .status {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: 0.375rem;
    font-weight: var(--font-weight-medium);
    transition: all 0.2s ease;
  }

  .status.saving {
    color: var(--color-warning-500);
    background: rgba(245, 158, 11, 0.1);
  }

  .status.saved {
    color: var(--color-success-500);
    background: rgba(34, 197, 94, 0.1);
  }

  .status.error {
    color: var(--color-error-500);
    background: rgba(239, 68, 68, 0.1);
  }

  .spinner {
    width: 12px;
    height: 12px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .check-icon, .error-icon {
    font-weight: var(--font-weight-bold);
  }

  .editor-container {
    flex: 1;
    padding: var(--space-4);
    overflow: hidden;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .note-app {
      flex-direction: column;
    }
    
    .sidebar {
      width: 100%;
      height: 200px;
    }
    
    .sidebar-header {
      padding: var(--space-4);
    }
    
    .app-title {
      font-size: var(--font-size-lg);
      margin-bottom: var(--space-3);
    }
  }
</style> 