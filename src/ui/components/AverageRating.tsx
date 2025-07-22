"use client";
/*
 * Documentation:
 * Average Rating — https://app.subframe.com/94cd6c8ba7b2/library?component=Average+Rating_9e112536-b90e-4037-832b-d16b051c0dc8
 * Icon with background — https://app.subframe.com/94cd6c8ba7b2/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { IconWithBackground } from "./IconWithBackground";
import { FeatherDollarSign } from "@subframe/core";

interface AverageRatingRootProps extends React.HTMLAttributes<HTMLDivElement> {
  _48?: React.ReactNode;
  averageRating?: React.ReactNode;
  className?: string;
}

const AverageRatingRoot = React.forwardRef<HTMLElement, AverageRatingRootProps>(
  function AverageRatingRoot(
    { _48, averageRating, className, ...otherProps }: AverageRatingRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm",
          className
        )}
        ref={ref as any}
        {...otherProps}
      >
        <div className="flex w-full items-center justify-between">
          <IconWithBackground variant="error" icon={<FeatherDollarSign />} />
        </div>
        {_48 ? (
          <span className="text-heading-1 font-heading-1 text-default-font">
            {_48}
          </span>
        ) : null}
        {averageRating ? (
          <span className="text-body font-body text-subtext-color">
            {averageRating}
          </span>
        ) : null}
      </div>
    );
  }
);

export const AverageRating = AverageRatingRoot;
