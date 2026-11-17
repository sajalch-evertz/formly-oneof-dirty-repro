import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import type { ConfigOption, FieldTypeConfig } from '@ngx-formly/core';
import { FieldType, FormlyAttributes } from '@ngx-formly/core';

/** Core ships no input or select, so these are the minimum the JSON Schema types need. */
@Component({
  selector: 'formly-field-input',
  imports: [ReactiveFormsModule, FormlyAttributes],
  template: `
    <label class="form-label" [for]="id">{{ props.label }}</label>
    <input class="form-control" [id]="id" [type]="props.type || 'text'" [formControl]="formControl" [formlyAttributes]="field" />
  `,
})
export class InputTypeComponent extends FieldType<FieldTypeConfig> {}

@Component({
  selector: 'formly-field-enum',
  imports: [ReactiveFormsModule, FormlyAttributes],
  template: `
    <label class="form-label" [for]="id">{{ props.label || 'Select' }}</label>
    <select class="form-select" [id]="id" [formControl]="formControl" [formlyAttributes]="field">
      @for (option of $any(props.options); track option.value) {
        <option [ngValue]="option.value">{{ option.label }}</option>
      }
    </select>
  `,
})
export class EnumTypeComponent extends FieldType<FieldTypeConfig> {}

export const FORMLY_CONFIG: ConfigOption = {
  // Formly's default, stated explicitly.
  extras: { resetFieldOnHide: true },
  types: [
    { name: 'string', component: InputTypeComponent },
    { name: 'integer', component: InputTypeComponent, defaultOptions: { props: { type: 'number' } } },
    { name: 'enum', component: EnumTypeComponent },
    { name: 'object', extends: 'formly-group' },
    { name: 'multischema', extends: 'formly-group' },
  ],
};
