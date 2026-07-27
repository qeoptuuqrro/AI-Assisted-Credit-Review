import { useId, useState, type ChangeEvent, type DragEvent } from "react";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import styles from "./FileDropzone.module.css";

const ACCEPTED_EXTENSIONS = ["pdf", "xlsx", "csv", "docx"];
const MAX_FILE_SIZE = 25 * 1024 * 1024;

export type FileDropzoneStatus = "idle" | "uploading" | "ready-for-review" | "verified" | "failed";

type FileDropzoneProps = {
  status: FileDropzoneStatus;
  fileName?: string;
  error?: string;
  acceptedFormats?: string;
  compact?: boolean;
  onFileAccepted: (file: File) => void;
  onFileRejected?: (message: string) => void;
  onRemove?: () => void;
};

export function FileDropzone({
  status,
  fileName,
  error,
  acceptedFormats = "PDF, XLSX, CSV, or DOCX",
  compact = false,
  onFileAccepted,
  onFileRejected,
  onRemove,
}: FileDropzoneProps) {
  const inputId = useId();
  const [dragActive, setDragActive] = useState(false);
  const hasFile = status !== "idle" && status !== "failed" && Boolean(fileName);

  function validateAndAccept(file: File | undefined) {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !ACCEPTED_EXTENSIONS.includes(extension)) {
      onFileRejected?.("Choose a PDF, XLSX, CSV, or DOCX file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      onFileRejected?.("Choose a file smaller than 25 MB.");
      return;
    }
    onFileAccepted(file);
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    validateAndAccept(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    validateAndAccept(event.dataTransfer.files?.[0]);
  }

  if (hasFile) {
    const statusLabel = status === "uploading" ? "Uploading" : status === "verified" ? "Verified" : "Ready for review";
    return (
      <div className={styles.fileRow} data-compact={compact} data-status={status} role="status" aria-live="polite">
        <span className={styles.fileIcon}><Icon name={status === "verified" ? "fileCheck" : "document"} size="sm" /></span>
        <span className={styles.fileCopy}>
          <strong>{fileName}</strong>
          <small>{statusLabel}{status === "uploading" ? "…" : " · Upload does not verify evidence"}</small>
        </span>
        {status === "uploading" ? <span className={styles.spinner} aria-hidden="true" /> : onRemove ? <Button size="sm" variant="quiet" onClick={onRemove}>Replace</Button> : <Icon name="checkCircle" size="sm" />}
      </div>
    );
  }

  return (
    <div
      className={styles.dropzoneWrap}
      data-active={dragActive}
      data-error={status === "failed"}
      data-compact={compact}
      onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
      onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
      onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragActive(false); }}
      onDrop={handleDrop}
    >
      <input
        id={inputId}
        className={styles.input}
        type="file"
        accept=".pdf,.xlsx,.csv,.docx"
        aria-label="Choose a file or drag it here"
        aria-describedby={`${inputId}-help`}
        onChange={handleInput}
      />
      <div
        className={styles.dropzone}
        data-active={dragActive}
        data-error={status === "failed"}
        data-compact={compact}
        aria-hidden="true"
      >
        <span className={styles.uploadIcon}><Icon name="send" size="sm" /></span>
        <span className={styles.dropCopy}>
          <strong>{dragActive ? "Drop file to upload" : "Choose a file or drag it here"}</strong>
          <small id={`${inputId}-help`}>{status === "failed" && error ? error : `${acceptedFormats} · up to 25 MB`}</small>
        </span>
      </div>
    </div>
  );
}
