# Cấu hình Firebase & Firestore

Tài liệu này hướng dẫn cấu hình Firebase cho môi trường phát triển của dự án, bao gồm Firebase project, biến môi trường, Authentication, Firestore Database và security rules. Phần tổng quan kiến trúc và quy tắc codebase nằm trong [README](../README.md).

---

## 1. Tạo Firebase project và web app

1. Vào [Firebase Console](https://console.firebase.google.com/) và chọn **Add project**, hoặc mở một project có sẵn.
2. Trong project, chọn biểu tượng **Web** (`</>`), đặt tên app và chọn **Register app**. Không cần bật Firebase Hosting ở bước này nếu chỉ dùng GitHub Pages để deploy.
3. Sau khi đăng ký, Firebase sẽ cung cấp object `firebaseConfig` có dạng:

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

Giữ lại các giá trị này để điền vào file môi trường ở bước tiếp theo.

---

## 2. Cấu hình biến môi trường

Từ thư mục gốc của repo, tạo file `.env.local` từ file mẫu:

```bash
cp .env.example .env.local
```

Điền các giá trị tương ứng từ `firebaseConfig`. Vite chỉ expose các biến bắt đầu bằng `VITE_` cho client app.

| Biến                                | Nguồn trong `firebaseConfig` |
| ----------------------------------- | ---------------------------- |
| `VITE_FIREBASE_API_KEY`             | `apiKey`                     |
| `VITE_FIREBASE_AUTH_DOMAIN`         | `authDomain`                 |
| `VITE_FIREBASE_PROJECT_ID`          | `projectId`                  |
| `VITE_FIREBASE_STORAGE_BUCKET`      | `storageBucket`              |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId`          |
| `VITE_FIREBASE_APP_ID`              | `appId`                      |

Có thể xem lại các giá trị này trong **Project settings** → **General** → **Your apps** → chọn web app → **SDK setup and configuration** → **npm**.

Nếu thiếu `apiKey` hoặc `projectId`, app sẽ báo lỗi khi khởi tạo Firebase. Logic kiểm tra nằm trong [`src/lib/firebase.ts`](../src/lib/firebase.ts).

---

## 3. Bật Authentication

1. Trong Firebase Console, vào **Build** → **Authentication** → **Get started**.
2. Ở tab **Sign-in method**, bật provider **Email/Password**.

Ứng dụng hiện dùng luồng đăng ký và đăng nhập bằng email + mật khẩu. Không cần bật Email link nếu không có thay đổi về sản phẩm.

---

## 4. Tạo Firestore Database và áp dụng rules

1. Vào **Build** → **Firestore Database** → **Create database**.
2. Chọn mode phù hợp với môi trường và chọn **location**. Ví dụ: `asia-southeast1`. Lưu ý rằng location gần như không thể đổi sau khi database đã được tạo.
3. Ở tab **Rules**, áp dụng rules để mỗi user chỉ truy cập dữ liệu dưới `users/{uid}/...`. File mẫu của repo nằm tại [`firebase/firestore.rules`](../firebase/firestore.rules).

Có hai cách áp dụng rules:

- Dán toàn bộ nội dung [`firebase/firestore.rules`](../firebase/firestore.rules) vào Firebase Console và chọn **Publish**.
- Dùng [Firebase CLI](https://firebase.google.com/docs/cli) với lệnh `firebase deploy --only firestore:rules`, sau khi đã `firebase init` và trỏ cấu hình rules về `firebase/firestore.rules`.

Trước khi đưa app vào sử dụng, luôn đảm bảo Firestore rules đã được publish. Không để database ở trạng thái mở toàn bộ dữ liệu nếu không có chủ đích.

---

## 5. Kiểm tra local

Sau khi hoàn tất cấu hình Firebase và `.env.local`, chạy app tại môi trường local:

```bash
pnpm install
pnpm dev
```

Mở `http://localhost:5173` và kiểm tra luồng đăng ký / đăng nhập bằng email + mật khẩu.

---

## 6. Cấu trúc dữ liệu Firestore

| Đường dẫn                    | Mô tả                                                               |
| ---------------------------- | ------------------------------------------------------------------- |
| `users/{uid}/categories`     | Phân loại dự chi (`name`, `sortOrder`, `archived`)                  |
| `users/{uid}/budgetItems`    | Dự chi (`title`, `amountVnd`, `categoryId`, `validFrom`, `validTo`) |
| `users/{uid}/incomePeriods`  | Thu nhập theo kỳ (`label`, `amountVnd`, `validFrom`, `validTo`)     |
| `users/{uid}/actualExpenses` | Chi thực tế (`budgetItemId`, `amountVnd`, `spentMonth`, `note`)     |

Các giá trị tháng dùng khóa dạng **`YYYY-MM`** để thuận tiện cho so sánh và tính toán. Mốc “tháng hiện tại” dùng timezone **`Asia/Ho_Chi_Minh`**.

Trong UI, tháng hiển thị theo format **`T{tháng}/{năm}`** (ví dụ `T4/2026`) thông qua `formatMonthLabel()` trong [`src/lib/month.ts`](../src/lib/month.ts).

Khi thay đổi mô hình dữ liệu, cần cập nhật đồng bộ:

- [`firebase/firestore.rules`](../firebase/firestore.rules)
- types trong [`src/lib/types.ts`](../src/lib/types.ts)
- hooks Firestore trong [`src/hooks/`](../src/hooks/)
- các test liên quan đến logic nghiệp vụ, nếu có

---

## English Notes

- Firestore data should stay under `users/{uid}/...`.
- The app uses Firestore persistent local cache and PWA precache via `vite-plugin-pwa`.
