# Alert
One-line description: displays a brief important message that attracts attention without interrupting the user's task.

## Semantic HTML First
Use `role="alert"` on a container element. The browser automatically treats it as an `aria-live="assertive"` region. No additional ARIA live region attributes are needed.

## Structure
```
div[role=alert]
```

## Required ARIA
| Attribute | Element | Notes |
|-----------|---------|-------|
| `role="alert"` | container | required |

## How It Works
- When content is added to or changes within an element with `role="alert"`, the browser announces it immediately
- Do NOT put `role="alert"` on an element that is always visible with static content — it will announce on page load
- Instead, either: inject the alert element into the DOM dynamically, or start with an empty alert container and populate its text content when needed

## Arrow Implementation
```js
const message = Arrow.signal('');

// Render only when message is non-empty
Arrow.effect(() => {
  if (message.value) {
    document.getElementById('alert-region').textContent = message.value;
  }
});
```
```html
<div role="alert" id="alert-region"></div>
```

## Common Mistakes
- Putting `role="alert"` on the page body or a large container
- Using `role="alert"` for non-urgent information (use `role="status"` instead)
- Alert always present in DOM with static content (announces on page load)
- Adding `aria-live="assertive"` to `role="alert"` (redundant)
- Using alerts for form validation errors (use `aria-describedby` instead)

## Reference
APG: https://www.w3.org/WAI/ARIA/apg/patterns/alert/
