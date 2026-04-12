import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AdBanner from '@/components/AdBanner';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // In a real app, you would fetch this from Supabase or a CMS
  const post = {
    title: '10 Essential Tools for Modern Web Developers',
    content: `
# 10 Essential Tools for Modern Web Developers

In the fast-paced world of web development, staying productive is key. Having the right tools in your arsenal can make the difference between a project that drags on and one that is completed efficiently and with high quality.

## 1. Visual Studio Code
VS Code has become the industry standard for a reason. Its vast ecosystem of extensions and built-in features like IntelliSense and Git integration make it indispensable.

## 2. Chrome DevTools
Essential for debugging and optimizing your web applications in real-time.

## 3. Postman
The go-to tool for API development and testing.

## 4. Git & GitHub
Version control is not optional. GitHub provides a platform for collaboration and code hosting.

## 5. Figma
For designing and prototyping user interfaces before you start coding.

## 6. MultiTool Hub
Our own collection of utilities like JSON formatters and image compressors can save you minutes every day.

...and more!
    `,
    date: 'March 15, 2024',
    author: 'Alex Johnson',
    category: 'Development',
    image: 'https://picsum.photos/seed/dev/1200/600',
  };

  return (
    <article className="container-custom py-12 md:py-20">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 mb-8 dark:text-gray-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft size={16} />
        Back to Blog
      </Link>

      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-x-4 text-xs font-medium text-indigo-600 uppercase tracking-widest mb-4 dark:text-indigo-400">
          <Tag size={14} />
          {post.category}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6 dark:text-white">
          {post.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-10 border-b border-gray-100 dark:border-gray-800 pb-6 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <User size={16} />
            {post.author}
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            {post.date}
          </div>
        </div>

        <div className="relative aspect-video w-full overflow-hidden rounded-3xl shadow-xl mb-12">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="mt-12">
          <AdBanner slot="blog-post-top" />
        </div>

        <div className="prose prose-indigo prose-lg max-w-none mt-12 dark:prose-invert">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <div className="mt-12">
          <AdBanner slot="blog-post-bottom" />
        </div>
      </div>
    </article>
  );
}
