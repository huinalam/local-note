import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { isSidebarCollapsed, toggleSidebar } from '../uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    // 각 테스트 전에 상태 초기화
    isSidebarCollapsed.set(false);
  });

  describe('isSidebarCollapsed', () => {
    it('기본값이 false여야 함', () => {
      const value = get(isSidebarCollapsed);
      expect(value).toBe(false);
    });

    it('스토어 값을 구독할 수 있어야 함', () => {
      let currentValue: boolean;
      const unsubscribe = isSidebarCollapsed.subscribe(value => {
        currentValue = value;
      });

      expect(currentValue!).toBe(false);
      unsubscribe();
    });
  });

  describe('toggleSidebar', () => {
    it('사이드바 상태를 토글해야 함', () => {
      // 초기 상태 확인
      expect(get(isSidebarCollapsed)).toBe(false);

      // 토글 후 true가 되어야 함
      toggleSidebar();
      expect(get(isSidebarCollapsed)).toBe(true);

      // 다시 토글하면 false가 되어야 함
      toggleSidebar();
      expect(get(isSidebarCollapsed)).toBe(false);
    });

    it('여러 번 토글해도 정상 동작해야 함', () => {
      const initialValue = get(isSidebarCollapsed);

      // 10번 토글
      for (let i = 0; i < 10; i++) {
        toggleSidebar();
      }

      // 짝수 번 토글했으므로 초기값과 같아야 함
      expect(get(isSidebarCollapsed)).toBe(initialValue);
    });
  });
});
