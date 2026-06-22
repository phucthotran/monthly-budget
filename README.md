# Dự chi hàng tháng (Monthly budget)

Ứng dụng web dạng **PWA** dùng để quản lý **dự chi**, **thu nhập theo kỳ**, **chi thực tế** và **tiết kiệm** bằng **VND**. Dữ liệu được lưu trên **Firebase** (Firestore + Authentication), có hỗ trợ **offline cache** của Firestore. Giao diện sử dụng tiếng Việt.

**Công nghệ chính:** Vite, React 19, TypeScript, TanStack Router / Query / Form, Shadcn-style UI (Radix + Tailwind), Firebase v11, `vite-plugin-pwa`.

---

## Ghi chú phát triển

Dự án này được phát triển theo hướng **AI-assisted vibe coding**: người thực hiện đưa ra ý tưởng sản phẩm, định hướng nghiệp vụ, kiểm tra luồng sử dụng và điều chỉnh UI/UX để phù hợp hơn với nhu cầu thực tế. Phần triển khai mã nguồn được hỗ trợ đáng kể bởi AI, sau đó được rà soát và tinh chỉnh theo các quy tắc trong repo.

README này tập trung giúp developer mới nhanh chóng nắm được kiến trúc, quy ước chính và các điểm cần lưu ý khi tiếp tục phát triển. Các hướng dẫn thao tác chi tiết như cấu hình Firebase, Firestore hoặc deploy được tách riêng trong thư mục [`docs/`](docs/).

---

## Yêu cầu môi trường

- Node.js **20+** (khuyến nghị LTS)
- [pnpm](https://pnpm.io/) **9.x** (theo trường `packageManager` trong `package.json`)

---

## Bắt đầu nhanh

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Điền `.env.local` và bật **Authentication** + **Firestore** trên Firebase. Hướng dẫn chi tiết: **[docs/setup-firebase.md](docs/setup-firebase.md)**.

Mở `http://localhost:5173`, đăng ký / đăng nhập bằng **email + mật khẩu**.

---

## Kiến trúc mã nguồn

Repo được tổ chức theo hướng tách rõ phần route, feature module, shared UI và logic nghiệp vụ thuần. Mục tiêu là giúp developer dễ xác định nơi cần chỉnh sửa khi thêm hoặc thay đổi tính năng.

### Cấu trúc thư mục (chính)

```
src/
  components/     # UI, layout, providers, shared inputs + patterns
    inputs/       # MonthYearPicker, VndAmountInput, …
  hooks/         # Firestore + TanStack Query (subscription, …)
  lib/            # Firebase init, budget/month logic, i18n strings, types
  modules/        # Feature module: page, components, hooks theo từng màn
  routes/         # Wrapper mỏng: createRoute + import page từ modules
  routeTree.ts    # Cây route (khai báo thủ công)
```

- **Route mỏng:** `src/routes/*.tsx` chỉ khai báo `createRoute(...)` và import page từ `src/modules/<feature>/...`. Logic UI và data nên nằm trong `modules/`.
- **Dữ liệu Firestore:** toàn bộ dữ liệu người dùng nằm dưới `users/{uid}/...` (xem bảng trong [docs/setup-firebase.md](docs/setup-firebase.md)). Ưu tiên sort phía client để tránh phát sinh index Firestore không cần thiết.
- **Logic nghiệp vụ thuần:** các phép tính ngân sách nằm trong [`src/lib/budget/`](src/lib/budget/) để dễ đọc, dễ test và ít phụ thuộc UI.

### Logic thống kê (tóm tắt)

- **Phạm vi tháng trên màn Thống kê:** từ **tháng hiện tại** đến **hết năm dương lịch**, sau đó **đủ 12 tháng** năm kế tiếp (ví dụ T4/2026 → đến hết 12/2027).
- Mỗi tháng `M`: cộng thu nhập / dự chi / chi thực tế theo bản ghi có `validFrom ≤ M ≤ validTo` (hoặc `validTo` rỗng = mở).
- **Tiết kiệm (kế hoạch):** `thu nhập − tổng dự chi`.
- **Tiết kiệm (thực tế):** `thu nhập − tổng chi thực tế` trong tháng.
- **Còn lại theo khoản dự chi:** `amountVnd` khoản − tổng `actualExpenses` của khoản đó trong tháng hiện tại.

---

## Quy tắc phát triển

Quy ước đầy đủ nằm trong [`.cursor/rules/`](.cursor/rules/). Đây là nguồn tham chiếu cho cả developer và AI agent khi làm việc với codebase:

| File                                                                                       | Nội dung ngắn gọn                                                                                                         |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| [`00-core-project-standards.mdc`](.cursor/rules/00-core-project-standards.mdc)             | i18n VND, `formatMonthLabel`, route mỏng, utilities (`types.ts`, `vnd.ts`, `style-classes.ts`), Firestore `users/{uid}/…` |
| [`01-import-and-module-boundaries.mdc`](.cursor/rules/01-import-and-module-boundaries.mdc) | Alias `@/`, barrel `@/components/ui`, `@/components/patterns`, `@/components/inputs`                                      |
| [`02-forms-dialog-edit-pattern.mdc`](.cursor/rules/02-forms-dialog-edit-pattern.mdc)       | Form sửa: `useImperativeHandle` (`openCreate` / `openEdit`), không `useEffect` theo `open`                                |
| [`03-month-and-money-inputs.mdc`](.cursor/rules/03-month-and-money-inputs.mdc)             | `MonthYearPicker`, `VndAmountInput`, `VndAmountQuickPick`, `YearFilterSelect`                                             |
| [`04-strings-and-ui-text.mdc`](.cursor/rules/04-strings-and-ui-text.mdc)                   | Copy UI tiếng Việt trong `src/lib/strings.ts` (`t.*`); hàm helper cho chuỗi động                                          |
| [`05-tanstack-form-zod.mdc`](.cursor/rules/05-tanstack-form-zod.mdc)                       | TanStack Form + Zod schema, `Field`/`FieldLabel`/`FieldError`, `useId()` + `aria-*`                                       |
| [`06-security-precommit-ci.mdc`](.cursor/rules/06-security-precommit-ci.mdc)               | Pre-commit (audit, Gitleaks, Trivy), GitHub Actions CI                                                                    |
| [`07-data-layer.mdc`](.cursor/rules/07-data-layer.mdc)                                     | `useFirestoreCollection`, domain hooks, mutation hook pattern, query keys, cache strategy                                 |
| [`08-responsive-dialog.mdc`](.cursor/rules/08-responsive-dialog.mdc)                       | `ResponsiveSheet` + `ModalHeading` + `DialogFooter` shell, sizing, accessibility                                          |

### Skills (AI agent)

[`.cursor/skills/`](.cursor/skills/) chứa các skill hỗ trợ AI agent scaffold nhanh theo đúng pattern của repo:

| Skill                                              | Khi nào dùng                                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [`add-module`](.cursor/skills/add-module/SKILL.md) | Tạo mới một feature module (types → strings → hooks → mutations → route)             |
| [`add-dialog`](.cursor/skills/add-dialog/SKILL.md) | Tạo create/edit dialog với `ResponsiveSheet` + TanStack Form + `useImperativeHandle` |

**Công cụ kiểm soát chất lượng:** ESLint (flat) + **Perfectionist** (thứ tự import/export/object/…), kiểm tra vòng lặp import (`import/no-cycle`), **Prettier**, **Husky** + **lint-staged** (pre-commit), **Commitlint** (conventional commits). Ví dụ commit: `feat: thêm màn thống kê`, `fix: sửa format VND`.

---

## Bảo mật

### CI (GitHub Actions)

Workflow [`.github/workflows/security.yml`](.github/workflows/security.yml) được chạy khi có **push lên `main`** hoặc **pull request**:

| Bước           | Mô tả                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| **Gitleaks**   | Quét secret trong lịch sử git (action `gitleaks/gitleaks-action`)                                               |
| **pnpm audit** | `pnpm audit --audit-level=high` (lỗ hổng dependency mức high+)                                                  |
| **Trivy**      | Quét filesystem: `vuln`, `secret`, `misconfig` (mức HIGH, CRITICAL); bỏ qua theo [`.trivyignore`](.trivyignore) |

### Pre-commit trên máy phát triển

Husky [`.husky/pre-commit`](.husky/pre-commit) chạy `lint-staged` rồi script **`pnpm run security:precommit`** ([`scripts/security-precommit.mjs`](scripts/security-precommit.mjs)):

- `pnpm audit --audit-level=high`
- **Gitleaks** `protect --staged` (chống commit secret)
- **Trivy** `fs` (secret + misconfig, mức HIGH/CRITICAL; bỏ qua theo `.trivyignore`)

**Công cụ CLI:** cần cài [Gitleaks](https://github.com/gitleaks/gitleaks#installing) và [Trivy](https://trivy.dev/latest/getting-started/installation/) (ví dụ `brew install gitleaks trivy`) để pre-commit chạy đầy đủ. Script riêng `pnpm run security:audit` chỉ chạy audit dependency.

**Lưu ý vận hành:** Rule Firestore mẫu nằm trong [`firebase/firestore.rules`](firebase/firestore.rules). Luôn publish rules trước khi đưa ứng dụng vào sử dụng; không để cấu hình mặc định mở dữ liệu nếu không có chủ đích. Chi tiết: [docs/setup-firebase.md](docs/setup-firebase.md).

---

## Scripts

| Lệnh                                | Mô tả                                                 |
| ----------------------------------- | ----------------------------------------------------- |
| `pnpm dev`                          | Dev server Vite                                       |
| `pnpm build`                        | `tsc -b` + production build + PWA                     |
| `pnpm preview`                      | Xem bản build                                         |
| `pnpm lint` / `pnpm lint:fix`       | ESLint                                                |
| `pnpm format` / `pnpm format:check` | Prettier                                              |
| `pnpm test` / `pnpm test:watch`     | Vitest                                                |
| `pnpm security:audit`               | `pnpm audit --audit-level=high`                       |
| `pnpm security:precommit`           | Audit + Gitleaks (staged) + Trivy (fs) — cần tool CLI |

---

## Tài liệu chi tiết (setup & triển khai)

| Tài liệu                                                   | Nội dung                                                              |
| ---------------------------------------------------------- | --------------------------------------------------------------------- |
| [docs/setup-firebase.md](docs/setup-firebase.md)           | Project Firebase, `.env`, Auth, Firestore, rules, cấu trúc collection |
| [docs/deploy-github-pages.md](docs/deploy-github-pages.md) | Bật Pages, **Environment secrets** `VITE_*`, workflow deploy          |

---

## English (for contributors)

- **PWA / offline:** Firestore persistent local cache; service worker precache từ `vite-plugin-pwa`.
- **Routing:** `src/routes/*` are thin; route tree: [`src/routeTree.ts`](src/routeTree.ts).
- **Linting:** `eslint-plugin-perfectionist` + `import/no-cycle` — align with [`.cursor/rules/`](.cursor/rules/).

---

## License

Private / unspecified — set as needed for your team.
