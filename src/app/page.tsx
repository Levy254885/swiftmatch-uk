import Link from 'next/link';
import { SERVICE_CATEGORIES } from '@/constants/services';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight text-slate-900">
              SwiftMatch
            </span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
              UK
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <Link href="/services" className="hover:text-slate-900">
              Services
            </Link>
            <Link href="/for-professionals" className="hover:text-slate-900">
              For professionals
            </Link>
            <Link href="/how-it-works" className="hover:text-slate-900">
              How it works
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Log in
            </Link>
            <Link
              href="/request"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Find a professional
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
          <h1 className="text-center text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Need a professional?
          </h1>
          <p className="mt-3 text-center text-lg text-slate-600">
            Tell us what you need. We&apos;ll find someone suitable and available.
          </p>

          <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <label htmlFor="job-description" className="sr-only">
              Describe what you need
            </label>
            <textarea
              id="job-description"
              rows={3}
              placeholder={`"My boiler has stopped working and I need someone today."`}
              className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                placeholder="Postcode (e.g. M1 1AE)"
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              <select
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                defaultValue="today"
              >
                <option value="emergency">Emergency — now</option>
                <option value="today">Today</option>
                <option value="within_24h">Within 24 hours</option>
                <option value="this_week">This week</option>
                <option value="flexible">Flexible</option>
              </select>
              <Link
                href="/request"
                className="rounded-lg bg-slate-900 px-6 py-2.5 text-center text-sm font-medium text-white hover:bg-slate-800"
              >
                Find a professional
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-xl font-semibold text-slate-900">Popular services</h2>
        <p className="mt-1 text-sm text-slate-600">
          From emergency repairs to planned work across the UK.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {SERVICE_CATEGORIES.slice(0, 12).map((cat) => (
            <Link
              key={cat.id}
              href={`/services/${cat.slug}`}
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-xl font-semibold text-slate-900">
            How it works
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                1
              </div>
              <h3 className="mt-4 font-medium text-slate-900">Describe the job</h3>
              <p className="mt-2 text-sm text-slate-600">
                Tell us what you need in your own words. Add photos if helpful.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                2
              </div>
              <h3 className="mt-4 font-medium text-slate-900">We find available professionals</h3>
              <p className="mt-2 text-sm text-slate-600">
                Our matching engine identifies suitable, verified professionals near you who are available.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                3
              </div>
              <h3 className="mt-4 font-medium text-slate-900">Choose and book</h3>
              <p className="mt-2 text-sm text-slate-600">
                Compare matches or quotes, chat if needed, and book with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            Verified professionals. Real availability.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            We prioritise the right professional over the fastest or cheapest.
            Availability is checked in real time. Profiles show verification,
            ratings, completed jobs and response performance.
          </p>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold">Are you a professional?</h2>
              <p className="mt-2 max-w-md text-slate-300">
                Receive relevant job requests in real time. Set your availability,
                services and areas. Get matched with customers who need you now.
              </p>
            </div>
            <Link
              href="/for-professionals"
              className="rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              Join as a professional
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col gap-8 md:flex-row md:justify-between">
            <div>
              <span className="text-lg font-semibold text-slate-900">SwiftMatch</span>
              <p className="mt-2 max-w-xs text-sm text-slate-500">
                Instant service matching for the United Kingdom.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h4 className="text-sm font-medium text-slate-900">Product</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>
                    <Link href="/services">Services</Link>
                  </li>
                  <li>
                    <Link href="/how-it-works">How it works</Link>
                  </li>
                  <li>
                    <Link href="/for-professionals">For professionals</Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-900">Company</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>
                    <Link href="/about">About</Link>
                  </li>
                  <li>
                    <Link href="/support">Support</Link>
                  </li>
                  <li>
                    <Link href="/privacy">Privacy</Link>
                  </li>
                  <li>
                    <Link href="/terms">Terms</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-slate-100 pt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} SwiftMatch UK. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
