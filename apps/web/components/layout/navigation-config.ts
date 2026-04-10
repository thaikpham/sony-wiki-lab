export interface NavigationItem {
  label: string;
  href: "/wiki" | "/color-lab" | "/livestream" | "/photobooth";
  icon: "wiki" | "color-lab" | "livestream" | "photobooth";
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
  {
    label: "Livestream",
    href: "/livestream",
    icon: "livestream",
  },
  {
    label: "Photobooth",
    href: "/photobooth",
    icon: "photobooth",
  },
];
