import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import PeopleIcon from "@mui/icons-material/People";
import StorefrontIcon from "@mui/icons-material/Storefront";
import type { SvgIconComponent } from "@mui/icons-material";
import { hasRole, ROLES, type Role } from "../../auth/roles";

export interface NavItem {
  label: string;
  path: string;
  icon: SvgIconComponent;
  /** Roles that see this entry — the same groups the routes are guarded with. */
  roles: readonly Role[];
}

/** Single source of truth for the sidebar. Adding a resource later is one entry here. */
export const navItems: NavItem[] = [
  { label: "Пользователи", path: "/users", icon: PeopleIcon, roles: ROLES.admin },
  { label: "Города", path: "/cities", icon: LocationCityIcon, roles: ROLES.admin },
  // /v1/manage/* is scoped server-side: a manager sees their cities, an owner their places.
  { label: "Заведения", path: "/places", icon: StorefrontIcon, roles: ROLES.venue },
  { label: "Скидки", path: "/discounts", icon: LocalOfferIcon, roles: ROLES.venue },
];

export function navItemsFor(role: Role | undefined): NavItem[] {
  return navItems.filter((item) => hasRole(role, item.roles));
}
