import { is_screaming_case } from "./strings";
import { DomProperty } from "./types/fuzzer";
import { Indexable } from "./types/general";
import browser from "webextension-polyfill";

export function get_element_by_xpath(xpath: string): Node | null {
  return document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue;
}

export function elem_to_xpath(element: Element): string {
  if (element.id.length) return 'id("' + element.id + '")';
  if (element.tagName.toLowerCase() === "html") return "HTML";

  if (!element.parentNode || !element.parentNode.childNodes) return "";

  const siblings = element.parentNode.childNodes;
  for (let i = 0, sib_i = 0; i < siblings.length; i++) {
    const sibling = siblings[i] as Element;
    if (sibling === element && element.parentNode)
      return (
        elem_to_xpath(element.parentNode as HTMLElement) +
        "/" +
        element.tagName +
        "[" +
        (sib_i + 1) +
        "]"
      );
    if (sibling.nodeType === 1 && sibling.tagName === element.tagName) sib_i++;
  }

  return "";
}

export function get_dom_properties(o: Indexable): DomProperty[] {
  const res: DomProperty[] = [];

  for (const p in o) {
    const type = typeof o[p];

    if (
      (type !== "number" && type !== "boolean" && type !== "string") ||
      is_screaming_case(p)
    )
      continue;

    res.push({
      name: p,
      type: type,
    });
  }

  return res;
}

export function get_event_types(): string[] {
  return Object.keys(window)
    .filter((k) => !k.indexOf("on"))
    .map((n) => n.substring(2));
}

const event_matcher: Record<string, string[]> = {
  AnimationEvent: ["animationstart", "animationend", "animationiteration"],
  AudioProcessingEvent: ["audioprocess"],
  BlobEvent: ["dataavailable"],
  ClipboardEvent: ["copy", "cut", "paste"],
  CloseEvent: ["close"],
  CompositionEvent: ["compositionstart", "compositionupdate", "compositionend"],
  CustomEvent: [],
  DeviceMotionEvent: ["devicemotion"],
  DeviceOrientationEvent: ["deviceorientation", "deviceorientationabsolute"],
  DragEvent: [
    "drag",
    "dragend",
    "dragenter",
    "dragleave",
    "dragover",
    "dragstart",
    "drop",
  ],
  ErrorEvent: [],
  FetchEvent: ["fetch"],
  FocusEvent: ["blur", "focus", "focusin", "focusout"],
  FontFaceSetLoadEvent: ["loading", "loadingdone", "loadingerror"],
  FormDataEvent: ["formdata"],
  GamepadEvent: ["gamepadconnected", "gamepaddisconnected"],
  HashChangeEvent: ["hashchange"],
  IDBVersionChangeEvent: ["versionchange", "success", "blocked"],
  InputEvent: ["beforeinput", "input"],
  KeyboardEvent: ["keydown", "keyup", "keypress"],
  MediaStreamEvent: ["addstream", "removestream"],
  MessageEvent: ["message"],
  MouseEvent: ["click", "dblclick", "mouseup", "mousedown"],
  MutationEvent: [
    "DOMAttrModified",
    "DOMAttributeNameChanged",
    "DOMCharacterDataModified",
    "DOMElementNameChanged",
    "DOMNodeInserted",
    "DOMNodeInsertedIntoDocument",
    "DOMNodeRemoved",
    "DOMNodeRemovedFromDocument",
    "DOMSubtreeModified",
  ],
  OfflineAudioCompletionEvent: ["complete"],
  PageTransitionEvent: ["pageshow", "pagehide"],
  PointerEvent: [
    "pointerover",
    "pointerenter",
    "pointerdown",
    "pointermove",
    "pointerrawupdate",
    "pointerup",
    "pointercancel",
    "pointerout",
    "pointerleave",
    "gotpointercapture",
    "lostpointercapture",
  ],
  PopStateEvent: ["popstate"],
  ProgressEvent: [
    "loadstart",
    "progress",
    "abort",
    "error",
    "load",
    "timeout",
    "loadend",
  ],
  RTCDataChannelEvent: ["datachannel"],
  RTCPeerConnectionIceEvent: ["icecandidate"],
  StorageEvent: ["storage"],
  SubmitEvent: ["submit"],
  TouchEvent: ["touchstart", "touchend", "touchmove", "touchcancel"],
  TrackEvent: ["addtrack", "removetrack"],
  TransitionEvent: [
    "transitionrun",
    "transitionstart",
    "transitionend",
    "transitioncancel",
  ],
  UIEvent: ["load", "unload", "abort", "error", "select"],
  WebGLContextEvent: [
    "webglcontextcreationerror",
    "webglcontextlost",
    "webglcontextrestored",
  ],
  WheelEvent: ["wheel"],
};

export function event_type_to_event(event_type: string): Event | null {
  for (const constr in event_matcher) {
    const values = event_matcher[constr];
    if (values.includes(event_type)) return document.createEvent(constr);
  }

  return null;
}

export function event_type_to_event_name(event_type: string): string | null {
  for (const constr in event_matcher) {
    const values = event_matcher[constr];
    if (values.includes(event_type)) return constr;
  }

  return null;
}

export function event_to_properties(ev: Indexable): DomProperty[] {
  return get_dom_properties(ev);
}

export async function get_current_tab_id(): Promise<number> {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (tab.id === undefined) throw new Error("tab id is undefined");
  return tab.id;
}
