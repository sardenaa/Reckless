# Security Spec: ReckLess RolePlay

## 1. Data Invariants
- A **Thread** must belong to a valid **Forum**.
- A **Post** must belong to a valid **Thread**.
- **User profiles** can only be modified by the owner (limited fields) or admins.
- **Roles** (admin/moderator) can ONLY be assigned by existing admins.
- **Financial data** (money, materials) in the user profile is immutable via the client (system-only).

## 2. The "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)

1. **Identity Spoofing**: Creating a thread as another user.
   `{ title: "Hack", authorId: "not-me", authorName: "Admin" }`
2. **Privilege Escalation**: Updating own role to 'admin'.
   `{ role: "admin" }` (Update on /users/my-id)
3. **Ghost Field Injection**: Adding `isVerified: true` to a user profile.
   `{ isVerified: true }`
4. **Relationship Poisoning**: Posting to a thread that doesn't exist.
   `{ threadId: "garbage-id", content: "..." }`
5. **Orphaned Write**: Creating a thread with a 2MB title.
   `{ title: "A".repeat(2000000) }`
6. **Financial Fraud**: Increasing `money` via `setDoc`.
   `{ money: 9999999 }`
7. **Bypassing Locking**: Updating a 'locked' thread.
   `{ title: "Changed although locked" }`
8. **PII Leak**: Reading another user's email.
   `get(/users/someone-else)` (Emails should be private or split).
9. **Mass Scraping**: Listing all users without a filter.
   `collection('users').get()` (Rules must enforce filters).
10. **Admin Mimicry**: Creating an announcement as a regular user.
    `post(/announcements, { title: "Fake News" })`
11. **Timestamp Forgery**: Manually setting `createdAt` to 2010.
    `{ createdAt: "2010-01-01T00:00:00Z" }`
12. **Immortal Field Mutation**: Changing `createdAt` on an existing thread.
    `{ createdAt: "new-date" }`

## 3. Test Runner
(I will generate the actual test file later if needed, for now I'll focus on the rules).
