import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "home"
  | "layers"
  | "arrowRight"
  | "arrowLeft"
  | "arrowDown"
  | "check"
  | "chevronDown"
  | "chevronRight"
  | "search"
  | "book"
  | "bell"
  | "externalLink"
  | "filter"
  | "user"
  | "calendar"
  | "building"
  | "close"
  | "plus"
  | "button"
  | "tag"
  | "panel"
  | "spark"
  | "eye"
  | "cursor"
  | "clipboard"
  | "document"
  | "branch"
  | "history"
  | "alertCircle"
  | "checkCircle"
  | "chart"
  | "link"
  | "refresh"
  | "more"
  | "lock"
  | "trendDown"
  | "trendUp"
  | "clock"
  | "shield"
  | "users"
  | "scale"
  | "calculator"
  | "fileCheck"
  | "command"
  | "send"
  | "copy"
  | "thumbUp"
  | "thumbDown"
  | "atSign"
  | "bookmark"
  | "grip"
  | "help";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  name: IconName;
  size?: "xs" | "sm" | "md";
};

const paths: Record<IconName, ReactNode> = {
  home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-7h6v7" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
  arrowRight: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
  arrowLeft: <><path d="M19 12H5M10 7l-5 5 5 5" /></>,
  arrowDown: <><path d="M12 5v14M7 14l5 5 5-5" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevronDown: <path d="m7 9 5 5 5-5" />,
  chevronRight: <path d="m9 7 5 5-5 5" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5Z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5Z" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  externalLink: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" /></>,
  filter: <><path d="M4 7h16M7 12h10M10 17h4" /></>,
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></>,
  building: <><path d="M4 21V7l8-4 8 4v14M8 10h1M8 14h1M15 10h1M15 14h1M10 21v-4h4v4" /></>,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  button: <><rect x="3" y="6" width="18" height="12" rx="6" /><path d="M9 12h6" /></>,
  tag: <><path d="M20 13 13 20 4 11V4h7l9 9Z" /><circle cx="8.5" cy="8.5" r="1" /></>,
  panel: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /></>,
  spark: <><path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3Z" /><path d="m18.5 15 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" /></>,
  eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
  cursor: <path d="m5 3 13 8-6 1-3 6-4-15Z" />,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5V3h6v1.5M9 9h6M9 13h6M9 17h4" /></>,
  document: <><path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" /><path d="M14 3.5V8h4M8 12h8M8 16h6" /></>,
  branch: <><circle cx="6" cy="5" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="6" cy="19" r="2" /><path d="M6 7v10M8 10h4a6 6 0 0 0 6-2" /></>,
  history: <><path d="M4 7v5h5" /><path d="M5.5 8.5A8 8 0 1 1 4 14" /><path d="M12 8v5l3 2" /></>,
  alertCircle: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 17h.01" /></>,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1" /></>,
  refresh: <><path d="M20 7v5h-5" /><path d="M4 17v-5h5" /><path d="M6.1 8.5A7 7 0 0 1 18 7l2 5M4 12l2 5a7 7 0 0 0 11.9-1.5" /></>,
  more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  trendDown: <><path d="m4 7 6 6 4-4 6 6" /><path d="M15 15h5v-5" /></>,
  trendUp: <><path d="m4 17 6-6 4 4 6-6" /><path d="M15 9h5v5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  shield: <><path d="M12 3 20 6v5c0 5-3.2 8.5-8 10-4.8-1.5-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><circle cx="17" cy="9" r="2.5" /><path d="M15.5 14.5A4.5 4.5 0 0 1 21 19" /></>,
  scale: <><path d="M12 3v18M6 5h12M5 5 2.5 11h5L5 5ZM19 5l-2.5 6h5L19 5Z" /><path d="M3 11a2 2 0 0 0 4 0M17 11a2 2 0 0 0 4 0M8 21h8" /></>,
  calculator: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8v3H8zM8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" /></>,
  fileCheck: <><path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" /><path d="M14 3.5V8h4m-9 6 2 2 4-5" /></>,
  command: <><path d="m5 8 4 4-4 4" /><path d="M11 16h7" /></>,
  send: <><path d="M12 19V5" /><path d="m6.5 10.5 5.5-5.5 5.5 5.5" /></>,
  copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  thumbUp: <><path d="M7 10v10H4V10h3Z" /><path d="M7 19h9.4a2 2 0 0 0 2-1.7l1-6A2 2 0 0 0 17.4 9H14l.5-3A2.5 2.5 0 0 0 12 3.5L7 10v9Z" /></>,
  thumbDown: <><path d="M7 14V4H4v10h3Z" /><path d="M7 5h9.4a2 2 0 0 1 2 1.7l1 6a2 2 0 0 1-2 2.3H14l.5 3A2.5 2.5 0 0 1 12 20.5L7 14V5Z" /></>,
  atSign: <><circle cx="12" cy="12" r="8.5" /><path d="M15.5 15.5V9.5a3.5 3.5 0 1 0 0 5.2c1.7 1.1 3.5 0 3.5-2.2V12" /></>,
  bookmark: <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.8L6 21V4.5Z" />,
  grip: <><circle cx="9" cy="7" r=".8" fill="currentColor" stroke="none" /><circle cx="15" cy="7" r=".8" fill="currentColor" stroke="none" /><circle cx="9" cy="12" r=".8" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r=".8" fill="currentColor" stroke="none" /><circle cx="9" cy="17" r=".8" fill="currentColor" stroke="none" /><circle cx="15" cy="17" r=".8" fill="currentColor" stroke="none" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.4 2.4 0 1 1 3.2 2.3c-.7.3-1 1-1 1.7M12 17h.01" /></>,
};

export function Icon({ name, size = "md", ...props }: IconProps) {
  const dimension = size === "xs" ? 10 : size === "sm" ? 18 : 20;

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
