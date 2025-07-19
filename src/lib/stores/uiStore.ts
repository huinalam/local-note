import { writable } from 'svelte/store';

// 사이드바 축소 상태 관리
export const isSidebarCollapsed = writable<boolean>(false);

/**
 * 사이드바 상태를 토글합니다
 */
export const toggleSidebar = () => {
  isSidebarCollapsed.update((collapsed) => !collapsed);
};
