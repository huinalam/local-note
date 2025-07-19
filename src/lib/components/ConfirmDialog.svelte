<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  export let isOpen: boolean = false;
  export let title: string = '';
  export let message: string = '';
  export let confirmText: string = '확인';
  export let cancelText: string = '취소';
  export let onConfirm: () => void;
  export let onCancel: () => void;
  export let variant: 'danger' | 'warning' | 'info' = 'info';

  let dialogElement: HTMLDivElement;
  let confirmButtonElement: HTMLButtonElement;

  function handleKeyDown(event: KeyboardEvent) {
    if (!isOpen) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onCancel();
        break;
      case 'Enter':
        event.preventDefault();
        onConfirm();
        break;
    }
  }

  function handleConfirm() {
    onConfirm();
  }

  function handleCancel() {
    onCancel();
  }

  function handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    // 다이얼로그가 열릴 때 확인 버튼에 포커스
    if (isOpen && confirmButtonElement) {
      confirmButtonElement.focus();
    }
  });

  onDestroy(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  // isOpen이 변경될 때 포커스 관리
  $: if (isOpen && confirmButtonElement) {
    setTimeout(() => {
      confirmButtonElement.focus();
    }, 0);
  }
</script>

{#if isOpen}
  <div 
    class="confirm-dialog-overlay"
    on:click={handleOverlayClick}
    on:keydown={handleKeyDown}
    role="dialog"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-message"
    tabindex="-1"
    bind:this={dialogElement}
  >
    <div class="confirm-dialog-content">
      <header class="dialog-header">
        <h2 id="dialog-title" class="dialog-title">
          {title}
        </h2>
      </header>
      
      <div class="dialog-body">
        <p id="dialog-message" class="dialog-message">
          {message}
        </p>
      </div>
      
      <footer class="dialog-footer">
        <button
          type="button"
          class="dialog-button cancel-button"
          on:click={handleCancel}
        >
          {cancelText}
        </button>
        <button
          type="button"
          class="dialog-button confirm-button {variant}"
          on:click={handleConfirm}
          bind:this={confirmButtonElement}
        >
          {confirmText}
        </button>
      </footer>
    </div>
  </div>
{/if}

<style>
  .confirm-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.15s ease-out;
  }

  .confirm-dialog-content {
    background: var(--color-surface, #1a1a1a);
    border-radius: var(--border-radius-lg, 12px);
    padding: var(--spacing-xl, 24px);
    max-width: 400px;
    width: 90%;
    box-shadow: var(--shadow-xl, 0 25px 50px -12px rgba(0, 0, 0, 0.25));
    animation: slideIn 0.15s ease-out;
  }

  .dialog-header {
    margin-bottom: var(--spacing-lg, 16px);
  }

  .dialog-title {
    margin: 0;
    font-size: var(--font-size-lg, 18px);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #ffffff);
  }

  .dialog-body {
    margin-bottom: var(--spacing-xl, 24px);
  }

  .dialog-message {
    margin: 0;
    font-size: var(--font-size-base, 14px);
    line-height: var(--line-height-relaxed, 1.6);
    color: var(--color-text-secondary, #a1a1aa);
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-md, 12px);
  }

  .dialog-button {
    padding: var(--spacing-sm, 8px) var(--spacing-lg, 16px);
    border-radius: var(--border-radius-md, 8px);
    border: none;
    font-size: var(--font-size-sm, 13px);
    font-weight: var(--font-weight-medium, 500);
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 80px;
  }

  .cancel-button {
    background: var(--color-surface-secondary, #27272a);
    color: var(--color-text-primary, #ffffff);
    border: 1px solid var(--color-border, #3f3f46);
  }

  .cancel-button:hover, .cancel-button:focus {
    background: var(--color-surface-tertiary, #3f3f46);
    outline: 2px solid var(--color-primary, #3b82f6);
    outline-offset: 2px;
  }

  .confirm-button {
    background: var(--color-primary, #3b82f6);
    color: white;
  }

  .confirm-button:hover, .confirm-button:focus {
    background: var(--color-primary-hover, #2563eb);
    outline: 2px solid var(--color-primary, #3b82f6);
    outline-offset: 2px;
  }

  .confirm-button.danger {
    background: var(--color-danger, #ef4444);
    color: white;
  }

  .confirm-button.danger:hover, .confirm-button.danger:focus {
    background: var(--color-danger-hover, #dc2626);
    outline: 2px solid var(--color-danger, #ef4444);
    outline-offset: 2px;
  }

  .confirm-button.warning {
    background: var(--color-warning, #f59e0b);
    color: white;
  }

  .confirm-button.warning:hover, .confirm-button.warning:focus {
    background: var(--color-warning-hover, #d97706);
    outline: 2px solid var(--color-warning, #f59e0b);
    outline-offset: 2px;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* 모바일 반응형 */
  @media (max-width: 480px) {
    .confirm-dialog-content {
      margin: var(--spacing-lg, 16px);
      width: calc(100% - 32px);
    }

    .dialog-footer {
      flex-direction: column-reverse;
    }

    .dialog-button {
      width: 100%;
    }
  }
</style> 