# Dialog (Modal)

A modal overlay that captures focus and blocks interaction with background content until dismissed.

## Semantic HTML First

Prefer the native `<dialog>` element when possible — it provides built-in modal behavior, focus trapping, and Escape to close. Use `showModal()` / `close()` for free. However, in Arrow sandbox code where `document` access is unavailable, use ARIA roles instead.

## Structure

```
div[role=dialog][aria-modal=true][aria-labelledby="dialog-title"]
  h2#dialog-title        ← accessible name
  p#dialog-desc          ← optional description (aria-describedby)
  [dialog content]
  button                 ← close trigger
```

## Required ARIA

| Attribute | Where | Purpose |
|---|---|---|
| `role="dialog"` | Container | Identifies the dialog region |
| `aria-modal="true"` | Container | Signals modal — hides background from AT |
| `aria-labelledby` | Container | Points to heading (accessible name) |
| `aria-describedby` | Container | Points to description (optional) |

## Keyboard

- **Escape**: close the dialog
- **Tab / Shift+Tab**: cycle focus within the dialog (focus trap)
- **Initial focus**: first focusable element inside, or the dialog container itself

## Arrow Implementation

```js
const isOpen = Arrow.state(false);
const triggerRef = Arrow.ref();

const dialog = Arrow.div(
  { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'dlg-title',
    tabindex: '-1',
    onkeydown: (e) => { if (e.key === 'Escape') isOpen.set(false); } },
  Arrow.h2({ id: 'dlg-title' }, 'Dialog Title'),
  Arrow.p('Dialog content here.'),
  Arrow.button({ onclick: () => isOpen.set(false) }, 'Close')
);

// Show/hide reactively; return focus to trigger on close
Arrow.effect(() => {
  if (!isOpen.get()) triggerRef.current?.focus();
});
```

> **Focus trap**: Arrow doesn't auto-trap Tab. Implement manually or use a focus-trap library.

## Common Mistakes

- Missing focus trap — Tab escapes the dialog
- Not returning focus to the trigger element on close
- Applying `aria-hidden` to the backdrop instead of `aria-modal="true"` on the dialog
- Omitting `aria-labelledby` — dialog has no accessible name
- Not closing on Escape

---

APG reference: <https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/>
