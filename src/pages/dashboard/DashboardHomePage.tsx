import { useAuthSession } from "../../hooks/useAuthSession";
import { displayNameFromAuthUser } from "../../lib/userDisplay";
export function DashboardHomePage() {
  const { user } = useAuthSession();

  const name = displayNameFromAuthUser(null, user);

  return (
    <>
      <h1 className="text-headline-lg text-slate-dark">Projects</h1>
      <p className="mt-3 text-body-md text-slate-medium">
        Welcome back,{" "}
        <span className="font-semibold text-slate-dark">{name}</span>.
      </p>
    </>
  );
}
