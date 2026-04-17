# Utsav.in — Frontend

Premium Indian e-commerce frontend built with **React 18 + Tailwind CSS v3**, wired to the Express/MongoDB backend.


## Quick Start


###  Install and run the backend

```bash
cd backend
npm install
npm start
```

###  Install and run the frontend

```bash
npm install
npm run dev
# opens at http://localhost:5173
```

---

## API Routes Used

| Page              | Method | Endpoint                              |
|-------------------|--------|---------------------------------------|
| Register          | `POST` | `/api/v1/users/register`              |
| Login             | `POST` | `/api/v1/users/login`                 |
| Logout            | `POST` | `/api/v1/users/logout`                |
| Resend verify     | `POST` | `/api/v1/users/reverify`              |
| Forgot password   | `POST` | `/api/v1/users/forgot-password`       |
| Verify OTP        | `POST` | `/api/v1/users/verify-otp/:email`     |
| Change password   | `POST` | `/api/v1/users/change-password/:email`|
| All users (admin) | `GET`v | `/api/v1/users/all-user`              |
| Get user by ID    | `GET`  | `/api/v1/users/get-user/:userId`      |

---
