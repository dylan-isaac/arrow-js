# Combobox

## Example Structure

```
div
  input[role=combobox][aria-expanded][aria-controls=listbox-id][aria-autocomplete=list][aria-activedescendant]
  ul[role=listbox][id=listbox-id]
    li[role=option][id=opt-0][aria-selected=true]
    li[role=option][id=opt-1][aria-selected=false]
```

## Required ARIA

| Attribute | Element | Value |
|---|---|---|
| `role="combobox"` | input | static |
| `aria-expanded` | input | `"true"` / `"false"` |
| `aria-controls` | input | listbox `id` |
| `aria-autocomplete` | input | `"list"` / `"both"` / `"inline"` |
| `aria-activedescendant` | input | id of highlighted option, or `""` |
| `role="listbox"` | suggestion list | static |
| `role="option"` | each list item | static |
| `aria-selected` | each option | `"true"` on highlighted option, `"false"` otherwise |

## Keyboard

| Key | Behavior |
|---|---|
| `ArrowDown` | Open listbox (if closed); move highlight to next option |
| `ArrowUp` | Move highlight to previous option |
| `Enter` | Select highlighted option; close listbox |
| `Escape` | Close listbox; clear highlight |
| `Tab` | Close listbox; move focus away |

## Arrow Implementation

```js
import { html, reactive } from '@arrow-js/core';

const ALL_OPTIONS = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

const state = reactive({
  value: '',
  open: false,
  activeIndex: -1,
  get filtered() {
    return ALL_OPTIONS.filter(o =>
      o.toLowerCase().includes(state.value.toLowerCase())
    );
  },
});

const optId = (i) => `opt-${i}`;

const select = (val) => {
  state.value = val;
  state.open = false;
  state.activeIndex = -1;
};

const onKeyDown = (e) => {
  const len = state.filtered.length;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    state.open = true;
    state.activeIndex = Math.min(state.activeIndex + 1, len - 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    state.activeIndex = Math.max(state.activeIndex - 1, 0);
  } else if (e.key === 'Enter' && state.activeIndex >= 0) {
    select(state.filtered[state.activeIndex]);
  } else if (e.key === 'Escape') {
    state.open = false;
    state.activeIndex = -1;
  }
};

html`
  <div style="position:relative">
    <input
      role="combobox"
      aria-expanded="${() => String(state.open)}"
      aria-controls="combobox-listbox"
      aria-autocomplete="list"
      aria-activedescendant="${() => state.activeIndex >= 0 ? optId(state.activeIndex) : ''}"
      .value="${() => state.value}"
      @input="${(e) => { state.value = e.target.value; state.open = true; state.activeIndex = -1; }}"
      @keydown="${onKeyDown}"
    />
    <ul
      id="combobox-listbox"
      role="listbox"
      ?hidden="${() => !state.open || state.filtered.length === 0}"
    >
      ${() => state.filtered.map((opt, i) => html`
        <li
          id="${optId(i)}"
          role="option"
          aria-selected="${() => String(state.activeIndex === i)}"
          @mousedown="${(e) => { e.preventDefault(); select(opt); }}"
        >${opt}</li>
      `)}
    </ul>
  </div>
`(document.body);
```

## Common Mistakes

- Do **not** move DOM focus to options — keep focus on the input and use `aria-activedescendant` to indicate the highlighted option
- Always update `aria-expanded` reactively; forgetting it leaves screen readers with no signal that the list opened
- Give each option a stable, unique `id` — `aria-activedescendant` won't work without it
- Use `aria-selected` on the currently highlighted option, not on the input or listbox
- Handle `Escape` to close the listbox; many implementations forget this
- Use `mousedown` + `preventDefault` on option click to prevent the input from losing focus before the value is committed
- Don't use `role="menu"` / `role="menuitem"` — menus are for commands, not selection lists

APG reference: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
