export function ArrowDown() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v17M5.5 13.5 12 20l6.5-6.5" />
    </svg>
  );
}

export function PageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 2.75h8l4 4V21.25H6z" />
      <path d="M14 2.75v4h4M9 12h6M9 16h6" />
    </svg>
  );
}

export function AudioIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10v4h3l4 3V7l-4 3z" />
      {muted ? (
        <path d="m15 10 4 4m0-4-4 4" />
      ) : (
        <path d="M15 9.5a4 4 0 0 1 0 5M17.5 7a7.5 7.5 0 0 1 0 10" />
      )}
    </svg>
  );
}
