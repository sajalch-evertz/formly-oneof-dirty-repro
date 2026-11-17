# ngx-formly: switching a `oneOf` branch leaves the form pristine

Minimal reproduction. Changing a JSON Schema `oneOf` branch selector changes the model, but
`form.dirty` stays `false`, so anything gated on dirty (a Discard or Save button, an
unsaved-changes guard) never reacts.

## Versions

| Package | Version |
| --- | --- |
| `@ngx-formly/core` | 9.1.0 |
| `@angular/core` | 20.3.27 |
| TypeScript | 5.8.3 |
| Node | 22 |

No UI theme package. [`src/formly-config.ts`](src/formly-config.ts) registers the minimum the
[JSON Schema guide](https://formly.dev/docs/guides/json-schema) needs: an input, a select, and
core's `formly-group` for `object` and `multischema`.

## Run it

```bash
npm install
npm start    # http://localhost:4300
```

## Steps

1. Open the page. `form.dirty` is `false`; the model is `{ "output": { "url": "https://example.test/ingest" } }`.
2. Select **File** in the branch selector.
3. The model is now `{ "output": { "path": "/var/log/job.log" } }`, but `form.dirty` is still
   `false` and **Discard** stays disabled.

Expected: `form.dirty` is `true` after the user changes the selector.

## Why

`resolveMultiSchema()` builds the selector as a field with no `key`:

```ts
{ type: 'enum', defaultValue: -1, props: { ... }, hooks: { onInit: ... } }
```

`registerControl()` returns early for a field without a key:

```ts
if (!field.form || !hasKey(field)) {
  return;
}
```

so the selector's `FormControl` is never attached to the form. A user selection marks that
detached control dirty, and the root form never hears about it.

## Suggested fix

Have the selector mark the root form dirty when the user changes it, in `resolveMultiSchema()`:

```ts
props: {
  // ...existing props
  change: (f) => {
    let root = f;
    while (root.parent) root = root.parent;
    root.formControl?.markAsDirty();
  },
},
```

`props.change` is used rather than `valueChanges` on purpose: the `hide` expression calls
`control.setValue(...)` to pick the initial branch, which would mark the form dirty on load.
`props.change` only fires on a real user event.

## Consumer workaround

After `toFieldConfig()`, set the same `change` on every `multischema` selector:

```ts
const walk = (f: FormlyFieldConfig): void => {
  if (f.type === 'multischema') {
    f.fieldGroup![0].props = {
      ...f.fieldGroup![0].props,
      change: (x) => {
        let root = x;
        while (root.parent) root = root.parent;
        root.formControl?.markAsDirty();
      },
    };
  }
  f.fieldGroup?.forEach(walk);
};
walk(rootField);
```

`props.change` is invoked by the `FormlyAttributes` directive, so the field type's `<select>`
needs `[formlyAttributes]="field"`. The UI packages (Bootstrap, Material, ...) already have it;
this repro's enum type includes it too.
