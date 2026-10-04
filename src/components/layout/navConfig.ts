import LocationCityIcon from "@mui/icons-material/LocationCity";
import PeopleIcon from "@mui/icons-material/People";
import StorefrontIcon from "@mui/icons-material/Storefront";
import type { SvgIconComponent } from "@mui/icons-material";

export interface NavItem {
  label: string;
  path: string;
  icon: SvgIconComponent;
  adminOnly?: boolean;
}

/** Single source of truth for the sidebar. Adding a resource later is one entry here. */
export const navItems: NavItem[] = [
  { label: "Users", path: "/users", icon: PeopleIcon },
  { label: "Cities", path: "/cities", icon: LocationCityIcon, adminOnly: true },
  // Not adminOnly: /v1/manage/places is open to managers, scoped to their own cities.
  { label: "Places", path: "/places", icon: StorefrontIcon },
];
