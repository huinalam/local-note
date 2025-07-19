<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import NoteList from './NoteList.svelte';
  import SimpleMDEEditor from './SimpleMDEEditor.svelte';
  import ConfirmDialog from './ConfirmDialog.svelte';
  import { NoteService } from '../services/noteService';
  import { AutoSaveService } from '../services/autoSaveService';
  import { NoteDatabase } from '../database/NoteDatabase';
  import { ShortcutManager } from '../services/ShortcutManager';
  import { DefaultShortcuts } from '../services/DefaultShortcuts';
  import { ConfirmDialogService, confirmDialogStore } from '../services/confirmDialogService';
  import { createNoteNavigationActions } from '../actions/noteNavigationActions';
  import { createSearchActions } from '../actions/searchActions';
  import { createShortcutHelpActions } from '../actions/shortcutHelpActions';
  import { uiActions } from '../actions/uiActions';
  import SearchModal from './SearchModal.svelte';
  import ShortcutHelpModal from './ShortcutHelpModal.svelte';
  import { isSidebarCollapsed, toggleSidebar } from '../stores/uiStore';
  import { shortcutHelpStore } from '../stores/shortcutHelpStore';
  import { ShortcutHelpService } from '../services/ShortcutHelpService';
  import type { Note } from '../database/types';

  let notes: Note[] = [];
  let currentNote: Note = createEmptyNote();
  let saveStatus: 'idle' | 'saving' | 'saved' | 'error' = 'idle';
  let isSearchModalOpen = false;
  
  // 단축키 도움말 관련
  let shortcutHelpService: ShortcutHelpService;
  
  const db = new NoteDatabase();
  const noteService = new NoteService(db);
  const autoSaveService = new AutoSaveService(noteService);
  const confirmDialogService = new ConfirmDialogService();
  
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
        
        // 기존 노트 편집 시: 위치 유지를 위해 현재 배열에서만 업데이트
        const noteIndex = notes.findIndex(note => note.id === updatedNote.id);
        if (noteIndex !== -1) {
          // 현재 배열에서 해당 노트만 업데이트 (위치 유지)
          notes[noteIndex] = { ...notes[noteIndex], ...updatedNote };
          notes = [...notes]; // 반응성을 위한 새 배열 생성
        }
        
        // Wait a bit for auto-save, then update status
        setTimeout(() => {
          saveStatus = 'saved';
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
        // 새 노트 생성 시에만 전체 목록 새로고침
        await loadNotes();
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
    // 선택된 메모를 현재 노트로 설정
    currentNote = note;
    saveStatus = 'idle';
  }

  async function handleNoteDelete(note: Note) {
    try {
      // 확인 다이얼로그 표시
      confirmDialogService.show({
        title: "노트 삭제",
        message: `"${note.title || '제목 없음'}" 노트를 삭제하시겠습니까?\n삭제된 노트는 복구할 수 없습니다.`,
        confirmText: "삭제",
        cancelText: "취소",
        variant: "danger",
        onConfirm: async () => {
          try {
            const success = await noteService.deleteNote(note.id);
            if (success) {
              // 노트 목록 새로고침
              await loadNotes();
              
              // 현재 노트가 삭제된 노트와 같다면 빈 노트로 초기화
              if (currentNote.id === note.id) {
                currentNote = createEmptyNote();
                saveStatus = 'idle';
              }
              
              console.log("노트가 성공적으로 삭제되었습니다");
            } else {
              console.error("노트 삭제 실패: 노트를 찾을 수 없습니다");
            }
          } catch (error) {
            console.error("노트 삭제 실패:", error);
          }
          confirmDialogService.hide();
        },
        onCancel: () => {
          console.log("노트 삭제가 취소되었습니다");
          confirmDialogService.hide();
        },
      });
    } catch (error) {
      console.error("삭제 다이얼로그 표시 실패:", error);
    }
  }

  async function handleNoteReorder(event: CustomEvent<{ noteId: string; newIndex: number }>) {
    try {
      const { noteId, newIndex } = event.detail;
      
      // 현재 노트 배열을 복사
      const reorderedNotes = [...notes];
      
      // 드래그된 노트 찾기
      const draggedNoteIndex = reorderedNotes.findIndex(note => note.id === noteId);
      if (draggedNoteIndex === -1) return;
      
      // 노트를 배열에서 제거
      const [draggedNote] = reorderedNotes.splice(draggedNoteIndex, 1);
      
      // 새 위치에 노트 삽입
      reorderedNotes.splice(newIndex, 0, draggedNote);
      
      // 노트 배열 업데이트 (즉시 UI 반영)
      notes = reorderedNotes;
      
      // 데이터베이스에 순서 정보 저장
      await noteService.reorderNote(noteId, newIndex);
      
      console.log(`노트 "${draggedNote.title}"이 ${newIndex + 1}번째 위치로 이동했습니다`);
      
    } catch (error) {
      console.error('노트 순서 변경 실패:', error);
      // 에러 발생 시 원래 순서로 되돌리기
      await loadNotes();
    }
  }

  // 현재 노트 상태 관리 함수들 (삭제 액션에서 사용)
  function getCurrentNote() {
    return currentNote.id ? currentNote : null;
  }

  function setCurrentNote(note: Note | null) {
    if (note) {
      currentNote = note;
    } else {
      currentNote = createEmptyNote();
    }
    saveStatus = 'idle';
  }

  function openSearchModal() {
    isSearchModalOpen = true;
  }

  function closeSearchModal() {
    isSearchModalOpen = false;
  }

  function openShortcutHelp() {
    // 단축키 데이터 수집
    const appShortcuts = shortcutManager.getAllShortcuts();
    
    // EasyMDE 단축키도 가져오기 (SimpleMDEEditor에서)
    const easyMDEShortcuts = {
      toggleBold: 'Cmd-B',
      toggleItalic: 'Cmd-I',
      drawLink: 'Cmd-K',
      toggleBlockquote: "Cmd-'",
      toggleHeadingSmaller: 'Cmd-H',
      toggleUnorderedList: 'Cmd-L',
      toggleOrderedList: 'Cmd-Alt-L',
      drawTable: 'Cmd-Alt-T',
      drawHorizontalRule: 'Cmd-R',
      drawImage: 'Cmd-Alt-I',
      toggleCodeBlock: 'Cmd-Alt-C',
      togglePreview: 'Cmd-P',
    };
    
    // 단축키 데이터 변환
    const editorShortcuts = shortcutHelpService.convertEasyMDEShortcuts(easyMDEShortcuts);
    const helpData = shortcutHelpService.getShortcutsByCategory(editorShortcuts);
    
    // 도움말 모달 열기
    shortcutHelpStore.open(helpData);
  }

  function closeShortcutHelp() {
    shortcutHelpStore.close();
  }

  function handleNoteSelectFromSearch(note: Note) {
    currentNote = note;
    closeSearchModal();
  }

  onMount(() => {
    loadNotes();
    
    // 단축키 시스템 초기화
    try {
      shortcutManager = new ShortcutManager();
      defaultShortcuts = new DefaultShortcuts(shortcutManager);
      shortcutHelpService = new ShortcutHelpService(shortcutManager);
      
      // 기본 단축키와 액션을 등록 (서비스와 함께)
      defaultShortcuts.registerAll(
        noteService, 
        autoSaveService, 
        confirmDialogService,
        getCurrentNote,
        setCurrentNote,
        loadNotes
      );

      // 메모 네비게이션 액션 등록 (실제 데이터와 연동)
      const noteNavigationActions = createNoteNavigationActions(
        () => notes,
        getCurrentNote,
        setCurrentNote
      );
      
      // 검색 액션 등록
      const searchActions = createSearchActions(openSearchModal);
      shortcutManager.registerAction(searchActions.openSearchModal);
      
      // 도움말 액션 등록
      const helpActions = createShortcutHelpActions(openShortcutHelp);
      shortcutManager.registerAction(helpActions.openShortcutHelp);
      
      // 사이드바 토글 액션 등록
      // shortcutManager.registerAction(uiActions.toggleSidebar); // TODO: uiActions 형식 수정 필요
      
      // 메모 번호 이동 단축키 등록
      shortcutManager.registerAction(noteNavigationActions.goToNote1);
      shortcutManager.registerAction(noteNavigationActions.goToNote2);
      shortcutManager.registerAction(noteNavigationActions.goToNote3);
      shortcutManager.registerAction(noteNavigationActions.goToNote4);
      shortcutManager.registerAction(noteNavigationActions.goToNote5);
      shortcutManager.registerAction(noteNavigationActions.goToNote6);
      shortcutManager.registerAction(noteNavigationActions.goToNote7);
      shortcutManager.registerAction(noteNavigationActions.goToNote8);
      shortcutManager.registerAction(noteNavigationActions.goToNote9);
      
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
  <aside class="sidebar" class:sidebar--collapsed={$isSidebarCollapsed}>
    <div class="sidebar-header">
      <div class="sidebar-header-top">
        <h1 class="app-title">📝 Local Note</h1>
        <button 
          class="sidebar-toggle-btn" 
          on:click={toggleSidebar}
          aria-label={$isSidebarCollapsed ? '사이드바 보이기' : '사이드바 숨기기'}
          title={$isSidebarCollapsed ? '사이드바 보이기' : '사이드바 숨기기'}
        >
          {#if $isSidebarCollapsed}
            <span class="icon">▶</span>
          {:else}
            <span class="icon">◀</span>
          {/if}
        </button>
      </div>
      <div class="sidebar-buttons">
        <button class="new-note-btn" on:click={handleNewNote}>
          <span class="icon">+</span>
          새 메모
        </button>
        <button 
          class="help-btn" 
          on:click={openShortcutHelp}
          aria-label="단축키 도움말 (F1)"
          title="단축키 도움말 (F1)"
        >
          <span class="icon">?</span>
          도움말
        </button>
      </div>
    </div>
    
    <div class="note-list-container">
      <NoteList 
        {notes} 
        currentNoteId={currentNote?.id}
        on:noteSelect={(e) => handleNoteSelect(e.detail)}
        on:noteDelete={(e) => handleNoteDelete(e.detail)}
        on:noteReorder={handleNoteReorder}
      />
    </div>
  </aside>

  <main class="editor-area">
    <!-- 사이드바 숨김 상태에서 표시되는 플로팅 토글 버튼 -->
    {#if $isSidebarCollapsed}
      <button 
        class="floating-sidebar-toggle" 
        on:click={toggleSidebar}
        aria-label="사이드바 보이기"
        title="사이드바 보이기"
      >
        <span class="icon">▶</span>
      </button>
    {/if}
    
    <div class="editor-container">
      <SimpleMDEEditor note={currentNote} onChange={handleNoteChange} />
    </div>
  </main>
</div>

<!-- 확인 다이얼로그 -->
{#if $confirmDialogStore.isOpen && $confirmDialogStore.config}
  <ConfirmDialog
    isOpen={$confirmDialogStore.isOpen}
    title={$confirmDialogStore.config.title}
    message={$confirmDialogStore.config.message}
    confirmText={$confirmDialogStore.config.confirmText}
    cancelText={$confirmDialogStore.config.cancelText}
    variant={$confirmDialogStore.config.variant}
    onConfirm={$confirmDialogStore.config.onConfirm}
    onCancel={$confirmDialogStore.config.onCancel}
  />
{/if}

<!-- 검색 모달 -->
<SearchModal 
  isOpen={isSearchModalOpen}
  onClose={closeSearchModal}
  onNoteSelect={handleNoteSelectFromSearch}
  notes={notes}
/>

<!-- 단축키 도움말 모달 -->
<ShortcutHelpModal 
  isOpen={$shortcutHelpStore.isOpen}
  onClose={closeShortcutHelp}
  shortcutData={$shortcutHelpStore.shortcutData}
/>

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
    transition: width 0.3s ease-in-out;
  }

  .sidebar--collapsed {
    width: 0;
    min-width: 0;
    overflow: hidden;
  }

  .sidebar-header {
    padding: var(--space-6);
    border-bottom: 1px solid var(--color-border-secondary);
  }

  .sidebar-header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-4);
  }

  .sidebar-toggle-btn {
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-secondary);
    border-radius: 0.375rem;
    padding: var(--space-1) var(--space-2);
    cursor: pointer;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 2rem;
    height: 2rem;
  }

  .sidebar-toggle-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
    border-color: var(--color-border-primary);
  }

  .sidebar-toggle-btn:focus {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .floating-sidebar-toggle {
    position: fixed;
    top: var(--space-4);
    left: var(--space-4);
    z-index: 1000;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-secondary);
    border-radius: 0.5rem;
    padding: var(--space-3);
    cursor: pointer;
    color: var(--color-text-primary);
    font-size: var(--font-size-lg);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 3rem;
    height: 3rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(8px);
  }

  .floating-sidebar-toggle:hover {
    background: var(--color-bg-hover);
    border-color: var(--color-border-primary);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  .floating-sidebar-toggle:focus {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .floating-sidebar-toggle:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .app-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin: 0;
    flex: 1;
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

  .sidebar-buttons {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .help-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--color-bg-tertiary);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border-secondary);
    border-radius: 0.375rem;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: var(--font-family-sans);
  }

  .help-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
    border-color: var(--color-border-primary);
    transform: translateY(-1px);
  }

  .help-btn:focus {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .help-btn .icon {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-bold);
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
    transition: flex-basis 0.3s ease-in-out;
  }

  .editor-container {
    flex: 1;
    min-height: 0;
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