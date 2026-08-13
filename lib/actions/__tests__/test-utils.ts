import { vi } from "vitest";

type QueryResult = { data?: unknown; error?: unknown };

const CHAIN_METHODS = ["select", "eq", "order", "insert", "update", "delete", "or", "limit"] as const;

export function makeQueryBuilder(result: QueryResult) {
  const chain: Record<string, unknown> = {};

  for (const method of CHAIN_METHODS) {
    chain[method] = vi.fn(() => chain);
  }

  chain.maybeSingle = vi.fn(async () => result);
  chain.single = vi.fn(async () => result);
  chain.then = (
    onFulfilled?: (value: QueryResult) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ) => Promise.resolve(result).then(onFulfilled, onRejected);

  return chain;
}

export function createSupabaseMock() {
  const from = vi.fn();
  const rpc = vi.fn();
  const getUser = vi.fn(async () => ({ data: { user: { id: "user-1" } }, error: null }));

  return {
    from,
    rpc,
    auth: { getUser },
  };
}

export function workspaceFoundBuilder(workspaceId = "workspace-1") {
  return makeQueryBuilder({ data: { id: workspaceId }, error: null });
}

export function workspaceNotFoundBuilder() {
  return makeQueryBuilder({ data: null, error: null });
}
