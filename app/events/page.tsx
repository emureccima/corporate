import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Mock data - in production, this would come from Appwrite
const events = [
  {
    id: '1',
    title: 'Annual General Meeting',
    description: 'Join us for our annual general meeting to discuss cooperative updates, financial reports, and future plans.',
    date: '2025-02-15',
    time: '10:00 AM',
    location: 'Community Center Hall',
    status: 'Upcoming',
    attendees: 45,
    imageUrl: null,
  },
  {
    id: '2',
    title: 'Financial Literacy Workshop',
    description: 'Learn about budgeting, savings strategies, and investment opportunities.',
    date: '2025-02-28',
    time: '2:00 PM',
    location: 'Training Room B',
    status: 'Upcoming',
    attendees: 23,
    imageUrl: null,
  },
  {
    id: '3',
    title: 'Community Cleanup Drive',
    description: 'Join our environmental initiative to keep our community clean and green.',
    date: '2025-03-10',
    time: '9:00 AM',
    location: 'Community Park',
    status: 'Upcoming',
    attendees: 67,
    imageUrl: null,
  },
];

export default function EventsPage() {
  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif font-bold">Community Events</h1>
        <p className="text-xl text-neutral max-w-2xl mx-auto">
          Stay connected with your cooperative community through our regular events and activities
        </p>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  event.status === 'Upcoming' 
                    ? 'bg-accent/10 text-accent' 
                    : 'bg-neutral-100 text-neutral'
                }`}>
                  {event.status}
                </span>
                <div className="flex items-center text-sm text-neutral">
                  <Users className="h-4 w-4 mr-1" />
                  {event.attendees}
                </div>
              </div>
              <CardTitle className="text-xl">{event.title}</CardTitle>
              <CardDescription>{event.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-accent" />
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-accent" />
                  {event.time}
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-accent" />
                  {event.location}
                </div>
              </div>
              <Button className="w-full" variant="outline">
                Register Interest
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center space-y-4 py-12">
        <h2 className="text-2xl font-serif font-bold">Don't Miss Our Events</h2>
        <p className="text-neutral">
          Become a member to participate in all our community events and activities
        </p>
        <Button variant="accent" size="lg">
          Join Our Cooperative
        </Button>
      </div>
    </div>
  );
}