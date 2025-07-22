
"use client";

import React from "react";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { FeatherAnchor } from "@subframe/core";
import { SettingsMenu } from "@/ui/components/SettingsMenu";
import { FeatherHome } from "@subframe/core";
import { FeatherUsers } from "@subframe/core";
import { FeatherMessageCircle } from "@subframe/core";
import { FeatherCalendar } from "@subframe/core";
import { FeatherHandshake } from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { FeatherDollarSign } from "@subframe/core";
import { FeatherShapes } from "@subframe/core";
import { FeatherSettings } from "@subframe/core";
import { TextField } from "@/ui/components/TextField";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherBell } from "@subframe/core";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { FeatherUser } from "@subframe/core";
import { FeatherLogOut } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { FeatherChevronDown } from "@subframe/core";
import { FeatherCheckCircle } from "@subframe/core";
import { FeatherShield } from "@subframe/core";
import { FeatherCreditCard } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherCloud } from "@subframe/core";
import { FeatherChevronLeft } from "@subframe/core";
import { FeatherChevronRight } from "@subframe/core";
import { FeatherEdit2 } from "@subframe/core";
import { FeatherEye } from "@subframe/core";
import { FeatherImage } from "@subframe/core";
import { Badge } from "@/ui/components/Badge";

function BusinessDashboard_Home() {
  return (
    <div className="container max-w-none flex h-full items-start border border-solid border-neutral-border">
      {/* Sidebar */}
      <div className="flex flex-col items-start gap-8 self-stretch border-r border-solid border-neutral-border bg-default-background px-6 py-8">
        {/* Logo and Title */}
        <div className="flex items-center gap-2">
          <IconWithBackground
            variant="warning"
            size="large"
            icon={<FeatherAnchor />}
            square={true}
          />
          <span className="text-heading-2 font-heading-2 text-default-font">
            Business Dashboard
          </span>
        </div>

        {/* Home Navigation */}
        <div className="flex w-full flex-col items-start gap-1">
          <SettingsMenu.Item
            selected={true}
            icon={<FeatherHome />}
            label="Home"
          />
        </div>

        {/* Client Management Section */}
        <div className="flex w-full flex-col items-start gap-1">
          <span className="w-full text-body-bold font-body-bold text-default-font">
            Client Management
          </span>
          <SettingsMenu.Item icon={<FeatherUsers />} label="Bookings" />
          <SettingsMenu.Item icon={<FeatherAnchor />} label="Experiences" />
          <SettingsMenu.Item icon={<FeatherMessageCircle />} label="Messages" />
          <SettingsMenu.Item icon={<FeatherCalendar />} label="Calendar" />
          <SettingsMenu.Item icon={<FeatherHandshake />} label="Clients" />
        </div>

        {/* Finance Section */}
        <div className="flex w-full flex-col items-start gap-2">
          <span className="w-full text-body-bold font-body-bold text-default-font">
            Finance
          </span>
          <div className="flex w-full flex-col items-start gap-1">
            <Button
              className="h-8 w-full flex-none justify-start"
              variant="neutral-tertiary"
              icon={<FeatherDollarSign />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            >
              Sales &amp; Payments
            </Button>
            <SettingsMenu.Item icon={<FeatherShapes />} label="Integrations" />
          </div>
        </div>

        {/* Workspace Section */}
        <div className="flex w-full flex-col items-start gap-1">
          <span className="w-full text-body-bold font-body-bold text-default-font">
            Workspace
          </span>
          <SettingsMenu.Item label="Account" />
          <SettingsMenu.Item icon={<FeatherSettings />} label="Settings" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-start px-2 py-2 grow">
        {/* Header */}
        <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border px-8 py-4">
          <TextField label="" helpText="">
            <TextField.Input
              placeholder="Search..."
              value=""
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
            />
          </TextField>
          <div className="flex items-center gap-4">
            <IconButton
              icon={<FeatherBell />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            />
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <Button
                  variant="neutral-tertiary"
                  iconRight={<FeatherChevronDown />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                >
                  Ocean Travel
                </Button>
              </SubframeCore.DropdownMenu.Trigger>
              <SubframeCore.DropdownMenu.Portal>
                <SubframeCore.DropdownMenu.Content
                  side="bottom"
                  align="end"
                  sideOffset={4}
                  asChild={true}
                >
                  <DropdownMenu>
                    <DropdownMenu.DropdownItem icon={<FeatherUser />}>
                      Profile
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem icon={<FeatherSettings />}>
                      Settings
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownDivider />
                    <DropdownMenu.DropdownItem icon={<FeatherLogOut />}>
                      Logout
                    </DropdownMenu.DropdownItem>
                  </DropdownMenu>
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="flex w-full flex-col items-start gap-2 px-2 py-2">
          <div className="flex w-full flex-col items-start gap-2 px-2 py-2">
            <div className="flex w-full flex-col items-start gap-2 px-2 py-2">
              <div className="flex w-full items-start rounded-md bg-[#275fe0ff] px-6 py-4">
                <div className="flex flex-col items-start gap-4">
                  <span className="text-white font-heading-2 font-bold">
                    Good Morning! 🌊
                  </span>
                  <span className="text-heading-3 font-heading-3 text-white">
                    You have 10 bookings today. Weather conditions are perfect
                    for water adventures!
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <FeatherCheckCircle className="text-body font-body text-white mr-1" />
                      <span className="text-body font-body text-white">
                        Profile Complete
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FeatherShield className="text-body font-body text-white mr-1" />
                      <span className="text-body font-body text-white">
                        Verified Business
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex h-320 w-320 flex-none flex-col items-start gap-8 px-8 py-8 overflow-auto">
          {/* Monthly Stats Section */}
          <div className="flex w-full items-center justify-between">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Monthly Stats
            </span>
          </div>
          <div className="flex w-full items-start gap-4">
            {/* Revenue Card */}
            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
              <div className="flex w-full items-center justify-between">
                <IconWithBackground icon={<FeatherCreditCard />} />
              </div>
              <span className="text-heading-1 font-heading-1 text-default-font">
                $10,254
              </span>
              <span className="text-body font-body text-subtext-color">
                Revenue
              </span>
            </div>
            
            {/* Active Bookings Card */}
            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
              <div className="flex w-full items-center justify-between">
                <IconWithBackground
                  variant="success"
                  icon={<FeatherCalendar />}
                />
              </div>
              <span className="text-heading-1 font-heading-1 text-default-font">
                52
              </span>
              <span className="text-body font-body text-subtext-color">
                Active Bookings
              </span>
            </div>
            
            {/* Total Clients Card */}
            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
              <div className="flex w-full items-center justify-between">
                <IconWithBackground icon={<FeatherUsers />} />
              </div>
              <span className="text-heading-1 font-heading-1 text-default-font">
                36
              </span>
              <span className="text-body font-body text-subtext-color">
                Total Clients
              </span>
            </div>
            
            {/* Total Experiences Card */}
            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
              <div className="flex w-full items-center justify-between">
                <IconWithBackground
                  variant="success"
                  icon={<FeatherAnchor />}
                />
              </div>
              <span className="text-heading-1 font-heading-1 text-default-font">
                12
              </span>
              <span className="text-body font-body text-subtext-color">
                Total Experiences
              </span>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="flex w-full items-center justify-between">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Quick Actions
            </span>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            <div className="flex w-full flex-col items-start gap-2 px-2 py-2">
              <div className="flex w-full items-start gap-4">
                <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-2 self-stretch rounded-md border border-solid border-neutral-border bg-default-background px-6 py-4 shadow-sm">
                  <IconWithBackground
                    variant="neutral"
                    size="large"
                    icon={<FeatherPlus />}
                  />
                  <span className="text-body-bold font-body-bold text-default-font">
                    Add Experiences
                  </span>
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-2 self-stretch rounded-md border border-solid border-neutral-border bg-default-background px-6 py-4 shadow-sm">
                  <IconWithBackground
                    variant="neutral"
                    size="large"
                    icon={<FeatherMessageCircle />}
                  />
                  <span className="text-body-bold font-body-bold text-default-font">
                    Messages
                  </span>
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-2 self-stretch rounded-md border border-solid border-neutral-border bg-default-background px-6 py-4 shadow-sm">
                  <IconWithBackground
                    variant="neutral"
                    size="large"
                    icon={<FeatherCalendar />}
                  />
                  <span className="text-body-bold font-body-bold text-default-font">
                    Calendar
                  </span>
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-2 self-stretch rounded-md border border-solid border-neutral-border bg-default-background px-6 py-4 shadow-sm">
                  <IconWithBackground
                    variant="neutral"
                    size="large"
                    icon={<FeatherCloud />}
                  />
                  <span className="text-body-bold font-body-bold text-default-font">
                    Check Weather
                  </span>
                </div>
              </div>
            </div>

            {/* This Week's Bookings Header */}
            <div className="flex w-full items-center justify-between">
              <span className="text-heading-2 font-heading-2 text-default-font">
                This Week's Bookings
              </span>
              <div className="flex items-center gap-2">
                <IconButton
                  icon={<FeatherChevronLeft />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                />
                <span className="text-body-bold font-body-bold text-default-font">
                  March 18 - 24
                </span>
                <IconButton
                  icon={<FeatherChevronRight />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                />
              </div>
            </div>

            {/* Weekly Bookings Grid */}
            <div className="flex w-full items-start gap-4 overflow-x-auto">
              {/* Monday */}
              <div className="flex flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 grow-0 shrink-0 basis-auto w-[calc(25%-16px)]">
                <span className="text-body-bold font-body-bold text-default-font">
                  Monday
                </span>
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex w-full items-center rounded-md border border-solid border-neutral-border px-3 py-3">
                    <div className="flex flex-col items-start gap-1 grow">
                      <span className="text-body-bold font-body-bold text-default-font">
                        Scuba-diving with turtles 🐢
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        March 18, 2025 - 10:00 AM
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Duration: 6 hours
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Group size: 6/8
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Total sales: $1200
                      </span>
                      <div className="flex w-full flex-col items-start gap-2">
                        <div className="flex w-full items-center gap-2">
                          <Button
                            className="grow"
                            variant="neutral-secondary"
                            icon={<FeatherMessageCircle />}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                          >
                            Message Group
                          </Button>
                          <Button
                            className="grow"
                            variant="neutral-secondary"
                            icon={<FeatherEdit2 />}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Second booking for Monday */}
                  <div className="flex w-full items-center rounded-md border border-solid border-neutral-border px-3 py-3">
                    <div className="flex flex-col items-start gap-1 grow">
                      <span className="text-body-bold font-body-bold text-default-font">
                        Scuba-diving with turtles 🐢
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        March 18, 2025 - 10:00 AM
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Duration: 6 hours
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Group size: 6/8
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Total sales: $1200
                      </span>
                      <div className="flex w-full flex-col items-start gap-2">
                        <div className="flex w-full items-center gap-2">
                          <Button
                            className="grow"
                            variant="neutral-secondary"
                            icon={<FeatherMessageCircle />}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                          >
                            Message Group
                          </Button>
                          <Button
                            className="grow"
                            variant="neutral-secondary"
                            icon={<FeatherEdit2 />}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tuesday */}
              <div className="flex flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 grow-0 shrink-0 basis-auto w-[calc(25%-16px)]">
                <span className="text-body-bold font-body-bold text-default-font">
                  Tuesday
                </span>
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex w-full items-center gap-2 rounded-md border border-solid border-neutral-border px-3 py-3">
                    <div className="flex flex-col items-start gap-1 grow">
                      <span className="text-body-bold font-body-bold text-default-font">
                        Sailing Adventure
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        March 19, 2025 - 2:00 PM
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Duration: 4 hours
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Group size: 8/8
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Total sales: $1600
                      </span>
                      <div className="flex w-full flex-col items-start gap-2">
                        <div className="flex w-full items-center gap-2">
                          <Button
                            className="grow"
                            variant="neutral-secondary"
                            icon={<FeatherMessageCircle />}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                          >
                            Message Group
                          </Button>
                          <Button
                            className="grow"
                            variant="neutral-secondary"
                            icon={<FeatherEdit2 />}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wednesday */}
              <div className="flex flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 grow-0 shrink-0 basis-auto w-[calc(25%-16px)]">
                <span className="text-body-bold font-body-bold text-default-font">
                  Wednesday
                </span>
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex w-full items-center gap-2 rounded-md border border-solid border-neutral-border px-3 py-3">
                    <div className="flex flex-col items-start gap-1 grow">
                      <span className="text-body-bold font-body-bold text-default-font">
                        Kayaking Expedition
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        March 20, 2025 - 9:30 AM
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Duration: 5 hours
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Group size: 4/4
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Total sales: $800
                      </span>
                      <div className="flex w-full flex-col items-start gap-2">
                        <div className="flex w-full items-center gap-2">
                          <Button
                            className="grow"
                            variant="neutral-secondary"
                            icon={<FeatherMessageCircle />}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                          >
                            Message Group
                          </Button>
                          <Button
                            className="grow"
                            variant="neutral-secondary"
                            icon={<FeatherEdit2 />}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thursday */}
              <div className="flex flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 grow-0 shrink-0 basis-auto w-[calc(25%-16px)]">
                <span className="text-body-bold font-body-bold text-default-font">
                  Thursday
                </span>
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex w-full items-center gap-2 rounded-md border border-solid border-neutral-border px-3 py-3">
                    <div className="flex flex-col items-start gap-1 grow">
                      <span className="text-body-bold font-body-bold text-default-font">
                        Snorkeling Trip
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        March 21, 2025 - 11:00 AM
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Duration: 3 hours
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Group size: 6/10
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Total sales: $900
                      </span>
                      <div className="flex w-full flex-col items-start gap-2">
                        <div className="flex w-full items-center gap-2">
                          <Button
                            className="grow"
                            variant="neutral-secondary"
                            icon={<FeatherMessageCircle />}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                          >
                            Message Group
                          </Button>
                          <Button
                            className="grow"
                            variant="neutral-secondary"
                            icon={<FeatherEdit2 />}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Friday */}
              <div className="flex flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 grow-0 shrink-0 basis-auto w-[calc(25%-16px)]">
                <span className="text-body-bold font-body-bold text-default-font">
                  Friday
                </span>
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex w-full items-center gap-2 rounded-md border border-solid border-neutral-border px-3 py-3">
                    <div className="flex flex-col items-start gap-1 grow">
                      <span className="text-body-bold font-body-bold text-default-font">
                        Deep Sea Fishing
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        March 22, 2025 - 7:00 AM
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Duration: 8 hours
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Group size: 5/7
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Total sales: $1250
                      </span>
                      <div className="flex w-full flex-col items-start gap-2">
                        <div className="flex w-full items-center gap-2">
                          <Button
                            className="grow"
                            variant="neutral-secondary"
                            icon={<FeatherMessageCircle />}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                          >
                            Message Group
                          </Button>
                          <Button
                            className="grow"
                            variant="neutral-secondary"
                            icon={<FeatherEdit2 />}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Saturday */}
              <div className="flex flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 grow-0 shrink-0 basis-auto w-[calc(25%-16px)]">
                <span className="text-body-bold font-body-bold text-default-font">
                  Saturday
                </span>
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex w-full items-center gap-2 rounded-md border border-solid border-neutral-border px-3 py-3">
                    <div className="flex flex-col items-start gap-1 grow">
                      <span className="text-body-bold font-body-bold text-default-font">
                        Sunset Cruise
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        March 23, 2025 - 5:00 PM
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Duration: 2 hours
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Group size: 10/10
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Total sales: $1000
                      </span>
                      <div className="flex w-full flex-col items-start gap-2">
                        <div className="flex w-full items-center gap-2">
                          <Button
                            className="grow"
                            variant="neutral-secondary"
                            icon={<FeatherMessageCircle />}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                          >
                            Message Group
                          </Button>
                          <Button
                            className="grow"
                            variant="neutral-secondary"
                            icon={<FeatherEdit2 />}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sunday */}
              <div className="flex flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 grow-0 shrink-0 basis-auto w-[calc(25%-16px)]">
                <span className="text-body-bold font-body-bold text-default-font">
                  Sunday
                </span>
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex w-full items-center gap-2 rounded-md border border-solid border-neutral-border px-3 py-3">
                    <div className="flex flex-col items-start gap-1 grow">
                      <span className="text-body-bold font-body-bold text-default-font">
                        Island Hopping Tour
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        March 24, 2025 - 8:00 AM
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Duration: 6 hours
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Group size: 7/8
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        Total sales: $1400
                      </span>
                      <div className="flex w-full flex-col items-start gap-2">
                        <div className="flex w-full items-center gap-2">
                          <Button
                            className="grow"
                            variant="neutral-secondary"
                            icon={<FeatherMessageCircle />}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                          >
                            Message Group
                          </Button>
                          <Button
                            className="grow"
                            variant="neutral-secondary"
                            icon={<FeatherEdit2 />}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings Section */}
            <div className="flex w-full flex-col items-start gap-4">
              <div className="flex w-full items-center justify-between">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  Recent Bookings
                </span>
                <Button
                  icon={<FeatherEye />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                >
                  View all
                </Button>
              </div>
              <div className="flex w-full flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
                {/* Booking Item 1 */}
                <div className="flex w-full items-center gap-4 border-b border-solid border-neutral-border pb-4">
                  <div className="flex h-12 w-12 flex-none items-center justify-center rounded-md bg-brand-50">
                    <FeatherImage className="text-heading-2 font-heading-2 text-brand-600" />
                  </div>
                  <div className="flex flex-col items-start grow">
                    <span className="text-body-bold font-body-bold text-default-font">
                      Sarah Johnson
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      Sunset Sailing
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-body font-body text-subtext-color">
                        21-05-2025
                      </span>
                      <span className="text-body font-body text-subtext-color">
                        2 guests
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-body font-body text-subtext-color">
                      $1,200
                    </span>
                    <Badge variant="success">Confirmed</Badge>
                  </div>
                </div>
                
                {/* Booking Item 2 */}
                <div className="flex w-full items-center gap-4 border-b border-solid border-neutral-border pb-4">
                  <div className="flex h-12 w-12 flex-none items-center justify-center rounded-md bg-brand-50">
                    <FeatherImage className="text-heading-2 font-heading-2 text-brand-600" />
                  </div>
                  <div className="flex flex-col items-start grow">
                    <span className="text-body-bold font-body-bold text-default-font">
                      Sarah Johnson
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      Sunset Sailing
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-body font-body text-subtext-color">
                        21-05-2025
                      </span>
                      <span className="text-body font-body text-subtext-color">
                        2 guests
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-body font-body text-subtext-color">
                      $1,200
                    </span>
                    <Badge variant="success">Confirmed</Badge>
                  </div>
                </div>
                
                {/* Booking Item 3 */}
                <div className="flex w-full items-center gap-4 border-b border-solid border-neutral-border pb-4">
                  <div className="flex h-12 w-12 flex-none items-center justify-center rounded-md bg-brand-50">
                    <FeatherImage className="text-heading-2 font-heading-2 text-brand-600" />
                  </div>
                  <div className="flex flex-col items-start grow">
                    <span className="text-body-bold font-body-bold text-default-font">
                      Sarah Johnson
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      Sunset Sailing
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-body font-body text-subtext-color">
                        21-05-2025
                      </span>
                      <span className="text-body font-body text-subtext-color">
                        2 guests
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-body font-body text-subtext-color">
                      $1,200
                    </span>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessDashboard_Home;
