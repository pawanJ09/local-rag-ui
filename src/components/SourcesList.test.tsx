import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SourcesList } from "./SourcesList";

const source = {
  source_path: "notes/ideas.md",
  chunk_count: 4,
  file_hash: "h",
  last_indexed: "2026-01-01T00:00:00+00:00",
};

describe("SourcesList", () => {
  it("shows a friendly empty state", () => {
    render(<SourcesList sources={[]} loading={false} error={null} onRemove={vi.fn()} />);
    expect(screen.getByText(/No documents indexed yet/)).toBeInTheDocument();
  });

  it("lists documents and removes one on request", async () => {
    const onRemove = vi.fn();
    render(<SourcesList sources={[source]} loading={false} error={null} onRemove={onRemove} />);

    expect(screen.getByText("notes/ideas.md")).toBeInTheDocument();
    expect(screen.getByText("4 chunks")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /remove notes\/ideas\.md/i }));
    expect(onRemove).toHaveBeenCalledWith("notes/ideas.md");
  });

  it("shows an error message", () => {
    render(<SourcesList sources={[]} loading={false} error="Nope" onRemove={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Nope");
  });
});
