import type { Collaboration } from "../data/projects";

export function CollaborationCredit({ collaboration }: { collaboration: Collaboration }) {
  return (
    <p className="project-collaboration">
      {collaboration.label}{" "}
      {collaboration.url ? (
        <a
          className="project-collaboration-highlight"
          href={collaboration.url}
          target="_blank"
          rel="noreferrer"
        >
          {collaboration.highlight}
        </a>
      ) : (
        <strong className="project-collaboration-highlight">{collaboration.highlight}</strong>
      )}
    </p>
  );
}
