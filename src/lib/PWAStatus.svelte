<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  let isOnline = true;
  let isStandalone = false;
  let isServiceWorkerSupported = false;
  let serviceWorkerStatus = 'checking...';

  onMount(() => {
    if (browser) {
      // 온라인 상태 확인
      isOnline = navigator.onLine;
      window.addEventListener('online', () => isOnline = true);
      window.addEventListener('offline', () => isOnline = false);
      
      // 스탠드얼론 모드 확인
      isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Service Worker 지원 확인
      isServiceWorkerSupported = 'serviceWorker' in navigator;
      
      // Service Worker 상태 확인
      if (isServiceWorkerSupported) {
        navigator.serviceWorker.getRegistration().then(registration => {
          if (registration) {
            serviceWorkerStatus = 'active';
          } else {
            serviceWorkerStatus = 'not registered';
          }
        }).catch(() => {
          serviceWorkerStatus = 'error';
        });
      } else {
        serviceWorkerStatus = 'not supported';
      }
    }
  });
</script>

<div class="pwa-status">
  <h4>PWA 상태</h4>
  <div class="status-grid">
    <div class="status-item">
      <span class="status-label">연결 상태:</span>
      <span class="status-value {isOnline ? 'online' : 'offline'}">
        {isOnline ? '🟢 온라인' : '🔴 오프라인'}
      </span>
    </div>
    
    <div class="status-item">
      <span class="status-label">설치 상태:</span>
      <span class="status-value {isStandalone ? 'installed' : 'browser'}">
        {isStandalone ? '📱 설치됨' : '🌐 브라우저'}
      </span>
    </div>
    
    <div class="status-item">
      <span class="status-label">Service Worker:</span>
      <span class="status-value {serviceWorkerStatus === 'active' ? 'active' : 'inactive'}">
        {serviceWorkerStatus === 'active' ? '✅ 활성' : 
         serviceWorkerStatus === 'not supported' ? '❌ 미지원' :
         serviceWorkerStatus === 'error' ? '❌ 오류' : '⏳ 확인중'}
      </span>
    </div>
  </div>
</div>

<style>
  .pwa-status {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    padding: 1rem;
    margin-top: 1rem;
  }

  .pwa-status h4 {
    color: #2c3e50;
    margin-bottom: 0.75rem;
    font-size: 1rem;
    font-weight: 600;
  }

  .status-grid {
    display: grid;
    gap: 0.5rem;
  }

  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0;
  }

  .status-label {
    color: #666;
    font-size: 0.9rem;
  }

  .status-value {
    font-size: 0.9rem;
    font-weight: 500;
  }

  .status-value.online { color: #28a745; }
  .status-value.offline { color: #dc3545; }
  .status-value.installed { color: #007bff; }
  .status-value.browser { color: #6c757d; }
  .status-value.active { color: #28a745; }
  .status-value.inactive { color: #ffc107; }
</style> 