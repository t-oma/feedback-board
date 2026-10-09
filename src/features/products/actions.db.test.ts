import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import type * as Navigation from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("next/cache", () => ({
  refresh: mocks.refresh,
}));

vi.mock("@/features/auth/session.server", () => ({
  getSession: mocks.getSession,
}));

import { db } from "@/server/db";
import { products } from "@/server/db/schema/products";
import { insertTestUser, uniqueSlug } from "@/server/db/users.testing";

import { createProductAction } from "./actions";

const navigation = await vi.importActual<typeof Navigation>("next/navigation");

const consoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => undefined);

const ownerHasProductError = {
  ok: false,
  code: "CONFLICT",
  message: "You already have a board.",
};

const slugTakenError = {
  ok: false,
  code: "CONFLICT",
  fieldErrors: { slug: ["This slug is already taken. Choose another one."] },
};

function sessionFor(userId: string) {
  return { session: { id: randomUUID() }, user: { id: userId } };
}

function createProduct(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value);
  }

  return createProductAction(null, formData);
}

function productsOwnedBy(ownerId: string) {
  return db.select().from(products).where(eq(products.ownerId, ownerId));
}

function productsWithSlug(slug: string) {
  return db.select().from(products).where(eq(products.slug, slug));
}

describe("createProductAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates the signed-in user's product from the normalized input", async () => {
    const [owner, someoneElse] = await Promise.all([
      insertTestUser(),
      insertTestUser(),
    ]);
    const slug = uniqueSlug();
    mocks.getSession.mockResolvedValueOnce(sessionFor(owner.id));

    await expect(
      createProduct({
        name: "  Orbit   CLI ",
        slug: ` ${slug.toUpperCase()} `,
        description: " Tell us\r\nwhat is missing. ",
        ownerId: someoneElse.id,
      }),
    ).resolves.toStrictEqual({ ok: true, data: undefined });

    await expect(productsOwnedBy(owner.id)).resolves.toMatchObject([
      {
        name: "Orbit CLI",
        slug,
        description: "Tell us\nwhat is missing.",
      },
    ]);
    await expect(productsOwnedBy(someoneElse.id)).resolves.toEqual([]);
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("stores an empty description when the request has none", async () => {
    const owner = await insertTestUser();
    mocks.getSession.mockResolvedValueOnce(sessionFor(owner.id));

    await expect(
      createProduct({ name: "Orbit CLI", slug: uniqueSlug() }),
    ).resolves.toStrictEqual({ ok: true, data: undefined });
    await expect(productsOwnedBy(owner.id)).resolves.toMatchObject([
      { description: "" },
    ]);
  });

  it("returns field errors before it looks at the session", async () => {
    await expect(
      createProduct({ name: "", slug: "Орбіта", description: "" }),
    ).resolves.toStrictEqual({
      ok: false,
      code: "VALIDATION",
      fieldErrors: {
        name: ["Enter a product name"],
        slug: ["Use Latin letters, numbers and hyphens"],
      },
    });
    expect(mocks.getSession).not.toHaveBeenCalled();
  });

  it("asks a visitor without a session to sign in again", async () => {
    mocks.getSession.mockResolvedValueOnce(null);
    const slug = uniqueSlug();

    await expect(
      createProduct({ name: "Orbit CLI", slug, description: "" }),
    ).resolves.toStrictEqual({
      ok: false,
      code: "UNAUTHENTICATED",
      message: "Your session has ended. Sign in again to create your board.",
    });
    await expect(productsWithSlug(slug)).resolves.toEqual([]);
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it("refuses a second product and refreshes the page to show the first", async () => {
    const owner = await insertTestUser();
    const firstSlug = uniqueSlug();
    await db
      .insert(products)
      .values({ ownerId: owner.id, name: "First", slug: firstSlug });
    mocks.getSession.mockResolvedValueOnce(sessionFor(owner.id));

    await expect(
      createProduct({ name: "Second", slug: uniqueSlug(), description: "" }),
    ).resolves.toStrictEqual(ownerHasProductError);
    await expect(productsOwnedBy(owner.id)).resolves.toMatchObject([
      { slug: firstSlug },
    ]);
    expect(mocks.refresh).toHaveBeenCalledOnce();
    expect(consoleError).not.toHaveBeenCalled();
  });

  // PostgreSQL checks unique indexes in the order they were created, so the
  // owner's comes before the slug's. It does not document that order, and the
  // message depends on it, so this pins it.
  it("reports the existing board when the second product's slug is taken too", async () => {
    const owner = await insertTestUser();
    const slug = uniqueSlug();
    await db
      .insert(products)
      .values({ ownerId: owner.id, name: "First", slug });
    mocks.getSession.mockResolvedValueOnce(sessionFor(owner.id));

    await expect(
      createProduct({ name: "Second", slug, description: "" }),
    ).resolves.toStrictEqual(ownerHasProductError);
  });

  it("puts a slug another product has on the address field", async () => {
    const [firstOwner, secondOwner] = await Promise.all([
      insertTestUser(),
      insertTestUser(),
    ]);
    const slug = uniqueSlug();
    await db
      .insert(products)
      .values({ ownerId: firstOwner.id, name: "First", slug });
    mocks.getSession.mockResolvedValueOnce(sessionFor(secondOwner.id));

    await expect(
      createProduct({ name: "Second", slug, description: "" }),
    ).resolves.toStrictEqual(slugTakenError);
    await expect(productsOwnedBy(secondOwner.id)).resolves.toEqual([]);
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it("keeps one product when the same owner submits twice at once", async () => {
    const owner = await insertTestUser();
    mocks.getSession
      .mockResolvedValueOnce(sessionFor(owner.id))
      .mockResolvedValueOnce(sessionFor(owner.id));

    const results = await Promise.all([
      createProduct({ name: "First", slug: uniqueSlug(), description: "" }),
      createProduct({ name: "Second", slug: uniqueSlug(), description: "" }),
    ]);

    expect(results).toContainEqual({ ok: true, data: undefined });
    expect(results).toContainEqual(ownerHasProductError);
    await expect(productsOwnedBy(owner.id)).resolves.toHaveLength(1);
  });

  it("gives a slug to one owner when two claim it at once", async () => {
    const [firstOwner, secondOwner] = await Promise.all([
      insertTestUser(),
      insertTestUser(),
    ]);
    const slug = uniqueSlug();
    mocks.getSession
      .mockResolvedValueOnce(sessionFor(firstOwner.id))
      .mockResolvedValueOnce(sessionFor(secondOwner.id));

    const results = await Promise.all([
      createProduct({ name: "First", slug, description: "" }),
      createProduct({ name: "Second", slug, description: "" }),
    ]);

    expect(results).toContainEqual({ ok: true, data: undefined });
    expect(results).toContainEqual(slugTakenError);
    await expect(productsWithSlug(slug)).resolves.toHaveLength(1);
  });

  // A session whose user is gone by the time of the insert: the foreign key
  // refuses the row, and nothing in the action anticipates that.
  it("logs a write it did not anticipate and returns it as UNEXPECTED", async () => {
    mocks.getSession.mockResolvedValueOnce(sessionFor(randomUUID()));

    await expect(
      createProduct({ name: "Orbit CLI", slug: uniqueSlug(), description: "" }),
    ).resolves.toStrictEqual({
      ok: false,
      code: "UNEXPECTED",
      message: "We couldn’t complete your request. Please try again.",
    });
    expect(consoleError).toHaveBeenCalledExactlyOnceWith(
      "createProductAction failed unexpectedly",
      expect.any(Error),
    );
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it("rethrows a Next.js control-flow error raised while reading the session", async () => {
    let redirectError: unknown;
    try {
      navigation.redirect("/sign-in");
    } catch (error) {
      redirectError = error;
    }
    mocks.getSession.mockRejectedValueOnce(redirectError);

    await expect(
      createProduct({ name: "Orbit CLI", slug: uniqueSlug(), description: "" }),
    ).rejects.toBe(redirectError);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
