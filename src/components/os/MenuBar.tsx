"use client";

import Link from "next/link";
import { DigitalClock } from "@/components/retro/DigitalClock";
import { useMenuBar } from "@/components/os/MenuBarContext";
import { useBootSequence } from "@/components/os/BootSequenceContext";

export const MenuBar = () => {
  const { activeTitle } = useMenuBar();
  const { isPhaseReached, isComplete } = useBootSequence();

  const className = [
    "os-menubar",
    !isComplete && !isPhaseReached("menubar") ? "os-boot-hidden" : "",
    !isComplete && isPhaseReached("menubar") ? "os-boot-slide-down" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <nav className={className}>
      <div className="os-menubar-left">
        <Link href="/" className="os-menubar-brand">
          ivgtr.me
        </Link>
      </div>
      <div className="os-menubar-center">
        {activeTitle && (
          <span className="os-menubar-active-title">{activeTitle}</span>
        )}
      </div>
      <div className="os-menubar-right">
        <DigitalClock />
      </div>
    </nav>
  );
};
