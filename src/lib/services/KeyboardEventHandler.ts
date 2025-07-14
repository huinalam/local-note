import type { KeyCombo } from "../types/shortcut";

export class KeyboardEventHandler {
  /**
   * 키 이름을 정규화합니다 (소문자 변환)
   */
  normalizeKey(event: KeyboardEvent): string {
    return event.key.toLowerCase();
  }

  /**
   * 키 조합 문자열을 파싱하여 KeyCombo 객체로 변환합니다
   */
  parseKeyCombo(keys: string): KeyCombo {
    const parts = keys.toLowerCase().split("+");
    const key = parts[parts.length - 1];

    return {
      ctrl: parts.includes("ctrl"),
      alt: parts.includes("alt"),
      shift: parts.includes("shift"),
      meta: parts.includes("meta"),
      key,
    };
  }

  /**
   * 키보드 이벤트가 키 조합과 일치하는지 확인합니다
   */
  matchesCombo(event: KeyboardEvent, combo: KeyCombo): boolean {
    const normalizedKey = this.normalizeKey(event);

    return (
      event.ctrlKey === combo.ctrl &&
      event.altKey === combo.alt &&
      event.shiftKey === combo.shift &&
      event.metaKey === combo.meta &&
      normalizedKey === combo.key
    );
  }

  /**
   * 키보드 이벤트를 키 문자열로 변환합니다
   */
  eventToKeyString(event: KeyboardEvent): string {
    const parts: string[] = [];

    if (event.ctrlKey) parts.push("ctrl");
    if (event.altKey) parts.push("alt");
    if (event.shiftKey) parts.push("shift");
    if (event.metaKey) parts.push("meta");

    parts.push(this.normalizeKey(event));

    return parts.join("+");
  }
}
