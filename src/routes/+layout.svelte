<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { browser, dev } from '$app/environment';
  
  let showUpdatePrompt = false;
  let updateServiceWorker: (() => void) | null = null;
  let showInstallPrompt = false;
  let deferredPrompt: any;

  onMount(async () => {
    if (browser) {
      // PWA 설치 프롬프트 이벤트 리스너
      window.addEventListener('beforeinstallprompt', (e) => {
        // 기본 프롬프트를 막음
        e.preventDefault();
        // 이벤트를 저장하여 나중에 사용
        deferredPrompt = e;
        // 설치 버튼을 UI에 표시
        showInstallPrompt = true;
        console.log('PWA 설치 프롬프트 준비됨');
      });

      // 앱이 이미 설치되었는지 확인
      window.addEventListener('appinstalled', () => {
        showInstallPrompt = false;
        deferredPrompt = null;
        console.log('PWA가 설치되었습니다.');
      });

      // PWA 업데이트 확인
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { registerSW } = await import('virtual:pwa-register');
      
      const updateSW = registerSW({
        onNeedRefresh() {
          showUpdatePrompt = true;
          updateServiceWorker = () => {
            updateSW(true);
          };
        },
        onOfflineReady() {
          console.log('앱이 오프라인에서 사용할 준비가 되었습니다.');
        },
        onRegistered(r: ServiceWorkerRegistration | undefined) {
          console.log('Service Worker가 등록되었습니다:', r);
        },
        onRegisterError(error: unknown) {
          console.error('Service Worker 등록 실패:', error);
        }
      });
    }
  });

  function handleUpdateClick() {
    if (updateServiceWorker) {
      updateServiceWorker();
      showUpdatePrompt = false;
    }
  }

  function dismissUpdate() {
    showUpdatePrompt = false;
  }

  async function handleInstallClick() {
    if (deferredPrompt) {
      // 설치 프롬프트를 표시
      deferredPrompt.prompt();
      // 사용자의 선택을 기다림
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`사용자 응답: ${outcome}`);
      // 프롬프트는 한 번만 사용할 수 있으므로 초기화
      deferredPrompt = null;
      // 설치 프롬프트 UI를 숨김
      showInstallPrompt = false;
    }
  }
</script>

<svelte:head>
  {#if (!dev && browser)}
    <link rel="manifest" href="/manifest.webmanifest">
  {/if}
</svelte:head>

{#if showInstallPrompt}
  <div class="install-prompt">
    <div class="install-content">
      <h3>📥 앱으로 설치하기</h3>
      <p>이 앱을 홈 화면에 추가하여 더 빠르고 편리하게 사용하세요.</p>
      <div class="install-buttons">
        <button class="install-btn" on:click={handleInstallClick}>
          설치
        </button>
        <button class="dismiss-btn" on:click={() => showInstallPrompt = false}>
          나중에
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showUpdatePrompt}
  <div class="update-prompt">
    <div class="update-content">
      <h3>🔄 새 버전이 있습니다!</h3>
      <p>앱의 새 버전이 준비되었습니다. 지금 업데이트하시겠습니까?</p>
      <div class="update-buttons">
        <button class="update-btn" on:click={handleUpdateClick}>
          업데이트
        </button>
        <button class="dismiss-btn" on:click={dismissUpdate}>
          나중에
        </button>
      </div>
    </div>
  </div>
{/if}

<slot />

<style>
  .install-prompt {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
  }

  .install-content {
    background: linear-gradient(135deg, #2c3e50, #465a70);
    color: white;
    padding: 1.5rem 2rem;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    text-align: center;
  }

  .install-content h3 {
    margin: 0 0 1rem 0;
    font-size: 1.2rem;
    font-weight: 600;
  }
  
  .install-content p {
    margin: 0 0 1.5rem 0;
    font-size: 0.95rem;
    opacity: 0.9;
    line-height: 1.4;
  }

  .install-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .install-btn {
    background: #007aff;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .install-btn:hover {
    background: #005ecb;
  }

  .update-prompt {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .update-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    max-width: 400px;
    text-align: center;
  }

  .update-content h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-size: 1.3rem;
  }

  .update-content p {
    color: #666;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }

  .update-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .update-btn {
    background: linear-gradient(135deg, #0066cc, #0052a3);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .update-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 102, 204, 0.3);
  }

  .dismiss-btn {
    background: #6c757d;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .dismiss-btn:hover {
    background: #5a6268;
    transform: translateY(-2px);
  }
</style> 