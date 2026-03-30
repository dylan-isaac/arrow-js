# Alert

## Example Structure

```
div[role=alert]
```

## Required ARIA

| Attribute | Element | Notes |
|---|---|---|
| `role="alert"` | container | required |

## Keyboard

No keyboard interaction — alerts are announced automatically by AT when content changes.

## Arrow Implementation

`role="alert"` creates an implicit `aria-live="assertive"` region. When content is added to or changes within it, the browser announces it immediately.

Start with an empty container and populate its text when needed. Do NOT put `role="alert"` on an element that is always visible with static content — it will announce on page load.

```js
import { html, reactive } from '@arrow-js/core';

const state = reactive({ message: '' });

html`
  <button @click="${() => state.message = 'Item saved!'}">Save</button>
  <div role="alert">${() => state.message}</div>
`(document.body);
```

## Common Mistakes

- Putting `role="alert"` on the page body or a large container
- Using `role="alert"` for non-urgent information (use `role="status"` instead)
- Alert always present in DOM with static content (announces on page load)
- Adding `aria-live="assertive"` to `role="alert"` (redundant)
- Using alerts for form validation errors (use `aria-describedby` instead)

APG: https://www.w3.org/WAI/ARIA/apg/patterns/alert/
