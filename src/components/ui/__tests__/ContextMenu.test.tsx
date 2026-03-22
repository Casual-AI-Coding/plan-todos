import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
} from "../ContextMenu";

describe("ContextMenu", () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染", () => {
    it("默认不显示菜单内容", () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={mockOnClick}>Item 1</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>,
      );

      expect(screen.getByText("Trigger")).toBeInTheDocument();
      expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
    });
  });

  describe("触发显示", () => {
    it("右键点击触发器显示菜单", () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={mockOnClick}>Item 1</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>,
      );

      const trigger = screen.getByText("Trigger");
      fireEvent.contextMenu(trigger);

      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });
  });

  describe("菜单项交互", () => {
    it("点击菜单项触发回调并关闭菜单", async () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={mockOnClick}>Click Me</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>,
      );

      // Open menu
      fireEvent.contextMenu(screen.getByText("Trigger"));
      expect(screen.getByText("Click Me")).toBeInTheDocument();

      // Click item
      fireEvent.click(screen.getByText("Click Me"));

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(screen.queryByText("Click Me")).not.toBeInTheDocument();
      });
    });

    it("禁用的菜单项不可点击", async () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={mockOnClick} disabled>
              Disabled Item
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>,
      );

      fireEvent.contextMenu(screen.getByText("Trigger"));
      fireEvent.click(screen.getByText("Disabled Item"));

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe("关闭行为", () => {
    it("按 Escape 键关闭菜单", async () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={mockOnClick}>Item 1</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>,
      );

      fireEvent.contextMenu(screen.getByText("Trigger"));
      expect(screen.getByText("Item 1")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Escape" });

      await waitFor(() => {
        expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
      });
    });

    it("点击外部区域关闭菜单", async () => {
      render(
        <div>
          <ContextMenu>
            <ContextMenuTrigger>
              <div>Trigger</div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={mockOnClick}>Item 1</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
          <div>Outside</div>
        </div>,
      );

      fireEvent.contextMenu(screen.getByText("Trigger"));
      expect(screen.getByText("Item 1")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Outside"));

      await waitFor(() => {
        expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
      });
    });
  });

  describe("样式变体", () => {
    it("danger 变体应用危险样式", () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem variant="danger">Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>,
      );

      fireEvent.contextMenu(screen.getByText("Trigger"));

      const deleteButton = screen.getByRole("button", { name: "Delete" });
      expect(deleteButton).toHaveClass("text-red-600");
    });
  });

  describe("分隔符和标签", () => {
    it("渲染分隔符", () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Item 1</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Item 2</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>,
      );

      fireEvent.contextMenu(screen.getByText("Trigger"));

      const separator = document.querySelector(
        '[style*="background-color: var(--color-border)"]',
      );
      expect(separator).toBeInTheDocument();
    });

    it("渲染标签", () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>Actions</ContextMenuLabel>
            <ContextMenuItem>Item 1</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>,
      );

      fireEvent.contextMenu(screen.getByText("Trigger"));

      expect(screen.getByText("Actions")).toBeInTheDocument();
    });
  });
});
