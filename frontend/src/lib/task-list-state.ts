export type TaskListFilter<Status extends string> = "all" | Status;

export interface TaskListState<Status extends string> {
  draftSearch: string;
  search: string;
  searchOpen: boolean;
  filtersOpen: boolean;
  filter: TaskListFilter<Status>;
}

export type TaskListAction<Status extends string> =
  | { type: "toggle-search-panel" }
  | { type: "toggle-filter-panel" }
  | { type: "draft-search-changed"; value: string }
  | { type: "apply-search" }
  | { type: "clear-search" }
  | { type: "select-filter"; filter: TaskListFilter<Status> }
  | { type: "change-view" };

export function createInitialTaskListState<Status extends string>(): TaskListState<Status> {
  return {
    draftSearch: "",
    search: "",
    searchOpen: false,
    filtersOpen: true,
    filter: "all",
  };
}

export function taskListReducer<Status extends string>(
  state: TaskListState<Status>,
  action: TaskListAction<Status>,
): TaskListState<Status> {
  switch (action.type) {
    case "toggle-search-panel":
      return state.searchOpen
        ? { ...state, searchOpen: false, draftSearch: "", search: "" }
        : { ...state, searchOpen: true };
    case "toggle-filter-panel":
      return state.filtersOpen
        ? { ...state, filtersOpen: false, filter: "all" }
        : { ...state, filtersOpen: true };
    case "draft-search-changed":
      return { ...state, draftSearch: action.value };
    case "apply-search":
      return { ...state, search: state.draftSearch.trim() };
    case "clear-search":
      return { ...state, draftSearch: "", search: "" };
    case "select-filter":
      return { ...state, filter: action.filter };
    case "change-view":
      return { ...state, filter: "all" };
  }
}
