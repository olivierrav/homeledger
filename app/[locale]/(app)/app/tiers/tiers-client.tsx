"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  safeCreateTier,
  safeUpdateTier,
  safeDeleteTier,
} from "@/lib/actions/safe-tiers";

type Tier = {
  id: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

type Category = {
  id: string;
  name: string;
  color: string;
  iconKey: string | null;
};

export function TiersClient({
  initialTiers,
  categories,
}: {
  initialTiers: Tier[];
  categories: Category[];
}) {
  const t = useTranslations();
  const [tiers, setTiers] = useState(initialTiers);
  const [searchText, setSearchText] = useState("");
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Tier | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = searchText
    ? tiers.filter(
        (tier) =>
          tier.name.toLowerCase().includes(searchText.toLowerCase()) ||
          tier.description?.toLowerCase().includes(searchText.toLowerCase())
      )
    : tiers;

  async function handleAdd() {
    setAdding(true);
    try {
      const created = await safeCreateTier({
        name: t("tiers.newTier"),
      });
      setTiers((prev) => [created, ...prev]);
    } catch (error) {
      console.error("Error creating tier", error);
    } finally {
      setAdding(false);
    }
  }

  async function handleFieldChange(
    tier: Tier,
    field: string,
    value: string | null
  ) {
    setLoadingIds((prev) => [...prev, tier.id]);
    try {
      const updated = await safeUpdateTier(tier.id, { [field]: value });
      setTiers((prev) => prev.map((t) => (t.id === tier.id ? updated : t)));
    } catch (error) {
      console.error("Error updating tier", error);
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== tier.id));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setLoadingIds((prev) => [...prev, deleteTarget.id]);
    try {
      await safeDeleteTier(deleteTarget.id);
      setTiers((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    } catch (error) {
      console.error("Error deleting tier", error);
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== deleteTarget?.id));
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <Card className="rounded-2xl card-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{t("tiers.title")}</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("tiers.searchPlaceholder")}
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
                <TableHead>{t("tiers.columns.name")}</TableHead>
                <TableHead>{t("tiers.columns.description")}</TableHead>
                <TableHead className="w-48">
                  {t("tiers.columns.defaultCategory")}
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tier) => {
                const isLoading = loadingIds.includes(tier.id);
                return (
                  <TableRow key={tier.id}>
                    <TableCell>
                      <InlineEdit
                        value={tier.name}
                        disabled={isLoading}
                        onSave={(val) => handleFieldChange(tier, "name", val)}
                      />
                    </TableCell>
                    <TableCell>
                      <InlineEdit
                        value={tier.description ?? ""}
                        disabled={isLoading}
                        placeholder="—"
                        onSave={(val) =>
                          handleFieldChange(
                            tier,
                            "description",
                            val || null
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={tier.categoryId ?? "none"}
                        disabled={isLoading}
                        onValueChange={(val) =>
                          handleFieldChange(
                            tier,
                            "categoryId",
                            val === "none" ? null : val
                          )
                        }
                      >
                        <SelectTrigger className="h-7 rounded-md">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">—</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              <span className="flex items-center gap-2">
                                <span
                                  className="inline-block h-3 w-3 rounded-full"
                                  style={{ backgroundColor: cat.color }}
                                />
                                {cat.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center">
                      {isLoading ? (
                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                      ) : (
                        <button
                          onClick={() => setDeleteTarget(tier)}
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
              {t("tiers.actions.deleteConfirmTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("tiers.actions.deleteConfirmDescription")}
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
  placeholder,
  onSave,
}: {
  value: string;
  disabled: boolean;
  placeholder?: string;
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
          if (draft !== value) onSave(draft);
          else setDraft(value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setEditing(false);
            if (draft !== value) onSave(draft);
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
      {value || (
        <span className="text-muted-foreground">{placeholder ?? "—"}</span>
      )}
    </span>
  );
}
