import { describe, test, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import Tab from "../Tab.svelte";
import type { Tab as TabType } from "../../database/types";

describe("Tab Component", () => {
  const mockTab: TabType = {
    id: "tab-1",
    noteId: "note-1",
    position: 0,
    isActive: true,
  };

  const mockNote = {
    id: "note-1",
    title: "Test Note",
    content: "Test content",
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  test("should render tab with note title", () => {
    const { getByText } = render(Tab, {
      props: {
        tab: mockTab,
        note: mockNote,
      },
    });

    expect(getByText("Test Note")).toBeInTheDocument();
  });

  test("should render active tab with active class", () => {
    const { container } = render(Tab, {
      props: {
        tab: { ...mockTab, isActive: true },
        note: mockNote,
      },
    });

    const tabElement = container.querySelector(".tab");
    expect(tabElement).toHaveClass("active");
  });

  test("should render inactive tab without active class", () => {
    const { container } = render(Tab, {
      props: {
        tab: { ...mockTab, isActive: false },
        note: mockNote,
      },
    });

    const tabElement = container.querySelector(".tab");
    expect(tabElement).not.toHaveClass("active");
  });

  test("should render close button", () => {
    const { getByRole } = render(Tab, {
      props: {
        tab: mockTab,
        note: mockNote,
      },
    });

    const closeButton = getByRole("button", { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });

  test("should emit click event when tab is clicked", async () => {
    const clickHandler = vi.fn();
    const { getByText } = render(Tab, {
      props: {
        tab: mockTab,
        note: mockNote,
        onclick: clickHandler,
      },
    });

    await fireEvent.click(getByText("Test Note"));

    expect(clickHandler).toHaveBeenCalled();
  });

  test("should emit close event when close button is clicked", async () => {
    const closeHandler = vi.fn();
    const { getByRole } = render(Tab, {
      props: {
        tab: mockTab,
        note: mockNote,
        onclose: closeHandler,
      },
    });

    const closeButton = getByRole("button", { name: /close/i });
    await fireEvent.click(closeButton);

    expect(closeHandler).toHaveBeenCalled();
  });

  test("should show default title when note has no title", () => {
    const noteWithoutTitle = {
      ...mockNote,
      title: "",
    };

    const { getByText } = render(Tab, {
      props: {
        tab: mockTab,
        note: noteWithoutTitle,
      },
    });

    expect(getByText("새 메모")).toBeInTheDocument();
  });

  test("should truncate long titles", () => {
    const noteWithLongTitle = {
      ...mockNote,
      title: "This is a very long title that should be truncated",
    };

    const { container } = render(Tab, {
      props: {
        tab: mockTab,
        note: noteWithLongTitle,
      },
    });

    const titleElement = container.querySelector(".tab-title");
    expect(titleElement).toHaveClass("truncate");
  });
});
