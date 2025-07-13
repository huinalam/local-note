<script lang="ts">
  let title = 'Local Note';
  let message = 'Hello World!';
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
    
    <div class="text-center">
      <button type="button" class="start-button">
        메모장 시작하기
      </button>
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
