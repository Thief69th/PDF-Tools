import Image from 'next/image';
import { Target, Users, Shield, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container-custom py-12 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900  sm:text-5xl ">About MultiTool Hub</h1>
        <p className="mt-6 text-lg leading-8 opacity-70">
          We are on a mission to provide the most comprehensive and easy-to-use collection of online tools for digital professionals worldwide.
        </p>
      </div>

      <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 ">Our Story</h2>
          <p className="mt-6 text-lg opacity-70">
            MultiTool Hub started as a small internal project to help our team of developers and designers save time on repetitive tasks. We soon realized that these tools could benefit millions of others, so we decided to open them up to the world.
          </p>
          <p className="mt-4 text-lg opacity-70">
            Today, we serve thousands of users daily, providing everything from simple unit converters to complex developer utilities.
          </p>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-3xl shadow-2xl">
          <Image
            src="https://picsum.photos/seed/about/800/600"
            alt="Our Team"
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-indigo-600 opacity-20" />
        </div>
      </div>

      <div className="mt-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 ">Our Values</h2>
          <p className="mt-4 text-lg opacity-70">
            The principles that guide everything we build.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: 'Accessibility',
              description: 'Tools should be free and accessible to everyone, regardless of their background.',
              icon: Users,
            },
            {
              name: 'Privacy',
              description: 'Your data is yours. We process everything in your browser whenever possible.',
              icon: Shield,
            },
            {
              name: 'Simplicity',
              description: 'We believe in clean, intuitive interfaces that get out of your way.',
              icon: Target,
            },
            {
              name: 'Speed',
              description: 'Time is money. Our tools are optimized for maximum performance.',
              icon: Zap,
            },
          ].map((value) => (
            <div key={value.name} className="rounded-2xl border border-gray-100 bg-white dark:bg-gray-800 p-8 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--card)] text-[var(--accent)]">
                <value.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 ">{value.name}</h3>
              <p className="mt-2 text-sm opacity-60">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
