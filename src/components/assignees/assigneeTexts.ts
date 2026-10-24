/**
 * Every text an assignment UI shows, per kind of assignee. Whole phrases rather than a
 * noun spliced into English templates: Russian declines the noun differently in each.
 */
export interface AssigneeTexts {
  /** Shown when nobody is assigned. */
  empty: string;
  removeTooltip: string;
  removeTitle: string;
  /** Follows the person's name in the remove confirmation. */
  removeConsequence: string;
  searchPlaceholder: string;
  /** While nothing is typed, and when a search finds nothing. */
  searchPrompt: string;
  searchEmpty: string;
}

export const MANAGER_TEXTS: AssigneeTexts = {
  empty: "Менеджеры не назначены.",
  removeTooltip: "Снять менеджера",
  removeTitle: "Снять менеджера?",
  removeConsequence: "больше не будет отвечать за этот город.",
  searchPlaceholder: "Найти менеджера по email или имени…",
  searchPrompt: "Начните вводить, чтобы найти менеджера",
  searchEmpty: "Менеджеры не найдены",
};

export const OWNER_TEXTS: AssigneeTexts = {
  empty: "Владельцы не назначены.",
  removeTooltip: "Снять владельца",
  removeTitle: "Снять владельца?",
  removeConsequence: "больше не сможет управлять скидками этого заведения.",
  searchPlaceholder: "Найти владельца по email или имени…",
  searchPrompt: "Начните вводить, чтобы найти владельца",
  searchEmpty: "Владельцы не найдены",
};
