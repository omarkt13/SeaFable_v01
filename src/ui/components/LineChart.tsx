"use client";
/*
 * Documentation:
 * Line Chart — https://app.subframe.com/94cd6c8ba7b2/library?component=Line+Chart_22944dd2-3cdd-42fd-913a-1b11a3c1d16d
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";

interface LineChartRootProps
  extends React.ComponentProps<typeof SubframeCore.LineChart> {
  className?: string;
}

const LineChartRoot = React.forwardRef<HTMLElement, LineChartRootProps>(
  function LineChartRoot(
    { className, ...otherProps }: LineChartRootProps,
    ref
  ) {
    return (
      <SubframeCore.LineChart
        className={SubframeUtils.twClassNames("h-80 w-full", className)}
        ref={ref as any}
        colors={[
          "#14b8a6",
          "#99f6e4",
          "#0d9488",
          "#5eead4",
          "#0f766e",
          "#2dd4bf",
        ]}
        {...otherProps}
      />
    );
  }
);

export const LineChart = LineChartRoot;
