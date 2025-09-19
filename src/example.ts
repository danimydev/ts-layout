import * as TsLayout from "./ts-layout";

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepPartial<T[P]>
    : T[P];
};

type UIElement = TsLayout.LayoutElement & {
  // overrided TsLayout props
  parent?: UIElement;
  children: UIElement[];

  style: {
    backgroundColor: string;
    fontColor: string;
    fontSize: number;
    fontFamily: string;
    borderSize: number;
    borderColor: string;
  };
  text?: string;
};

const DEFAULT_STYLE: UIElement["style"] = {
  backgroundColor: "transparent",
  fontColor: "black",
  fontSize: 16,
  fontFamily: "monospace",
  borderColor: "black",
  borderSize: 0,
};

function createUIElement(
  partialUIElement: DeepPartial<UIElement> = {},
  parent?: UIElement,
) {
  const baseUIElement: UIElement = {
    ...TsLayout.createLayoutElement(partialUIElement, parent),
    parent,
    children: [],
    style: DEFAULT_STYLE,
  };

  const style: UIElement["style"] = {
    ...baseUIElement.style,
    ...partialUIElement.style,
  };

  const uiElement = Object.assign(baseUIElement, partialUIElement);

  uiElement.style = style;

  parent?.children.push(uiElement);

  return uiElement;
}

function createTextUIElement(
  partialUIElement: DeepPartial<UIElement> = {},
  context: CanvasRenderingContext2D,
  parent?: UIElement,
) {
  const uiElement: UIElement = createUIElement(partialUIElement, parent);

  context.save();
  context.font = `${uiElement.style.fontSize}px ${uiElement.style.fontFamily}`;
  uiElement.size = getTextSize(uiElement.text || "", context);
  context.restore();

  return uiElement;
}

function render(uiElement: UIElement, context: CanvasRenderingContext2D) {
  context.save();
  context.fillStyle = uiElement.style.backgroundColor;
  context.fillRect(
    uiElement.position.x,
    uiElement.position.y,
    uiElement.size.x,
    uiElement.size.y,
  );
  context.restore();

  if (uiElement.style.borderSize > 0) {
    context.save();
    context.strokeStyle = uiElement.style.borderColor;
    context.lineWidth = uiElement.style.borderSize;
    context.strokeRect(
      uiElement.position.x,
      uiElement.position.y,
      uiElement.size.x,
      uiElement.size.y,
    );
    context.restore();
  }

  if (uiElement.text) {
    context.save();
    context.fillStyle = uiElement.style.fontColor;
    context.textBaseline = "top";
    context.font = `${uiElement.style.fontSize}px ${uiElement.style.fontFamily}`;
    context.fillText(
      uiElement.text,
      uiElement.position.x,
      uiElement.position.y,
    );
    context.restore();
  }

  for (let i = 0; i < uiElement.children.length; i++) {
    render(uiElement.children[i], context);
  }
}

function getTextSize(text: string, context: CanvasRenderingContext2D) {
  const metrics = context.measureText(text);
  const ascent = metrics.emHeightAscent ?? 0;
  const descent = metrics.emHeightDescent ?? 0;
  return { x: metrics.width, y: ascent + descent };
}

export default function (context: CanvasRenderingContext2D) {
  const appPadding = 20;
  const appChildrenGap = 20;
  const app = createUIElement({
    size: {
      x: context.canvas.width - appPadding * 2 - appChildrenGap,
      y: context.canvas.height - appPadding * 2,
    },
    sizeBehavior: "FIXED",
    padding: {
      x: appPadding,
      y: appPadding,
    },
    childrenGap: appChildrenGap,
    layoutDirection: "LEFT_TO_RIGHT",
    style: {
      backgroundColor: "gray",
    },
  });

  createTextUIElement(
    {
      style: {
        fontSize: 32,
      },
      text: "TS LAYOUT",
    },
    context,
    app,
  );

  const uiElementExampleContextMenuSection = createUIElement(
    {
      sizeBehavior: "GROW",
      layoutDirection: "TOP_TO_BOTTOM",
      childrenGap: 10,
      style: {
        backgroundColor: "white",
      },
    },
    app,
  );

  createTextUIElement(
    {
      text: "Context Menu",
    },
    context,
    uiElementExampleContextMenuSection,
  );

  const contextMenuContainer = createUIElement(
    {
      layoutDirection: "TOP_TO_BOTTOM",
      padding: { x: 10, y: 10 },
      childrenGap: 10,
      style: {
        backgroundColor: "black",
      },
    },
    uiElementExampleContextMenuSection,
  );

  for (let i = 0; i < 5; i++) {
    const contextMenuItemContainer = createUIElement(
      {
        padding: { x: 10, y: 10 },
        childrenGap: 10,
        sizeBehavior: "GROW",
        style: {
          backgroundColor: "red",
        },
      },
      contextMenuContainer,
    );

    createTextUIElement(
      {
        style: {
          fontColor: "white",
          backgroundColor: "blue",
        },
        text: `Action - ${(i + 1) ** (i + 1)}`,
      },
      context,
      contextMenuItemContainer,
    );
  }

  TsLayout.updateLayoutElement(app);
  render(app, context);
}
