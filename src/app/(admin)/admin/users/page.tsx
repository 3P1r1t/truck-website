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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminMessage } from "@/components/admin/AdminMessageProvider";

type CreateForm = {
  username: string;
  email: string;
  password: string;
  role: "ADMIN" | "SUPER_ADMIN";
};

export default function AdminUsersPage() {
  const locale = useLocale("zh");
  const { pushMessage } = useAdminMessage();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>({
    username: "",
    email: "",
    password: "",
    role: "ADMIN",
  });

  const [manageTarget, setManageTarget] = useState<AdminUser | null>(null);
  const [manageSubmitting, setManageSubmitting] = useState(false);
  const [manageActive, setManageActive] = useState(true);
  const [managePassword, setManagePassword] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminGetUsers();
      setUsers(data);
      setError("");
    } catch (err: any) {
      const message = err?.message || (locale === "zh" ? "加载失败" : "Failed to load users");
      setError(message);
      pushMessage(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{locale === "zh" ? "管理员管理" : "Admin Users"}</h1>
        <Button
          onClick={() => {
            setCreateForm({ username: "", email: "", password: "", role: "ADMIN" });
            setCreateOpen(true);
          }}
        >
          {locale === "zh" ? "新增管理员" : "New Admin"}
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="rounded border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left">
              <th className="px-3 py-2">{locale === "zh" ? "用户名" : "Username"}</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">{locale === "zh" ? "角色" : "Role"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "状态" : "Status"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "操作" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="px-3 py-2">{user.username}</td>
                <td className="px-3 py-2">{user.email}</td>
                <td className="px-3 py-2">{user.role}</td>
                <td className="px-3 py-2">{user.isActive ? (locale === "zh" ? "启用" : "Active") : (locale === "zh" ? "停用" : "Disabled")}</td>
                <td className="space-x-2 px-3 py-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setManageTarget(user);
                      setManageActive(user.isActive);
                      setManagePassword("");
                    }}
                  >
                    {locale === "zh" ? "管理" : "Manage"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(user)}>
                    {locale === "zh" ? "删除" : "Delete"}
                  </Button>
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-muted-foreground" colSpan={5}>
                  {locale === "zh" ? "暂无管理员" : "No admin users"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={createOpen} onOpenChange={(next) => !next && setCreateOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === "zh" ? "新增管理员" : "Create Admin"}</DialogTitle>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setCreateSubmitting(true);
              setError("");
              try {
                await adminCreateUser(createForm);
                setCreateOpen(false);
                await load();
                pushMessage(locale === "zh" ? "管理员创建成功" : "Admin created successfully", "success");
              } catch (err: any) {
                const message = err?.message || (locale === "zh" ? "创建失败" : "Failed to create user");
                setError(message);
                pushMessage(message, "error");
              } finally {
                setCreateSubmitting(false);
              }
            }}
          >
            <div className="space-y-1">
              <label className="text-sm font-medium">{locale === "zh" ? "用户名" : "Username"}</label>
              <Input
                required
                value={createForm.username}
                onChange={(e) => setCreateForm((old) => ({ ...old, username: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <Input
                required
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm((old) => ({ ...old, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{locale === "zh" ? "初始密码" : "Initial Password"}</label>
              <Input
                required
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm((old) => ({ ...old, password: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{locale === "zh" ? "角色" : "Role"}</label>
              <select
                className="h-10 w-full rounded border px-3"
                value={createForm.role}
                onChange={(e) => setCreateForm((old) => ({ ...old, role: e.target.value as CreateForm["role"] }))}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button disabled={createSubmitting}>{createSubmitting ? (locale === "zh" ? "创建中..." : "Creating...") : (locale === "zh" ? "确定" : "Create")}</Button>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                {locale === "zh" ? "取消" : "Cancel"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(manageTarget)} onOpenChange={(next) => !next && setManageTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === "zh" ? "管理员设置" : "Admin Settings"}</DialogTitle>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!manageTarget) return;
              setManageSubmitting(true);
              setError("");
              try {
                await adminUpdateUserStatus(manageTarget.id, manageActive);
                if (managePassword.trim()) {
                  await adminResetUserPassword(manageTarget.id, managePassword.trim());
                }
                setManageTarget(null);
                await load();
                pushMessage(locale === "zh" ? "管理员更新成功" : "Admin updated successfully", "success");
              } catch (err: any) {
                const message = err?.message || (locale === "zh" ? "保存失败" : "Failed to save user");
                setError(message);
                pushMessage(message, "error");
              } finally {
                setManageSubmitting(false);
              }
            }}
          >
            <div className="space-y-1">
              <label className="text-sm font-medium">{locale === "zh" ? "状态" : "Status"}</label>
              <select
                className="h-10 w-full rounded border px-3"
                value={manageActive ? "active" : "disabled"}
                onChange={(e) => setManageActive(e.target.value === "active")}
              >
                <option value="active">{locale === "zh" ? "启用" : "Active"}</option>
                <option value="disabled">{locale === "zh" ? "停用" : "Disabled"}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{locale === "zh" ? "重置密码(可选)" : "Reset Password (Optional)"}</label>
              <Input
                type="password"
                value={managePassword}
                onChange={(e) => setManagePassword(e.target.value)}
                placeholder={locale === "zh" ? "留空则不修改" : "Leave blank to keep unchanged"}
              />
            </div>

            <div className="flex gap-2">
              <Button disabled={manageSubmitting}>{manageSubmitting ? (locale === "zh" ? "保存中..." : "Saving...") : (locale === "zh" ? "保存" : "Save")}</Button>
              <Button type="button" variant="outline" onClick={() => setManageTarget(null)}>
                {locale === "zh" ? "取消" : "Cancel"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => !next && setDeleteTarget(null)}
        title={locale === "zh" ? "删除管理员" : "Delete Admin"}
        description={locale === "zh" ? "确认删除该管理员？此操作不可恢复。" : "Are you sure to delete this admin user? This action cannot be undone."}
        confirmText={locale === "zh" ? "确认删除" : "Delete"}
        cancelText={locale === "zh" ? "取消" : "Cancel"}
        loading={deleteSubmitting}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleteSubmitting(true);
          try {
            await adminDeleteUser(deleteTarget.id);
            setDeleteTarget(null);
            await load();
            pushMessage(locale === "zh" ? "管理员删除成功" : "Admin deleted successfully", "success");
          } catch (err: any) {
            pushMessage(err?.message || (locale === "zh" ? "删除失败" : "Delete failed"), "error");
          } finally {
            setDeleteSubmitting(false);
          }
        }}
      />
    </div>
  );
}
