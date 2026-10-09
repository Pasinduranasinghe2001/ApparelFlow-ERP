import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const instant = false;

export default async function DashboardRoot() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Redirect to role-specific dashboard
  switch (session.user.role) {
    case "cutting_supervisor":
      redirect("/dashboard/supervisor");
    case "cutting_verifier":
      redirect("/dashboard/verifier");
    case "sewing_supervisor":
      redirect("/dashboard/sewing");
    default:
      return <div>Unauthorized Role</div>;
  }
}
