# Accordion

Use this pattern (not `<details>/<summary>`) when building accordions. Native disclosure elements lack Arrow Down/Up navigation between triggers and coordinated open/close behavior. Use the custom ARIA approach below.

## Example Structure

```
h3 > button[aria-expanded][aria-controls] → div[role=region][aria-labelledby]
```

## Required ARIA

| Attribute | Element | Value |
|---|---|---|
| `aria-expanded` | trigger button | `"true"` / `"false"` |
| `aria-controls` | trigger button | panel id |
| `role="region"` | panel | (use when ≤6 panels) |
| `aria-labelledby` | panel | trigger button id |

## Keyboard

| Key | Behavior |
|---|---|
| Enter / Space | Toggle focused trigger's panel |
| Arrow Down/Up | Move focus between triggers |
| Home / End | First / last trigger |

## Arrow Implementation

```ts
const items = [
  { id: 'q1', title: 'Question?', content: 'Answer.' },
]
const state = reactive({ openId: '' })
const toggle = (id) => { state.openId = state.openId === id ? '' : id }

// Per item:
html`
  <h3>
    <button
      id="${`trigger-${item.id}`}"
      aria-expanded="${() => String(state.openId === item.id)}"
      aria-controls="${`panel-${item.id}`}"
      @click="${() => toggle(item.id)}"
    >${item.title}</button>
  </h3>
  <div
    id="${`panel-${item.id}`}"
    role="region"
    aria-labelledby="${`trigger-${item.id}`}"
    hidden="${() => state.openId !== item.id}"
  >${item.content}</div>
`
```

## Common Mistakes

- Use `<button>` for the trigger, not `<div>`
- Add `aria-expanded` and update it reactively
- Use `hidden` attribute on panels, not `aria-hidden`
- Wrap each button in a heading element (`<h3>`–`<h6>`)

[APG Reference](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/)
