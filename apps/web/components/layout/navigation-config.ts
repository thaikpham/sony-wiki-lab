export interface NavigationItem {
  label: string;
  href: "/wiki" | "/color-lab";
  icon: "wiki" | "color-lab";
}

export const navigationItems: NavigationItem[] = [
  {
    label: "Wiki",
    href: "/wiki",
    icon: "wiki",
  },
  {
    label: "Color Lab",
    href: "/color-lab",
    icon: "color-lab",
  },
];
