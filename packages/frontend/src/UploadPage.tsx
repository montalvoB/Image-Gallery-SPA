import { useState, useId, useEffect } from "react";

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.readAsDataURL(file);
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = (err) => reject(err);
  });
}

type ActionState = "idle" | "loading" | "success" | "error";

interface UploadPageProps {
  authToken: string;
}

export function UploadPage({ authToken }: UploadPageProps) {
  const fileInputId = useId();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageTitle, setImageTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [actionState, setActionState] = useState<ActionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] ?? null;
    setFile(selectedFile);

    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    try {
      const dataUrl = await readAsDataURL(selectedFile);
      setPreviewUrl(dataUrl);
    } catch (err) {
      console.error("Failed to read file:", err);
      setPreviewUrl(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return; 

    setActionState("loading");
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", imageTitle);

    try {
      const response = await fetch("/api/images", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error: ${text || response.statusText}`);
      }

      setActionState("success");
      setImageTitle("");
      setFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Upload failed");
      setActionState("error");
    }
  }

  // Clear messages when inputs change to keep UI clean
  useEffect(() => {
    if (actionState === "success" || actionState === "error") {
      setTimeout(() => setActionState("idle"), 4000);
    }
  }, [actionState]);

  const isDisabled = actionState === "loading";

  return (
    <div>
      <h2>Upload</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor={fileInputId}>Choose image to upload:</label>
          <input
            id={fileInputId}
            name="image"
            type="file"
            accept=".png,.jpg,.jpeg"
            required
            onChange={handleFileChange}
            disabled={isDisabled}
          />
        </div>

        <div>
          <label>
            <span>Image title: </span>
            <input
              name="name"
              value={imageTitle}
              onChange={(e) => setImageTitle(e.target.value)}
              required
              disabled={isDisabled}
            />
          </label>
        </div>

        <div>
          {previewUrl && (
            <img
              style={{ width: "20em", maxWidth: "100%" }}
              src={previewUrl}
              alt="Preview of selected upload"
            />
          )}
        </div>

        <input type="submit" value="Confirm upload" disabled={isDisabled} />

        <div
          aria-live="polite"
          style={{ marginTop: "1em", minHeight: "1.5em", color: actionState === "error" ? "red" : "green" }}
        >
          {actionState === "success" && "Upload successful!"}
          {actionState === "error" && errorMessage}
        </div>
      </form>
    </div>
  );
}
