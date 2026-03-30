# Dialog (Modal)

## Example Structure

### Native `<dialog>` (preferred)

```html
<dialog id="my-dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Dialog Title</h2>
  <p>Dialog content here.</p>
  <button>Close</button>
</dialog>
```

Use `showModal()` / `close()` for free focus trapping, Escape handling, and modal backdrop.

### ARIA fallback (when `<dialog>` is unavailable)

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

| Key | Behavior |
|---|---|
| Escape | Close the dialog |
| Tab / Shift+Tab | Cycle focus within the dialog (focus trap) |

Initial focus: first focusable element inside, or the dialog container itself.

## Arrow Implementation

```js
import { html, reactive } from '@arrow-js/core';

const state = reactive({ open: false });
let triggerEl = null;

html`
  <button @click="${() => { triggerEl = document.activeElement; state.open = true; }}">
    Open Dialog
  </button>
  ${() => state.open ? html`
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dlg-title"
      tabindex="-1"
      @keydown="${(e) => { if (e.key === 'Escape') { state.open = false; triggerEl?.focus(); } }}"
    >
      <h2 id="dlg-title">Dialog Title</h2>
      <p>Dialog content here.</p>
      <button @click="${() => { state.open = false; triggerEl?.focus(); }}">Close</button>
    </div>
  ` : ''}
`(document.body);
```

> **Focus trap**: Arrow doesn't auto-trap Tab. Implement manually or use a focus-trap library.

## Common Mistakes

- Missing focus trap — Tab escapes the dialog
- Not returning focus to the trigger element on close
- Applying `aria-hidden` to the backdrop instead of `aria-modal="true"` on the dialog
- Omitting `aria-labelledby` — dialog has no accessible name
- Not closing on Escape

APG reference: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
