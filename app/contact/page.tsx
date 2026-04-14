import React from 'react';
import { Mail, MessageSquare, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="container-custom py-12 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900  sm:text-5xl">Contact Us</h1>
        <p className="mt-6 text-lg leading-8 opacity-70">
          Have a question, feedback, or a tool suggestion? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="rounded-3xl bg-indigo-900 p-8 text-white md:p-12">
          <h2 className="text-2xl font-bold">Get in touch</h2>
          <p className="mt-4 text-indigo-100">
            Fill out the form and our team will get back to you within 24 hours.
          </p>

          <div className="mt-12 space-y-8">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-800">
                <Mail size={20} />
              </div>
              <span>support@multitoolhub.com</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-800">
                <Phone size={20} />
              </div>
              <span>+1 (555) 000-0000</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-800">
                <MapPin size={20} />
              </div>
              <span>123 Tool Street, San Francisco, CA</span>
            </div>
          </div>
        </div>

        <form className="space-y-6 rounded-3xl border border-gray-100 bg-white dark:bg-gray-800 p-8 shadow-xl md:p-12">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="first-name" className="block text-sm font-semibold leading-6 text-gray-900 ">
                First name
              </label>
              <input
                type="text"
                name="first-name"
                id="first-name"
                className="mt-2.5 block w-full rounded-xl border-0 px-3.5 py-2 text-gray-900  shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            <div>
              <label htmlFor="last-name" className="block text-sm font-semibold leading-6 text-gray-900 ">
                Last name
              </label>
              <input
                type="text"
                name="last-name"
                id="last-name"
                className="mt-2.5 block w-full rounded-xl border-0 px-3.5 py-2 text-gray-900  shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900 ">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="mt-2.5 block w-full rounded-xl border-0 px-3.5 py-2 text-gray-900  shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900 ">
              Message
            </label>
            <textarea
              name="message"
              id="message"
              rows={4}
              className="mt-2.5 block w-full rounded-xl border-0 px-3.5 py-2 text-gray-900  shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-[var(--card)]0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
