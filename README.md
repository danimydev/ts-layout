# TsLayout

TsLayout is a library you can use to build ui libraries on top of it, it
provides auto layout (sizing & positioning). I was inspired by Clay and decided
to write my own version of it using TypeScript because I do not know C... yet
:).

## Installing

Just copy the
[source code](https://github.com/danimydev/ts-layout/blob/main/src/ts-layout.ts),
it is just one TypeScript file!

## How to extend TsLayout?

Since TsLayout only provides the bare bones to build a ui layout system, you
will need to extend it if you want to handle styling and rendering but it's not
complicated. Here is a quick example of how it may look like.

First, create a type that extends from TsLayout.

```typescript
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
```

You can create a function that creates this element with default values or not,
that is up to you and your needs. TsLayout provides a function for this but this
will only return a `LayoutElement` and it will only work for layout
calculations. Here is an example that creates a custom `UIElement` that has some
style props and possibly text.

```typescript
const DEFAULT_STYLE: UIElement["style"] = {
    backgroundColor: "transparent",
    fontColor: "black",
    fontSize: 16,
    fontFamily: "monospace",
    borderColor: "black",
    borderSize: 0,
};

function createUIElement(
    partialUIElement: DeepPartial<UIElement< = {},
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
```

## Example

TsLayout only works for 2d use cases. But the good news is that it lets you
choose which context to use so you can write the render code and use both size
and position as `Vector2d.x` and `Vector2d.y` to draw your layout on a screen.
You can decide how to handle text, color, fonts and other stuff.

Here is an example on how to use TsLayout with a `HTMLCanvasElement` using it's
`CanvasRenderingContext2D`.

For this example I use a helper function that helps me get the size as
`Vector2d<number>.`

```typescript
function getTextSize(text: string, context: CanvasRenderingContext2D) {
  const metrics = context.measureText(text);
  const ascent = metrics.emHeightAscent ?? 0;
  const descent = metrics.emHeightDescent ?? 0;
  return { x: metrics.width, y: ascent + descent };
}
```

Here we create the ui that is being displayed bellow on a `HTMLCanvasElement`.

```typescript
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
```

Now we just need to update our root layout element. This will run several tree
passes to our layout in order to calculate size, grow and position (in that
order) so once we are rendering we have the correct information.

```typescript
TsLayout.updateLayoutElement(app);
render(app, context);
```
