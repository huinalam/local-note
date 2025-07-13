<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import NoteForm from '$lib/components/NoteForm.svelte';
  
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: string }>;
  }
  
  let deferredPrompt: BeforeInstallPromptEvent | null = null;
  export let showInstallButton = false;
  let installPromptTimeout: NodeJS.Timeout | null = null;

  if (browser && typeof window !== 'undefined') {
    window.addEventListener(
      'beforeinstallprompt',
      (e: Event) => {
        console.log('beforeinstallprompt 이벤트 발생');
        const bipEvent = e as BeforeInstallPromptEvent;
        bipEvent.preventDefault();
        deferredPrompt = bipEvent;
        showInstallButton = true;
        
        // 타임아웃 클리어
        if (installPromptTimeout) {
          clearTimeout(installPromptTimeout);
          installPromptTimeout = null;
        }
      },
      { once: true } as AddEventListenerOptions
    );
  }

  onMount(() => {
    if (browser) {
      // 스탠드얼론 모드인지 확인
      if (window.matchMedia('(display-mode: standalone)').matches) {
        showInstallButton = false;
        return;
      }
      
      // 앱 설치 이벤트 리스너
      window.addEventListener('appinstalled', () => {
        console.log('앱이 설치되었습니다');
        showInstallButton = false;
        deferredPrompt = null;
      });
      
      // PWA 설치 조건을 충족했지만 beforeinstallprompt가 발생하지 않는 경우를 위한 타임아웃
      installPromptTimeout = setTimeout(() => {
        if (!deferredPrompt && !showInstallButton) {
          // Service Worker와 Manifest가 있는지 확인
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(registration => {
              if (registration) {
                console.log('PWA 조건이 충족되었지만 beforeinstallprompt가 발생하지 않음');
                // 수동으로 설치 버튼 표시 (브라우저 설치 기능 안내)
                showInstallButton = true;
              }
            });
          }
        }
      }, 3000); // 3초 후 체크
    }
  });

  async function handleInstallClick() {
    if (deferredPrompt) {
      console.log('PWA 설치 프롬프트 표시');
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('사용자 선택:', outcome);
      if (outcome === 'accepted') {
        showInstallButton = false;
      }
      deferredPrompt = null;
    } else {
      // deferredPrompt가 없는 경우 브라우저별 안내
      alert('브라우저의 설치 기능을 사용해주세요:\n\nChrome/Edge: 주소창 우측의 설치 아이콘을 클릭하세요\nFirefox: 메뉴 → 페이지 → 홈 화면에 설치\nSafari: 공유 → 홈 화면에 추가');
    }
  }
</script>

<svelte:head>
  <title>Local Note - 로컬 메모장</title>
</svelte:head>

<main class="app-layout">
  <!-- PWA Install Button -->
  {#if showInstallButton}
    <div class="install-banner">
      <button class="install-button" on:click={handleInstallClick}>
        📱 앱으로 설치하기
      </button>
    </div>
  {/if}
  
  <!-- Main Note Application -->
  <NoteForm />
</main>

<style>
  .app-layout {
    display: grid;
    grid-template-rows: 1fr;
    height: 100vh;
    background: var(--color-bg-primary);
  }

  .install-banner {
    position: fixed;
    top: var(--space-4);
    right: var(--space-4);
    z-index: 1000;
  }

  .install-button {
    font-size: var(--font-size-sm);
    padding: var(--space-3) var(--space-4);
    background: var(--color-primary-600);
    border: none;
    color: var(--color-text-inverse);
    border-radius: 0.375rem;
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    font-family: var(--font-family-sans);
  }

  .install-button:hover {
    background: var(--color-primary-700);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
  }

  .install-button:focus {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }
</style>
