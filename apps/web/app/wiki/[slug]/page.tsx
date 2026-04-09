import { notFound } from "next/navigation";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

interface WikiProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: WikiProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug} — Wiki sản phẩm`,
    description: "Thông tin chi tiết sản phẩm Sony",
  };
}

export default async function WikiProductDetailPage({
  params,
}: WikiProductDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("wiki_products")
    .select("id,name,slug,short_description,description,specs,is_published,updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !product || !product.is_published) {
    notFound();
  }

  const specs =
    product.specs && typeof product.specs === "object" && !Array.isArray(product.specs)
      ? Object.entries(product.specs as Record<string, string | number | boolean>)
      : [];

  return (
    <article className="mx-auto max-w-4xl space-y-6 py-8">
      <header className="space-y-2 border-b border-[var(--border)] pb-6">
        <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
          Wiki sản phẩm
        </p>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">{product.name}</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {product.short_description ?? "Chưa có mô tả ngắn cho sản phẩm này."}
        </p>
      </header>

      {product.description ? (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">Mô tả</h2>
          <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--text-secondary)]">
            {product.description}
          </p>
        </section>
      ) : null}

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">
          Thông số kỹ thuật
        </h2>
        {specs.length > 0 ? (
          <dl className="space-y-2">
            {specs.map(([key, value]) => (
              <div key={key} className="grid grid-cols-1 gap-1 border-b border-[var(--border-subtle)] py-2 sm:grid-cols-[180px_1fr]">
                <dt className="text-sm font-medium text-[var(--foreground)]">{key}</dt>
                <dd className="text-sm text-[var(--text-secondary)]">{String(value)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">
            Chưa có thông số kỹ thuật cho sản phẩm này.
          </p>
        )}
      </section>
    </article>
  );
}
