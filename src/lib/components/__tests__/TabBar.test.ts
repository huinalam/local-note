import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import TabBar from "../TabBar.svelte";
import { tabStore } from "../../stores/tabStore";
import type { Tab } from "../../database/types";

describe("TabBar Component", () => {
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
  ];

  beforeEach(() => {
    tabStore.reset();
  });

  test("should render empty state when no tabs", () => {
    const { getByText } = render(TabBar, {
      props: {
        notes: [],
      },
    });

    expect(getByText("새 탭")).toBeInTheDocument();
  });

  test("should render tabs when tabs exist", () => {
    // 탭 추가
    mockTabs.forEach((tab) => tabStore.addTab(tab));

    const { getByText } = render(TabBar, {
      props: {
        notes: mockNotes,
      },
    });

    expect(getByText("First Note")).toBeInTheDocument();
    expect(getByText("Second Note")).toBeInTheDocument();
  });

  test("should render new tab button", () => {
    const { getByRole } = render(TabBar, {
      props: {
        notes: mockNotes,
      },
    });

    const newTabButton = getByRole("button", { name: /새 탭/i });
    expect(newTabButton).toBeInTheDocument();
  });

  test("should emit newTab event when new tab button is clicked", async () => {
    const newTabHandler = vi.fn();
    const { getByRole } = render(TabBar, {
      props: {
        notes: mockNotes,
        onnewTab: newTabHandler,
      },
    });

    const newTabButton = getByRole("button", { name: /새 탭/i });
    await fireEvent.click(newTabButton);

    expect(newTabHandler).toHaveBeenCalled();
  });

  test("should emit tabSelect event when tab is clicked", async () => {
    // 탭 추가
    mockTabs.forEach((tab) => tabStore.addTab(tab));

    const tabSelectHandler = vi.fn();
    const { getByText } = render(TabBar, {
      props: {
        notes: mockNotes,
        ontabSelect: tabSelectHandler,
      },
    });

    await fireEvent.click(getByText("Second Note"));

    expect(tabSelectHandler).toHaveBeenCalled();
  });

  test("should emit tabClose event when tab close button is clicked", async () => {
    // 탭 추가
    mockTabs.forEach((tab) => tabStore.addTab(tab));

    const tabCloseHandler = vi.fn();
    const { container } = render(TabBar, {
      props: {
        notes: mockNotes,
        ontabClose: tabCloseHandler,
      },
    });

    // 첫 번째 탭의 닫기 버튼 찾기
    const closeButtons = container.querySelectorAll(".tab-close");
    await fireEvent.click(closeButtons[0]);

    expect(tabCloseHandler).toHaveBeenCalled();
  });

  test("should show active tab correctly", () => {
    // 탭 추가 (마지막에 추가된 탭이 활성화됨)
    mockTabs.forEach((tab) => tabStore.addTab(tab));

    // 첫 번째 탭을 활성화
    tabStore.setActiveTab("tab-1");

    const { container } = render(TabBar, {
      props: {
        notes: mockNotes,
      },
    });

    const tabs = container.querySelectorAll(".tab");
    expect(tabs[0]).toHaveClass("active");
    expect(tabs[1]).not.toHaveClass("active");
  });

  test("should handle empty notes array gracefully", () => {
    // 탭 추가
    mockTabs.forEach((tab) => tabStore.addTab(tab));

    const { container } = render(TabBar, {
      props: {
        notes: [],
      },
    });

    // 노트가 없어도 컴포넌트가 렌더링되어야 함
    expect(container.querySelector(".tab-bar")).toBeInTheDocument();
  });
});
