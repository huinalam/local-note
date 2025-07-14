<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Tab as TabType } from '../database/types';
  import type { Note } from '../database/types';

  export let tab: TabType;
  export let note: Note;
  export let onclick: ((event: CustomEvent<string>) => void) | undefined = undefined;
  export let onclose: ((event: CustomEvent<string>) => void) | undefined = undefined;

  const dispatch = createEventDispatcher<{
    click: string;
    close: string;
  }>();

  function handleTabClick() {
    const event = dispatch('click', tab.id);
    onclick?.(event);
  }

  function handleCloseClick(event: MouseEvent) {
    event.stopPropagation();
    const closeEvent = dispatch('close', tab.id);
    onclose?.(closeEvent);
  }

  $: displayTitle = note.title || '새 메모';
</script>

<div 
  class="tab"
  class:active={tab.isActive}
  on:click={handleTabClick}
  on:keydown={(e) => e.key === 'Enter' && handleTabClick()}
  role="button"
  tabindex="0"
>
  <span class="tab-title truncate">
    {displayTitle}
  </span>
  
  <button 
    class="tab-close"
    on:click={handleCloseClick}
    aria-label="Close tab"
    type="button"
  >
    ×
  </button>
</div>

<style>
  .tab {
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
    min-width: 0; /* Allow flex shrinking */
    max-width: 200px;
    white-space: nowrap;
  }

  .tab:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-tertiary);
  }

  .tab.active {
    color: var(--color-primary-400);
    border-bottom-color: var(--color-primary-400);
    background: var(--color-bg-secondary);
  }

  .tab-title {
    flex: 1;
    min-width: 0; /* Allow text truncation */
  }

  .truncate {
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

  .tab:hover .tab-close {
    opacity: 1;
  }

  .tab-close:hover {
    background: var(--color-bg-tertiary);
    color: var(--color-text-secondary);
  }

  .tab.active .tab-close {
    opacity: 0.7;
  }

  .tab.active .tab-close:hover {
    opacity: 1;
    background: var(--color-bg-tertiary);
  }
</style> 