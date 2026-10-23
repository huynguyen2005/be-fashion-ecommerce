# Backend

API server viết bằng **Express 5 + TypeScript (strict)**, theo kiến trúc **Modular Layered Architecture** (Controller → Service → Repository).

## Công nghệ

| Thành phần | Công cụ |
| --- | --- |
| Runtime | Node.js >= 22 (ESM) |
| Framework | Express 5 |
| Ngôn ngữ | TypeScript (strict, `noUncheckedIndexedAccess`) |
| Logger | pino |
| Cấu hình | dotenv |
| Dev / Build | tsx (hot reload), tsc + tsc-alias |
| Chất lượng code | ESLint, Prettier |
| Package manager | pnpm |

## Cài đặt & chạy

### Yêu cầu

- Node.js >= 22 (kiểm tra: `node -v`)
- pnpm (cài: `npm i -g pnpm`)

### Các bước

Mở terminal tại thư mục `backend/`:

```bash
pnpm install              # 1. cài thư viện (chỉ cần làm 1 lần)
cp .env.example .env      # 2. tạo file .env (Windows PowerShell: Copy-Item .env.example .env)
pnpm dev                  # 3. chạy server
```

Khi terminal hiện dòng sau là server đã chạy:

```
Server listening on http://0.0.0.0:3001 (development)
```

> Giữ nguyên terminal này. Đóng terminal hoặc nhấn `Ctrl+C` là server tắt.

### Kiểm tra server

Mở trình duyệt (hoặc Thunder Client / Postman) và gọi:

```
GET http://localhost:3001/health
```

Kết quả đúng: `{"status":"ok"}`

### Các lệnh

| Lệnh | Tác dụng |
| --- | --- |
| `pnpm dev` | Chạy chế độ dev, tự khởi động lại khi sửa code (tsx) |
| `pnpm build` | Biên dịch ra `dist/` (tsc + tsc-alias, đổi alias `@common`... thành đường dẫn thật) |
| `pnpm start` | Chạy bản đã build trong `dist/` (phải `pnpm build` trước) |
| `pnpm typecheck` | Kiểm tra kiểu TypeScript, không xuất file |
| `pnpm lint` | Kiểm tra code bằng ESLint |
| `pnpm format` | Format code bằng Prettier |

### Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách xử lý |
| --- | --- | --- |
| Trình duyệt báo `ERR_ADDRESS_INVALID` khi mở `http://0.0.0.0:3001` | `0.0.0.0` chỉ là địa chỉ để server lắng nghe, không dùng để truy cập | Mở `http://localhost:3001/health` |
| `Connection was refused by the server` / `ECONNREFUSED` | Server chưa chạy hoặc đã tắt | Chạy `pnpm dev` và đợi dòng `Server listening...` |
| `Invalid PORT` / `Invalid NODE_ENV` khi khởi động | Giá trị trong `.env` sai | Sửa lại theo bảng biến môi trường bên dưới |
| `EADDRINUSE` | Cổng 3001 đã có tiến trình khác dùng | Tắt tiến trình đó hoặc đổi `PORT` trong `.env` |

## Biến môi trường (`.env`)

| Biến | Mặc định | Mô tả |
| --- | --- | --- |
| `NODE_ENV` | `development` | `development` \| `production` \| `test` |
| `HOST` | `0.0.0.0` | Địa chỉ lắng nghe |
| `PORT` | `3001` | Cổng (0–65535) |

Giá trị sai sẽ làm app lỗi ngay khi khởi động (xem `src/common/config/env.ts`).

## Kiến trúc

### Mô hình phân tầng

```
Request
   │
   ▼
Route        khai báo endpoint, gắn middleware
   │
   ▼
Controller   nhận request, validate DTO, gọi service, trả response (không chứa nghiệp vụ)
   │
   ▼
Service      xử lý nghiệp vụ, không biết gì về HTTP (req/res)
   │
   ▼
Repository   truy cập dữ liệu (DB), không chứa nghiệp vụ
   │
   ▼
Database
```

Quy tắc: tầng trên chỉ gọi tầng ngay dưới nó; không gọi ngược lên hoặc nhảy cách tầng.

### Cấu trúc thư mục

```
src/
├── index.ts          Điểm vào: app.listen + graceful shutdown (SIGINT/SIGTERM)
├── app.ts            Khởi tạo Express app (middleware, /health, router). KHÔNG listen
│                     → dễ import để test
├── common/           Phần dùng chung giữa các module
│   ├── config/       env.ts (đọc + validate biến môi trường), logger.ts (pino)
│   ├── constants/    Hằng số
│   ├── errors/       Các lớp lỗi tuỳ chỉnh
│   ├── middlewares/  Middleware dùng chung (auth, error handler, ...)
│   ├── types/        Kiểu TypeScript dùng chung
│   └── utils/        Hàm tiện ích
├── modules/          Các module nghiệp vụ
│   └── index.ts      Router gốc: nơi đăng ký router của từng module
└── databases/        DataSource, entities, migrations (sẽ bổ sung)
tests/                Test
```

### Cấu trúc một module

Mỗi tính năng là một thư mục riêng trong `src/modules/`, ví dụ:

```
src/modules/users/
├── user.route.ts         Định nghĩa endpoint
├── user.controller.ts    Tầng Controller
├── user.service.ts       Tầng Service
├── user.repository.ts    Tầng Repository
└── dto/                  Dữ liệu vào/ra của API
```

Đăng ký module trong `src/modules/index.ts`:

```ts
router.use('/users', userRouter);
```

### Path alias

Dùng trong code thay cho đường dẫn tương đối (cấu hình ở `tsconfig.json`):

| Alias | Trỏ tới |
| --- | --- |
| `@common/*` | `src/common/*` |
| `@modules/*` | `src/modules/*` |
| `@databases/*` | `src/databases/*` |

Khi import file nội bộ phải ghi đuôi `.js` (ESM), ví dụ `import { env } from '@common/config/env.js'`.

### Luồng khởi động

1. `index.ts` import `app` và `env` (env được validate ngay lúc import).
2. `app.ts` gắn `express.json()`, `express.urlencoded()`, route `/health`, rồi router gốc từ `modules/index.ts`.
3. Server lắng nghe tại `HOST:PORT`; nhận `SIGINT`/`SIGTERM` thì đóng server rồi thoát (graceful shutdown).
