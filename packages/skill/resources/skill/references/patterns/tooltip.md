# Tooltip

## Example Structure

```
button[aria-describedby=tip-id]   ← trigger (any focusable element)
  span[role=tooltip][id=tip-id]   ← popup label (hidden until hover/focus)
```

If the tooltip provides the **only** accessible name (e.g. icon-only button), use `aria-labelledby` instead of `aria-describedby`.

## Required ARIA

| Attribute | Element | Value |
|---|---|---|
| `role="tooltip"` | popup element | required |
| `id` | popup element | unique id |
| `aria-describedby` | trigger element | id of tooltip (supplemental description) |
| `aria-labelledby` | trigger element | id of tooltip (when tooltip IS the name) |

## Keyboard

| Key | Behavior |
|---|---|
| Tab / Shift+Tab | Focus trigger — tooltip appears |
| Escape | Dismiss tooltip |
| Blur | Tooltip hides when trigger loses focus |

No keyboard interaction inside the tooltip — tooltips must be non-interactive. The tooltip should remain visible while the cursor is over the tooltip itself, not just the trigger.

## Arrow Implementation

```js
import { html, reactive } from '@arrow-js/core';

const state = reactive({ visible: false });

const show = () => state.visible = true;
const hide = () => state.visible = false;
const onKeydown = (e) => { if (e.key === 'Escape') hide(); };

html`
  <button
    aria-describedby="my-tooltip"
    @mouseenter="${show}"
    @mouseleave="${hide}"
    @focus="${show}"
    @blur="${hide}"
    @keydown="${onKeydown}"
  >
    ℹ️
    <span
      id="my-tooltip"
      role="tooltip"
      ?hidden="${() => !state.visible}"
    >More information about this action</span>
  </button>
`(document.body);
```

## Common Mistakes

- Putting interactive content (links, buttons) inside a tooltip — use a dialog instead
- Using the `title` attribute as a tooltip — inaccessible on touch/keyboard
- Showing tooltip only on hover, not on focus — keyboard users are excluded
- Forgetting `role="tooltip"` — AT won't associate it correctly
- Not dismissing on Escape — required by APG pattern
- Using `aria-describedby` when the tooltip is the only accessible name (use `aria-labelledby`)

APG: https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
