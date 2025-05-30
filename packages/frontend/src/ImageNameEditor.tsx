import { useState } from "react";

interface INameEditorProps {
  initialValue: string;
  imageId: string;
  onNameChange: (newName: string) => void;
}

export function ImageNameEditor(props: INameEditorProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [input, setInput] = useState(props.initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmitPressed() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/images");
      if (!response.ok) {
        throw new Error("Failed to fetch image data");
      }

      props.onNameChange(input);
      setIsEditingName(false);
    } catch (err) {
      setError("Error updating name. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isEditingName) {
    return (
      <div style={{ margin: "1em 0" }}>
        <label>
          New Name{" "}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
        </label>
        <button
          disabled={input.length === 0 || isLoading}
          onClick={handleSubmitPressed}
        >
          Submit
        </button>
        <button onClick={() => setIsEditingName(false)} disabled={isLoading}>
          Cancel
        </button>
        {isLoading && <p>Working...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  } else {
    return (
      <div style={{ margin: "1em 0" }}>
        <button onClick={() => setIsEditingName(true)}>Edit name</button>
      </div>
    );
  }
}
