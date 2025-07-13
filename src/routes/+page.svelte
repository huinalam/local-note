<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import PWAStatus from '$lib/PWAStatus.svelte';
  
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: string }>;
  }
  
  let title = 'Local Note';
  let message = 'Hello World!';
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

  function handleStartClick() {
    console.log('메모장 시작하기 클릭');
    // 향후 메모장 기능 구현 예정
  }
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<main>
  <div class="container">
    <h1>{title}</h1>
    
    <div class="content">
      <p>{message}</p>
      <p>TypeScript와 SvelteKit을 사용한 로컬 메모장 앱입니다.</p>
      <p>IndexedDB를 사용하여 모든 데이터를 로컬에 저장합니다.</p>
      
      <button class="start-button" on:click={handleStartClick}>
        메모장 시작하기
      </button>
      
      {#if showInstallButton}
        <button class="install-button" on:click={handleInstallClick}>
          📱 앱으로 설치하기
        </button>
      {/if}
      
      <PWAStatus />
      
      <div class="features">
        <h3>PWA 기능</h3>
        <ul>
          <li>✅ 오프라인에서도 사용 가능</li>
          <li>✅ 데스크탑에 앱으로 설치</li>
          <li>✅ 자동 업데이트</li>
          <li>✅ 빠른 로딩</li>
        </ul>
        
        <div class="install-guide">
          <h4>설치 방법</h4>
          <div class="guide-grid">
            <div class="guide-item">
              <strong>Chrome/Edge:</strong> 주소창 우측의 설치 아이콘 클릭
            </div>
            <div class="guide-item">
              <strong>Firefox:</strong> 메뉴 → 페이지 → 홈 화면에 설치
            </div>
            <div class="guide-item">
              <strong>Safari:</strong> 공유 → 홈 화면에 추가
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<style>
  main {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
  }

  .container {
    max-width: 600px;
    width: 100%;
  }

  .content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .start-button {
    font-size: 1.1rem;
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #0066cc, #0052a3);
    border: none;
    color: white;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    margin: 1rem 0.5rem;
  }

  .start-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 102, 204, 0.3);
  }

  .install-button {
    font-size: 1.1rem;
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #28a745, #20c997);
    border: none;
    color: white;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    animation: pulse 2s infinite;
    margin: 1rem 0.5rem;
  }

  .install-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(40, 167, 69, 0); }
    100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
  }

  .features {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 6px;
    margin-top: 2rem;
  }

  .features h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  .features ul {
    list-style: none;
    padding: 0;
    text-align: left;
  }

  .features li {
    padding: 0.5rem 0;
    color: #555;
    font-size: 0.95rem;
  }

  .install-guide {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e9ecef;
  }

  .install-guide h4 {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }

  .guide-grid {
    display: grid;
    gap: 0.75rem;
  }

  .guide-item {
    background: white;
    padding: 0.75rem;
    border-radius: 4px;
    font-size: 0.9rem;
    color: #555;
    text-align: left;
  }

  .guide-item strong {
    color: #2c3e50;
  }

  h1 {
    color: #2c3e50;
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 1rem;
  }

  p {
    color: #666;
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
</style>
