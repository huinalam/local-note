<script lang="ts">
  import type { Note } from '../database/types';

  export let note: Note;
  export let onChange: ((note: Note) => void) | undefined = undefined;

  let content = note?.content || '';

  // note가 변경될 때 content도 업데이트
  $: content = note?.content || '';

  function handleContentChange(event: Event) {
    if (!note) return;
    
    const target = event.target as HTMLTextAreaElement;
    content = target.value;
    
    const updatedNote = {
      ...note,
      content: target.value,
      title: generateTitleFromContent(target.value) // 내용에서 제목 자동 생성
    };
    onChange?.(updatedNote);
  }

  function generateTitleFromContent(content: string): string {
    if (!content.trim()) return '';
    
    // 첫 번째 줄을 제목으로 사용 (최대 50자)
    const firstLine = content.split('\n')[0].trim();
    return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
  }
</script>

<div class="note-editor">
  <textarea
    class="content-textarea"
    placeholder="메모를 입력하세요..."
    bind:value={content}
    on:input={handleContentChange}
    aria-label="메모 내용"
  ></textarea>
</div>

<style>
  .note-editor {
    height: 100%;
    background: var(--color-bg-primary);
    border-radius: 0.5rem;
  }

  .content-textarea {
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
    font-family: var(--font-family-sans);
    padding: var(--space-6);
    border-radius: 0.5rem;
    transition: all 0.2s ease;
  }

  .content-textarea::placeholder {
    color: var(--color-text-tertiary);
    font-style: italic;
  }

  .content-textarea:focus {
    background: var(--color-bg-secondary);
    box-shadow: 0 0 0 1px var(--color-border-focus);
  }

  .content-textarea:hover {
    background: var(--color-bg-secondary);
  }
</style> 