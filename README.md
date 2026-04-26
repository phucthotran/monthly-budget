# Dự chi hàng tháng (Monthly budget)

Ứng dụng web **PWA** quản lý **dự chi**, **thu nhập theo kỳ**, **chi thực tế** và **tiết kiệm** (chỉ **VND**). Dữ liệu lưu trên **Firebase** (Firestore + Auth), có **offline cache** Firestore. Giao diện **tiếng Việt**.

**Stack:** Vite, React 19, TypeScript, TanStack Router / Query / Form, Shadcn-style UI (Radix + Tailwind), Firebase v11, `vite-plugin-pwa`.

---

## Yêu cầu môi trường

- Node.js **20+** (khuyến nghị LTS)
- [pnpm](https://pnpm.io/) **9.x** (`packageManager` trong `package.json`)

---

## Bắt đầu nhanh

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Điền `.env.local` và bật Auth + Firestore trên Firebase theo mục **[Cấu hình Firebase](#cấu-hình-firebase)**. Mở `http://localhost:5173`, đăng ký / đăng nhập bằng **email + mật khẩu**.

---

## Cấu hình Firebase

### 1. Tạo project và ứng dụng web

1. Vào [Firebase Console](https://console.firebase.google.com/) → **Add project** (hoặc chọn project có sẵn).
2. Trong project: biểu tượng **Web** (`</>`) → đặt tên app → **Register app** (không bắt buộc bật Hosting cho bước này).
3. Firebase hiển thị object `firebaseConfig` dạng:

   ```js
   const firebaseConfig = {
     apiKey: '...',
     authDomain: '...',
     projectId: '...',
     storageBucket: '...',
     messagingSenderId: '...',
     appId: '...',
   }
   ```

### 2. Biến môi trường (`.env.local`)

```bash
cp .env.example .env.local
```

Điền từng giá trị tương ứng (Vite chỉ đọc biến bắt đầu bằng `VITE_`):

| Biến                                | Nguồn trong `firebaseConfig` |
| ----------------------------------- | ---------------------------- |
| `VITE_FIREBASE_API_KEY`             | `apiKey`                     |
| `VITE_FIREBASE_AUTH_DOMAIN`         | `authDomain`                 |
| `VITE_FIREBASE_PROJECT_ID`          | `projectId`                  |
| `VITE_FIREBASE_STORAGE_BUCKET`      | `storageBucket`              |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId`          |
| `VITE_FIREBASE_APP_ID`              | `appId`                      |

Cũng có thể lấy từ **Project settings** (biểu tượng bánh răng) → tab **General** → phần **Your apps** → chọn app web → **SDK setup and configuration** → **npm** (cùng bộ key).

Nếu thiếu `apiKey` hoặc `projectId`, app sẽ báo lỗi khi khởi tạo Firebase (xem [`src/lib/firebase.ts`](src/lib/firebase.ts)).

### 3. Authentication

1. **Build** → **Authentication** → **Get started**.
2. Tab **Sign-in method** → bật **Email/Password** (chỉ cần Email/Password, không bắt buộc Email link).

Ứng dụng dùng đăng ký / đăng nhập email + mật khẩu.

### 4. Firestore

1. **Build** → **Firestore Database** → **Create database**.
2. Chọn chế độ (test hoặc production) và **location** (ví dụ `asia-southeast1`). Location khó đổi sau khi tạo.
3. Tab **Rules**: áp dụng rules để mỗi user chỉ truy cập dữ liệu dưới `users/{uid}/...`. Nội dung mẫu trong repo: [`firebase/firestore.rules`](firebase/firestore.rules). Có thể **dán toàn bộ** vào Console và **Publish**, hoặc dùng [Firebase CLI](https://firebase.google.com/docs/cli) (`firebase deploy --only firestore:rules`) sau khi đã `firebase init` và trỏ file rules về `firebase/firestore.rules`.

Trước khi public, đảm bảo rules đã publish — không để mặc định mở toàn bộ nếu không chủ đích.

### 5. Chạy ứng dụng

```bash
pnpm install
pnpm dev
```

Mở `http://localhost:5173` và thử đăng ký / đăng nhập.

### Cấu trúc dữ liệu (Firestore)

| Đường dẫn                    | Mô tả                                                               |
| ---------------------------- | ------------------------------------------------------------------- |
| `users/{uid}/categories`     | Phân loại dự chi (`name`, `sortOrder`, `archived`)                  |
| `users/{uid}/budgetItems`    | Dự chi (`title`, `amountVnd`, `categoryId`, `validFrom`, `validTo`) |
| `users/{uid}/incomePeriods`  | Thu nhập theo kỳ (`label`, `amountVnd`, `validFrom`, `validTo`)     |
| `users/{uid}/actualExpenses` | Chi thực tế (`budgetItemId`, `amountVnd`, `spentMonth`, `note`)     |

Tháng dùng khóa **`YYYY-MM`** (dùng để so sánh & tính toán), mốc “tháng hiện tại” theo **`Asia/Ho_Chi_Minh`**.

Trong UI, tháng được hiển thị theo format: **`T{tháng}/{năm}`** (ví dụ `T4/2026`) bằng `formatMonthLabel()` trong [`src/lib/month.ts`](src/lib/month.ts).

---

## Logic thống kê (tóm tắt)

- **Phạm vi tháng trên màn Thống kê:** từ **tháng hiện tại** đến **hết năm dương lịch**, sau đó **đủ 12 tháng** của năm kế tiếp (ví dụ tháng 4/2026 → đến hết 12/2027).
- Mỗi tháng `M`: cộng thu nhập / dự chi / chi thực tế theo các bản ghi có `validFrom ≤ M ≤ validTo` (hoặc `validTo` rỗng = mở).
- **Tiết kiệm (kế hoạch):** `thu nhập − tổng dự chi`.
- **Tiết kiệm (thực tế):** `thu nhập − tổng chi thực tế` trong tháng.
- **Còn lại theo khoản dự chi:** `amountVnd` của khoản − tổng `actualExpenses` của khoản đó trong tháng hiện tại.

Code thuần (dễ test) nằm trong [`src/lib/budget/`](src/lib/budget/).

---

## Scripts

| Lệnh                | Mô tả                             |
| ------------------- | --------------------------------- |
| `pnpm dev`          | Dev server Vite                   |
| `pnpm build`        | `tsc -b` + production build + PWA |
| `pnpm preview`      | Xem bản build                     |
| `pnpm lint`         | ESLint                            |
| `pnpm format`       | Prettier write                    |
| `pnpm format:check` | Prettier check                    |
| `pnpm test`         | Vitest                            |

---

## Deploy lên GitHub Pages

Repo đã có sẵn workflow deploy: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### 1) Bật GitHub Pages

1. Vào **Settings** → **Pages**
2. **Build and deployment** → chọn **Source: GitHub Actions**

### 2) Deploy

- Push lên nhánh **`main`** → workflow sẽ build và publish thư mục `dist/`
- Khi build cho Pages, app sẽ set `base` = `/<repo>/` thông qua biến `VITE_BASE`

Lưu ý: để PWA/manifest hoạt động dưới subpath của Pages, manifest dùng đường dẫn relative (`start_url: '.'`, icon `favicon.svg`) trong `vite.config.ts`.

---

## Chất lượng code

- **ESLint** (flat config) + **Prettier** + `eslint-config-prettier`
- **Perfectionist**: enforce sort cho `import`, `named import`, `export`, `object`, `enum`, types…
- **Import cycle check**: `import/no-cycle` (và các rule import hygiene khác)
- **Husky** + **lint-staged** (pre-commit)
- **Commitlint** (conventional commits) — hook `commit-msg` (cần `git init` để Husky gắn hook)

Ví dụ commit: `feat: thêm màn thống kê`, `fix: sửa format VND`.

---

## Cấu trúc thư mục (chính)

```
src/
  components/     # UI, layout, providers + shared inputs/patterns
    inputs/       # MonthYearPicker, VndAmountInput,...
  hooks/          # Firestore + TanStack Query subscription
  lib/            # firebase, budget, month, strings, types
  modules/        # Feature modules (page + components + hooks, colocated)
  routes/         # TanStack Router: THIN wrappers only (createRoute + import module page)
  routeTree.ts    # Cây route (manual)
```

### Quy ước quan trọng trong codebase

- **Routes mỏng**: `src/routes/*.tsx` chỉ nên chứa `createRoute(...)` và import page từ `src/modules/<feature>/...`.
- **Import UI**: ưu tiên import từ `@/components/ui` và `@/components/patterns` (barrel), tránh import sâu kiểu `@/components/ui/button` trong app code.
- **Chọn tháng/năm**: không dùng `input type="month"`. Dùng `MonthYearPicker` ([`src/components/inputs/MonthYearPicker.tsx`](src/components/inputs/MonthYearPicker.tsx)) với tháng `T1..T12`, danh sách năm tối đa 5, responsive (không tràn modal).
- **Nhập tiền VND**: dùng `VndAmountInput` ([`src/components/inputs/VndAmountInput.tsx`](src/components/inputs/VndAmountInput.tsx)) để hiển thị `1.000.000` khi nhập.
- **Edit dialog/form**: init data cho “Sửa” bằng `useImperativeHandle` (`openCreate/openEdit`) thay vì `useEffect` theo `open`.
- **Sort list**:
  - `categories`: A→Z theo `name` (collation vi-VN)
  - `budgetItems`/`incomePeriods`: `validFrom` (tháng/năm) trước, rồi A→Z theo `title`/`label`

---

## English (for contributors)

- **PWA / offline:** Firestore uses persistent local cache (multi-tab). Static assets are precached by the service worker from `vite-plugin-pwa`.
- **Changing the data model:** keep Firestore paths under `users/{uid}/…`, update [`firebase/firestore.rules`](firebase/firestore.rules), then adjust TypeScript types in [`src/lib/types.ts`](src/lib/types.ts) and hooks in [`src/hooks/`](src/hooks/).
- **Routing:** `src/routes/*` are thin wrappers that import pages from `src/modules/*`. The route tree is in [`src/routeTree.ts`](src/routeTree.ts).
- **Linting:** `eslint-plugin-perfectionist` enforces deterministic ordering; `eslint-plugin-import` checks for cycles (`import/no-cycle`).

---

## License

Private / unspecified — set as needed for your team.
