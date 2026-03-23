"use client";

import { useEffect, useState } from "react";
import {
  adminCreateUser,
  adminDeleteUser,
  adminGetUsers,
  adminResetUserPassword,
  adminUpdateUserStatus,
} from "@/lib/api";
import { AdminUser } from "@/lib/types";
import { useLocale } from "@/lib/use-locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminUsersPage() {
  const locale = useLocale();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "ADMIN" as "ADMIN" | "SUPER_ADMIN" });

  const load = async () => {
    try {
      const data = await adminGetUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load users");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{locale === "zh" ? "管理员管理" : "Admin Users"}</h1>

      <form
        className="grid grid-cols-1 gap-3 rounded border p-4 md:grid-cols-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          try {
            await adminCreateUser(form);
            setForm({ username: "", email: "", password: "", role: "ADMIN" });
            await load();
          } catch (err: any) {
            setError(err?.message || "Failed to create user");
          }
        }}
      >
        <Input placeholder="Username" value={form.username} onChange={(e) => setForm((v) => ({ ...v, username: e.target.value }))} required />
        <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))} required />
        <Input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))} required />
        <select className="h-10 rounded border px-3" value={form.role} onChange={(e) => setForm((v) => ({ ...v, role: e.target.value as any }))}>
          <option value="ADMIN">ADMIN</option>
          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
        </select>
        <Button>Add</Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="rounded border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left">
              <th className="px-3 py-2">Username</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="px-3 py-2">{user.username}</td>
                <td className="px-3 py-2">{user.email}</td>
                <td className="px-3 py-2">{user.role}</td>
                <td className="px-3 py-2">{user.isActive ? "Active" : "Disabled"}</td>
                <td className="space-x-2 px-3 py-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await adminUpdateUserStatus(user.id, !user.isActive);
                      await load();
                    }}
                  >
                    {user.isActive ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const newPassword = window.prompt("New password", "");
                      if (!newPassword) return;
                      await adminResetUserPassword(user.id, newPassword);
                    }}
                  >
                    Reset Password
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      if (!window.confirm("Delete this admin user?")) return;
                      await adminDeleteUser(user.id);
                      await load();
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-muted-foreground" colSpan={5}>
                  No admin users
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
