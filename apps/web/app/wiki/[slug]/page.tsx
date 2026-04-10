import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import WikiProductImage from "@/components/wiki/WikiProductImage";
import WikiSpecGroups from "@/components/wiki/WikiSpecGroups";
import { withTimeout } from "@/lib/utils/with-timeout";
import {
  formatWikiPrice,
  formatWikiUpdatedAt,
} from "@/lib/wiki/presentation";
import {
  getCachedPublishedWikiProductDetailPageData,
  PUBLIC_WIKI_DATA_TIMEOUT_MS,
} from "@/lib/wiki/queries";

export async function generateMetadata({
  params,
}: PageProps<"/wiki/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const pageData = await withTimeout(
    getCachedPublishedWikiProductDetailPageData(slug),
    PUBLIC_WIKI_DATA_TIMEOUT_MS,
    "Wiki detail metadata timed out."
  ).catch(() => null);
  const product = pageData?.product ?? null;

  return {
    title: product ? `${product.name} — Wiki sản phẩm` : `${slug} — Wiki sản phẩm`,
    description:
      product?.shortDescription ?? "Thông tin chi tiết sản phẩm Sony",
  };
}

export default async function WikiProductDetailPage({
  params,
}: PageProps<"/wiki/[slug]">) {
  const { slug } = await params;
  const pageData = await withTimeout(
    getCachedPublishedWikiProductDetailPageData(slug),
    PUBLIC_WIKI_DATA_TIMEOUT_MS,
    "Wiki detail page timed out."
  ).catch(() => null);

  if (!pageData) {
    notFound();
  }

  const { product, relatedProducts } = pageData;

  return (
    <article className="space-y-8 py-8">
      <header className="space-y-3 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
            Wiki sản phẩm
          </p>
          {product.category ? (
            <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)]">
              {product.category.name}
            </span>
          ) : null}
          {product.subcategory ? (
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-alt)] px-2.5 py-1 text-[11px] text-[var(--muted-foreground)]">
              {product.subcategory}
            </span>
          ) : null}
        </div>
        <h1 className="max-w-4xl text-3xl font-bold text-[var(--foreground)] lg:text-5xl">
          {product.name}
        </h1>
        <p className="max-w-3xl text-sm text-[var(--text-secondary)] lg:text-base">
          {product.shortDescription ?? "Chưa có mô tả ngắn cho sản phẩm này."}
        </p>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Giá tham khảo
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--primary)]">
              {formatWikiPrice(product.priceVnd)}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Cập nhật gần nhất
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
              {formatWikiUpdatedAt(product.updatedAt)}
            </p>
          </div>
        </div>
        {product.buyLink ? (
          <a
            href={product.buyLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
          >
            Buy Link
          </a>
        ) : null}
      </header>

      {product.mainImage ? (
        <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <WikiProductImage
            alt={`Hình minh họa cho ${product.name}`}
            className="aspect-[21/8] w-full"
            priority
            sizes="100vw"
            src={product.mainImage}
          />
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
        <div className="space-y-6">
          {product.description ? (
            <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">Mô tả</h2>
              <p className="max-w-3xl whitespace-pre-wrap text-sm leading-7 text-[var(--text-secondary)] lg:text-base">
                {product.description}
              </p>
            </section>
          ) : null}

          {product.gallery.length > 0 ? (
            <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
                Gallery
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {product.gallery.map((imageUrl, index) => (
                  <WikiProductImage
                    key={imageUrl}
                    alt={`Gallery image for ${product.name}`}
                    className={`rounded-[1.5rem] border border-[var(--border-subtle)] ${
                      index % 5 === 0
                        ? "aspect-[4/5] sm:col-span-2 2xl:col-span-1"
                        : index % 3 === 0
                          ? "aspect-[5/4]"
                          : "aspect-[4/3]"
                    }`}
                    sizes="(min-width: 1536px) 20vw, (min-width: 640px) 45vw, 100vw"
                    src={imageUrl}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm xl:sticky xl:top-24 xl:h-fit">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Thông số kỹ thuật
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Bảng specs đã được mở rộng để tận dụng chiều ngang trên desktop.
              </p>
            </div>
            <span className="rounded-full bg-[var(--surface-alt)] px-3 py-1 text-xs text-[var(--muted-foreground)]">
              {product.specCount} specs
            </span>
          </div>
          <WikiSpecGroups groups={product.specGroups} />
        </section>
      </div>

      {relatedProducts.length > 0 ? (
        <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Related Products
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                Các sản phẩm liên quan
              </h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Ưu tiên cùng subcategory, sau đó đến cùng category.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/wiki/${relatedProduct.slug}`}
                className="group rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-alt)] p-4 transition-colors hover:border-[var(--ring)] hover:bg-[var(--surface)]"
              >
                <WikiProductImage
                  alt={`Hình minh họa cho ${relatedProduct.name}`}
                  className="aspect-[4/3] rounded-[1.25rem]"
                  sizes="(min-width: 1280px) 20vw, (min-width: 768px) 40vw, 100vw"
                  src={relatedProduct.mainImage}
                />
                <div className="mt-4 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {relatedProduct.category ? (
                      <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)]">
                        {relatedProduct.category.name}
                      </span>
                    ) : null}
                    {relatedProduct.subcategory ? (
                      <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[11px] text-[var(--muted-foreground)]">
                        {relatedProduct.subcategory}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-base font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                    {relatedProduct.name}
                  </h3>
                  <p className="line-clamp-2 text-sm text-[var(--text-secondary)]">
                    {relatedProduct.shortDescription ?? "Sản phẩm liên quan trong cùng hệ catalog."}
                  </p>
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="text-sm font-semibold text-[var(--primary)]">
                      {formatWikiPrice(relatedProduct.priceVnd)}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {relatedProduct.specCount} specs
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
