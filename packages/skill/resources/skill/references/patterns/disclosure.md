# Disclosure

## Example Structure

For simple disclosure, prefer native `<details>` and `<summary>` — built-in toggle, keyboard support, and screen reader announcements with zero ARIA needed.

```html
<details>
  <summary>Toggle Section</summary>
  <p>Content here.</p>
</details>
```

Only use the ARIA pattern below when `<details>`/`<summary>` cannot meet your design requirements.

### ARIA version

```
button[aria-expanded][aria-controls] → div[id]
```

## Required ARIA

| Attribute | Element | Value |
|---|---|---|
| `aria-expanded` | trigger `<button>` | `"true"` / `"false"` |
| `aria-controls` | trigger `<button>` | id of content div |

## Keyboard

| Key | Behavior |
|---|---|
| Enter / Space | Toggle (native with `<button>`) |

## Arrow Implementation

### 1. Native HTML (preferred)

```js
html`
  <details>
    <summary>Toggle Section</summary>
    <p>Content here.</p>
  </details>
`
```

### 2. ARIA version (when custom styling requires it)

```js
import { html, reactive } from '@arrow-js/core';

const state = reactive({ open: false });

html`
  <button
    aria-expanded="${() => String(state.open)}"
    aria-controls="disc-content"
    @click="${() => state.open = !state.open}"
  >Toggle Section</button>
  <div id="disc-content" ?hidden="${() => !state.open}">
    <p>Content here.</p>
  </div>
`
```

## Common Mistakes

- Using ARIA when `<details>`/`<summary>` would suffice
- Using `<div>` instead of `<button>` for the trigger
- Using `aria-hidden` instead of the `hidden` attribute on content
- Missing `aria-expanded` on the trigger button

APG: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
