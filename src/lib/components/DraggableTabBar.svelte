<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { tabStore } from '../stores/tabStore';
  import type { Note } from '../database/types';

  export let notes: Note[];
  export let onnewTab: (() => void) | undefined = undefined;
  export let ontabSelect: ((tabId: string) => void) | undefined = undefined;
  export let ontabClose: ((tabId: string) => void) | undefined = undefined;

  const dispatch = createEventDispatcher<{
    newTab: void;
    tabSelect: string;
    tabClose: string;
  }>();

  let draggedTabId: string | null = null;
  let dragOverTabId: string | null = null;

  function handleNewTab() {
    dispatch('newTab');
    onnewTab?.();
  }

  function handleTabClick(tabId: string) {
    tabStore.setActiveTab(tabId);
    dispatch('tabSelect', tabId);
    ontabSelect?.(tabId);
  }

  function handleTabClose(tabId: string) {
    tabStore.removeTab(tabId);
    dispatch('tabClose', tabId);
    ontabClose?.(tabId);
  }

  // 드래그 앤 드롭 이벤트 핸들러
  function handleDragStart(event: DragEvent, tabId: string) {
    draggedTabId = tabId;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', tabId);
    }
  }

  function handleDragOver(event: DragEvent, tabId: string) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    dragOverTabId = tabId;
  }

  function handleDragLeave() {
    dragOverTabId = null;
  }

  function handleDrop(event: DragEvent, targetTabId: string) {
    event.preventDefault();
    
    if (draggedTabId && draggedTabId !== targetTabId) {
      // 타겟 탭의 위치를 찾아서 드래그된 탭을 그 위치로 이동
      const targetTab = $tabStore.find(tab => tab.id === targetTabId);
      if (targetTab) {
        tabStore.reorderTabs(draggedTabId, targetTab.position);
      }
    }
    
    // 드래그 상태 초기화
    draggedTabId = null;
    dragOverTabId = null;
  }

  function handleDragEnd() {
    draggedTabId = null;
    dragOverTabId = null;
  }

  // 노트 ID로 노트 찾기 헬퍼 함수
  function findNoteById(noteId: string): Note | undefined {
    return notes.find(note => note.id === noteId);
  }

  // 탭 제목 표시 헬퍼 함수
  function getTabTitle(noteId: string): string {
    const note = findNoteById(noteId);
    return note?.title || '새 메모';
  }
</script>

<div class="draggable-tab-bar">
  <div class="tab-list">
    {#each $tabStore as tab (tab.id)}
      {@const note = findNoteById(tab.noteId)}
      {#if note}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="draggable-tab"
          class:active={tab.isActive}
          class:dragging={draggedTabId === tab.id}
          class:drag-over={dragOverTabId === tab.id}
          draggable="true"
          on:click={() => handleTabClick(tab.id)}
          on:dragstart={(e) => handleDragStart(e, tab.id)}
          on:dragover={(e) => handleDragOver(e, tab.id)}
          on:dragleave={handleDragLeave}
          on:drop={(e) => handleDrop(e, tab.id)}
          on:dragend={handleDragEnd}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === 'Enter' && handleTabClick(tab.id)}
        >
          <span class="tab-title">{getTabTitle(tab.noteId)}</span>
          <button
            class="tab-close"
            on:click|stopPropagation={() => handleTabClose(tab.id)}
            aria-label="Close tab"
            type="button"
          >
            ×
          </button>
        </div>
      {/if}
    {/each}
  </div>
  
  <button 
    class="new-tab-button"
    on:click={handleNewTab}
    aria-label="새 탭"
  >
    새 탭
  </button>
</div>

<style>
  .draggable-tab-bar {
    display: flex;
    align-items: center;
    background: var(--color-bg-primary);
    border-bottom: 1px solid var(--color-border-secondary);
    overflow-x: auto;
    min-height: 48px;
  }

  .tab-list {
    display: flex;
    flex: 1;
    min-width: 0;
  }

  .draggable-tab {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    background: transparent;
    border: none;
    padding: var(--space-3) var(--space-4);
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 2px solid transparent;
    min-width: 0;
    max-width: 200px;
    white-space: nowrap;
    user-select: none;
  }

  .draggable-tab:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-tertiary);
  }

  .draggable-tab.active {
    color: var(--color-primary-400);
    border-bottom-color: var(--color-primary-400);
    background: var(--color-bg-secondary);
  }

  .draggable-tab.dragging {
    opacity: 0.5;
    transform: rotate(5deg);
  }

  .draggable-tab.drag-over {
    background: var(--color-primary-500);
    color: var(--color-text-inverse);
    transform: scale(1.05);
  }

  .tab-title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tab-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    background: transparent;
    border: none;
    border-radius: 2px;
    color: var(--color-text-tertiary);
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    opacity: 0;
  }

  .draggable-tab:hover .tab-close {
    opacity: 1;
  }

  .tab-close:hover {
    background: var(--color-bg-tertiary);
    color: var(--color-text-secondary);
  }

  .draggable-tab.active .tab-close {
    opacity: 0.7;
  }

  .draggable-tab.active .tab-close:hover {
    opacity: 1;
    background: var(--color-bg-tertiary);
  }

  .new-tab-button {
    flex-shrink: 0;
    background: transparent;
    border: none;
    padding: var(--space-3) var(--space-4);
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 4px;
    margin: var(--space-2);
  }

  .new-tab-button:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-tertiary);
  }

  .new-tab-button:focus {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }

  /* 스크롤바 스타일링 */
  .draggable-tab-bar::-webkit-scrollbar {
    height: 4px;
  }

  .draggable-tab-bar::-webkit-scrollbar-track {
    background: var(--color-bg-secondary);
  }

  .draggable-tab-bar::-webkit-scrollbar-thumb {
    background: var(--color-border-primary);
    border-radius: 2px;
  }

  .draggable-tab-bar::-webkit-scrollbar-thumb:hover {
    background: var(--color-border-focus);
  }
</style> 