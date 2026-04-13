import Image from 'next/image';
import Link from 'next/link';
import AdBanner from '@/components/AdBanner';

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: '10 Essential Tools for Modern Web Developers',
      excerpt: 'From code editors to browser extensions, these tools will supercharge your development workflow.',
      date: 'March 15, 2024',
      category: 'Development',
      author: 'Alex Johnson',
      image: 'https://picsum.photos/seed/dev/800/500',
      slug: 'essential-tools-modern-dev'
    },
    {
      id: 2,
      title: 'How to Improve Your Website SEO in 2024',
      excerpt: 'Learn the latest SEO strategies to help your website rank higher in search engine results.',
      date: 'March 10, 2024',
      category: 'Marketing',
      author: 'Sarah Miller',
      image: 'https://picsum.photos/seed/seo/800/500',
      slug: 'improve-website-seo-2024'
    },
    {
      id: 3,
      title: 'The Future of AI in Productivity Tools',
      excerpt: 'How artificial intelligence is transforming the way we use online tools and manage our tasks.',
      date: 'March 5, 2024',
      category: 'Technology',
      author: 'David Chen',
      image: 'https://picsum.photos/seed/ai/800/500',
      slug: 'future-of-ai-productivity'
    },
    {
      id: 4,
      title: 'Designing Better User Interfaces: A Guide',
      excerpt: 'Principles and practices for creating intuitive and visually appealing user interfaces.',
      date: 'February 28, 2024',
      category: 'Design',
      author: 'Emma Wilson',
      image: 'https://picsum.photos/seed/design/800/500',
      slug: 'designing-better-ui-guide'
    }
  ];

  return (
    <div className="container-custom py-12 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl ">Our Blog</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-white">
          Insights, tutorials, and news from the world of technology and productivity.
        </p>
      </div>

      <div className="mt-12">
        <AdBanner slot="blog-top" />
      </div>

      <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
        {posts.map((post) => (
          <article key={post.id} className="flex flex-col gap-6 md:flex-row lg:flex-col xl:flex-row">
            <Link href={`/blog/${post.slug}`} className="shrink-0 relative aspect-video w-full overflow-hidden rounded-2xl md:w-64 lg:w-full xl:w-64">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </Link>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-x-4 text-xs">
                <time dateTime={post.date} className="text-gray-500 dark:text-white">{post.date}</time>
                <span className="rounded-full bg-indigo-50 px-3 py-1.5 font-medium text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  {post.category}
                </span>
              </div>
              <h2 className="mt-3 text-xl font-bold text-gray-900 dark:text-white hover:text-indigo-600  dark:hover:text-indigo-400">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-white line-clamp-2">
                {post.excerpt}
              </p>
              <div className="mt-4 flex items-center gap-x-2">
                <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-800" />
                <span className="text-xs font-medium text-gray-900 dark:text-white">{post.author}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-20">
        <AdBanner slot="blog-bottom" />
      </div>
    </div>
  );
}
