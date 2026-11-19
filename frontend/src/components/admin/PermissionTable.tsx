import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildPermissionTable } from "@/lib/admin-permission-table";

export function PermissionTable() {
  const rows = buildPermissionTable();

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        [VERIFY] with client — derived from the same permission rules the admin UI enforces (lib/admin-permissions.ts).
        The real backend must re-check every one of these server-side; nothing here is a security boundary on its own.
      </p>
      <div className="overflow-hidden rounded-xl ring-1 ring-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Reviewer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.action}>
                <TableCell className="font-medium text-foreground">{row.action}</TableCell>
                <TableCell>{row.admin}</TableCell>
                <TableCell>{row.staff}</TableCell>
                <TableCell>{row.reviewer}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
