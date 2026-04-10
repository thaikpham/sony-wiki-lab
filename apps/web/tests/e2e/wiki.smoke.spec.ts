import { expect, test, type Page } from "@playwright/test";

interface ApiResult<T> {
  json: T | null;
  ok: boolean;
  status: number;
}

interface WikiEntityResponse {
  error?: string;
  id?: string;
  ok?: boolean;
}

interface CreateWikiProductInput {
  buyLink: string;
  categoryId: string | null;
  description: string;
  gallery: string[];
  isPublished: boolean;
  mainImage: string;
  name: string;
  priceVnd: number | null;
  shortDescription: string;
  slug: string;
  specGroups: Array<{
    group: string;
    specs: Array<{ label: string; value: string }>;
  }>;
  subcategory: string;
}

const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9pG7n6wAAAAASUVORK5CYII=";

function buildTinyPngFile(name: string) {
  return {
    buffer: Buffer.from(PNG_BASE64, "base64"),
    mimeType: "image/png",
    name,
  };
}

async function apiRequest<T>(
  page: Page,
  input: {
    body?: unknown;
    method: "DELETE" | "GET" | "PATCH" | "POST";
    path: string;
  }
): Promise<ApiResult<T>> {
  return page.evaluate(async ({ body, method, path }) => {
    const response = await fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    return {
      json: (await response.json().catch(() => null)) as T | null,
      ok: response.ok,
      status: response.status,
    };
  }, input);
}

async function expectApiOk<T>(
  page: Page,
  input: {
    body?: unknown;
    method: "DELETE" | "GET" | "PATCH" | "POST";
    path: string;
  }
) {
  const result = await apiRequest<T>(page, input);

  expect(result.ok, JSON.stringify(result.json)).toBeTruthy();
  return result.json;
}

async function loginWikiAdmin(page: Page, password: string) {
  await page.goto("/wiki");

  if (await page.getByRole("button", { name: "Logout Admin" }).isVisible().catch(() => false)) {
    return;
  }

  const adminLoginButton = page.getByRole("button", { name: "Admin Login" });

  if (await adminLoginButton.isVisible().catch(() => false)) {
    await adminLoginButton.click();
    await page.getByLabel("Mật khẩu").fill(password);
    await page.getByRole("button", { name: "Đăng nhập" }).click();
  } else {
    const response = await apiRequest<{ error?: string; ok?: boolean }>(page, {
      method: "POST",
      path: "/api/wiki/admin/verify",
      body: { password },
    });

    expect(response.ok, JSON.stringify(response.json)).toBeTruthy();
    await page.goto("/wiki");
  }

  await expect(page.getByRole("button", { name: "Logout Admin" })).toBeVisible({
    timeout: 10_000,
  });
}

test.describe("wiki production smoke", () => {
  test("supports admin create/edit/publish flow and public runtime coverage", async ({
    page,
  }) => {
    const adminPassword =
      process.env.WIKI_E2E_ADMIN_PASSWORD ?? process.env.WIKI_ADMIN_PASSWORD ?? "";

    test.skip(!adminPassword, "Missing WIKI_ADMIN_PASSWORD for wiki admin smoke.");

    const uniqueToken = `${Date.now()}`;
    const categoryName = `E2E Category ${uniqueToken}`;
    const categorySlug = `e2e-category-${uniqueToken}`;
    const subcategoryName = `E2E Subcategory ${uniqueToken}`;
    const draftProductName = `E2E Draft ${uniqueToken}`;
    const draftProductSlug = `e2e-draft-${uniqueToken}`;
    const primaryProductName = `E2E Primary ${uniqueToken}`;
    const primaryProductSlug = `e2e-primary-${uniqueToken}`;

    let categoryId: string | null = null;
    let draftProductId: string | null = null;
    let primaryProductId: string | null = null;

    try {
      await page.goto("/");
      await page.locator("header").getByRole("button", { name: "Wiki" }).click();
      await expect(page).toHaveURL(/\/wiki$/);

      await loginWikiAdmin(page, adminPassword);

      const createdCategory = await expectApiOk<WikiEntityResponse>(page, {
        method: "POST",
        path: "/api/wiki/categories",
        body: {
          description: "Playwright smoke category for wiki production flow.",
          name: categoryName,
          slug: categorySlug,
        },
      });
      categoryId = createdCategory?.id ?? null;
      expect(categoryId).toBeTruthy();

      const draftProductInput: CreateWikiProductInput = {
        buyLink: "https://example.com/draft-product",
        categoryId,
        description: "Draft product used to verify publish and related products.",
        gallery: [],
        isPublished: false,
        mainImage: "",
        name: draftProductName,
        priceVnd: 12_340_000,
        shortDescription: "Draft product before publish",
        slug: draftProductSlug,
        specGroups: [
          {
            group: "Core",
            specs: [{ label: "Type", value: "Draft smoke product" }],
          },
        ],
        subcategory: subcategoryName,
      };
      const createdDraft = await expectApiOk<WikiEntityResponse>(page, {
        method: "POST",
        path: "/api/wiki/products",
        body: draftProductInput,
      });
      draftProductId = createdDraft?.id ?? null;
      expect(draftProductId).toBeTruthy();

      await page.goto(`/wiki?q=${draftProductSlug}`);
      await expect(
        page.locator("tbody tr", { hasText: draftProductName })
      ).toHaveCount(0);

      await expectApiOk<WikiEntityResponse>(page, {
        method: "PATCH",
        path: `/api/wiki/products/${draftProductId}`,
        body: {
          ...draftProductInput,
          isPublished: true,
        },
      });

      await page.goto(`/wiki?q=${draftProductSlug}`);
      await expect(
        page.locator("tbody tr", { hasText: draftProductName })
      ).toBeVisible();

      await page.goto("/wiki");
      await page.getByRole("button", { name: "Add Product" }).click();

      const createDialog = page.getByRole("dialog", { name: "Tạo sản phẩm mới" });
      await createDialog.getByLabel("Tên sản phẩm").fill(primaryProductName);
      await createDialog.getByLabel("Slug").fill(primaryProductSlug);
      await createDialog.getByLabel("Danh mục").selectOption(categoryId ?? "");
      await createDialog.getByLabel("Subcategory").fill(subcategoryName);
      await createDialog.getByLabel("Price (VND)").fill("56789000");
      await createDialog.getByLabel("Buy link").fill("https://example.com/primary-product");
      await createDialog
        .getByLabel("Mô tả ngắn")
        .fill("Short description created by the Playwright wiki smoke suite.");
      await createDialog
        .getByLabel("Mô tả chi tiết")
        .fill("Detailed description created by Playwright to verify public detail updates.");

      await createDialog
        .locator("label", { hasText: "Upload ảnh chính" })
        .locator('input[type="file"]')
        .setInputFiles(buildTinyPngFile("wiki-main.png"));
      await expect(createDialog.getByAltText("Wiki main preview")).toBeVisible();

      await createDialog
        .locator("label", { hasText: "Upload gallery" })
        .locator('input[type="file"]')
        .setInputFiles([
          buildTinyPngFile("wiki-gallery-1.png"),
          buildTinyPngFile("wiki-gallery-2.png"),
        ]);
      await expect(createDialog.getByText("Image 1")).toBeVisible();

      await createDialog.getByRole("button", { name: "Thêm nhóm spec" }).click();
      await createDialog.getByPlaceholder("Tên nhóm").fill("Imaging");
      await createDialog.getByRole("button", { name: "Thêm spec" }).click();
      await createDialog.getByPlaceholder("Label").fill("Mount");
      await createDialog.getByPlaceholder("Value").fill("Sony E");
      await createDialog.getByRole("button", { name: "Tạo sản phẩm" }).click();

      const primaryRow = page.locator("tbody tr", { hasText: primaryProductName });
      await expect(primaryRow).toBeVisible();

      const adminCatalog = await expectApiOk<{
        products: Array<{ id: string; slug: string }>;
      }>(page, {
        method: "GET",
        path: "/api/wiki/admin/catalog",
      });
      primaryProductId =
        adminCatalog?.products.find((product) => product.slug === primaryProductSlug)?.id ??
        null;

      await page.getByRole("button", { name: categoryName }).click();
      await page.getByRole("button", { name: subcategoryName }).click();
      await expect(primaryRow).toBeVisible();

      const draftRow = page.locator("tbody tr", { hasText: draftProductName });
      await expect(draftRow).toBeVisible();

      await primaryRow.getByRole("button", { name: "So sánh" }).click();
      await draftRow.getByRole("button", { name: "So sánh" }).click();
      await primaryRow.getByRole("button", { name: "Quick View" }).click();
      await expect(page.getByText("Quick View")).toBeVisible();
      await page.getByRole("button", { name: "Đóng" }).first().click();
      await page.getByRole("button", { name: /So sánh \(2\)/ }).click();
      await expect(page.getByRole("heading", { name: "So sánh sản phẩm" })).toBeVisible();
      await page.getByRole("button", { name: "Đóng" }).first().click();

      await page.getByPlaceholder("Tìm theo tên, slug, mô tả...").fill("primary");
      await expect(primaryRow).toBeVisible();
      await expect(draftRow).toHaveCount(0);
      await page.getByPlaceholder("Tìm theo tên, slug, mô tả...").fill("");
      await expect(draftRow).toBeVisible();

      await primaryRow.getByRole("button", { name: "Edit" }).click();
      const editDialog = page.getByRole("dialog", { name: "Chỉnh sửa sản phẩm" });
      await editDialog
        .getByLabel("Mô tả ngắn")
        .fill("Updated short description after the product edit smoke step.");
      await editDialog.getByRole("button", { name: "Lưu thay đổi" }).click();

      await primaryRow.getByRole("link", { name: "Detail" }).click();
      await expect(page).toHaveURL(new RegExp(`/wiki/${primaryProductSlug}$`));
      await expect(
        page.getByText("Updated short description after the product edit smoke step.")
      ).toBeVisible();
      await expect(page.getByRole("heading", { name: "Gallery" })).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Các sản phẩm liên quan" })
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: new RegExp(draftProductName) })
      ).toBeVisible();

      await page.goto("/");
      await page
        .getByPlaceholder("Tìm kiếm tất cả thông tin...")
        .fill(categoryName.slice(0, 20));
      await page.getByRole("button", { name: new RegExp(categoryName) }).first().click();
      await expect(page).toHaveURL(new RegExp(`/wiki\\?category=${categorySlug}`));

      await page.goto("/");
      await page
        .getByPlaceholder("Tìm kiếm tất cả thông tin...")
        .fill(primaryProductName.slice(0, 20));
      await page.getByRole("button", { name: new RegExp(primaryProductName) }).first().click();
      await expect(page).toHaveURL(new RegExp(`/wiki/${primaryProductSlug}$`));

      await page.goto("/wiki");
      await page.getByRole("button", { name: "Logout Admin" }).click();
      await expect(page.getByRole("button", { name: "Admin Login" })).toBeVisible();
    } finally {
      await page.goto("/wiki").catch(() => null);

      if (await page.getByRole("button", { name: "Admin Login" }).isVisible().catch(() => false)) {
        await loginWikiAdmin(page, adminPassword);
      }

      if (primaryProductId) {
        await apiRequest<WikiEntityResponse>(page, {
          method: "DELETE",
          path: `/api/wiki/products/${primaryProductId}`,
        });
      }

      if (draftProductId) {
        await apiRequest<WikiEntityResponse>(page, {
          method: "DELETE",
          path: `/api/wiki/products/${draftProductId}`,
        });
      }

      if (categoryId) {
        await apiRequest<WikiEntityResponse>(page, {
          method: "DELETE",
          path: `/api/wiki/categories/${categoryId}`,
        });
      }
    }
  });
});
