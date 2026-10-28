export function PdfDownload() {
  return (
    <a
      className="pdf-download"
      href="?pdf"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open portfolio PDF preview"
      title="Open portfolio PDF preview"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 2H5v20h14V7l-5-5Z M14 2v6h5 M12 11v7 m-3-3 3 3 3-3" />
      </svg>
    </a>
  );
}
