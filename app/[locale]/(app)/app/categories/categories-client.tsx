"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  safeCreateCategory,
  safeUpdateCategory,
  safeDeleteCategory,
} from "@/lib/actions/safe-categories";

type Category = {
  id: string;
  name: string;
  color: string;
  iconKey: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export function CategoriesClient({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const t = useTranslations();
  const [categories, setCategories] = useState(initialCategories);
  const [searchText, setSearchText] = useState("");
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = searchText
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(searchText.toLowerCase())
      )
    : categories;

  async function handleAdd() {
    setAdding(true);
    try {
      const created = await safeCreateCategory({
        name: t("categories.newCategory"),
        color: "#1890ff",
      });
      setCategories((prev) => [created, ...prev]);
    } catch (error) {
      console.error("Error creating category", error);
    } finally {
      setAdding(false);
    }
  }

  async function handleFieldChange(
    category: Category,
    field: string,
    value: string
  ) {
    setLoadingIds((prev) => [...prev, category.id]);
    try {
      const updated = await safeUpdateCategory(category.id, {
        [field]: value,
      });
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? updated : c))
      );
    } catch (error) {
      console.error("Error updating category", error);
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== category.id));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setLoadingIds((prev) => [...prev, deleteTarget.id]);
    try {
      await safeDeleteCategory(deleteTarget.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    } catch (error) {
      console.error("Error deleting category", error);
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== deleteTarget?.id));
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <Card className="rounded-2xl card-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{t("categories.title")}</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("categories.searchPlaceholder")}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="h-8 w-48 rounded-lg pl-8"
              />
            </div>
            <Button
              size="sm"
              className="h-8 rounded-full"
              onClick={handleAdd}
              disabled={adding}
            >
              {adding ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-1 h-4 w-4" />
              )}
              {t("common.add")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20 text-center">
                  {t("categories.columns.color")}
                </TableHead>
                <TableHead>{t("categories.columns.name")}</TableHead>
                <TableHead className="w-24 text-center">
                  {t("categories.columns.icon")}
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((category) => {
                const isLoading = loadingIds.includes(category.id);
                return (
                  <TableRow key={category.id}>
                    <TableCell className="text-center">
                      <input
                        type="color"
                        value={category.color}
                        disabled={isLoading}
                        onChange={(e) =>
                          handleFieldChange(category, "color", e.target.value)
                        }
                        className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent"
                      />
                    </TableCell>
                    <TableCell>
                      <InlineEdit
                        value={category.name}
                        disabled={isLoading}
                        onSave={(val) =>
                          handleFieldChange(category, "name", val)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {category.iconKey ?? "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {isLoading ? (
                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                      ) : (
                        <button
                          onClick={() => setDeleteTarget(category)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={t("common.delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-muted-foreground"
                  >
                    —
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("categories.actions.deleteConfirmTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("categories.actions.deleteConfirmDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InlineEdit({
  value,
  disabled,
  onSave,
}: {
  value: string;
  disabled: boolean;
  onSave: (val: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <Input
        autoFocus
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (draft.trim() && draft !== value) onSave(draft);
          else setDraft(value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setEditing(false);
            if (draft.trim() && draft !== value) onSave(draft);
            else setDraft(value);
          }
          if (e.key === "Escape") {
            setEditing(false);
            setDraft(value);
          }
        }}
        className="h-7 rounded-md"
      />
    );
  }

  return (
    <span
      onClick={() => !disabled && setEditing(true)}
      className="cursor-pointer rounded px-1 py-0.5 hover:bg-muted"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") !disabled && setEditing(true);
      }}
    >
      {value}
    </span>
  );
}
