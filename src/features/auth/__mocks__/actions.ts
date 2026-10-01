// Stories load this in place of `../actions`, which imports the database
// driver and cannot run in a browser. `.storybook/preview.ts` registers it.
import { fn } from "storybook/test";

import type * as actions from "../actions";

export const signInAction = fn<typeof actions.signInAction>();
export const createAccountAction = fn<typeof actions.createAccountAction>();
export const signOutAction = fn<typeof actions.signOutAction>();
