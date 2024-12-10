import { Dispatch, SetStateAction } from "react";

export type MS<T> = Dispatch<SetStateAction<T>>;

export type AcceptedType = string | number | boolean;

export interface Indexable {
  [key: string]: any;
}
