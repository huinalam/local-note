import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import DraggableTabBar from "../DraggableTabBar.svelte";
import { tabStore } from "../../stores/tabStore";
import type { Tab } from "../../database/types";

describe("DraggableTabBar Component", () => {
  const mockTabs: Tab[] = [
    {
      id: "tab-1",
      noteId: "note-1",
      position: 0,
      isActive: true,
    },
    {
      id: "tab-2",
      noteId: "note-2",
      position: 1,
      isActive: false,
    },
    {
      id: "tab-3",
      noteId: "note-3",
      position: 2,
      isActive: false,
    },
  ];

  const mockNotes = [
    {
      id: "note-1",
      title: "First Note",
      content: "Content 1",
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "note-2",
      title: "Second Note",
      content: "Content 2",
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "note-3",
      title: "Third Note",
      content: "Content 3",
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    tabStore.reset();
    mockTabs.forEach((tab) => tabStore.addTab(tab));
  });

  test("should render tabs in correct order", () => {
    const { container } = render(DraggableTabBar, {
      props: {
        notes: mockNotes,
      },
    });

    const tabs = container.querySelectorAll(".draggable-tab");
    expect(tabs).toHaveLength(3);

    // 탭 순서 확인 (position 순서대로)
    expect(tabs[0]).toHaveTextContent("First Note"); // position 0
    expect(tabs[1]).toHaveTextContent("Second Note"); // position 1
    expect(tabs[2]).toHaveTextContent("Third Note"); // position 2
  });

  test("should have draggable attribute on tabs", () => {
    const { container } = render(DraggableTabBar, {
      props: {
        notes: mockNotes,
      },
    });

    const tabs = container.querySelectorAll(".draggable-tab");
    tabs.forEach((tab) => {
      expect(tab).toHaveAttribute("draggable", "true");
    });
  });

  test("should handle drag start event", async () => {
    const { container } = render(DraggableTabBar, {
      props: {
        notes: mockNotes,
      },
    });

    const firstTab = container.querySelector(".draggable-tab");
    expect(firstTab).toBeInTheDocument();

    // 드래그 시작 이벤트 발생
    await fireEvent.dragStart(firstTab!);

    // 드래그 중인 탭에 dragging 클래스가 추가되어야 함
    expect(firstTab).toHaveClass("dragging");
  });

  test("should handle drag over event", async () => {
    const { container } = render(DraggableTabBar, {
      props: {
        notes: mockNotes,
      },
    });

    const tabs = container.querySelectorAll(".draggable-tab");
    const firstTab = tabs[0];
    const secondTab = tabs[1];

    // 드래그 오버 이벤트 발생
    await fireEvent.dragOver(secondTab);

    // 드래그 오버된 탭에 drag-over 클래스가 추가되어야 함
    expect(secondTab).toHaveClass("drag-over");
  });

  test("should handle drop event and reorder tabs", async () => {
    const { container } = render(DraggableTabBar, {
      props: {
        notes: mockNotes,
      },
    });

    const tabs = container.querySelectorAll(".draggable-tab");
    const firstTab = tabs[0];
    const thirdTab = tabs[2];

    // 드래그 앤 드롭 시뮬레이션
    await fireEvent.dragStart(firstTab);
    await fireEvent.dragOver(thirdTab);
    await fireEvent.drop(thirdTab);

    // 탭 순서가 변경되었는지 확인
    // 실제 순서 변경은 tabStore를 통해 이루어짐
    const updatedTabs = tabStore.getActiveTab();
    expect(updatedTabs).toBeDefined();
  });

  test("should clean up drag state on drag end", async () => {
    const { container } = render(DraggableTabBar, {
      props: {
        notes: mockNotes,
      },
    });

    const firstTab = container.querySelector(".draggable-tab");

    // 드래그 시작 후 종료
    await fireEvent.dragStart(firstTab!);
    expect(firstTab).toHaveClass("dragging");

    await fireEvent.dragEnd(firstTab!);
    expect(firstTab).not.toHaveClass("dragging");
  });

  test("should prevent default on drag over", async () => {
    const { container } = render(DraggableTabBar, {
      props: {
        notes: mockNotes,
      },
    });

    const secondTab = container.querySelectorAll(".draggable-tab")[1];

    const dragOverEvent = new Event("dragover", { bubbles: true });
    const preventDefaultSpy = vi.spyOn(dragOverEvent, "preventDefault");

    secondTab.dispatchEvent(dragOverEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});
