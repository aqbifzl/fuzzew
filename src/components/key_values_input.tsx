import { useState } from "react";
import { DomProperty } from "../lib/types/fuzzer";
import Datalist from "./datalist";
import SelectWithLabel from "./select";

type Props = {
  props_suggestion: DomProperty[];
  on_new_value: (v: DomProperty | null) => void;
  label: string;
  required?: boolean;
};

type Accepted = "string" | "number" | "boolean";

export function KeyValuesInput({
  on_new_value,
  props_suggestion,
  label,
  required = true,
}: Props) {
  const [selected_prop, set_selected_prop] = useState("");
  const [type, set_type] = useState<Accepted | null>(null);

  const get_val_from_props = (v: string) =>
    props_suggestion.find((p) => p.name === v);

  const show_type_prompt =
    !!selected_prop.length && !get_val_from_props(selected_prop);

  const handle_val_change = (v: string, t: string | null) => {
    const p = get_val_from_props(v);
    if (p) {
      on_new_value(p);
      return;
    }

    if (t !== null) {
      on_new_value({
        name: v,
        type: t,
      });
    } else {
      on_new_value(null);
    }
  };

  return (
    <div>
      <Datalist
        label={label}
        required={required}
        options={props_suggestion}
        option_label={(v) => v.name}
        option_value={(v) => v.name}
        on_change={(v) => {
          set_selected_prop(v);
          set_type(null);
          handle_val_change(v, null);
        }}
      />
      {show_type_prompt && (
        <SelectWithLabel
          label="type"
          options={["string", "number", "boolean"]}
          value={type}
          on_change={(v) => {
            set_type(!v.length ? null : (v as Accepted));
            handle_val_change(selected_prop, v);
          }}
          option_label={(o) => o}
          option_value={(o) => o}
        />
      )}
    </div>
  );
}
