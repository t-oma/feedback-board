import { defineRelations } from "drizzle-orm";
import { accounts, sessions, users, verifications } from "./schema/auth";
import { products } from "./schema/products";
import { votes } from "./schema/votes";
import { feedbacks } from "./schema/feedbacks";

export const schema = {
  users,
  sessions,
  accounts,
  verifications,
  products,
  feedbacks,
  votes,
};

export const relations = defineRelations(schema, (r) => ({
  users: {
    sessions: r.many.sessions({
      from: r.users.id,
      to: r.sessions.userId,
    }),
    accounts: r.many.accounts({
      from: r.users.id,
      to: r.accounts.userId,
    }),
    product: r.one.products({
      from: r.users.id,
      to: r.products.ownerId,
    }),
    feedbacks: r.many.feedbacks({
      from: r.users.id,
      to: r.feedbacks.authorId,
    }),
    votes: r.many.votes({
      from: r.users.id,
      to: r.votes.userId,
    }),
  },
  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
    }),
  },
  accounts: {
    user: r.one.users({
      from: r.accounts.userId,
      to: r.users.id,
    }),
  },
  products: {
    owner: r.one.users({
      from: r.products.ownerId,
      to: r.users.id,
    }),
    feedbacks: r.many.feedbacks({
      from: r.products.id,
      to: r.feedbacks.productId,
    }),
  },
  feedbacks: {
    product: r.one.products({
      from: r.feedbacks.productId,
      to: r.products.id,
    }),
    author: r.one.users({
      from: r.feedbacks.authorId,
      to: r.users.id,
    }),
  },
  votes: {
    user: r.one.users({
      from: r.votes.userId,
      to: r.users.id,
    }),
    feedback: r.one.feedbacks({
      from: r.votes.feedbackId,
      to: r.feedbacks.id,
    }),
  },
}));
