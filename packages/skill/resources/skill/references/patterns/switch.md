# Switch

## Example Structure

```
button[role=switch][aria-checked]
```

## Required ARIA

| Attribute | Element | Value |
|---|---|---|
| `role="switch"` | `<button>` | required |
| `aria-checked` | `<button>` | `"true"` / `"false"` |
| accessible label | `<button>` | via text content, `aria-label`, or `aria-labelledby` |

## Keyboard

| Key | Behavior |
|---|---|
| Space | Toggle on/off |
| Enter | Toggle on/off (native with `<button>`) |

## Arrow Implementation

```js
import { html, reactive } from '@arrow-js/core';

const state = reactive({ on: false });

html`
  <button
    role="switch"
    aria-checked="${() => String(state.on)}"
    @click="${() => state.on = !state.on}"
  >Dark Mode</button>
`(document.body);
```

## Common Mistakes

- Using `<input type="checkbox">` for instant-effect UI (use `role="switch"` for toggles that take immediate action, e.g. dark mode; use checkbox for form submissions)
- Using `<div>` or `<span>` instead of `<button>` — requires manual keyboard and focus handling
- Missing `aria-checked` — screen readers cannot announce the toggle state
- Setting `aria-checked` to a boolean (`true`) instead of a string (`"true"`)
- Using `role="switch"` inside a form where the value needs to submit — prefer `<input type="checkbox">` there

APG: https://www.w3.org/WAI/ARIA/apg/patterns/switch/
