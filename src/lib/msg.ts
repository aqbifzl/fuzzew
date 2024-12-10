import { ReqT, ResT } from "./types/msg";
import browser from "webextension-polyfill";

export async function send_msg_wrapper<T>(r: ReqT): Promise<ResT<T>> {
  const res: ResT<T> = await browser.runtime.sendMessage(r);
  if (!res.success) console.error(res.data as string);

  return res;
}

export function err(m: string): ResT<string> {
  return {
    success: false,
    data: m,
  };
}

export function succ<T>(data?: T): ResT<T> {
  return {
    success: true,
    data,
  };
}
