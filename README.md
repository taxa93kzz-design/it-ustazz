# IT Ustaz

**IT Ustaz** — Қазақстандағы информатика пәні мұғалімдеріне ҚМЖ, тапсырма, тест және жұмыс парағын жылдам дайындауға көмектесетін цифрлық көмекші.

## Мүмкіндіктер

- ҚМЖ кестесін автоматты құрастыру және өңдеу;
- деңгейлік тапсырмалар мен бағалау дескрипторларын жасау;
- тестті браузерде орындау және нәтижені автоматты есептеу;
- баспаға дайын жұмыс парағын әзірлеу;
- әр мұғалімнің материалдарын Supabase PostgreSQL базасында жеке сақтау;
- email немесе username арқылы қауіпсіз кіру және әкімшілік басқару;
- іздеу, сынып және материал түрі бойынша сүзу;
- материалдарды Word (`.docx`) форматына жүктеу.

## Орнату

Компьютерде Node.js 20.9 немесе одан жаңа нұсқасы орнатылған болуы керек.

```bash
npm install
```

Үлгі конфигурацияны көшіріңіз:

```bash
cp .env.example .env.local
```

Windows PowerShell үшін:

```powershell
Copy-Item .env.example .env.local
```

AI генерациясын қосу үшін `.env.local` файлына Gemini API кілтін жазыңыз:

```dotenv
GEMINI_API_KEY=сіздің_кілт
GEMINI_MODEL=gemini-2.5-flash
```

Кілтке `NEXT_PUBLIC_` префиксін қоспаңыз. Gemini шақырулары тек `src/app/api/ai/` ішіндегі серверлік route арқылы орындалады. Кілтті қосқаннан кейін dev серверін қайта іске қосыңыз.

## Іске қосу

Әзірлеу режимі:

```bash
npm run dev
```

## Supabase авторизациясын баптау

1. Supabase жобасын ашып, SQL Editor ішінде
   `supabase/migrations/001_auth_and_profiles.sql` файлын орындаңыз.
2. `.env.example` файлын `.env.local` ретінде көшіріңіз. Жаңа Supabase
   жобасында `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` және
   `NEXT_PUBLIC_SITE_URL` мәндерін толтырыңыз.
3. Supabase Authentication → URL Configuration ішінде жергілікті
   `http://localhost:3000/auth/callback` және production доменінің дәл сондай
   redirect URL мекенжайын рұқсат етілген тізімге қосыңыз.

### Алғашқы admin аккаунты

Supabase Dashboard → Authentication → Users арқылы бірінші қолданушыны ашыңыз.
SQL Editor ішінде оның UUID мәнін қолданып:

```sql
update public.profiles
set role = 'admin', username = 'admin', is_active = true
where id = 'AUTH_USER_UUID';
```

Осыдан кейін `/admin/users` беті арқылы мұғалім аккаунттарын ашуға болады.
Уақытша пароль базаға жазылмайды және бірінші кіргенде оны ауыстыру ұсынылады.

## Vercel-ге жариялау

1. Кодты құпия `.env` файлдарын қоспай GitHub репозиторийіне жіберіңіз.
2. Vercel ішінде **Add New → Project** арқылы репозиторийді таңдаңыз.
3. Framework Preset ретінде Next.js таңдаңыз. Build командасы — `npm run build`,
   Output Directory — Next.js әдепкі мәні.
4. Project Settings → Environment Variables ішінде Supabase URL,
   publishable key, server secret key және қажет болса `GEMINI_API_KEY`
   мәндерін Production, Preview және Development орталарына қосыңыз.
5. `SUPABASE_SECRET_KEY` және `GEMINI_API_KEY` атауларына
   `NEXT_PUBLIC_` префиксін бермеңіз.
6. Supabase Authentication → URL Configuration ішінде Vercel production
   доменін **Site URL** ретінде және
   `https://сіздің-доменіңіз/auth/callback` мекенжайын Redirect URLs тізіміне
   қосыңыз.
7. Vercel-де Deploy басып, жарияланған `/login`, `/dashboard` және
   `/admin/users` маршруттарын тексеріңіз.

Содан кейін браузерде [http://localhost:3000](http://localhost:3000) мекенжайын ашыңыз.

Production нұсқасын тексеру:

```bash
npm run build
npm start
```

Код сапасын тексеру:

```bash
npm run lint
```

## Технологиялар

Next.js, TypeScript, App Router, Tailwind CSS, shadcn/ui үлгісіндегі компоненттер, Lucide Icons, React Hook Form, Zod және docx.

## Қауіпсіздік

`.env`, `.env.local` және `.env.production` файлдарын GitHub-қа қоспаңыз.
Publishable key браузерге арналған, ал Supabase secret key және Gemini
кілттері тек серверлік environment variables ішінде сақталуы тиіс. Кілт
кездейсоқ репозиторийге түссе, оны дереу revoke/rotate етіңіз.
