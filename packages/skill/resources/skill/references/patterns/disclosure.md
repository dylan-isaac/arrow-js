# Disclosure
A button that toggles visibility of a content section.

## Semantic HTML First
IMPORTANT: For simple disclosure, prefer the native `<details>` and `<summary>` elements. They provide built-in toggle behavior, keyboard support, and screen reader announcements with zero ARIA needed. Only use the ARIA pattern below when `<details>`/`<summary>` cannot meet your design requirements.

## Structure (ARIA version)
```
button[aria-expanded][aria-controls] → div[id]
```

## Required ARIA (only when not using `<details>`)
| Attribute | Element | Value |
|---|---|---|
| `aria-expanded` | trigger `<button>` | `"true"` / `"false"` |
| `aria-controls` | trigger `<button>` | id of content div |

## Keyboard
- **Enter / Space**: toggle (native with `<button>`)

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
const open = signal(false);

html`
  <button
    aria-expanded=${() => String(open.value)}
    aria-controls="disc-content"
    @click=${() => (open.value = !open.value)}
  >Toggle Section</button>
  <div id="disc-content" ?hidden=${() => !open.value}>
    <p>Content here.</p>
  </div>
`
```

## Common Mistakes
- Using ARIA when `<details>`/`<summary>` would suffice
- Using `<div>` instead of `<button>` for the trigger
- Using `aria-hidden` instead of the `hidden` attribute on content
- Missing `aria-expanded` on the trigger button

---
APG: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
