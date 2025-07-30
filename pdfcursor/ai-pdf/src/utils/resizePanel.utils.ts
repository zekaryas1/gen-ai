class ResizePanelUtils {
  transformLayout(
    side: "left" | "right",
    layout: number[],
    previousLayout: number[],
  ) {
    const isLeft = side === "left";
    const index = isLeft ? 0 : 2;
    const currentSize = Math.floor(layout[index]);

    if (currentSize === 0) {
      const prevSize = previousLayout[isLeft ? 0 : 1];
      const adjustedMiddle = layout[1] - prevSize + 0.2;
      const newLayout: number[] = isLeft
        ? [prevSize, adjustedMiddle, layout[2]]
        : [layout[0], adjustedMiddle, prevSize];

      return newLayout;
    } else {
      previousLayout[isLeft ? 0 : 1] = layout[index];
      const adjustedMiddle = layout[1] + layout[index] - 0.2;
      const newLayout: number[] = isLeft
        ? [0.2, adjustedMiddle, layout[2]]
        : [layout[0], adjustedMiddle, 0.2];

      return newLayout;
    }
  }
}

export const resizePanelUtils = new ResizePanelUtils();
