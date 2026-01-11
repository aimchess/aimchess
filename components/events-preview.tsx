import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Clock, MapPin, Trophy, Users, Zap } from "lucide-react";
import Link from "next/link";

export function EventsPreview() {
  const upcomingEvents = [
    {
      id: 1,
      title: "Monthly Chess Tournament",
      date: "October 15, 2025",
      time: "10:00 AM - 6:00 PM",
      location: "Main Academy Hall",
      type: "Tournament",
      participants: "32 players",
      icon: Trophy,
      description:
        "Compete against fellow chess enthusiasts in our monthly tournament with exciting prizes.",
      bgColorClass: "bg-blue-50",
      badgeBgClass: "bg-blue-100",
      badgeTextClass: "text-blue-700",
      iconColorClass: "text-blue-600",
    },
    {
      id: 2,
      title: "Beginner's Workshop",
      date: "October 20, 2025",
      time: "2:00 PM - 4:00 PM",
      location: "Training Room A",
      type: "Workshop",
      participants: "15 students",
      icon: Users,
      bgColorClass: "bg-purple-50",
      badgeBgClass: "bg-purple-100",
      badgeTextClass: "text-purple-700",
      iconColorClass: "text-purple-600",
    },
    {
      id: 3,
      title: "Grandmaster Masterclass",
      date: "November 05, 2025",
      time: "11:00 AM - 1:00 PM",
      location: "Conference Hall",
      type: "Masterclass",
      participants: "50 attendees",
      icon: Zap,
      bgColorClass: "bg-pink-50",
      badgeBgClass: "bg-pink-100",
      badgeTextClass: "text-pink-700",
      iconColorClass: "text-pink-600",
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#F5F7FA] via-[#E2E8F0] to-[#2B6CB0]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#2B6CB0] to-[#9F7AEA] bg-clip-text text-transparent mb-4">
            Upcoming Events
          </h2>
          <p className="text-lg text-[#2D3748] max-w-2xl mx-auto">
            Join our exciting chess events, tournaments, and workshops designed
            to enhance your skills and connect with fellow players.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {upcomingEvents.map((event) => {
            const IconComponent = event.icon;
            return (
              <Card
                key={event.id}
                className={`${event.bgColorClass} hover-lift border border-gray-200 hover:border-opacity-60 transition-all duration-300`}
              >
                <CardHeader className="pb-4">
                  <div
                    className={`flex items-center gap-3 mb-2 p-2 rounded-lg ${event.badgeBgClass} inline-block`}
                  >
                    <div
                      className={`p-2 rounded-lg ${event.badgeBgClass} flex items-center justify-center`}
                    >
                      <IconComponent
                        className={`h-5 w-5 ${event.iconColorClass}`}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded-full ${event.badgeTextClass} bg-opacity-20`}
                    >
                      {event.type}
                    </span>
                  </div>
                  <CardTitle className="text-xl text-[#2D3748]">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="text-[#4A5568]">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-[#4A5568]">
                    <Calendar className="h-4 w-4 text-[#2B6CB0]" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#4A5568]">
                    <Clock className="h-4 w-4 text-[#2B6CB0]" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#4A5568]">
                    <MapPin className="h-4 w-4 text-[#2B6CB0]" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#4A5568]">
                    <Users className="h-4 w-4 text-[#2B6CB0]" />
                    <span>{event.participants}</span>
                  </div>
                  <Link href="/contact" className="cursor-pointer w-full sm:w-auto">
                  <Button className="w-full mt-4 bg-[#2B6CB0] hover:bg-[#2B6CB0]/90 text-white">
                    Register Now
                  </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Link href="/events">
            <Button
              variant="outline"
              size="lg"
              className="border-[#2B6CB0] text-[#2B6CB0] hover:bg-[#2B6CB0] hover:text-white bg-transparent"
            >
              View All Events
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
