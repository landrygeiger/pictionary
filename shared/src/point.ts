export type Point = { x: number; y: number };

export const relativeMousePosFromEvent = (
  event: { clientX: number; clientY: number },
  element: HTMLElement,
): Point => ({
  x: event.clientX - element.getBoundingClientRect().left,
  y: event.clientY - element.getBoundingClientRect().top,
});
