import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import ConfirmDialog from "../ConfirmDialog.svelte";

describe("ConfirmDialog Component", () => {
  beforeEach(() => {
    // 키보드 이벤트 모킹
    vi.spyOn(document, "addEventListener");
    vi.spyOn(document, "removeEventListener");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("렌더링", () => {
    it("should render dialog when isOpen is true", () => {
      const props = {
        isOpen: true,
        title: "삭제 확인",
        message: "정말로 이 노트를 삭제하시겠습니까?",
        confirmText: "삭제",
        cancelText: "취소",
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
        variant: "danger" as const,
      };

      render(ConfirmDialog, { props });

      expect(screen.getByText("삭제 확인")).toBeInTheDocument();
      expect(
        screen.getByText("정말로 이 노트를 삭제하시겠습니까?")
      ).toBeInTheDocument();
      expect(screen.getByText("삭제")).toBeInTheDocument();
      expect(screen.getByText("취소")).toBeInTheDocument();
    });

    it("should not render dialog when isOpen is false", () => {
      const props = {
        isOpen: false,
        title: "삭제 확인",
        message: "정말로 이 노트를 삭제하시겠습니까?",
        confirmText: "삭제",
        cancelText: "취소",
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
        variant: "danger" as const,
      };

      render(ConfirmDialog, { props });

      expect(screen.queryByText("삭제 확인")).not.toBeInTheDocument();
    });

    it("should apply danger variant styles", () => {
      const props = {
        isOpen: true,
        title: "삭제 확인",
        message: "정말로 이 노트를 삭제하시겠습니까?",
        confirmText: "삭제",
        cancelText: "취소",
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
        variant: "danger" as const,
      };

      render(ConfirmDialog, { props });

      const confirmButton = screen.getByText("삭제");
      expect(confirmButton).toHaveClass("danger");
    });
  });

  describe("사용자 상호작용", () => {
    it("should call onConfirm when confirm button is clicked", async () => {
      const onConfirm = vi.fn();
      const props = {
        isOpen: true,
        title: "삭제 확인",
        message: "정말로 이 노트를 삭제하시겠습니까?",
        confirmText: "삭제",
        cancelText: "취소",
        onConfirm,
        onCancel: vi.fn(),
        variant: "danger" as const,
      };

      render(ConfirmDialog, { props });

      const confirmButton = screen.getByText("삭제");
      await fireEvent.click(confirmButton);

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("should call onCancel when cancel button is clicked", async () => {
      const onCancel = vi.fn();
      const props = {
        isOpen: true,
        title: "삭제 확인",
        message: "정말로 이 노트를 삭제하시겠습니까?",
        confirmText: "삭제",
        cancelText: "취소",
        onConfirm: vi.fn(),
        onCancel,
        variant: "danger" as const,
      };

      render(ConfirmDialog, { props });

      const cancelButton = screen.getByText("취소");
      await fireEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("should call onCancel when Escape key is pressed", async () => {
      const onCancel = vi.fn();
      const props = {
        isOpen: true,
        title: "삭제 확인",
        message: "정말로 이 노트를 삭제하시겠습니까?",
        confirmText: "삭제",
        cancelText: "취소",
        onConfirm: vi.fn(),
        onCancel,
        variant: "danger" as const,
      };

      render(ConfirmDialog, { props });

      await fireEvent.keyDown(document, { key: "Escape" });

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("should call onConfirm when Enter key is pressed", async () => {
      const onConfirm = vi.fn();
      const props = {
        isOpen: true,
        title: "삭제 확인",
        message: "정말로 이 노트를 삭제하시겠습니까?",
        confirmText: "삭제",
        cancelText: "취소",
        onConfirm,
        onCancel: vi.fn(),
        variant: "danger" as const,
      };

      render(ConfirmDialog, { props });

      await fireEvent.keyDown(document, { key: "Enter" });

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe("접근성", () => {
    it("should have proper ARIA attributes", () => {
      const props = {
        isOpen: true,
        title: "삭제 확인",
        message: "정말로 이 노트를 삭제하시겠습니까?",
        confirmText: "삭제",
        cancelText: "취소",
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
        variant: "danger" as const,
      };

      render(ConfirmDialog, { props });

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-labelledby");
      expect(dialog).toHaveAttribute("aria-describedby");
    });

    it("should focus confirm button when dialog opens", () => {
      const props = {
        isOpen: true,
        title: "삭제 확인",
        message: "정말로 이 노트를 삭제하시겠습니까?",
        confirmText: "삭제",
        cancelText: "취소",
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
        variant: "danger" as const,
      };

      render(ConfirmDialog, { props });

      const confirmButton = screen.getByText("삭제");
      expect(confirmButton).toHaveFocus();
    });
  });
});
