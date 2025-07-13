<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import PWAStatus from '$lib/PWAStatus.svelte';
  
  let title = 'Local Note';
  let message = 'Hello World!';
  let deferredPrompt: any = null;
  let showInstallButton = false;

  onMount(() => {
    if (browser) {
      // PWA 설치 프롬프트 이벤트 리스너
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton = true;
      });

      // 앱이 이미 설치되었는지 확인
      window.addEventListener('appinstalled', () => {
        showInstallButton = false;
        deferredPrompt = null;
      });

      // 이미 설치된 앱인지 확인 (standalone 모드)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        showInstallButton = false;
      }
    }
  });

  async function handleInstallClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        showInstallButton = false;
      }
      
      deferredPrompt = null;
    }
  }
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="container">
  <h1 class="text-center mb-4">{title}</h1>
  <div class="welcome-message">
    <p class="mb-2">{message}</p>
    <p class="mb-2">TypeScript와 SvelteKit을 사용한 로컬 메모장 앱입니다.</p>
    <p class="mb-3">IndexedDB를 사용하여 모든 데이터를 로컬에 저장합니다.</p>
    
    <div class="text-center button-group">
      <button type="button" class="start-button">
        메모장 시작하기
      </button>
      
      {#if showInstallButton}
        <button type="button" class="install-button" on:click={handleInstallClick}>
          📱 앱 설치하기
        </button>
      {/if}
    </div>
    
    <PWAStatus />
    
    <div class="pwa-info">
      <h3>PWA 기능</h3>
      <ul>
        <li>✅ 오프라인에서도 사용 가능</li>
        <li>✅ 데스크탑에 앱으로 설치</li>
        <li>✅ 자동 업데이트</li>
        <li>✅ 빠른 로딩</li>
      </ul>
      
      <div class="install-guide">
        <h4>설치 방법</h4>
        <div class="guide-steps">
          <div class="step">
            <strong>Chrome/Edge:</strong> 주소창 우측의 설치 아이콘 클릭
          </div>
          <div class="step">
            <strong>Firefox:</strong> 메뉴 → 페이지 → 홈 화면에 설치
          </div>
          <div class="step">
            <strong>Safari:</strong> 공유 → 홈 화면에 추가
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .welcome-message {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .button-group {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }

  .start-button {
    font-size: 1.1rem;
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #0066cc, #0052a3);
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .start-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 102, 204, 0.3);
  }

  .install-button {
    font-size: 1.1rem;
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #28a745, #20c997);
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s ease;
    animation: pulse 2s infinite;
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

  .pwa-info {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 6px;
    margin-top: 2rem;
  }

  .pwa-info h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  .pwa-info ul {
    list-style: none;
    padding: 0;
    text-align: left;
  }

  .pwa-info li {
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

  .guide-steps {
    display: grid;
    gap: 0.75rem;
  }

  .step {
    background: white;
    padding: 0.75rem;
    border-radius: 4px;
    font-size: 0.9rem;
    color: #555;
    text-align: left;
  }

  .step strong {
    color: #2c3e50;
  }

  h1 {
    color: #2c3e50;
    font-size: 2.5rem;
    font-weight: 700;
  }

  p {
    color: #666;
    font-size: 1.1rem;
  }
</style>
