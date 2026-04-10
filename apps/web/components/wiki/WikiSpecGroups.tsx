import type { WikiSpecGroup } from "@/types/wiki";

interface WikiSpecGroupsProps {
  groups: WikiSpecGroup[];
}

export default function WikiSpecGroups({ groups }: WikiSpecGroupsProps) {
  if (groups.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-foreground)]">
        Chưa có thông số kỹ thuật cho sản phẩm này.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <section
          key={group.group}
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-alt)] p-4"
        >
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--foreground)]">
            {group.group}
          </h3>
          <dl className="space-y-2">
            {group.specs.map((spec) => (
              <div
                key={`${group.group}-${spec.label}`}
                className="grid grid-cols-1 gap-1 border-b border-[var(--border-subtle)] py-2 last:border-b-0 sm:grid-cols-[180px_1fr]"
              >
                <dt className="text-sm font-medium text-[var(--foreground)]">
                  {spec.label}
                </dt>
                <dd className="text-sm text-[var(--text-secondary)]">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
