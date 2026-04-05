import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

const blogDir = path.join(process.cwd(), 'src/content/blog');

function checkAuth(cookies: any): boolean {
  const token = cookies.get('admin_token')?.value;
  const expected = import.meta.env.ADMIN_PASSWORD || 'admin888';
  return token === expected;
}

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  if (!checkAuth(cookies)) {
    return new Response(JSON.stringify({ error: '未授权' }), { status: 401 });
  }

  try {
    const originalSlug = params.slug;
    const data = await request.json();
    const { title, slug, description, tags, date, draft, content } = data;

    if (!title || !slug || !description) {
      return new Response(JSON.stringify({ error: '标题、slug、描述为必填项' }), { status: 400 });
    }

    const originalPath = path.join(blogDir, `${originalSlug}.md`);
    if (!fs.existsSync(originalPath)) {
      return new Response(JSON.stringify({ error: '文章不存在' }), { status: 404 });
    }

    const safeSlug = slug.replace(/[^a-zA-Z0-9\u4e00-\u9fff-]/g, '-').replace(/-+/g, '-');
    const newPath = path.join(blogDir, `${safeSlug}.md`);

    // If slug changed, check new slug doesn't exist
    if (safeSlug !== originalSlug && fs.existsSync(newPath)) {
      return new Response(JSON.stringify({ error: '新 slug 已存在' }), { status: 409 });
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

    // Delete old file if slug changed
    if (safeSlug !== originalSlug) {
      fs.unlinkSync(originalPath);
    }

    fs.writeFileSync(newPath, fileContent, 'utf-8');

    return new Response(JSON.stringify({ success: true, slug: safeSlug }));
  } catch (err) {
    return new Response(JSON.stringify({ error: '服务器错误' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  if (!checkAuth(cookies)) {
    return new Response(JSON.stringify({ error: '未授权' }), { status: 401 });
  }

  try {
    const slug = params.slug;
    const filePath = path.join(blogDir, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return new Response(JSON.stringify({ error: '文章不存在' }), { status: 404 });
    }

    fs.unlinkSync(filePath);
    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    return new Response(JSON.stringify({ error: '服务器错误' }), { status: 500 });
  }
};
