import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QueryBox } from "./QueryBox";

describe("QueryBox", () => {
  it("submits the trimmed question", async () => {
    const onSubmit = vi.fn();
    render(<QueryBox onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/ask a question/i), "  what is rent?  ");
    await userEvent.click(screen.getByRole("button", { name: "Ask" }));

    expect(onSubmit).toHaveBeenCalledWith("what is rent?");
  });

  it("keeps the button disabled while the box is empty", () => {
    render(<QueryBox onSubmit={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Ask" })).toBeDisabled();
  });

  it("can be disabled from outside, e.g. while a request is running", async () => {
    render(<QueryBox onSubmit={vi.fn()} disabled />);
    await userEvent.type(screen.getByLabelText(/ask a question/i), "hello");
    expect(screen.getByRole("button", { name: "Ask" })).toBeDisabled();
  });
});
