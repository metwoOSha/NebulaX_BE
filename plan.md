# NebulaX Backend — план разработки

## 1. Auth
- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] POST /api/auth/logout
- [ ] GET /api/auth/me

## 2. Users
- [ ] GET /api/users/:id — профиль юзера
- [ ] PUT /api/users/:id — обновить профиль (username, name, about, avatar_color_id)
- [ ] PUT /api/users/:id/tags — обновить интересы

## 3. Rooms
- [ ] GET /api/rooms — все комнаты (с разбивкой: my/joined/recommended)
- [ ] POST /api/rooms — создать комнату
- [ ] GET /api/rooms/:id — одна комната
- [ ] POST /api/rooms/:id/join — вступить в комнату
- [ ] DELETE /api/rooms/:id/leave — покинуть комнату

## 4. Messages
- [ ] GET /api/rooms/:id/messages — история с cursor-based пагинацией

## 5. Tags
- [ ] GET /api/tags — список всех тегов

## 6. Middleware
- [ ] authMiddleware — проверка JWT
- [ ] errorMiddleware — обработка ошибок
- [ ] rateLimitMiddleware — лимит на auth роуты

## 7. Socket.io
- [ ] join_room — войти в комнату
- [ ] leave_room — выйти из комнаты
- [ ] message — отправить сообщение
- [ ] typing — индикатор печати
- [ ] online_users — список онлайн юзеров
- [ ] disconnect — отключение

## 8. Redis
- [ ] Pub/Sub для синхронизации сообщений
- [ ] Online юзеры в комнате (Redis Set)