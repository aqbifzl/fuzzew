import browser, { browserAction } from "webextension-polyfill";
import { BgFunc, ReqT, ReqTarget, ResT } from "./lib/types/msg";
import { add_element } from "./lib/storage_helper";
import { err, succ } from "./lib/msg";
import { LastElementT } from "./lib/types/fuzzer";
import { ELEMENT_BADGE_TIMEOUT } from "./lib/constants";

let last_elem: LastElementT = null;

browser.runtime.onMessage.addListener(
  async (r: ReqT): Promise<ResT<unknown>> => {
    if (r.target !== ReqTarget.BG) return succ();

    console.log(`called with ${r.func}`);

    if (!r || r.func === undefined)
      return err("received invalid message, request or function is undefined");

    const handlers: Partial<Record<BgFunc, () => Promise<ResT<unknown>>>> = {
      [BgFunc.UPDATE_LAST_CONTEXT_MENU_TARGET]: async () => {
        if (r.data === null) r.data = null;
        else last_elem = r.data as LastElementT;
        return succ();
      },
    };

    const handler = handlers[r.func];
    return handler ? handler() : err("invalid function called");
  },
);

browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create(
    {
      id: "add_element",
      title: "Add element",
      contexts: ["all"],
    },
    () => {},
  );
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (last_elem === null) {
    console.error("context menu btn clicked but last_elem is null");
    return;
  }

  browserAction.setBadgeBackgroundColor({ color: "#00FF00" });
  browser.browserAction.setBadgeText({
    text: "+",
  });

  setTimeout(() => {
    browser.browserAction.setBadgeText({
      text: "",
    });
  }, ELEMENT_BADGE_TIMEOUT);

  const { name, xpath, properties } = last_elem;

  await add_element(name, xpath, properties);
});
