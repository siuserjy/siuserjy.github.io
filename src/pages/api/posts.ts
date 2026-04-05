import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

const blogDir = path.join(process.cwd(), 'src/content/blog');

function checkAuth(request: Request, cookies: any): boolean {
  const token = cookies.get('admin_token')?.value;
  const expected = import.meta.env.ADMIN_PASSWORD || 'admin888';
  return token === expected;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!checkAuth(request, cookies)) {
    return new Response(JSON.stringify({ error: '未授权' }), { status: 401 });
  }

  try {
    const data = await request.json();
    const { title, slug, description, tags, date, draft, content } = data;

    if (!title || !slug || !description) {
      return new Response(JSON.stringify({ error: '标题、slug、描述为必填项' }), { status: 400 });
    }

    // Sanitize slug
    const safeSlug = slug.replace(/[^a-zA-Z0-9\u4e00-\u9fff-]/g, '-').replace(/-+/g, '-');
    const filePath = path.join(blogDir, `${safeSlug}.md`);

    if (fs.existsSync(filePath)) {
      return new Response(JSON.stringify({ error: '该 slug 已存在' }), { status: 409 });
    }

    const tagsStr = tags && tags.length > 0 ? `\ntags: [${tags.map((t: string) => `"${t}"`).join(', ')}]` : '';
    const draftStr = draft ? '\ndraft: true' : '';

    const fileContent = `---
title: "${title}"
date: ${date || new Date().toISOString().split('T')[0]}
description: "${description}"${tagsStr}${draftStr}
---

${content || ''}
`;

    if (!fs.existsSync(blogDir)) {
      fs.mkdirSync(blogDir, { recursive: true });
    }

    fs.writeFileSync(filePath, fileContent, 'utf-8');

    return new Response(JSON.stringify({ success: true, slug: safeSlug }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: '服务器错误' }), { status: 500 });
  }
};
