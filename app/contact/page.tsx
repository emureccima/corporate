import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ContactPage() {
  return (
    <div className="container py-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif font-bold">Contact Us</h1>
        <p className="text-xl text-neutral max-w-2xl mx-auto">
          Get in touch with our cooperative team. We're here to help you with any questions or concerns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-serif font-bold mb-6">Get in Touch</h2>
            <div className="space-y-6">
              <Card>
                <CardContent className="flex items-center space-x-4 pt-6">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-neutral">info@EMURECCIMA.org</p>
                    <p className="text-sm text-neutral">We'll respond within 24 hours</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center space-x-4 pt-6">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Phone className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-neutral">+1 (555) 123-4567</p>
                    <p className="text-sm text-neutral">Monday - Friday, 9 AM - 5 PM</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center space-x-4 pt-6">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Address</h3>
                    <p className="text-neutral">123 Community Street</p>
                    <p className="text-neutral">City, State 12345</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center space-x-4 pt-6">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Office Hours</h3>
                    <p className="text-neutral">Monday - Friday: 9:00 AM - 5:00 PM</p>
                    <p className="text-neutral">Saturday: 10:00 AM - 2:00 PM</p>
                    <p className="text-neutral">Sunday: Closed</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="Enter your first name"
                    required
                  />
                  <Input
                    label="Last Name"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
                
                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  required
                />
                
                <Input
                  label="Phone"
                  type="tel"
                  placeholder="Enter your phone number"
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <select className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-neutral focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent">
                    <option value="">Select a subject</option>
                    <option value="membership">Membership Inquiry</option>
                    <option value="loans">Loan Information</option>
                    <option value="savings">Savings Account</option>
                    <option value="events">Events & Activities</option>
                    <option value="technical">Technical Support</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    className="flex min-h-[120px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-neutral focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="Enter your message..."
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-neutral">Quick answers to common questions about our cooperative</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How do I become a member?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral">
                You can register online through our website, pay the membership fee, and wait for admin approval. 
                Once approved, you'll receive your membership number and access to all services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What are the membership benefits?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral">
                Members enjoy competitive savings rates, low-interest loans, dividend distributions, 
                and participation in community events and decision-making processes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How do I make payments?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral">
                You can make payments through bank transfer to our cooperative account. 
                Our payment system supports both online and offline transfers with admin confirmation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">When are dividends distributed?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral">
                Dividends are typically distributed annually based on the cooperative's financial performance 
                and your participation level throughout the year.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}