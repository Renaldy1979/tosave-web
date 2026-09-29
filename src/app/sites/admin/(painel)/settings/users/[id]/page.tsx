import type { Metadata } from "next";
import { UserDetailLoader } from "../../user-detail-loader";

export const metadata: Metadata = { title: "Usuário" };

export default async function UserDetailPage({ params }: PageProps<"/sites/admin/settings/users/[id]">) {
  const { id } = await params;
  return <UserDetailLoader key={id} userId={id} />;
}
