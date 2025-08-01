import Link from 'next/link';
import { ArrowRight, Users, CreditCard, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-foreground to-neutral-800 text-background">
        <div className="container py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl lg:text-6xl font-serif font-bold leading-tight">
              Building <span className="text-accent">Together</span>,<br />
              Growing <span className="text-accent">Together</span>
            </h1>
            <p className="text-xl lg:text-2xl text-neutral-300 max-w-2xl mx-auto">
              Join our cooperative society and be part of a community that believes in mutual support, 
              shared prosperity, and collective growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" variant="accent">
                  Become a Member
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/events">
                <Button size="lg" variant="ghost">
                  Explore Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold">
            Why Choose Our Cooperative?
          </h2>
          <p className="text-xl text-neutral max-w-2xl mx-auto">
            Experience the benefits of collective strength and shared prosperity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Community First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral">
                Be part of a supportive community that prioritizes collective growth and mutual assistance.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Savings & Loans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral">
                Access competitive savings accounts and loan services designed for members by members.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Regular Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral">
                Participate in community events, workshops, and social gatherings that strengthen our bonds.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Financial Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral">
                Benefit from profit-sharing and dividend distributions based on cooperative success.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-neutral-50">
        <div className="container py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-serif font-bold">
                Comprehensive Financial Services
              </h2>
              <p className="text-lg text-neutral">
                Our cooperative offers a full range of financial services designed to meet the diverse needs 
                of our members. From savings accounts to loan services, we're here to support your financial journey.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  <span>Competitive interest rates on savings</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  <span>Low-interest loans for members</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  <span>Emergency financial assistance</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  <span>Annual dividend distributions</span>
                </li>
              </ul>
              <Link href="/auth/register">
                <Button variant="accent" size="lg">
                  Join Today
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-accent">$2.5M+</div>
                  <div className="text-lg font-medium">Total Member Savings</div>
                  <div className="text-sm text-neutral">Growing every month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container">
        <div className="bg-foreground text-background rounded-2xl p-12 text-center space-y-6">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
            Start your journey with us today. Become a member and experience the power of collective growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="accent">
                Register Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="ghost">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
