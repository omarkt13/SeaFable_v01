"use client";
/*
 * Documentation:
 * Tree View2 — https://app.subframe.com/94cd6c8ba7b2/library?component=Tree+View2_d84e9971-f19d-4995-877d-a85dee23d8ea
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";
import { FeatherFolder } from "@subframe/core";
import { Accordion } from "./Accordion";
import { FeatherFile } from "@subframe/core";

interface FolderProps extends React.ComponentProps<typeof Accordion> {
  children?: React.ReactNode;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const Folder = React.forwardRef<HTMLElement, FolderProps>(function Folder(
  {
    children,
    label,
    icon = <FeatherFolder />,
    className,
    ...otherProps
  }: FolderProps,
  ref
) {
  return (
    <Accordion
      className={SubframeUtils.twClassNames(
        "group/99a77166 cursor-pointer",
        className
      )}
      trigger={
        <div className="flex w-full items-center gap-2 rounded-md px-3 py-2 group-hover/99a77166:bg-neutral-50">
          {icon ? (
            <SubframeCore.IconWrapper className="text-body font-body text-default-font">
              {icon}
            </SubframeCore.IconWrapper>
          ) : null}
          {label ? (
            <span className="line-clamp-1 grow shrink-0 basis-0 text-body font-body text-default-font">
              {label}
            </span>
          ) : null}
          <Accordion.Chevron />
        </div>
      }
      defaultOpen={true}
      ref={ref as any}
      {...otherProps}
    >
      {children ? (
        <div className="flex w-full flex-col items-start gap-1 pl-6 pt-1">
          {children}
        </div>
      ) : null}
    </Accordion>
  );
});

interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const Item = React.forwardRef<HTMLElement, ItemProps>(function Item(
  {
    selected = false,
    label,
    icon = <FeatherFile />,
    className,
    ...otherProps
  }: ItemProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/5465cedd flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 hover:bg-neutral-50",
        { "bg-brand-100 hover:bg-brand-100": selected },
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      {icon ? (
        <SubframeCore.IconWrapper
          className={SubframeUtils.twClassNames(
            "text-body font-body text-default-font",
            { "text-brand-700": selected }
          )}
        >
          {icon}
        </SubframeCore.IconWrapper>
      ) : null}
      {label ? (
        <span
          className={SubframeUtils.twClassNames(
            "line-clamp-1 grow shrink-0 basis-0 text-body font-body text-default-font",
            { "text-brand-700": selected }
          )}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
});

interface TreeView2RootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const TreeView2Root = React.forwardRef<HTMLElement, TreeView2RootProps>(
  function TreeView2Root(
    { children, className, ...otherProps }: TreeView2RootProps,
    ref
  ) {
    return children ? (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full flex-col items-start",
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

export const TreeView2 = Object.assign(TreeView2Root, {
  Folder,
  Item,
});
