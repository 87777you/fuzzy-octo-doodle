import assert from "node:assert/strict";
import { test } from "node:test";
import { createInitialTaskListState, taskListReducer } from "./task-list-state.ts";

type Status = "active" | "success";

test("closing and reopening search clears applied and draft search", () => {
  const opened = taskListReducer(createInitialTaskListState<Status>(), {
    type: "toggle-search-panel",
  });
  const edited = taskListReducer(opened, { type: "draft-search-changed", value: "  walk  " });
  const applied = taskListReducer(edited, { type: "apply-search" });
  const closed = taskListReducer(applied, { type: "toggle-search-panel" });
  const reopened = taskListReducer(closed, { type: "toggle-search-panel" });

  assert.equal(applied.search, "walk");
  assert.equal(closed.search, "");
  assert.equal(closed.draftSearch, "");
  assert.equal(closed.searchOpen, false);
  assert.equal(reopened.searchOpen, true);
  assert.equal(reopened.search, "");
  assert.equal(reopened.draftSearch, "");
});

test("closing status filters clears the selected status but preserves search", () => {
  const searched = taskListReducer(createInitialTaskListState<Status>(), {
    type: "draft-search-changed",
    value: "walk",
  });
  const applied = taskListReducer(searched, { type: "apply-search" });
  const selected = taskListReducer(applied, { type: "select-filter", filter: "success" });
  const closed = taskListReducer(selected, { type: "toggle-filter-panel" });

  assert.equal(selected.filter, "success");
  assert.equal(closed.filter, "all");
  assert.equal(closed.search, "walk");
  assert.equal(closed.filtersOpen, false);

  const reopened = taskListReducer(closed, { type: "toggle-filter-panel" });
  assert.equal(reopened.filter, "all");
  assert.equal(reopened.filtersOpen, true);
});

test("closing either panel preserves the other active criterion until it is closed", () => {
  const opened = taskListReducer(createInitialTaskListState<Status>(), {
    type: "toggle-search-panel",
  });
  const searched = taskListReducer(opened, {
    type: "draft-search-changed",
    value: "walk",
  });
  const applied = taskListReducer(searched, { type: "apply-search" });
  const selected = taskListReducer(applied, { type: "select-filter", filter: "success" });
  const searchClosed = taskListReducer(selected, { type: "toggle-search-panel" });

  assert.equal(searchClosed.search, "");
  assert.equal(searchClosed.filter, "success");

  const filtersClosed = taskListReducer(searchClosed, { type: "toggle-filter-panel" });
  assert.equal(filtersClosed.filter, "all");
  assert.equal(filtersClosed.search, "");
});

test("normal search apply and status switching remain available while panels are open", () => {
  const opened = taskListReducer(createInitialTaskListState<Status>(), {
    type: "toggle-search-panel",
  });
  const edited = taskListReducer(opened, { type: "draft-search-changed", value: " walk " });
  const searched = taskListReducer(edited, { type: "apply-search" });
  const selected = taskListReducer(searched, { type: "select-filter", filter: "success" });

  assert.equal(selected.search, "walk");
  assert.equal(selected.filter, "success");
  assert.equal(selected.searchOpen, true);
  assert.equal(selected.filtersOpen, true);
});
