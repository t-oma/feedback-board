"use client";

import { usePathname } from "next/navigation";

import { Avatar } from "@/components/avatar";
import { Menu } from "@/components/menu";
import { SignOutMenuItem } from "@/features/sign-out/ui/sign-out-menu-item";

type AccountMenuProps = {
  name: string;
  email: string;
};

export function AccountMenu({ name, email }: AccountMenuProps) {
  const onDashboard = usePathname() === "/dashboard";

  return (
    <Menu.Root>
      <Menu.Trigger aria-label="Account">
        <Avatar name={name} />
      </Menu.Trigger>
      <Menu.Popup>
        <Menu.Group>
          <Menu.GroupLabel>
            <span className="block truncate text-sm font-medium text-foreground">
              {name}
            </span>
            <span className="block truncate">{email}</span>
          </Menu.GroupLabel>
          <Menu.Separator />
          <Menu.LinkItem
            href="/dashboard"
            aria-current={onDashboard ? "page" : undefined}
          >
            Dashboard
          </Menu.LinkItem>
          <Menu.Separator />
          <SignOutMenuItem />
        </Menu.Group>
      </Menu.Popup>
    </Menu.Root>
  );
}
