# Triển khai GitHub Pages

Tài liệu này mô tả cách publish ứng dụng lên **GitHub Pages** bằng workflow [`deploy.yml`](../.github/workflows/deploy.yml) có sẵn trong repo.

Workflow deploy chạy khi:

- có push lên nhánh `main`
- chạy thủ công bằng **Run workflow** trong GitHub Actions

---

## 1. Bật GitHub Pages

Trong repository trên GitHub:

1. Vào **Settings** → **Pages**.
2. Ở mục **Build and deployment**, chọn **Source: GitHub Actions**.

Sau bước này, GitHub Pages sẽ nhận artifact từ workflow thay vì tự build bằng cấu hình mặc định.

---

## 2. Tạo environment `github-pages`

Workflow đang build trong environment tên `github-pages`:

```yaml
environment:
  name: github-pages
```

Trong repository trên GitHub:

1. Vào **Settings** → **Environments**.
2. Tạo environment mới tên `github-pages` nếu chưa có.
3. Trong environment này, thêm các **Environment secrets** sau:

```env
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Các giá trị trên lấy từ Firebase web app config. Xem chi tiết trong [Cấu hình Firebase & Firestore](./setup-firebase.md).

> Không dùng `.env.local` trên GitHub Actions. File này chỉ dành cho môi trường local.

---

## 3. Cấu hình Firebase Auth cho domain GitHub Pages

Nếu ứng dụng dùng Firebase Authentication, cần cho phép domain GitHub Pages trong Firebase Console:

1. Vào **Firebase Console** → **Authentication** → **Settings**.
2. Mở tab **Authorized domains**.
3. Thêm domain GitHub Pages của repo, thường có dạng:

```text
<username>.github.io
```

Ví dụ nếu URL Pages là `https://thotran.github.io/monthly-budget/`, domain cần thêm là:

```text
thotran.github.io
```

Nếu dùng custom domain, thêm cả custom domain đó.

---

## 4. Workflow build và deploy làm gì?

Workflow [`deploy.yml`](../.github/workflows/deploy.yml) gồm hai job:

| Job      | Vai trò                                                                |
| -------- | ---------------------------------------------------------------------- |
| `build`  | Cài dependency, build app và upload thư mục `dist/` làm Pages artifact |
| `deploy` | Publish artifact lên GitHub Pages bằng `actions/deploy-pages`          |

Ở bước build, workflow truyền các biến Firebase từ Environment secrets và set:

```env
VITE_BASE=/${{ github.event.repository.name }}/
```

`vite.config.ts` đọc `VITE_BASE` để cấu hình `base`. Điều này cần thiết vì GitHub Pages thường phục vụ project page dưới subpath dạng:

```text
https://<username>.github.io/<repo>/
```

---

## 5. Kiểm tra trước khi deploy

Trước khi merge hoặc push lên `main`, nên kiểm tra:

```bash
pnpm install
pnpm build
```

Checklist cấu hình:

- GitHub Pages đã chọn **Source: GitHub Actions**.
- Environment `github-pages` đã có đủ các secret `VITE_FIREBASE_*`.
- Firebase Authentication đã thêm domain GitHub Pages vào **Authorized domains**.
- Firestore rules đã được publish nếu app truy cập dữ liệu thật.
- Workflow **Deploy to GitHub Pages** chạy thành công trong tab **Actions**.

---

## 6. Ghi chú về PWA

Ứng dụng dùng `vite-plugin-pwa`. Trong [`vite.config.ts`](../vite.config.ts), manifest đang dùng `start_url: '.'` và icon relative (`favicon.svg`) để phù hợp khi chạy dưới subpath của GitHub Pages.

Nếu đổi nơi deploy, đổi repository name hoặc chuyển sang custom domain, cần kiểm tra lại:

- `VITE_BASE`
- đường dẫn asset trong bản build
- manifest và service worker của PWA
