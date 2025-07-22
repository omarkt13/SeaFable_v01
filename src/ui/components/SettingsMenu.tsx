"use client";
/*
 * Documentation:
 * Settings Menu — https://app.subframe.com/94cd6c8ba7b2/library?component=Settings+Menu_786775dd-5f70-4b46-85ee-a3c74e6a00d6
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";
import { FeatherUser } from "@subframe/core";

interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  icon?: React.ReactNode;
  label?: React.ReactNode;
  className?: string;
}

const Item = React.forwardRef<HTMLElement, ItemProps>(function Item(
  {
    selected = false,
    icon = <FeatherUser />,
    label,
    className,
    ...otherProps
  }: ItemProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/cd4ad3a1 flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-3 py-1 hover:bg-default-background active:bg-[#275edfff]",
        {
          "bg-[#275edfff] hover:bg-[#275edfff] active:bg-[#275edfff]": selected,
        },
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      {icon ? (
        <SubframeCore.IconWrapper
          className={SubframeUtils.twClassNames(
            "text-body font-body text-default-font group-active/cd4ad3a1:text-white",
            {
              "text-white group-hover/cd4ad3a1:text-white group-active/cd4ad3a1:text-white":
                selected,
            }
          )}
        >
          {icon}
        </SubframeCore.IconWrapper>
      ) : null}
      {label ? (
        <span
          className={SubframeUtils.twClassNames(
            "line-clamp-1 grow shrink-0 basis-0 text-body font-body text-default-font group-active/cd4ad3a1:text-white",
            {
              "text-body-bold font-body-bold text-white group-hover/cd4ad3a1:text-white group-active/cd4ad3a1:text-white":
                selected,
            }
          )}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
});

interface SettingsMenuRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const SettingsMenuRoot = React.forwardRef<HTMLElement, SettingsMenuRootProps>(
  function SettingsMenuRoot(
    { children, className, ...otherProps }: SettingsMenuRootProps,
    ref
  ) {
    return children ? (
      <div
        className={SubframeUtils.twClassNames(
          "flex h-full w-60 flex-col items-start gap-8 border-r border-solid border-neutral-border bg-default-background px-6 py-6",
          className
        )}
        ref={ref as any}
        {...otherProps}
      >
        {children}
      </div>
    ) : null;
  }
);

export const SettingsMenu = Object.assign(SettingsMenuRoot, {
  Item,
});
