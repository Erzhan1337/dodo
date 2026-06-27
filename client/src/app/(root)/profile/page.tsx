import type { Metadata } from "next";
import { ProfilePage } from "@/views/profile";

export const metadata: Metadata = {
  title: "Настройки | Dodo Pizza",
};

export default function Profile() {
  return <ProfilePage />;
}
