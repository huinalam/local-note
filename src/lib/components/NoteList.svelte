<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Note } from '../database/types';

  export let notes: Note[] = [];
  export let currentNoteId: string | null = null; // 현재 편집 중인 메모 ID

  const dispatch = createEventDispatcher<{
    noteSelect: Note;
    noteDelete: Note;
    noteReorder: { noteId: string; newIndex: number };
  }>();

  // 드래그앤 드롭 상태 관리
  let draggedNoteId: string | null = null;
  let dragOverIndex: number = -1;

  function handleNoteClick(note: Note) {
    dispatch('noteSelect', note);
  }

  function handleDeleteClick(event: MouseEvent, note: Note) {
    event.stopPropagation();
    dispatch('noteDelete', note);
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

  // 드래그앤 드롭 이벤트 핸들러
  function handleDragStart(event: DragEvent, note: Note) {
    if (!event.dataTransfer) return;
    
    draggedNoteId = note.id;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', note.id);
    
    // 드래그 시작 시 시각적 피드백
    if (event.target instanceof HTMLElement) {
      event.target.style.opacity = '0.5';
    }
  }

  function handleDragEnd(event: DragEvent) {
    // 드래그 종료 시 상태 초기화
    draggedNoteId = null;
    dragOverIndex = -1;
    
    if (event.target instanceof HTMLElement) {
      event.target.style.opacity = '1';
    }
  }

  function handleDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    if (!event.dataTransfer) return;
    
    event.dataTransfer.dropEffect = 'move';
    dragOverIndex = index;
  }

  function handleDragLeave() {
    dragOverIndex = -1;
  }

  function handleDrop(event: DragEvent, targetIndex: number) {
    event.preventDefault();
    
    if (!draggedNoteId) return;
    
    const draggedNote = notes.find(note => note.id === draggedNoteId);
    if (!draggedNote) return;
    
    const currentIndex = notes.findIndex(note => note.id === draggedNoteId);
    
    // 같은 위치에 드롭하면 무시
    if (currentIndex === targetIndex) {
      draggedNoteId = null;
      dragOverIndex = -1;
      return;
    }
    
    // 노트 순서 변경 이벤트 발생
    dispatch('noteReorder', {
      noteId: draggedNoteId,
      newIndex: targetIndex
    });
    
    // 상태 초기화
    draggedNoteId = null;
    dragOverIndex = -1;
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
    {#each notes as note, index (note.id)}
      <div 
        class="note-item-container"
        class:dragging={draggedNoteId === note.id}
        class:drag-over={dragOverIndex === index}
        draggable="true"
        on:dragstart={(e) => handleDragStart(e, note)}
        on:dragend={handleDragEnd}
        on:dragover={(e) => handleDragOver(e, index)}
        on:dragleave={handleDragLeave}
        on:drop={(e) => handleDrop(e, index)}
        role="listitem"
      >
        <button
          class="note-item"
          class:active={note.id === currentNoteId}
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
        
        <button
          class="delete-button"
          on:click={(e) => handleDeleteClick(e, note)}
          aria-label="노트 삭제"
          data-testid="delete-button"
          title="노트 삭제"
        >
          <span class="delete-icon">🗑️</span>
        </button>
      </div>
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

  .note-item.active {
    background: var(--color-primary-50);
    border-left: 3px solid var(--color-primary-500);
  }

  .note-item.active .note-title {
    color: var(--color-primary-700);
    font-weight: var(--font-weight-bold);
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
    line-clamp: 2;
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

  /* 삭제 버튼 스타일 */
  .note-item-container {
    position: relative;
    display: flex;
    align-items: stretch;
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    transition: all 0.2s ease;
    cursor: grab;
  }

  /* 드래그앤 드롭 스타일 */
  .note-item-container:active {
    cursor: grabbing;
  }

  .note-item-container.dragging {
    opacity: 0.5;
    transform: rotate(2deg);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    cursor: grabbing;
  }

  .note-item-container.drag-over {
    border: 2px dashed var(--color-primary-400);
    background: rgba(14, 165, 233, 0.05);
    transform: scale(1.02);
  }

  .note-item-container[draggable="true"]:focus {
    outline: 2px solid var(--color-primary-400);
    outline-offset: 2px;
  }

  .note-item-container:hover {
    background: var(--color-surface-secondary);
  }

  .note-item-container:hover .delete-button {
    opacity: 1;
    transform: translateX(0);
  }

  .note-item {
    flex: 1;
    min-width: 0; /* flexbox overflow fix */
  }

  .delete-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    min-width: 40px;
    background: var(--color-danger, #ef4444);
    border: none;
    color: white;
    cursor: pointer;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.2s ease;
    font-size: var(--font-size-sm);
    position: relative;
  }

  .delete-button:hover {
    background: var(--color-danger-hover, #dc2626);
    transform: translateX(0) scale(1.05);
  }

  .delete-button:focus {
    opacity: 1;
    transform: translateX(0);
    outline: 2px solid var(--color-danger, #ef4444);
    outline-offset: 2px;
  }

  .delete-icon {
    pointer-events: none;
  }

  /* 모바일에서는 항상 삭제 버튼 표시 */
  @media (max-width: 768px) {
    .delete-button {
      opacity: 0.7;
      transform: translateX(0);
    }

    .note-item-container:hover .delete-button,
    .delete-button:hover {
      opacity: 1;
    }
  }
</style> 