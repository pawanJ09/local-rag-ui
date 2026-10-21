import { useState } from "react";
import type { FormEvent } from "react";

interface Props {
  onSubmit: (question: string) => void;
  disabled?: boolean;
}

export function QueryBox({ onSubmit, disabled = false }: Props) {
  const [text, setText] = useState("");
  const trimmed = text.trim();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <form className="query-box" onSubmit={handleSubmit}>
      <label htmlFor="question" className="sr-only">
        Ask a question about your documents
      </label>
      <input
        id="question"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ask a question about your documents"
        autoComplete="off"
      />
      <button type="submit" disabled={disabled || !trimmed}>
        Ask
      </button>
    </form>
  );
}
