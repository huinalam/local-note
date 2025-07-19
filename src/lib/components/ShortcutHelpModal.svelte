<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import { browser } from "$app/environment";
  import { ShortcutHelpService } from "../services/ShortcutHelpService";
  import { HelpShortcutCategory, type ShortcutHelpData, type Shortcut, type EditorShortcut } from "../types/shortcut";

  // Props
  export let isOpen: boolean = false;
  export let onClose: () => void;
  export let shortcutData: ShortcutHelpData[] = [];

  // State
  let selectedCategoryIndex = 0;
  let searchQuery = "";
  let modalElement: HTMLDivElement;
  let filteredData: ShortcutHelpData[] = [];

  const dispatch = createEventDispatcher();

  // ShortcutHelpService 인스턴스 (플랫폼 감지용)
  let helpService: ShortcutHelpService | null = null;

  // 검색 쿼리에 따라 데이터 필터링
  $: {
    if (searchQuery.trim() === "") {
      filteredData = shortcutData;
    } else {
      const query = searchQuery.toLowerCase();
      filteredData = shortcutData.map(categoryData => ({
        ...categoryData,
        shortcuts: categoryData.shortcuts.filter(shortcut => 
          shortcut.description.toLowerCase().includes(query) ||
          shortcut.keys.toLowerCase().includes(query) ||
          ("action" in shortcut ? shortcut.action.toLowerCase().includes(query) : false)
        )
      })).filter(categoryData => categoryData.shortcuts.length > 0);
    }
    
    // 검색 결과가 변경되면 첫 번째 카테고리로 리셋
    selectedCategoryIndex = 0;
  }

  // 현재 선택된 카테고리의 단축키들
  $: currentShortcuts = filteredData[selectedCategoryIndex]?.shortcuts || [];
  $: currentCategory = filteredData[selectedCategoryIndex]?.category;

  // 키보드 이벤트 핸들러
  function handleKeyDown(event: KeyboardEvent) {
    if (!isOpen) return;

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        onClose();
        break;
      case "ArrowLeft":
        event.preventDefault();
        if (selectedCategoryIndex > 0) {
          selectedCategoryIndex--;
        }
        break;
      case "ArrowRight":
        event.preventDefault();
        if (selectedCategoryIndex < filteredData.length - 1) {
          selectedCategoryIndex++;
        }
        break;
      case "Tab":
        // Tab 키 처리는 브라우저에 맡김 (포커스 트랩은 CSS로 처리)
        break;
    }
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function selectCategory(index: number) {
    selectedCategoryIndex = index;
  }

  function clearSearch() {
    searchQuery = "";
  }

  function formatKeyCombo(keys: string): string {
    if (!helpService) return keys;
    
    const formatted = helpService.formatKeyCombo(keys);
    return formatted.display;
  }

  function getKeyTestId(keys: string): string {
    return `shortcut-key-${keys.toLowerCase()}`;
  }

  // 모달이 열릴 때 포커스 설정
  $: if (isOpen && modalElement) {
    setTimeout(() => {
      modalElement.focus();
    }, 100);
  }

  onMount(() => {
    // ShortcutHelpService 초기화 (플랫폼 감지용)
    // 실제로는 부모에서 전달받거나 의존성 주입으로 처리해야 하지만
    // 여기서는 간단히 플랫폼 감지만 사용
    helpService = {
      detectPlatform: () => {
        if (!browser || typeof navigator === "undefined") return "linux";
        const platform = navigator.platform.toLowerCase();
        if (platform.includes("mac")) return "mac";
        if (platform.includes("win")) return "windows";
        return "linux";
      },
      formatKeyCombo: (keys: string) => {
        const platform = helpService!.detectPlatform();
        const keyMap = platform === "mac" 
          ? { cmd: "⌘", ctrl: "⌃", alt: "⌥", shift: "⇧", meta: "⌘" }
          : { cmd: "Ctrl", ctrl: "Ctrl", alt: "Alt", shift: "Shift", meta: "Win" };
        
        const normalizedKeys = keys
          .toLowerCase()
          .replace(/-/g, "+")
          .replace(/cmd/g, platform === "mac" ? "cmd" : "ctrl");

        const keyParts = normalizedKeys.split("+").map(key => key.trim());
        const displayKeys: string[] = [];

        keyParts.forEach(key => {
          if (keyMap[key as keyof typeof keyMap]) {
            displayKeys.push(keyMap[key as keyof typeof keyMap]);
          } else {
            displayKeys.push(key.toUpperCase());
          }
        });

        const separator = platform === "mac" ? "" : "+";
        return {
          keys: keyParts,
          display: displayKeys.join(separator),
          platform
        };
      }
    } as any;

    if (browser) {
      document.addEventListener("keydown", handleKeyDown);
    }
    
    return () => {
      if (browser) {
        document.removeEventListener("keydown", handleKeyDown);
      }
    };
  });

  onDestroy(() => {
    if (browser) {
      document.removeEventListener("keydown", handleKeyDown);
    }
  });
</script>

{#if isOpen}
  <div 
    class="shortcut-help-backdrop"
    data-testid="shortcut-help-backdrop"
    on:click={handleBackdropClick}
    on:keydown={handleKeyDown}
    role="presentation"
    tabindex="-1"
  >
    <div 
      class="shortcut-help-modal"
      data-testid="shortcut-help-modal"
      bind:this={modalElement}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcut-help-title"
      tabindex="-1"
    >
      <!-- Header -->
      <header class="modal-header">
        <h2 id="shortcut-help-title" class="modal-title">단축키 도움말</h2>
        <button 
          class="close-button" 
          on:click={onClose} 
          aria-label="도움말 모달 닫기"
        >
          ✕
        </button>
      </header>

      <!-- Search -->
      <div class="search-container">
        <div class="search-input-wrapper">
          <input
            type="text"
            class="search-input"
            placeholder="단축키 검색..."
            bind:value={searchQuery}
            aria-label="단축키 검색"
          />
          {#if searchQuery}
            <button 
              class="clear-button"
              on:click={clearSearch}
              aria-label="검색 지우기"
            >
              ✕
            </button>
          {/if}
        </div>
      </div>

      <!-- Content -->
      <div class="modal-content">
        {#if filteredData.length === 0}
          <div class="empty-state">
            {#if shortcutData.length === 0}
              <div class="empty-icon">⌨️</div>
              <p class="empty-text">등록된 단축키가 없습니다</p>
            {:else}
              <div class="empty-icon">🔍</div>
              <p class="empty-text">검색 결과가 없습니다</p>
              <p class="empty-subtext">다른 검색어를 시도해보세요</p>
            {/if}
          </div>
        {:else}
          <!-- Category Tabs -->
          <div class="category-tabs">
            {#each filteredData as categoryData, index}
              <button
                class="category-tab"
                class:active={index === selectedCategoryIndex}
                on:click={() => selectCategory(index)}
              >
                {categoryData.category}
                <span class="shortcut-count">({categoryData.shortcuts.length})</span>
              </button>
            {/each}
          </div>

          <!-- Shortcuts List -->
          <div class="shortcuts-container">
            {#if currentShortcuts.length === 0}
              <div class="empty-category">
                <p class="empty-text">이 카테고리에는 단축키가 없습니다</p>
              </div>
            {:else}
              <div class="shortcuts-list">
                {#each currentShortcuts as shortcut}
                  <div class="shortcut-item">
                                         <div class="shortcut-info">
                       <span class="shortcut-description">{shortcut.description}</span>
                       {#if "action" in shortcut && shortcut.action}
                         <span class="shortcut-action">({shortcut.action})</span>
                       {/if}
                     </div>
                    <div 
                      class="shortcut-keys"
                      data-testid={getKeyTestId(shortcut.keys)}
                    >
                      {formatKeyCombo(shortcut.keys)}
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <footer class="modal-footer">
        <div class="keyboard-hints">
          <span class="hint">← → 카테고리 탐색</span>
          <span class="hint">Esc 닫기</span>
        </div>
      </footer>
    </div>
  </div>
{/if}

<style>
  .shortcut-help-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .shortcut-help-modal {
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-primary);
    border-radius: 0.75rem;
    width: 90%;
    max-width: 800px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-6);
    border-bottom: 1px solid var(--color-border-secondary);
    background: var(--color-bg-secondary);
  }

  .modal-title {
    font-size: var(--font-size-xl);
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

  .search-container {
    padding: var(--space-4) var(--space-6);
    border-bottom: 1px solid var(--color-border-secondary);
    background: var(--color-bg-secondary);
  }

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-input {
    width: 100%;
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-border-primary);
    border-radius: 0.375rem;
    background: var(--color-bg-primary);
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

  .clear-button {
    position: absolute;
    right: var(--space-3);
    background: none;
    border: none;
    color: var(--color-text-tertiary);
    cursor: pointer;
    padding: var(--space-1);
    border-radius: 0.25rem;
    transition: color 0.2s ease;
  }

  .clear-button:hover {
    color: var(--color-text-secondary);
  }

  .modal-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .category-tabs {
    display: flex;
    overflow-x: auto;
    border-bottom: 1px solid var(--color-border-secondary);
    background: var(--color-bg-secondary);
  }

  .category-tab {
    padding: var(--space-3) var(--space-4);
    border: none;
    background: none;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  .category-tab:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-tertiary);
  }

  .category-tab.active {
    color: var(--color-primary-600);
    border-bottom-color: var(--color-primary-600);
    background: var(--color-bg-primary);
  }

  .shortcut-count {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
    font-weight: var(--font-weight-normal);
  }

  .shortcuts-container {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-4);
  }

  .shortcuts-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .shortcut-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-border-secondary);
    border-radius: 0.5rem;
    background: var(--color-bg-secondary);
    transition: all 0.2s ease;
  }

  .shortcut-item:hover {
    background: var(--color-bg-tertiary);
    border-color: var(--color-border-primary);
  }

  .shortcut-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .shortcut-description {
    color: var(--color-text-primary);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
  }

  .shortcut-action {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-sm);
    font-family: var(--font-family-mono);
  }

  .shortcut-keys {
    padding: var(--space-2) var(--space-3);
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-primary);
    border-radius: 0.375rem;
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    font-family: var(--font-family-mono);
    white-space: nowrap;
  }

  .empty-state,
  .empty-category {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-12);
    text-align: center;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: var(--space-4);
  }

  .empty-text {
    color: var(--color-text-secondary);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    margin: 0 0 var(--space-2) 0;
  }

  .empty-subtext {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-base);
    margin: 0;
  }

  .modal-footer {
    padding: var(--space-4) var(--space-6);
    border-top: 1px solid var(--color-border-secondary);
    background: var(--color-bg-secondary);
  }

  .keyboard-hints {
    display: flex;
    gap: var(--space-4);
    justify-content: center;
  }

  .hint {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-sm);
    font-family: var(--font-family-mono);
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .shortcut-help-modal {
      width: 95%;
      max-height: 90vh;
    }

    .modal-header,
    .search-container,
    .modal-footer {
      padding: var(--space-4);
    }

    .shortcut-item {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-2);
    }

    .shortcut-keys {
      align-self: flex-end;
    }

    .category-tabs {
      flex-wrap: wrap;
    }

    .category-tab {
      min-width: 0;
      flex: 1;
    }
  }

  /* 포커스 트랩을 위한 스타일 */
  .shortcut-help-modal:focus {
    outline: none;
  }
</style> 