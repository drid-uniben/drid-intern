"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { useAuthToken } from "@/hooks/useAuth";
import { ChallengeCategory } from "@/types/domain";

export function ChallengeCategoryManager() {
  const token = useAuthToken();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-challenge-categories"],
    queryFn: async () => {
      const result = await apiGet<ChallengeCategory[]>("/challenge-categories/admin", token);
      return result.success && result.data ? result.data : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return apiPost<ChallengeCategory>("/challenge-categories", { name }, token);
    },
    onSuccess: (result) => {
      if (!result.success) {
        setMessage(result.error ?? "Failed to add category");
        return;
      }

      setMessage("Category added successfully.");
      setName("");
      queryClient.invalidateQueries({ queryKey: ["admin-challenge-categories"] });
      queryClient.invalidateQueries({ queryKey: ["challenge-categories"] });
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold">Add Category</h2>
        <form className="mt-4 space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="new-category" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Category name
            </label>
            <input
              id="new-category"
              className="input-glass"
              placeholder="e.g. mobile"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <button className="btn-gradient" type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Adding..." : "Add category"}
          </button>
        </form>
        {message ? (
          <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
            {message}
          </p>
        ) : null}
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold">Existing Categories</h2>
        {isLoading ? (
          <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>No categories yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {categories.map((category) => (
              <li key={category.id} className="rounded-lg px-3 py-2" style={{ background: "var(--badge-bg)" }}>
                {category.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
