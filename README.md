# User Management App

Aplikasi manajemen user dengan Next.js 15 + Supabase + Tailwind CSS 4.

Kenapa pakai Supabase? karena Supabase menyediakan database PostgreSQL dan storage dalam satu platform, dan saya pernah pakai Supabase. Untuk tampilan saya pakai template components dari Tailwind Plus (Dulu Tailwind UI)

## Langkah Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase Database

1. Buka https://supabase.com dan buat project baru
2. Di SQL Editor, jalankan query ini untuk buat table:

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON users FOR SELECT USING (true);
CREATE POLICY "Public insert" ON users FOR INSERT WITH CHECK (true);
```

**Setelah SQL ini dijalankan**, table `users` sudah ada. Sekarang kita buat file-file berikut:

**lib/supabase.ts** - Untuk koneksi ke database Supabase
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**app/api/users/route.ts** - API untuk GET (untuk ambil semua user) dan POST (untuk tambah user baru)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const { name, email, avatar_url } = await request.json();

  const { data, error } = await supabase
    .from('users')
    .insert([{ name, email, avatar_url }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
```

### 3. Setup Supabase Storage

1. Buka menu Storage → New bucket
2. Nama: `user-uploads`
3. Centang "Public bucket"
4. Di SQL Editor, jalankan policy:

```sql
CREATE POLICY "Public upload" ON storage.objects 
FOR INSERT TO public WITH CHECK (bucket_id = 'user-uploads');

CREATE POLICY "Public access" ON storage.objects 
FOR SELECT TO public USING (bucket_id = 'user-uploads');
```

**Setelah bucket dan policy dibuat**, kita buat file:

**app/api/upload/route.ts** - API untuk upload foto ke storage
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 });
  }

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `avatars/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from('user-uploads')
    .upload(filePath, buffer, { contentType: file.type });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage
    .from('user-uploads')
    .getPublicUrl(filePath);

  return NextResponse.json({ url: data.publicUrl });
}
```

### 4. Environment Variables

Buat file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Ambil URL dan key dari Settings → API di dashboard Supabase.

### 5. Next.js Config

Buat file `next.config.ts` untuk allow image from external domain:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
```

### 6. Buat UI atau halaman tampilan

**app/page.tsx** - Halaman utama "/" dengan form input dan list users

**app/layout.tsx** - Root layout

### 7. Jalankan

```bash
npm run dev
```

Buka http://localhost:3000

## Deploy

Push ke GitHub, lalu deploy di Vercel dengan environment variables yang sama.

Cek proyek lengkapnya di [GitHub](https://github.com/mamatqurtifa/user-management-app) atau kunjungi [user-management-app.qurtifa.my.id](https://user-management-app.qurtifa.my.id) untuk demo.
