import { assertEquals } from "@std/assert";
import * as TsLayout from "./mod.ts";

Deno.test(function createLayoutElement() {
  const element = TsLayout.createLayoutElement();
  assertEquals(element, {
    parent: undefined,
    children: [],
    position: { x: 0, y: 0 },
    size: { x: 0, y: 0 },
    sizeBehavior: "FIT",
    layoutDirection: "LEFT_TO_RIGHT",
    padding: { x: 0, y: 0 },
    childrenGap: 0,
  });
});
