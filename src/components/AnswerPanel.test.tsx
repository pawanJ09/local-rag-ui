import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnswerPanel } from "./AnswerPanel";

const chunk = {
  source_path: "docs/a.pdf",
  chunk_id: "c1",
  excerpt: "Rent is 2900.",
  distance: 0.2,
};

describe("AnswerPanel", () => {
  it("shows a grounded answer with its sources", () => {
    render(
      <AnswerPanel
        result={{ answer: "Rent was $2,900.", sources: [chunk], grounded: true }}
        loading={false}
        error={null}
      />,
    );
    expect(screen.getByTestId("answer-grounded")).toBeInTheDocument();
    expect(screen.getByText("Rent was $2,900.")).toBeInTheDocument();
    expect(screen.getByText(/Sources used \(1\)/)).toBeInTheDocument();
    expect(screen.queryByText("Not found in your documents")).not.toBeInTheDocument();
  });

  it("styles an ungrounded response differently and says so", () => {
    render(
      <AnswerPanel
        result={{ answer: "I don't have that information.", sources: [], grounded: false }}
        loading={false}
        error={null}
      />,
    );
    expect(screen.getByTestId("answer-ungrounded")).toBeInTheDocument();
    expect(screen.getByText("Not found in your documents")).toBeInTheDocument();
    expect(screen.queryByTestId("answer-grounded")).not.toBeInTheDocument();
  });

  it("labels sources as closest matches when the answer is ungrounded", () => {
    render(
      <AnswerPanel
        result={{ answer: "I don't have that information.", sources: [chunk], grounded: false }}
        loading={false}
        error={null}
      />,
    );
    expect(screen.getByText(/Closest matches \(1\)/)).toBeInTheDocument();
  });

  it("shows loading and error states", () => {
    const { rerender } = render(<AnswerPanel result={null} loading={true} error={null} />);
    expect(screen.getByRole("status")).toHaveTextContent("Searching");

    rerender(<AnswerPanel result={null} loading={false} error="Boom" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Boom");
  });

  it("renders nothing before the first question", () => {
    const { container } = render(<AnswerPanel result={null} loading={false} error={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
