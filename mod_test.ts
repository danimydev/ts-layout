import { assertEquals } from "@std/assert";
import * as TsLayout from "./mod.ts";

Deno.test(function createLayoutElement() {
  const parent = TsLayout.createLayoutElement();

  const child = TsLayout.createLayoutElement({
    "~layout": {
      padding: {
        x: 10,
        y: 10,
      },
    },
  });

  TsLayout.appendChild(parent, child);

  assertEquals(parent, {
    parent: undefined,
    children: [child],
    "~layout": {
      position: {
        x: 0,
        y: 0,
      },
      size: {
        x: 0,
        y: 0,
      },
      sizeBehavior: "FIT",
      layoutDirection: "LEFT_TO_RIGHT",
      padding: {
        x: 0,
        y: 0,
      },
      childrenGap: 0,
      childrenAlignment: "START",
    },
  });

  assertEquals(child, {
    parent: parent,
    children: [],
    "~layout": {
      position: {
        x: 0,
        y: 0,
      },
      size: {
        x: 0,
        y: 0,
      },
      sizeBehavior: "FIT",
      layoutDirection: "LEFT_TO_RIGHT",
      padding: {
        x: 10,
        y: 10,
      },
      childrenGap: 0,
      childrenAlignment: "START",
    },
  });
});

Deno.test(function updateLayoutElement() {
  const parent = TsLayout.createLayoutElement();

  const child = TsLayout.createLayoutElement({
    "~layout": {
      padding: {
        x: 10,
        y: 10,
      },
      size: {
        x: 100,
        y: 40,
      },
    },
  });

  TsLayout.appendChild(parent, child);

  TsLayout.updateLayoutElement(parent);

  assertEquals(parent, {
    parent: undefined,
    children: [child],
    "~layout": {
      position: {
        x: 0,
        y: 0,
      },
      size: {
        x: 120,
        y: 60,
      },
      sizeBehavior: "FIT",
      layoutDirection: "LEFT_TO_RIGHT",
      padding: {
        x: 0,
        y: 0,
      },
      childrenGap: 0,
      childrenAlignment: "START",
    },
  });

  assertEquals(child, {
    parent: parent,
    children: [],
    "~layout": {
      position: {
        x: 0,
        y: 0,
      },
      size: {
        x: 120,
        y: 60,
      },
      sizeBehavior: "FIT",
      layoutDirection: "LEFT_TO_RIGHT",
      padding: {
        x: 10,
        y: 10,
      },
      childrenGap: 0,
      childrenAlignment: "START",
    },
  });
});
