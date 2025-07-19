<script lang="ts">
  import type { Note } from '../database/types';
  import MarkdownPreview from './MarkdownPreview.svelte';

  export let note: Note;
  export let onChange: ((note: Note) => void) | undefined = undefined;
  export let isMobile: boolean = false;

  let content = note?.content || '';
  let showPreview = false;

  // note가 변경될 때 content도 업데이트
  $: content = note?.content || '';

  function handleContentChange(event: Event) {
    if (!note) return;
    
    const target = event.target as HTMLTextAreaElement;
    content = target.value;
    
    const updatedNote = {
      ...note,
      content: target.value,
      title: generateTitleFromContent(target.value)
    };
    onChange?.(updatedNote);
  }

  function generateTitleFromContent(content: string): string {
    if (!content.trim()) return '';
    
    // 첫 번째 줄을 제목으로 사용 (최대 50자)
    const firstLine = content.split('\n')[0].trim();
    return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
  }

  function toggleView() {
    showPreview = !showPreview;
  }
</script>

<div 
  class="markdown-editor-container" 
  class:mobile-layout={isMobile}
  data-testid="markdown-editor-container"
>
  {#if isMobile}
    <!-- 모바일: 토글 버튼과 단일 뷰 -->
    <div class="mobile-header">
      <button 
        class="view-toggle-button"
        data-testid="view-toggle-button"
        on:click={toggleView}
      >
        {showPreview ? '편집' : '미리보기'}
      </button>
    </div>
    
    <div class="mobile-content">
      {#if showPreview}
        <MarkdownPreview {content} />
      {:else}
        <textarea
          class="markdown-textarea"
          data-testid="markdown-textarea"
          placeholder="마크다운으로 메모를 작성하세요..."
          bind:value={content}
          on:input={handleContentChange}
          aria-label="마크다운 에디터"
        ></textarea>
      {/if}
    </div>
  {:else}
    <!-- 데스크톱: 분할 뷰 -->
    <div class="desktop-layout">
      <div class="editor-pane">
        <textarea
          class="markdown-textarea"
          data-testid="markdown-textarea"
          placeholder="마크다운으로 메모를 작성하세요..."
          bind:value={content}
          on:input={handleContentChange}
          aria-label="마크다운 에디터"
        ></textarea>
      </div>
      
      <div class="preview-pane">
        <MarkdownPreview {content} />
      </div>
    </div>
  {/if}
</div>

<style>
  .markdown-editor-container {
    height: 100%;
    background: var(--color-bg-primary);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .mobile-layout {
    display: flex;
    flex-direction: column;
  }

  .mobile-header {
    padding: var(--space-3);
    border-bottom: 1px solid var(--color-border-primary);
    background: var(--color-bg-secondary);
  }

  .view-toggle-button {
    background: var(--color-accent);
    color: white;
    border: none;
    padding: var(--space-2) var(--space-4);
    border-radius: 0.375rem;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .view-toggle-button:hover {
    background: var(--color-accent-hover);
  }

  .mobile-content {
    flex: 1;
    height: calc(100% - 60px);
  }

  .desktop-layout {
    display: flex;
    height: 100%;
  }

  .editor-pane {
    flex: 1;
    border-right: 1px solid var(--color-border-primary);
  }

  .preview-pane {
    flex: 1;
  }

  .markdown-textarea {
    width: 100%;
    height: 100%;
    min-height: 400px;
    font-size: var(--font-size-base);
    line-height: 1.75;
    color: var(--color-text-primary);
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    font-family: var(--font-family-mono);
    padding: var(--space-6);
    transition: all 0.2s ease;
  }

  .markdown-textarea::placeholder {
    color: var(--color-text-tertiary);
    font-style: italic;
  }

  .markdown-textarea:focus {
    background: var(--color-bg-secondary);
    box-shadow: inset 0 0 0 1px var(--color-border-focus);
  }

  .markdown-textarea:hover {
    background: var(--color-bg-secondary);
  }

  /* 모바일에서 textarea 높이 조정 */
  .mobile-layout .markdown-textarea {
    min-height: 300px;
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .desktop-layout {
      flex-direction: column;
    }

    .editor-pane {
      border-right: none;
      border-bottom: 1px solid var(--color-border-primary);
      flex: 0 0 50%;
    }

    .preview-pane {
      flex: 0 0 50%;
    }
  }
</style> 