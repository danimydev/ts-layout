import { assertEquals } from "@std/assert";
import * as TsLayout from "./mod.ts";

Deno.test(function createLayoutElement() {
  const parent = TsLayout.createLayoutElement();

  const child = TsLayout.createLayoutElement({
    padding: { x: 10, y: 10 },
  }, parent);

  const child2 = TsLayout.createLayoutElement({}, parent);

  assertEquals(parent, {
    parent: undefined,
    children: [child, child2],
    position: { x: 0, y: 0 },
    size: { x: 0, y: 0 },
    sizeBehavior: "FIT",
    layoutDirection: "LEFT_TO_RIGHT",
    padding: { x: 0, y: 0 },
    childrenGap: 0,
  });

  assertEquals(child, {
    parent: parent,
    children: [],
    position: { x: 0, y: 0 },
    size: { x: 0, y: 0 },
    sizeBehavior: "FIT",
    layoutDirection: "LEFT_TO_RIGHT",
    padding: { x: 10, y: 10 },
    childrenGap: 0,
  });

  assertEquals(child2, {
    parent: parent,
    children: [],
    position: { x: 0, y: 0 },
    size: { x: 0, y: 0 },
    sizeBehavior: "FIT",
    layoutDirection: "LEFT_TO_RIGHT",
    padding: { x: 0, y: 0 },
    childrenGap: 0,
  });
});

Deno.test(async function updateLayoutElement(t) {
  await t.step({
    name: "updateLayoutElementSize",
    fn: () => {
      const parent = TsLayout.createLayoutElement({
        padding: { x: 20, y: 20 },
        childrenGap: 20,
      });

      const child = TsLayout.createLayoutElement({
        size: { x: 100, y: 40 },
        padding: { x: 10, y: 10 },
      }, parent);

      const child2 = TsLayout.createLayoutElement({
        size: { x: 90, y: 50 },
      }, parent);

      TsLayout.updateLayoutElement(parent);

      assertEquals(parent, {
        parent: undefined,
        children: [child, child2],
        position: { x: 0, y: 0 },
        size: { x: 270, y: 100 },
        sizeBehavior: "FIT",
        layoutDirection: "LEFT_TO_RIGHT",
        padding: { x: 20, y: 20 },
        childrenGap: 20,
      });

      assertEquals(child, {
        parent: parent,
        children: [],
        position: { x: 20, y: 20 },
        size: { x: 120, y: 60 },
        sizeBehavior: "FIT",
        layoutDirection: "LEFT_TO_RIGHT",
        padding: { x: 10, y: 10 },
        childrenGap: 0,
      });

      assertEquals(child2, {
        parent: parent,
        children: [],
        position: { x: 160, y: 20 },
        size: { x: 90, y: 50 },
        sizeBehavior: "FIT",
        layoutDirection: "LEFT_TO_RIGHT",
        padding: { x: 0, y: 0 },
        childrenGap: 0,
      });
    },
  });

  await t.step({
    name: "updateLayoutElementWithGrowSizingBehavior",
    fn: () => {
      const parent = TsLayout.createLayoutElement({
        size: { x: 500, y: 400 },
        sizeBehavior: "FIXED",
      });

      const child = TsLayout.createLayoutElement({
        size: { x: 100, y: 40 },
        sizeBehavior: "GROW",
      }, parent);

      TsLayout.updateLayoutElement(parent);

      assertEquals(parent, {
        parent: undefined,
        children: [child],
        position: { x: 0, y: 0 },
        size: { x: 500, y: 400 },
        sizeBehavior: "FIXED",
        layoutDirection: "LEFT_TO_RIGHT",
        padding: { x: 0, y: 0 },
        childrenGap: 0,
      });

      assertEquals(child, {
        parent: parent,
        children: [],
        position: { x: 0, y: 0 },
        size: { x: 500, y: 400 },
        sizeBehavior: "GROW",
        layoutDirection: "LEFT_TO_RIGHT",
        padding: { x: 0, y: 0 },
        childrenGap: 0,
      });
    },
  });
});
