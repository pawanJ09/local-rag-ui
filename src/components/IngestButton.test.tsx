import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { IngestStatusResponse } from "../api/types";
import { IngestButton } from "./IngestButton";

const done: IngestStatusResponse = {
  job_id: "j1",
  status: "completed",
  files_scanned: 5,
  files_indexed: 2,
  files_skipped: 1,
  files_unchanged: 2,
  skipped_files: ["notes.png"],
  error: null,
};

describe("IngestButton", () => {
  it("calls onStart when clicked", async () => {
    const onStart = vi.fn();
    render(<IngestButton status={null} isRunning={false} error={null} onStart={onStart} />);
    await userEvent.click(screen.getByRole("button", { name: "Re-scan documents" }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("is disabled and says scanning while a job runs", () => {
    render(<IngestButton status={null} isRunning={true} error={null} onStart={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Scanning…" })).toBeDisabled();
  });

  it("summarises a finished scan and lists skipped files", () => {
    render(<IngestButton status={done} isRunning={false} error={null} onStart={vi.fn()} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Scanned 5 files: 2 indexed, 2 unchanged, 1 skipped.",
    );
    expect(screen.getByText("Skipped files (1)")).toBeInTheDocument();
  });

  it("shows a failed scan and request errors", () => {
    const failed: IngestStatusResponse = { ...done, status: "failed", error: "disk full" };
    const { rerender } = render(
      <IngestButton status={failed} isRunning={false} error={null} onStart={vi.fn()} />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Scan failed: disk full");

    rerender(<IngestButton status={null} isRunning={false} error="Network down" onStart={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Network down");
  });
});
