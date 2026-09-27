import type { Metadata } from "next";
import { NotificationsView } from "./notifications-view";

export const metadata: Metadata = { title: "Avisos" };

export default function NotificationsPage() {
  return <NotificationsView />;
}
