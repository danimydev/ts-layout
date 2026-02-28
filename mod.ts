type Vector2d<T> = {
  x: T;
  y: T;
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type LayoutElement = {
  parent: LayoutElement | undefined;
  children: LayoutElement[];
  "~layout": {
    position: Vector2d<number>;
    size: Vector2d<number>;
    sizeBehavior: "FIXED" | "GROW" | "FIT";
    layoutDirection: "LEFT_TO_RIGHT" | "TOP_TO_BOTTOM";
    padding: Vector2d<number>;
    childrenGap: number;
    childrenAlignment: "START" | "CENTER" | "END";
  };
};

export function createLayoutElement(
  partialLayoutElement: DeepPartial<LayoutElement> = {},
): LayoutElement {
  const baseLayoutElement: LayoutElement = {
    parent: undefined,
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
        x: 0,
        y: 0,
      },
      childrenGap: 0,
      childrenAlignment: "START",
    },
  };

  const layout: LayoutElement["~layout"] = Object.assign(
    baseLayoutElement["~layout"],
    partialLayoutElement["~layout"],
  );

  const uiElement = Object.assign(baseLayoutElement, partialLayoutElement);

  uiElement["~layout"] = layout;

  return uiElement;
}

export function appendChild(
  layoutElement: LayoutElement,
  childLayoutElement: LayoutElement,
) {
  layoutElement.children.push(childLayoutElement);
  childLayoutElement.parent = layoutElement;
}

function updateLayoutElementParentSize(layoutElement: LayoutElement) {
  if (!layoutElement.parent) {
    return;
  }

  if (layoutElement.parent["~layout"].sizeBehavior === "FIXED") {
    return;
  }

  if (layoutElement.parent["~layout"].layoutDirection === "LEFT_TO_RIGHT") {
    layoutElement.parent["~layout"].size.x += layoutElement["~layout"].size.x;
    layoutElement.parent["~layout"].size.y = Math.max(
      layoutElement["~layout"].size.y,
      layoutElement.parent["~layout"].size.y,
    );
  }

  if (layoutElement.parent["~layout"].layoutDirection === "TOP_TO_BOTTOM") {
    layoutElement.parent["~layout"].size.x = Math.max(
      layoutElement["~layout"].size.x,
      layoutElement.parent["~layout"].size.x,
    );
    layoutElement.parent["~layout"].size.y += layoutElement["~layout"].size.y;
  }
}

function updateLayoutElementSize(layoutElement: LayoutElement) {
  for (let i = 0; i < layoutElement.children.length; i++) {
    updateLayoutElementSize(layoutElement.children[i]);
  }

  layoutElement["~layout"].size.x += 2 * layoutElement["~layout"].padding.x;
  layoutElement["~layout"].size.y += 2 * layoutElement["~layout"].padding.y;

  if (layoutElement["~layout"].layoutDirection === "LEFT_TO_RIGHT") {
    layoutElement["~layout"].size.x += layoutElement["~layout"].childrenGap *
      (layoutElement.children.length - 1);
  }

  if (layoutElement["~layout"].layoutDirection === "TOP_TO_BOTTOM") {
    layoutElement["~layout"].size.y += layoutElement["~layout"].childrenGap *
      (layoutElement.children.length - 1);
  }

  updateLayoutElementParentSize(layoutElement);
}

function getLayoutElementRemainingSize(
  layoutElement: LayoutElement,
): Vector2d<number> {
  let remainingWidth = layoutElement["~layout"].size.x;
  let remainingHeight = layoutElement["~layout"].size.y;

  remainingWidth -= 2 * layoutElement["~layout"].padding.x;
  remainingHeight -= 2 * layoutElement["~layout"].padding.y;

  for (let i = 0; i < layoutElement.children.length; i++) {
    remainingWidth -= layoutElement.children[i]["~layout"].size.x;
    remainingHeight -= layoutElement.children[i]["~layout"].size.y;
  }

  remainingWidth -= (layoutElement.children.length - 1) *
    layoutElement["~layout"].childrenGap;

  remainingHeight -= (layoutElement.children.length - 1) *
    layoutElement["~layout"].childrenGap;

  return {
    x: remainingWidth,
    y: remainingHeight,
  };
}

function updateChildElementsSizeWitGrowSizingBeavior(
  layoutElement: LayoutElement,
) {
  const remainingSize = getLayoutElementRemainingSize(layoutElement);

  for (let i = 0; i < layoutElement.children.length; i++) {
    const childElement = layoutElement.children[i];

    if (childElement["~layout"].sizeBehavior === "GROW") {
      if (layoutElement["~layout"].layoutDirection === "LEFT_TO_RIGHT") {
        childElement["~layout"].size.x += remainingSize.x;
        childElement["~layout"].size.y = layoutElement["~layout"].size.y -
          2 * layoutElement["~layout"].padding.y;
      }

      if (layoutElement["~layout"].layoutDirection === "TOP_TO_BOTTOM") {
        childElement["~layout"].size.x = layoutElement["~layout"].size.x -
          2 * layoutElement["~layout"].padding.x;
        childElement["~layout"].size.y += remainingSize.y;
      }
    }

    updateChildElementsSizeWitGrowSizingBeavior(childElement);
  }
}

function updateBaseChildElementsPosition(layoutElement: LayoutElement) {
  if (layoutElement["~layout"].layoutDirection === "LEFT_TO_RIGHT") {
    let leftOffset = getOffsetBasedOnChildAlignment(layoutElement);
    for (let i = 0; i < layoutElement.children.length; i++) {
      const childElement = layoutElement.children[i];
      childElement["~layout"].position.x +=
        layoutElement["~layout"].position.x +
        layoutElement["~layout"].padding.x +
        leftOffset;
      childElement["~layout"].position.y +=
        layoutElement["~layout"].position.y +
        layoutElement["~layout"].padding.y;
      leftOffset += childElement["~layout"].size.x +
        layoutElement["~layout"].childrenGap;
      updateBaseChildElementsPosition(childElement);
    }
  }

  if (layoutElement["~layout"].layoutDirection === "TOP_TO_BOTTOM") {
    let topOffset = 0;
    for (let i = 0; i < layoutElement.children.length; i++) {
      const childElement = layoutElement.children[i];
      childElement["~layout"].position.x +=
        layoutElement["~layout"].position.x +
        layoutElement["~layout"].padding.x;
      childElement["~layout"].position.y +=
        layoutElement["~layout"].position.y +
        layoutElement["~layout"].padding.y +
        topOffset;
      topOffset += childElement["~layout"].size.y +
        layoutElement["~layout"].childrenGap;
      updateBaseChildElementsPosition(childElement);
    }
  }
}

function getOffsetBasedOnChildAlignment(layoutElement: LayoutElement) {
  if (layoutElement["~layout"].childrenAlignment === "START") {
    return 0;
  }

  const remainingSize = getLayoutElementRemainingSize(layoutElement);

  if (layoutElement["~layout"].childrenAlignment === "CENTER") {
    if (layoutElement["~layout"].layoutDirection === "LEFT_TO_RIGHT") {
      return remainingSize.x / 2;
    }

    if (layoutElement["~layout"].layoutDirection === "TOP_TO_BOTTOM") {
      return remainingSize.y / 2;
    }
  }

  if (layoutElement["~layout"].childrenAlignment === "END") {
    if (layoutElement["~layout"].layoutDirection === "LEFT_TO_RIGHT") {
      return remainingSize.x;
    }

    if (layoutElement["~layout"].layoutDirection === "TOP_TO_BOTTOM") {
      return remainingSize.y;
    }
  }

  return 0;
}

export function updateLayoutElement(layoutElement: LayoutElement) {
  updateLayoutElementSize(layoutElement);
  updateChildElementsSizeWitGrowSizingBeavior(layoutElement);
  updateBaseChildElementsPosition(layoutElement);
}
