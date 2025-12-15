# Supabase Migrations

Этот каталог содержит миграции базы данных для D&D платформы.

## Структура миграций

1. `20251215135052_create_profiles_table.sql` - Создание таблицы profiles
2. `20251215135053_create_masters_table.sql` - Создание таблицы masters
3. `20251215135054_create_players_table.sql` - Создание таблицы players
4. `20251215135055_create_games_table.sql` - Создание таблицы games
5. `20251215135056_create_bookings_table.sql` - Создание таблицы bookings
6. `20251215135057_create_storage_bucket.sql` - Создание Storage бакета и политик

## Применение миграций

### Через Supabase CLI

```bash
# Установите Supabase CLI, если еще не установлен
npm install -g supabase

# Войдите в Supabase
supabase login

# Свяжите проект с локальным проектом Supabase
supabase link --project-ref your-project-ref

# Примените все миграции
supabase db push
```

### Через Supabase Dashboard

1. Откройте ваш проект в [Supabase Dashboard](https://app.supabase.com)
2. Перейдите в раздел SQL Editor
3. Откройте каждую миграцию по порядку и выполните SQL

### Через MCP Supabase (если доступно)

Используйте инструмент `mcp_supabase_apply_migration` для применения каждой миграции.

## Структура базы данных

### Таблицы

- **profiles** - Базовые профили пользователей
- **masters** - Профили мастеров (DM)
- **players** - Профили игроков
- **games** - Объявления об играх
- **bookings** - Заявки на участие в играх

### Storage

- **public-assets** - Публичный бакет для изображений
  - `avatars/{user_id}/` - Аватары пользователей
  - `game-images/{game_id}/` - Изображения игр

## RLS политики

Все таблицы защищены Row Level Security (RLS):
- Публичное чтение профилей, мастеров, игроков и опубликованных игр
- Пользователи могут редактировать только свои профили
- Мастера могут создавать и редактировать только свои игры
- Игроки могут создавать заявки только на опубликованные игры

## Триггеры

- Автоматическое создание профиля при регистрации пользователя
- Автоматическое обновление `updated_at` при изменении записей
- Автоматическое обновление `seats_available` при изменении статуса бронирования

## Проверка после применения

После применения миграций проверьте:

1. Все таблицы созданы:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

2. RLS включен для всех таблиц:
```sql
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';
```

3. Storage бакет создан:
```sql
SELECT * FROM storage.buckets WHERE id = 'public-assets';
```

4. Политики Storage созданы:
```sql
SELECT * FROM storage.policies WHERE bucket_id = 'public-assets';
```

