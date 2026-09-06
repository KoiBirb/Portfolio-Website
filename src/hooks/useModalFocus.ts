import { useEffect, type RefObject } from "react";

const dialogs: HTMLElement[] = [];
let originalPageState: {
  overflow: string;
  rootInert: boolean;
  focus: HTMLElement | null;
} | null = null;
const focusableSelector =
  'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Share focus and scroll ownership across a details dialog and its nested lightbox.
export function useModalFocus(open: boolean, ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = document.getElementById("root");
    if (dialogs.length === 0) {
      originalPageState = {
        overflow: document.body.style.overflow,
        rootInert: root?.inert ?? false,
        focus: previousFocus,
      };
    }
    dialogs.push(dialog);
    document.body.style.overflow = "hidden";
    if (root) root.inert = true;

    const focusableElements = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) =>
          !element.matches(":disabled") && element.checkVisibility({ visibilityProperty: true }),
      );
    const focusFirst = () => (focusableElements()[0] ?? dialog).focus({ preventScroll: true });
    const isTopDialog = () => dialogs.at(-1) === dialog;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !isTopDialog()) return;
      const elements = focusableElements();
      const first = elements[0];
      const last = elements.at(-1);
      if (!first || !last) {
        event.preventDefault();
        dialog.focus({ preventScroll: true });
      } else if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === dialog)
      ) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };
    const handleFocus = (event: FocusEvent) => {
      if (isTopDialog() && event.target instanceof Node && !dialog.contains(event.target))
        focusFirst();
    };

    focusFirst();
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocus);
    return () => {
      const dialogIndex = dialogs.indexOf(dialog);
      if (dialogIndex !== -1) dialogs.splice(dialogIndex, 1);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocus);
      const remainingDialog = dialogs.at(-1);
      if (remainingDialog) {
        // A close animation can unmount an older dialog after a newer one opens.
        // Keep the page locked until the final modal has actually closed.
        document.body.style.overflow = "hidden";
        if (root) root.inert = true;
        if (previousFocus?.isConnected && remainingDialog.contains(previousFocus)) {
          previousFocus.focus({ preventScroll: true });
        } else {
          remainingDialog.focus({ preventScroll: true });
        }
        return;
      }

      const pageState = originalPageState;
      originalPageState = null;
      document.body.style.overflow = pageState?.overflow ?? "";
      if (root) root.inert = pageState?.rootInert ?? false;
      if (pageState?.focus?.isConnected) pageState.focus.focus({ preventScroll: true });
    };
  }, [open, ref]);
}
