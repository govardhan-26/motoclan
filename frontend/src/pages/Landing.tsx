import { Link } from 'react-router-dom'
import { Bike, Users, Map, BookOpen, ChevronRight, Star, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Landing() {
  const { isDark, toggle } = useTheme()

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-20 backdrop-blur-md border-b border-dark-border ${isDark ? 'bg-dark-bg/80' : 'bg-light-bg/90'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Bike className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold tracking-wide">
              MOTO<span className="text-accent">CLAN</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-gray-400 hover:bg-dark-hover transition-colors"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              to="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Join Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent border border-accent/30 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Star className="w-3.5 h-3.5 fill-current" />
            The #1 Motorcycle Community Platform
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
            Ride Together.
            <br />
            <span className="text-accent">Connect Forever.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Find your tribe, plan epic rides, share your journey. MotoClan is where
            passionate riders build lifelong bonds on and off the road.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="btn-primary text-base px-8 py-3 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Join Free
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="btn-secondary text-base px-8 py-3 w-full sm:w-auto text-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-dark-border bg-dark-surface">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
          {[
            { value: '10K+', label: 'Riders' },
            { value: '500+', label: 'Rides Organized' },
            { value: '200+', label: 'Communities' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-display text-3xl md:text-4xl font-bold text-accent">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="text-accent">Ride Better</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              From planning your next adventure to sharing stories from the road,
              MotoClan has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Users className="w-6 h-6 text-accent" />,
                title: 'Vibrant Community',
                description:
                  'Connect with thousands of riders who share your passion. Join groups, follow riders, and build lasting friendships.',
              },
              {
                icon: <Map className="w-6 h-6 text-accent" />,
                title: 'Epic Group Rides',
                description:
                  'Organize or join rides across the country. Set routes, manage participants, and explore new destinations together.',
              },
              {
                icon: <BookOpen className="w-6 h-6 text-accent" />,
                title: 'Share Your Stories',
                description:
                  'Post photos, ride reviews, and bike builds. Inspire others and get inspired by the community.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="card p-6 space-y-4 hover:border-accent/40 transition-colors"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-accent/20 to-orange-900/20 border border-accent/30 rounded-3xl p-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Hit the Road?
          </h2>
          <p className="text-gray-400 mb-8">
            Join thousands of riders already on MotoClan. It's free, forever.
          </p>
          <Link
            to="/register"
            className="btn-primary text-base px-10 py-3 inline-flex items-center gap-2"
          >
            Create Your Account
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border py-8 px-6 text-center text-gray-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-accent rounded-md flex items-center justify-center">
            <Bike className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-gray-400">MOTOCLAN</span>
        </div>
        <p>Ride Together. Connect Forever.</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} MotoClan. All rights reserved.</p>
      </footer>
    </div>
  )
}
