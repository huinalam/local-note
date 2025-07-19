import { toggleSidebar } from '../stores/uiStore';

export const uiActions = {
  toggleSidebar: {
    id: 'toggleSidebar',
    description: '사이드바 토글',
    keybinding: {
      mac: 'Meta+Shift+\\',
      default: 'Ctrl+Shift+\\',
    },
    execute: async () => {
      toggleSidebar();
    },
  },
};
