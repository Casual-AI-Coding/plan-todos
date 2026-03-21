 
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AboutCard } from "../AboutCard";

// Mock package.json
vi.mock("../../../package.json", () => ({
  default: {
    version: "0.6.2",
  },
}));

describe("AboutCard", () => {
  describe("渲染测试", () => {
    it("组件正确渲染", () => {
      const { container } = render(<AboutCard />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("显示所有信息行", () => {
      render(<AboutCard />);

      expect(screen.getByText("应用名称")).toBeInTheDocument();
      expect(screen.getByText("版本")).toBeInTheDocument();
      expect(screen.getByText("构建")).toBeInTheDocument();
    });
  });

  describe("信息显示", () => {
    it("显示应用名称", () => {
      render(<AboutCard />);
      expect(screen.getByText("Plan Todos")).toBeInTheDocument();
    });

    it("显示版本号", () => {
      render(<AboutCard />);
      expect(screen.getByText("0.6.2")).toBeInTheDocument();
    });

    it("显示构建信息", () => {
      render(<AboutCard />);
      expect(screen.getByText("Tauri + Next.js")).toBeInTheDocument();
    });
  });

  describe("布局样式", () => {
    it("使用 space-y-3 间距", () => {
      const { container } = render(<AboutCard />);
      const spaceDiv = container.querySelector(".space-y-3");
      expect(spaceDiv).toBeInTheDocument();
    });

    it("使用小号字体", () => {
      const { container } = render(<AboutCard />);
      const textSm = container.querySelector(".text-sm");
      expect(textSm).toBeInTheDocument();
    });

    it("使用 flex justify-between 布局", () => {
      const { container } = render(<AboutCard />);
      const flexDiv = container.querySelector(".flex.justify-between");
      expect(flexDiv).toBeInTheDocument();
    });
  });

  describe("文本样式", () => {
    it("标签使用灰色", () => {
      const { container } = render(<AboutCard />);
      const grayText = container.querySelector(".text-gray-600");
      expect(grayText).toBeInTheDocument();
    });

    it("值使用加粗字体", () => {
      const { container } = render(<AboutCard />);
      const mediumText = container.querySelector(".font-medium");
      expect(mediumText).toBeInTheDocument();
    });
  });

  describe("数据完整性", () => {
    it("显示三行信息", () => {
      const { container } = render(<AboutCard />);
      const rows = container.querySelectorAll(".flex.justify-between");
      expect(rows.length).toBe(3);
    });

    it("所有字段都有值", () => {
      render(<AboutCard />);

      // 检查标签和值都存在
      expect(
        screen.getByText((content) => content === "应用名称"),
      ).toBeInTheDocument();
      expect(screen.getByText("Plan Todos")).toBeInTheDocument();

      expect(screen.getByText("版本")).toBeInTheDocument();
      expect(screen.getByText("0.6.2")).toBeInTheDocument();

      expect(screen.getByText("构建")).toBeInTheDocument();
      expect(screen.getByText("Tauri + Next.js")).toBeInTheDocument();
    });
  });

  describe("版本信息", () => {
    it("显示版本信息不依赖外部数据", () => {
      // 验证版本号是静态导入的
      const { container } = render(<AboutCard />);
      const versionSpan = container.querySelectorAll(".font-medium")[1];
      expect(versionSpan).toHaveTextContent("0.6.2");
    });
  });

  describe("组合场景", () => {
    it("完整渲染所有信息", () => {
      render(<AboutCard />);

      const container = document.querySelector(".space-y-3");
      expect(container).toBeInTheDocument();

      // 验证所有内容
      expect(container).toHaveTextContent("应用名称");
      expect(container).toHaveTextContent("Plan Todos");
      expect(container).toHaveTextContent("版本");
      expect(container).toHaveTextContent("0.6.2");
      expect(container).toHaveTextContent("构建");
      expect(container).toHaveTextContent("Tauri + Next.js");
    });
  });
});
