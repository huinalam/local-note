<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Note } from '../database/types';

  export let notes: Note[] = [];

  const dispatch = createEventDispatcher<{
    noteSelect: Note;
  }>();

  function handleNoteClick(note: Note) {
    dispatch('noteSelect', note);
  }

  function formatDate(date: Date): string {
    const now = new Date();
    const noteDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - noteDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return '오늘';
    } else if (diffDays === 2) {
      return '어제';
    } else if (diffDays <= 7) {
      return `${diffDays - 1}일 전`;
    } else {
      return noteDate.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
      });
    }
  }

  function truncateContent(content: string, maxLength: number = 80): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }
</script>

<div class="note-list">
  {#if !notes || notes.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📝</div>
      <p class="empty-text">아직 메모가 없습니다</p>
      <p class="empty-subtext">새 메모 버튼을 눌러 시작해보세요</p>
    </div>
  {:else}
    {#each notes as note (note.id)}
      <button
        class="note-item"
        on:click={() => handleNoteClick(note)}
        data-testid="note-item"
      >
        <div class="note-content">
          <h3 class="note-title">
            {note.title || '제목 없음'}
          </h3>
          <p class="note-preview">
            {truncateContent(note.content)}
          </p>
          <div class="note-meta">
            <span class="note-date">{formatDate(note.updatedAt)}</span>
            {#if note.tags && note.tags.length > 0}
              <div class="note-tags">
                {#each note.tags.slice(0, 2) as tag}
                  <span class="tag">#{tag}</span>
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

<style>
  .note-list {
    padding: var(--space-2) 0;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-12) var(--space-6);
    text-align: center;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: var(--space-4);
    opacity: 0.5;
  }

  .empty-text {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-2) 0;
  }

  .empty-subtext {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
    margin: 0;
  }

  .note-item {
    width: 100%;
    padding: var(--space-4) var(--space-5);
    border: none;
    background: transparent;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 1px solid var(--color-border-secondary);
  }

  .note-item:hover {
    background: var(--color-bg-tertiary);
  }

  .note-item:focus {
    outline: 2px solid var(--color-border-focus);
    outline-offset: -2px;
    background: var(--color-bg-tertiary);
  }

  .note-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .note-title {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .note-preview {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .note-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .note-date {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
    font-weight: var(--font-weight-medium);
  }

  .note-tags {
    display: flex;
    gap: var(--space-1);
    align-items: center;
  }

  .tag {
    font-size: var(--font-size-xs);
    color: var(--color-primary-400);
    background: rgba(14, 165, 233, 0.1);
    padding: 2px var(--space-1);
    border-radius: 0.25rem;
    font-weight: var(--font-weight-medium);
  }

  .tag-more {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
    font-weight: var(--font-weight-medium);
  }
</style> 