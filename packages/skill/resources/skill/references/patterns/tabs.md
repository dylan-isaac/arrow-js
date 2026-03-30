# Tabs

## Example Structure

```
div[role=tablist]
  button[role=tab][aria-selected=true][aria-controls=panel-1][tabindex=0]
  button[role=tab][aria-selected=false][aria-controls=panel-2][tabindex=-1]
div[role=tabpanel][id=panel-1][aria-labelledby=tab-1]
div[role=tabpanel][id=panel-2][aria-labelledby=tab-2][hidden]
```

## Required ARIA

| Attribute | Element | Value |
|---|---|---|
| `role="tablist"` | container div | static |
| `role="tab"` | each tab button | static |
| `role="tabpanel"` | each panel div | static |
| `aria-selected` | active tab | `"true"` / `"false"` |
| `aria-controls` | tab | panel `id` |
| `aria-labelledby` | panel | tab `id` |
| `tabindex` | tabs | `0` active, `-1` inactive (roving) |

## Keyboard

| Key | Behavior |
|---|---|
| `ArrowLeft` / `ArrowRight` | Move focus between tabs |
| `Home` / `End` | Jump to first / last tab |
| `Enter` / `Space` | Activate focused tab (manual activation) |
| `Tab` | Move focus out of tablist into active panel |

## Arrow Implementation

```js
import { html, reactive } from '@arrow-js/core';

const tabs = [
  { id: 'tab-1', label: 'First', panelId: 'panel-1' },
  { id: 'tab-2', label: 'Second', panelId: 'panel-2' },
];

const state = reactive({ activeId: 'tab-1' });

html`
  <div role="tablist">
    ${tabs.map(t => html`
      <button
        id="${t.id}"
        role="tab"
        aria-selected="${() => String(state.activeId === t.id)}"
        aria-controls="${t.panelId}"
        tabindex="${() => state.activeId === t.id ? 0 : -1}"
        @click="${() => state.activeId = t.id}"
      >${t.label}</button>
    `)}
  </div>
  ${tabs.map(t => html`
    <div
      id="${t.panelId}"
      role="tabpanel"
      aria-labelledby="${t.id}"
      ?hidden="${() => state.activeId !== t.id}"
    >Panel: ${t.label}</div>
  `)}
`(document.body);
```

## Common Mistakes

- Set `tabindex=0` on the active tab and `-1` on all others (roving tabindex)
- Use `<button role="tab">`, not `<a>` — tabs are not links
- Use `role="tablist"` on the container, not `role="menu"`
- Add `role="tabpanel"` and `aria-labelledby` to every panel

APG reference: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
