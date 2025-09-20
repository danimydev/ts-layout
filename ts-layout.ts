type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepPartial<T[P]>
    : T[P];
};

type Vector2d<T> = {
  x: T;
  y: T;
};

export type LayoutElement = {
  parent?: LayoutElement;
  children: LayoutElement[];
  position: Vector2d<number>;
  size: Vector2d<number>;
  sizeBehavior: "FIXED" | "GROW" | "FIT";
  layoutDirection: "LEFT_TO_RIGHT" | "TOP_TO_BOTTOM";
  padding: Vector2d<number>;
  childrenGap: number;
};

export function createLayoutElement(
  partialLayoutElement: DeepPartial<LayoutElement> = {},
  parent?: LayoutElement,
): LayoutElement {
  const baseLayoutElement: LayoutElement = {
    parent,
    children: [],
    position: { x: 0, y: 0 },
    size: { x: 0, y: 0 },
    sizeBehavior: "FIT",
    layoutDirection: "LEFT_TO_RIGHT",
    padding: { x: 0, y: 0 },
    childrenGap: 0,
  };

  return Object.assign(baseLayoutElement, partialLayoutElement);
}

function updateLayoutElementParentSize(layoutElement: LayoutElement) {
  if (!layoutElement.parent) {
    return;
  }

  if (layoutElement.parent.sizeBehavior === "FIXED") {
    return;
  }

  if (layoutElement.parent.layoutDirection === "LEFT_TO_RIGHT") {
    layoutElement.parent.size.x += layoutElement.size.x;
    layoutElement.parent.size.y = Math.max(
      layoutElement.size.y,
      layoutElement.parent.size.y,
    );
  }

  if (layoutElement.parent.layoutDirection === "TOP_TO_BOTTOM") {
    layoutElement.parent.size.x = Math.max(
      layoutElement.size.x,
      layoutElement.parent.size.x,
    );
    layoutElement.parent.size.y += layoutElement.size.y;
  }
}

function updateLayoutElementSize(layoutElement: LayoutElement) {
  for (let i = 0; i < layoutElement.children.length; i++) {
    updateLayoutElementSize(layoutElement.children[i]);
  }

  layoutElement.size.x += 2 * layoutElement.padding.x;
  layoutElement.size.y += 2 * layoutElement.padding.y;

  if (layoutElement.layoutDirection === "LEFT_TO_RIGHT") {
    layoutElement.size.x +=
      layoutElement.childrenGap * (layoutElement.children.length - 1);
  }

  if (layoutElement.layoutDirection === "TOP_TO_BOTTOM") {
    layoutElement.size.y +=
      layoutElement.childrenGap * (layoutElement.children.length - 1);
  }

  updateLayoutElementParentSize(layoutElement);
}

function getLayoutElementRemainingSize(
  layoutElement: LayoutElement,
): Vector2d<number> {
  let remainingWidth = layoutElement.size.x;
  let remainingHeight = layoutElement.size.y;

  remainingWidth -= 2 * layoutElement.padding.x;
  remainingHeight -= 2 * layoutElement.padding.y;

  for (let i = 0; i < layoutElement.children.length; i++) {
    remainingWidth -= layoutElement.children[i].size.x;
    remainingHeight -= layoutElement.children[i].size.y;
  }
  remainingWidth -=
    (layoutElement.children.length - 1) * layoutElement.childrenGap;

  remainingHeight -=
    (layoutElement.children.length - 1) * layoutElement.childrenGap;

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

    if (childElement.sizeBehavior === "GROW") {
      if (layoutElement.layoutDirection === "LEFT_TO_RIGHT") {
        childElement.size.x += remainingSize.x;
        childElement.size.y =
          layoutElement.size.y - 2 * layoutElement.padding.y;
      }

      if (layoutElement.layoutDirection === "TOP_TO_BOTTOM") {
        childElement.size.x =
          layoutElement.size.x - 2 * layoutElement.padding.x;
        childElement.size.y += remainingSize.y;
      }
    }

    updateChildElementsSizeWitGrowSizingBeavior(childElement);
  }
}

function updateBaseChildElementsPosition(layoutElement: LayoutElement) {
  if (layoutElement.layoutDirection === "LEFT_TO_RIGHT") {
    let leftOffset = 0;
    for (let i = 0; i < layoutElement.children.length; i++) {
      const childElement = layoutElement.children[i];
      childElement.position.x +=
        layoutElement.position.x + layoutElement.padding.x + leftOffset;
      childElement.position.y +=
        layoutElement.position.y + layoutElement.padding.y;
      leftOffset += childElement.size.x + layoutElement.childrenGap;
      updateBaseChildElementsPosition(childElement);
    }
  }

  if (layoutElement.layoutDirection === "TOP_TO_BOTTOM") {
    let topOffset = 0;
    for (let i = 0; i < layoutElement.children.length; i++) {
      const childElement = layoutElement.children[i];
      childElement.position.x +=
        layoutElement.position.x + layoutElement.padding.x;
      childElement.position.y +=
        layoutElement.position.y + layoutElement.padding.y + topOffset;
      topOffset += childElement.size.y + layoutElement.childrenGap;
      updateBaseChildElementsPosition(childElement);
    }
  }
}

export function updateLayoutElement(layoutElement: LayoutElement) {
  updateLayoutElementSize(layoutElement);
  updateChildElementsSizeWitGrowSizingBeavior(layoutElement);
  updateBaseChildElementsPosition(layoutElement);
}
