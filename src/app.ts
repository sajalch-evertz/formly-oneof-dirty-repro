import { JsonPipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import type { FormlyFieldConfig } from "@ngx-formly/core";
import { FormlyForm } from "@ngx-formly/core";
import { FormlyJsonschema } from "@ngx-formly/core/json-schema";
import type { JSONSchema7 } from "json-schema";

/** No `hide` expressions: nothing here depends on the defaults fix in v9. */
const SCHEMA: JSONSchema7 = {
  type: "object",
  properties: {
    output: {
      oneOf: [
        {
          title: "HTTP",
          type: "object",
          properties: {
            url: { type: "string", title: "URL", default: "https://example.test/ingest" },
          },
        },
        {
          title: "File",
          type: "object",
          properties: {
            path: { type: "string", title: "Path", default: "/var/log/job.log" },
          },
        },
      ],
    },
  },
};

@Component({
  selector: "app-root",
  imports: [JsonPipe, ReactiveFormsModule, FormlyForm],
  templateUrl: "./app.html",
})
export class AppComponent {
  readonly form = new FormGroup({});
  readonly fields: FormlyFieldConfig[] = [inject(FormlyJsonschema).toFieldConfig(SCHEMA)];
  model: Record<string, unknown> = {};

  discard(): void {
    this.model = {};
  }
}
