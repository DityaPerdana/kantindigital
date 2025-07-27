import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserActions } from "./userAction"

interface User {
  userid: string
  username: string
  email: string
  role_id: number
  roles?: { rolename: string }
}

interface UserTableProps {
  users: User[]
  roles: { roleid: number; rolename: string }[]
}

export default function UserTable({ users, roles }: UserTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.userid}>
              <TableCell className="font-mono text-sm">{user.userid}</TableCell>
              <TableCell className="font-medium">{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {user.roles?.rolename || 'Unknown'}
                </Badge>
              </TableCell>
              <TableCell>
                <UserActions
                  userItem={user}
                  roles={roles}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}