<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import type { Note } from '../database/types';

  // Props
  export let isOpen: boolean = false;
  export let onClose: () => void;
  export let onNoteSelect: (note: Note) => void;
  export let notes: Note[] = [];

  // State
  let searchQuery = '';
  let selectedIndex = 0;
  let searchInput: HTMLInputElement;
  let filteredNotes: Note[] = [];

  const dispatch = createEventDispatcher();

  // 검색 쿼리에 따라 노트 필터링
  $: {
    if (searchQuery.trim() === '') {
      filteredNotes = notes;
    } else {
      filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    // 검색 결과가 변경되면 선택 인덱스 초기화
    selectedIndex = 0;
  }

  // notes가 처음 로드될 때 filteredNotes 초기화
  $: if (notes.length > 0 && filteredNotes.length === 0 && searchQuery === '') {
    filteredNotes = notes;
  }

  // 모달이 열릴 때 검색 입력에 포커스
  $: if (isOpen && searchInput) {
    setTimeout(() => {
      searchInput.focus();
    }, 100);
  }

  function handleKeyDown(event: KeyboardEvent) {
    // 동일 이벤트가 상위 요소에 중복 전파되어 두 번 처리되는 문제를 방지
    event.stopPropagation();
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
      case 'ArrowDown':
        event.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, filteredNotes.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        break;
      case 'Enter':
        event.preventDefault();
        if (filteredNotes[selectedIndex]) {
          onNoteSelect(filteredNotes[selectedIndex]);
        }
        break;
    }
  }

  function handleNoteClick(note: Note) {
    onNoteSelect(note);
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function formatDate(date: Date): string {
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  }

  function truncateContent(content: string, maxLength: number = 60): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }
</script>

{#if isOpen}
  <div 
    class="search-modal-backdrop" 
    data-testid="search-modal-backdrop"
    on:click={handleBackdropClick}
    on:keydown={handleKeyDown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="search-modal-title"
    tabindex="-1"
  >
    <div class="search-modal" data-testid="search-modal">
      <div class="search-header">
        <h2 id="search-modal-title" class="search-title">메모 검색</h2>
        <button class="close-button" on:click={onClose} aria-label="검색 모달 닫기">
          ✕
        </button>
      </div>

      <div class="search-input-container">
        <input
          bind:this={searchInput}
          bind:value={searchQuery}
          type="text"
          class="search-input"
          data-testid="search-input"
          placeholder="메모 제목을 검색하세요..."
          on:keydown={handleKeyDown}
          aria-label="메모 검색"
        />
      </div>

      <div class="search-results" data-testid="search-results">
        {#if filteredNotes.length === 0}
          <div class="search-empty-state" data-testid="search-empty-state">
            <div class="empty-icon">🔍</div>
            <p class="empty-text">검색 결과가 없습니다</p>
            <p class="empty-subtext">다른 검색어를 시도해보세요</p>
          </div>
        {:else}
          {#each filteredNotes as note, index (note.id)}
            <button
              class="search-result-item"
              class:selected={index === selectedIndex}
              data-testid="search-result-{index}"
              on:click={() => handleNoteClick(note)}
            >
              <div class="result-content">
                <h3 class="result-title">
                  {note.title || '제목 없음'}
                </h3>
                <p class="result-preview">
                  {truncateContent(note.content)}
                </p>
                <div class="result-meta">
                  <span class="result-date">{formatDate(note.updatedAt)}</span>
                  {#if note.tags && note.tags.length > 0}
                    <div class="result-tags">
                      {#each note.tags.slice(0, 2) as tag}
                        <span class="result-tag">#{tag}</span>
                      {/each}
                      {#if note.tags.length > 2}
                        <span class="tag-more">+{note.tags.length - 2}</span>
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>
            </button>
          {/each}
        {/if}
      </div>

      <div class="search-footer">
        <div class="keyboard-hints">
          <span class="hint">↑↓ 탐색</span>
          <span class="hint">Enter 선택</span>
          <span class="hint">Esc 닫기</span>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .search-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 10vh;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .search-modal {
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-primary);
    border-radius: 0.5rem;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  }

  .search-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4);
    border-bottom: 1px solid var(--color-border-secondary);
  }

  .search-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    font-size: var(--font-size-lg);
    cursor: pointer;
    padding: var(--space-2);
    border-radius: 0.25rem;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
  }

  .search-input-container {
    padding: var(--space-4);
    border-bottom: 1px solid var(--color-border-secondary);
  }

  .search-input {
    width: 100%;
    padding: var(--space-3);
    border: 1px solid var(--color-border-primary);
    border-radius: 0.375rem;
    background: var(--color-bg-secondary);
    color: var(--color-text-primary);
    font-size: var(--font-size-base);
    font-family: var(--font-family-sans);
    transition: border-color 0.2s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.1);
  }

  .search-input::placeholder {
    color: var(--color-text-tertiary);
  }

  .search-results {
    flex: 1;
    overflow-y: auto;
    min-height: 200px;
    max-height: 400px;
  }

  .search-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-8);
    text-align: center;
  }

  .empty-icon {
    font-size: 2rem;
    margin-bottom: var(--space-4);
    opacity: 0.5;
  }

  .empty-text {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-2) 0;
  }

  .empty-subtext {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
    margin: 0;
  }

  .search-result-item {
    width: 100%;
    background: none;
    border: none;
    padding: var(--space-4);
    text-align: left;
    cursor: pointer;
    border-bottom: 1px solid var(--color-border-secondary);
    transition: background-color 0.2s ease;
  }

  .search-result-item:hover,
  .search-result-item.selected {
    background: var(--color-bg-tertiary);
  }

  .search-result-item:last-child {
    border-bottom: none;
  }

  .result-content {
    width: 100%;
  }

  .result-title {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-2) 0;
    line-height: var(--line-height-tight);
  }

  .result-preview {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-3) 0;
    line-height: var(--line-height-relaxed);
  }

  .result-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .result-date {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
  }

  .result-tags {
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  .result-tag {
    font-size: var(--font-size-xs);
    color: var(--color-primary-400);
    background: rgba(56, 189, 248, 0.1);
    padding: 1px var(--space-2);
    border-radius: 0.25rem;
  }

  .tag-more {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
  }

  .search-footer {
    padding: var(--space-3) var(--space-4);
    border-top: 1px solid var(--color-border-secondary);
    background: var(--color-bg-secondary);
  }

  .keyboard-hints {
    display: flex;
    gap: var(--space-4);
    justify-content: center;
  }

  .hint {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
    padding: var(--space-1) var(--space-2);
    background: var(--color-bg-tertiary);
    border-radius: 0.25rem;
  }

  /* 모바일 반응형 */
  @media (max-width: 640px) {
    .search-modal-backdrop {
      padding-top: 5vh;
    }

    .search-modal {
      width: 95%;
      max-height: 90vh;
    }

    .search-header,
    .search-input-container {
      padding: var(--space-3);
    }

    .search-result-item {
      padding: var(--space-3);
    }

    .keyboard-hints {
      gap: var(--space-2);
    }
  }
</style> 