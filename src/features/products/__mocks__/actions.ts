// Stories load this in place of `../actions`, which imports the database
// driver and cannot run in a browser. `.storybook/preview.ts` registers it.
import { fn } from "storybook/test";

import type * as actions from "../actions";

export const createProductAction = fn<typeof actions.createProductAction>();
