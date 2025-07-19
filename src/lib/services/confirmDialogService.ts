import { writable } from "svelte/store";

// ConfirmDialog 설정 타입
export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

// ConfirmDialog 상태 타입
interface ConfirmDialogState {
  isOpen: boolean;
  config: ConfirmDialogConfig | null;
}

// 초기 상태
const initialState: ConfirmDialogState = {
  isOpen: false,
  config: null,
};

// 스토어 생성
export const confirmDialogStore = writable<ConfirmDialogState>(initialState);

// ConfirmDialog 서비스
export class ConfirmDialogService {
  private store = confirmDialogStore;

  /**
   * 확인 다이얼로그를 표시합니다
   */
  show(config: ConfirmDialogConfig): void {
    this.store.set({
      isOpen: true,
      config,
    });
  }

  /**
   * 확인 다이얼로그를 숨깁니다
   */
  hide(): void {
    this.store.set({
      isOpen: false,
      config: null,
    });
  }

  /**
   * 다이얼로그가 열려있는지 확인합니다
   */
  get isOpen(): boolean {
    let isOpen = false;
    this.store.subscribe((state) => {
      isOpen = state.isOpen;
    })();
    return isOpen;
  }

  /**
   * 스토어를 구독합니다
   */
  subscribe = this.store.subscribe;
}
