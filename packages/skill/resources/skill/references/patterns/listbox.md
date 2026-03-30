# Listbox

## Example Structure

```
<!-- Single-select -->
ul[role=listbox][aria-label][aria-activedescendant]
  li[role=option][id][aria-selected=true]
  li[role=option][id][aria-selected=false]

<!-- Multi-select -->
ul[role=listbox][aria-multiselectable=true][aria-activedescendant]
  li[role=option][id][aria-selected=true]
  li[role=option][id][aria-selected=false]
```

> **Prefer native `<select>`** for simple single-select cases — it's free keyboard support and mobile-friendly.

## Required ARIA

| Attribute | Element | Value |
|---|---|---|
| `role="listbox"` | container | static |
| `aria-label` / `aria-labelledby` | container | names the widget |
| `aria-activedescendant` | container | `id` of visually focused option |
| `aria-multiselectable` | container | `"true"` for multi-select |
| `role="option"` | each item | static |
| `aria-selected` | each option | `"true"` / `"false"` |
| `tabindex` | container | `0` (options are NOT focusable) |

## Keyboard

| Key | Behavior |
|---|---|
| `Arrow Down` / `Arrow Up` | Move focus to next / previous option |
| `Home` / `End` | Move focus to first / last option |
| `Enter` / `Space` | Select focused option (single-select) |
| `Space` | Toggle focused option (multi-select) |
| `Shift+Arrow` | Extend selection (multi-select) |

## Arrow Implementation

```js
import { html, reactive } from '@arrow-js/core';

const options = [
  { id: 'opt-1', label: 'Apple' },
  { id: 'opt-2', label: 'Banana' },
  { id: 'opt-3', label: 'Cherry' },
];

const state = reactive({ focusedId: 'opt-1', selectedIds: new Set() });

const focusedIndex = () => options.findIndex(o => o.id === state.focusedId);

const onKey = (e) => {
  const i = focusedIndex();
  if (e.key === 'ArrowDown') state.focusedId = options[Math.min(i + 1, options.length - 1)].id;
  if (e.key === 'ArrowUp')   state.focusedId = options[Math.max(i - 1, 0)].id;
  if (e.key === 'Home')      state.focusedId = options[0].id;
  if (e.key === 'End')       state.focusedId = options[options.length - 1].id;
  if (e.key === ' ' || e.key === 'Enter') toggleSelected(state.focusedId);
  e.preventDefault();
};

const toggleSelected = (id) => {
  const s = new Set(state.selectedIds);
  s.has(id) ? s.delete(id) : s.add(id);
  state.selectedIds = s;
};

html`
  <ul
    role="listbox"
    aria-label="Fruit"
    aria-multiselectable="true"
    aria-activedescendant="${() => state.focusedId}"
    tabindex="0"
    @keydown="${onKey}"
  >
    ${options.map(o => html`
      <li
        id="${o.id}"
        role="option"
        aria-selected="${() => String(state.selectedIds.has(o.id))}"
        @click="${() => { state.focusedId = o.id; toggleSelected(o.id); }}"
      >${o.label}</li>
    `)}
  </ul>
`(document.body);
```

## Common Mistakes

- Don't use `role="list"` / `role="listitem"` — those are for static lists, not interactive selection
- Every option must have `aria-selected`; omitting it breaks selection state for screen readers
- Focus stays on the **listbox container**, not individual options — use `aria-activedescendant` to track visual focus
- Options must have stable `id` attributes for `aria-activedescendant` to resolve correctly
- Don't skip keyboard handling — a listbox without arrow key support is unusable without a mouse
- Options must not contain interactive elements (links, buttons, checkboxes) — use the Grid pattern instead
- Consider type-ahead for listboxes with many options (7+): typing a character moves focus to the next matching option

APG reference: https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
