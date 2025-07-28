import { createClient } from "@/utils/supabase/server";
import UserTable from "@/components/dashboard/userTable";
import { UserModal } from "@/components/dashboard/userModal";

export default async function Page() {
  const supabase = await createClient();
  
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("*, roles(rolename)");

  if (usersError) {
    return <div>Error loading users: {usersError.message}</div>
  }

  const { data: roles, error: rolesError } = await supabase
    .from("roles")  
    .select("roleid, rolename");

  if (rolesError) {
    return <div>Error loading roles: {rolesError.message}</div>
  }

  return (
    <div className="w-full p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage system users and their roles</p>
        </div>
        <UserModal
          mode="create"
          roles={roles || []}
        />
      </div>
      
      <div className="mt-4">
        <UserTable users={users ?? []} roles={roles || []} />
      </div>
    </div>
  );
}