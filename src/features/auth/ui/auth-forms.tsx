"use client";

import Link from "next/link";
import { useState } from "react";

import { Tabs } from "@/components/tabs";

import type { AuthMode } from "../schemas";
import { CreateAccountForm } from "./create-account-form";
import { SignInForm } from "./sign-in-form";

type AuthFormsProps = {
  mode: AuthMode;
  returnTo?: string | undefined;
  signInHref: string;
  createAccountHref: string;
};

export function AuthForms({
  mode,
  returnTo,
  signInHref,
  createAccountHref,
}: AuthFormsProps) {
  const [email, setEmail] = useState("");

  return (
    <Tabs.Root value={mode} className="w-full">
      <Tabs.List>
        <Tabs.Tab
          value="sign-in"
          nativeButton={false}
          render={<Link href={signInHref} />}
        >
          Sign in
        </Tabs.Tab>
        <Tabs.Tab
          value="create-account"
          nativeButton={false}
          render={<Link href={createAccountHref} />}
        >
          Create account
        </Tabs.Tab>
        <Tabs.Indicator renderBeforeHydration />
      </Tabs.List>

      <Tabs.Content>
        <Tabs.Panel keepMounted value="sign-in">
          <SignInForm
            email={email}
            onEmailChange={setEmail}
            returnTo={returnTo}
          />
        </Tabs.Panel>
        <Tabs.Panel keepMounted value="create-account">
          <CreateAccountForm
            email={email}
            onEmailChange={setEmail}
            returnTo={returnTo}
          />
        </Tabs.Panel>
      </Tabs.Content>
    </Tabs.Root>
  );
}
