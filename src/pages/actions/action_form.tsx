import { Dispatch, SetStateAction, useState } from "react";
import { ExtesionStorageT } from "../../lib/types/fuzzer";
import Input from "../../components/input";
import Button from "../../components/button";
import { FaPlus } from "react-icons/fa";
import { add_action } from "../../lib/storage_helper";
import { ValidationError } from "../../lib/error";
import ErrorBox from "../../components/error_box";

export default function ActionForm({
  set_state,
}: {
  set_state: Dispatch<SetStateAction<ExtesionStorageT | null>>;
}) {
  const [name, set_name] = useState("");
  const [rep, set_rep] = useState<number>(0);
  const [interv, set_interv] = useState(1000);
  const [err, set_err] = useState<Error | ValidationError | null>(null);

  if (err !== null && !(err instanceof ValidationError)) {
    throw err;
  }

  async function handle_submit(e: React.FormEvent) {
    e.preventDefault();

    try {
      set_state(await add_action(name, rep, interv));
      set_err(null);
      set_name("");
      set_rep(0);
      set_interv(1000);
    } catch (e) {
      if (e instanceof ValidationError) set_err(e);
      else if (e instanceof Error) set_err(e);
      else console.error(e);
    }
  }

  return (
    <form
      onSubmit={handle_submit}
      className="bg-pink-50 rounded-lg p-4 mb-4 shadow-md transition-all duration-300 ease-in-out"
    >
      <ErrorBox err={err} />

      <Input
        type="text"
        value={name}
        on_change={(e) => set_name(e)}
        label="Action Name"
        required={true}
      />

      <Button type="submit">
        <FaPlus className="inline mr-2" />
        Add Action
      </Button>
    </form>
  );
}
