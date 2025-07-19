<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import type { Note } from '../database/types';
  
  let EasyMDE: any;
  
  // 브라우저 환경에서만 EasyMDE 로드
  if (browser) {
    import('easymde').then((module) => {
      EasyMDE = module.default;
    });
    import('easymde/dist/easymde.min.css');
  }

  export let note: Note;
  export let onChange: ((note: Note) => void) | undefined = undefined;
  export let isMobile: boolean = false;

  let textareaElement: HTMLTextAreaElement;
  let easyMDE: EasyMDE | null = null;

  // SimpleMDE 설정
  const createSimpleMDEConfig = (): EasyMDE.Options => ({
    element: textareaElement,
    autofocus: false,
    autosave: {
      enabled: true,
      uniqueId: note?.id || 'default',
      delay: 1000,
    },
    minHeight: 'calc(100vh - 200px)',
    blockStyles: {
      bold: '**',
      italic: '*',
      code: '`',
    },
    forceSync: true,
    hideIcons: isMobile ? ['guide', 'fullscreen'] : [],
    showIcons: ['strikethrough', 'table'],
    insertTexts: {
      horizontalRule: ['', '\n\n-----\n\n'],
      image: ['![](http://', ')'],
      link: ['[', '](http://)'],
      table: ['', '\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text     | Text     |\n\n'],
    },
    lineWrapping: true,
    parsingConfig: {
      allowAtxHeaderWithoutSpace: true,
      strikethrough: true,
      underscoresBreakWords: true,
    },
    placeholder: '마크다운으로 메모를 작성하세요...',
    previewRender: (plainText: string) => {
      // 기본 marked 렌더링 사용
      return EasyMDE.prototype.markdown(plainText);
    },
    promptURLs: true,
    renderingConfig: {
      singleLineBreaks: false,
      codeSyntaxHighlighting: true,
    },
    shortcuts: {
      drawTable: 'Cmd-Alt-T',
      drawHorizontalRule: 'Cmd-R',
      drawImage: 'Cmd-Alt-I',
      drawLink: 'Cmd-K',
      toggleBlockquote: 'Cmd-\'',
      toggleBold: 'Cmd-B',
      toggleCodeBlock: 'Cmd-Alt-C',
      toggleHeadingSmaller: 'Cmd-H',
      toggleItalic: 'Cmd-I',
      toggleOrderedList: 'Cmd-Alt-L',
      togglePreview: 'Cmd-P',
      toggleUnorderedList: 'Cmd-L',
    },
    spellChecker: false,
    status: isMobile ? false : ['autosave', 'lines', 'words', 'cursor'],
    styleSelectedText: true,
    syncSideBySidePreviewScroll: true,
    tabSize: 4,
    theme: 'dark',
    toolbar: isMobile ? [
      'bold', 'italic', 'heading', '|',
      'quote', 'unordered-list', 'ordered-list', '|',
      'link', 'image', '|',
      'preview', 'side-by-side'
    ] : [
      'bold', 'italic', 'strikethrough', '|',
      'heading-1', 'heading-2', 'heading-3', '|',
      'quote', 'unordered-list', 'ordered-list', '|',
      'link', 'image', 'table', 'horizontal-rule', '|',
      'code', 'preview', 'side-by-side', 'fullscreen', '|',
      'guide'
    ],
    toolbarTips: true,
  });

  function generateTitleFromContent(content: string): string {
    if (!content.trim()) return '';
    
    // 첫 번째 줄을 제목으로 사용 (최대 50자)
    const firstLine = content.split('\n')[0].trim();
    // 마크다운 헤더 기호 제거
    const cleanTitle = firstLine.replace(/^#+\s*/, '');
    return cleanTitle.length > 50 ? cleanTitle.substring(0, 50) + '...' : cleanTitle;
  }

  function handleContentChange(content: string) {
    if (!note) return;
    
    const updatedNote = {
      ...note,
      content: content,
      title: generateTitleFromContent(content)
    };
    onChange?.(updatedNote);
  }

  onMount(async () => {
    if (browser && textareaElement) {
      // EasyMDE가 로드될 때까지 대기
      if (!EasyMDE) {
        const module = await import('easymde');
        EasyMDE = module.default;
      }
      
      // 초기 값 설정
      textareaElement.value = note?.content || '';
      
      // SimpleMDE 인스턴스 생성
      easyMDE = new EasyMDE(createSimpleMDEConfig());
      
      // 변경 이벤트 리스너 추가
      if (easyMDE) {
        easyMDE.codemirror.on('change', () => {
          const content = easyMDE?.value() || '';
          handleContentChange(content);
        });
      }

      // 다크 테마 CSS 적용
      const editorElement = textareaElement.parentElement;
      if (editorElement) {
        editorElement.classList.add('dark-theme');
      }
    }
  });

  onDestroy(() => {
    if (easyMDE) {
      easyMDE.cleanup();
      easyMDE = null;
    }
  });

  // note가 변경될 때 에디터 내용 업데이트
  $: if (browser && easyMDE && note) {
    const currentValue = easyMDE.value();
    if (currentValue !== note.content) {
      easyMDE.value(note.content || '');
    }
  }
</script>

<div 
  class="simplemde-editor-container" 
  class:mobile-layout={isMobile}
  data-testid="simplemde-editor-container"
>
  <textarea
    bind:this={textareaElement}
    data-testid="simplemde-textarea"
    aria-label="SimpleMDE 마크다운 에디터"
  ></textarea>
</div>

<style>
  .simplemde-editor-container {
    height: 100%;
    background: var(--color-bg-primary);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .mobile-layout {
    height: 100%;
  }

  /* SimpleMDE 다크 테마 커스터마이징 */
  :global(.dark-theme .EasyMDEContainer) {
    background: var(--color-bg-primary);
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :global(.dark-theme .EasyMDEContainer .editor-toolbar) {
    background: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border-primary);
    border-top: none;
    border-left: none;
    border-right: none;
    flex-shrink: 0;
  }

  :global(.dark-theme .EasyMDEContainer .editor-toolbar button) {
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    padding: var(--space-2);
    margin: 0 var(--space-1);
    border-radius: 0.25rem;
    transition: all 0.2s ease;
  }

  :global(.dark-theme .EasyMDEContainer .editor-toolbar button:hover) {
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
  }

  :global(.dark-theme .EasyMDEContainer .editor-toolbar button.active) {
    background: var(--color-primary-600);
    color: white;
  }

  :global(.dark-theme .EasyMDEContainer .editor-toolbar i.separator) {
    border-left: 1px solid var(--color-border-primary);
    margin: 0 var(--space-2);
  }

  :global(.dark-theme .EasyMDEContainer .CodeMirror) {
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    border: none;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-base);
    line-height: 1.75;
    height: 100%;
    flex: 1;
    min-height: calc(100vh - 200px);
  }

  :global(.dark-theme .EasyMDEContainer .CodeMirror-scroll) {
    height: 100%;
    min-height: calc(100vh - 200px);
  }

  :global(.dark-theme .EasyMDEContainer .CodeMirror .CodeMirror-cursor) {
    border-left: 1px solid var(--color-text-primary);
  }

  :global(.dark-theme .EasyMDEContainer .CodeMirror .CodeMirror-selected) {
    background: var(--color-bg-tertiary);
  }

  :global(.dark-theme .EasyMDEContainer .CodeMirror .CodeMirror-line::selection) {
    background: var(--color-bg-tertiary);
  }

  :global(.dark-theme .EasyMDEContainer .CodeMirror .CodeMirror-line::-moz-selection) {
    background: var(--color-bg-tertiary);
  }

  :global(.dark-theme .EasyMDEContainer .CodeMirror-placeholder) {
    color: var(--color-text-tertiary) !important;
  }

  :global(.dark-theme .EasyMDEContainer .editor-preview) {
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    border-left: 1px solid var(--color-border-primary);
    padding: var(--space-6);
    flex: 1;
    overflow-y: auto;
  }

  :global(.dark-theme .EasyMDEContainer .editor-preview h1,
          .dark-theme .EasyMDEContainer .editor-preview h2,
          .dark-theme .EasyMDEContainer .editor-preview h3,
          .dark-theme .EasyMDEContainer .editor-preview h4,
          .dark-theme .EasyMDEContainer .editor-preview h5,
          .dark-theme .EasyMDEContainer .editor-preview h6) {
    color: var(--color-text-primary);
    border-bottom: 1px solid var(--color-border-primary);
    padding-bottom: var(--space-2);
    margin-bottom: var(--space-4);
  }

  :global(.dark-theme .EasyMDEContainer .editor-preview pre) {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-primary);
    border-radius: 0.375rem;
    padding: var(--space-4);
    color: var(--color-text-primary);
  }

  :global(.dark-theme .EasyMDEContainer .editor-preview code) {
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
    padding: var(--space-1) var(--space-2);
    border-radius: 0.25rem;
  }

  :global(.dark-theme .EasyMDEContainer .editor-preview blockquote) {
    border-left: 4px solid var(--color-primary-600);
    background: var(--color-bg-secondary);
    padding: var(--space-4);
    margin: var(--space-4) 0;
    color: var(--color-text-secondary);
  }

  :global(.dark-theme .EasyMDEContainer .editor-preview table) {
    border-collapse: collapse;
    width: 100%;
    margin: var(--space-4) 0;
  }

  :global(.dark-theme .EasyMDEContainer .editor-preview table th,
          .dark-theme .EasyMDEContainer .editor-preview table td) {
    border: 1px solid var(--color-border-primary);
    padding: var(--space-2) var(--space-3);
    text-align: left;
  }

  :global(.dark-theme .EasyMDEContainer .editor-preview table th) {
    background: var(--color-bg-secondary);
    font-weight: var(--font-weight-semibold);
  }

  :global(.dark-theme .EasyMDEContainer .editor-statusbar) {
    background: var(--color-bg-secondary);
    border-top: 1px solid var(--color-border-primary);
    color: var(--color-text-tertiary);
    font-size: var(--font-size-sm);
    padding: var(--space-2) var(--space-4);
    flex-shrink: 0;
  }

  /* 모바일 최적화 */
  @media (max-width: 768px) {
    :global(.mobile-layout .EasyMDEContainer .editor-toolbar) {
      flex-wrap: wrap;
      padding: var(--space-2);
    }

    :global(.mobile-layout .EasyMDEContainer .editor-toolbar button) {
      margin: var(--space-1);
      padding: var(--space-2);
      min-width: 32px;
      min-height: 32px;
    }

    :global(.mobile-layout .EasyMDEContainer .CodeMirror) {
      font-size: var(--font-size-sm);
    }

    :global(.mobile-layout .EasyMDEContainer .editor-preview) {
      padding: var(--space-4);
      font-size: var(--font-size-sm);
    }
  }
</style> 