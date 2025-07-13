<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  let showUpdatePrompt = false;
  let updateServiceWorker: (() => void) | null = null;

  onMount(async () => {
    if (browser) {
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
</script>

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