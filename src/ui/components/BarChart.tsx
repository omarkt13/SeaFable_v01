"use client";
/*
 * Documentation:
 * Bar Chart — https://app.subframe.com/94cd6c8ba7b2/library?component=Bar+Chart_4d4f30e7-1869-4980-8b96-617df3b37912
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";

interface BarChartRootProps
  extends React.ComponentProps<typeof SubframeCore.BarChart> {
  stacked?: boolean;
  className?: string;
}

const BarChartRoot = React.forwardRef<HTMLElement, BarChartRootProps>(
  function BarChartRoot(
    { stacked = false, className, ...otherProps }: BarChartRootProps,
    ref
  ) {
    return (
      <SubframeCore.BarChart
        className={SubframeUtils.twClassNames("h-80 w-full", className)}
        ref={ref as any}
        stacked={stacked}
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

export const BarChart = BarChartRoot;
