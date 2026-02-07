"use client";

import Link from "next/link";
import { DigitalClock } from "@/components/retro/DigitalClock";
import { useMenuBar } from "@/components/os/MenuBarContext";

export const MenuBar = () => {
  const { activeTitle } = useMenuBar();

  return (
    <nav className="os-menubar">
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
