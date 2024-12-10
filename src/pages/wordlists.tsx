import { AnimatePresence, motion } from "framer-motion";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import Input from "../components/input";
import ExpandableCard from "../components/expandable_card";
import { ExtesionStorageT, WordlistT } from "../lib/types/fuzzer";
import {
  add_wordlist,
  get_storage,
  remove_wordlist,
  update_wordlist,
} from "../lib/storage_helper";
import Button from "../components/button";
import Loading from "../components/loading";
import { ValidationError } from "../lib/error";
import Label from "../components/label";
import { Checkbox } from "../components/checkbox";
import ErrorBox from "../components/error_box";

type NewWordlistProps = {
  set_state: Dispatch<SetStateAction<ExtesionStorageT | null>>;
};

function NewWordlistForm({ set_state }: NewWordlistProps) {
  const [name, set_name] = useState("");
  const [content, set_content] = useState("");
  const [ignore_prefix, set_ignore_prefix] = useState("//");
  const [rem_dup, set_rem_dup] = useState(false);
  const [err, set_error] = useState<Error | ValidationError | null>(null);

  if (err !== null && !(err instanceof ValidationError)) {
    throw err;
  }

  async function new_wordlist_handle() {
    try {
      set_state(await add_wordlist(name, content, ignore_prefix, rem_dup));
      set_name("");
      set_content("");
      set_error(null);
    } catch (e) {
      if (e instanceof ValidationError) set_error(e);
      else if (e instanceof Error) set_error(e);
      else console.error("Unknown error type:", e);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        new_wordlist_handle();
      }}
      className="bg-pink-50 rounded-lg p-4 mb-4 shadow-md transition-all duration-300 ease-in-out"
    >
      <ErrorBox err={err} />

      <Input
        type="text"
        value={ignore_prefix}
        on_change={(v) => set_ignore_prefix(v)}
        label="Ignore with prefix"
      />
      <Input
        type="text"
        value={name}
        on_change={(v) => set_name(v)}
        label="Name"
        required={true}
      />
      <Label label="Content" required={true} />
      <textarea
        value={content}
        onChange={(v) => set_content(v.target.value)}
        className="w-full mt-2 p-2 rounded-md border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none custom-scrollbar transition-all duration-300 ease-in-out"
        rows={3}
        placeholder="Enter a text content"
      ></textarea>
      <Checkbox
        name={"Ignore duplicates"}
        checked={rem_dup}
        on_change={(v) => set_rem_dup(v)}
      />
      <Button type="submit">
        <FaPlus className="inline mr-2" />
        Add Wordlist
      </Button>
    </form>
  );
}

type WordlistItemProps = {
  wordlist: WordlistT;
  set_state: Dispatch<SetStateAction<ExtesionStorageT | null>>;
};

function WordlistItem({ wordlist, set_state }: WordlistItemProps) {
  const [content, set_content] = useState(wordlist.content);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <ExpandableCard
        title={wordlist.name}
        on_delete={async () => set_state(await remove_wordlist(wordlist.id))}
      >
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <textarea
            value={content}
            onChange={(e) => set_content(e.target.value)}
            onBlur={async () => {
              set_state(await update_wordlist(wordlist.id, content));
            }}
            className="w-full mt-2 p-2 rounded-md border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none custom-scrollbar transition-all duration-300 ease-in-out"
            rows={3}
            placeholder="Enter wordlist content"
          />
        </motion.div>
      </ExpandableCard>
    </motion.div>
  );
}

export default function Wordlists() {
  const [state, set_state] = useState<ExtesionStorageT | null>(null);

  useEffect(() => {
    (async () => {
      set_state(await get_storage());
    })();
  }, []);

  if (!state) return <Loading />;

  return (
    <div className="max-w-md mx-auto">
      <NewWordlistForm set_state={set_state} />

      <AnimatePresence>
        {state.wordlists.map((w) => (
          <WordlistItem set_state={set_state} wordlist={w} />
        ))}
      </AnimatePresence>
    </div>
  );
}
