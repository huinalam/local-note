<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { tabStore } from '../stores/tabStore';
  import Tab from './Tab.svelte';
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

  function handleNewTab() {
    dispatch('newTab');
    onnewTab?.();
  }

  function handleTabClick(event: CustomEvent<string>) {
    const tabId = event.detail;
    tabStore.setActiveTab(tabId);
    dispatch('tabSelect', tabId);
    ontabSelect?.(tabId);
  }

  function handleTabClose(event: CustomEvent<string>) {
    const tabId = event.detail;
    tabStore.removeTab(tabId);
    dispatch('tabClose', tabId);
    ontabClose?.(tabId);
  }

  // 노트 ID로 노트 찾기 헬퍼 함수
  function findNoteById(noteId: string): Note | undefined {
    return notes.find(note => note.id === noteId);
  }
</script>

<div class="tab-bar">
  <div class="tab-list">
    {#each $tabStore as tab (tab.id)}
      {@const note = findNoteById(tab.noteId)}
      {#if note}
        <Tab 
          {tab} 
          {note} 
          onclick={handleTabClick}
          onclose={handleTabClose}
        />
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
  .tab-bar {
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
    min-width: 0; /* Allow flex shrinking */
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
  .tab-bar::-webkit-scrollbar {
    height: 4px;
  }

  .tab-bar::-webkit-scrollbar-track {
    background: var(--color-bg-secondary);
  }

  .tab-bar::-webkit-scrollbar-thumb {
    background: var(--color-border-primary);
    border-radius: 2px;
  }

  .tab-bar::-webkit-scrollbar-thumb:hover {
    background: var(--color-border-focus);
  }
</style> 