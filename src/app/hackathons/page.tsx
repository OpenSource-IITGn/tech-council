import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Users, Trophy, Clock, ExternalLink, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getHackathonsForDisplay, getHackathonStats } from "@/lib/hackathons-storage"

export const metadata: Metadata = {
  title: "Hackathons - Technical Council IITGN",
  description: "Explore upcoming, ongoing, and past hackathons organized by the Technical Council of IIT Gandhinagar.",
}

export default async function HackathonsPage() {
  const hackathons = await getHackathonsForDisplay();
  const stats = await getHackathonStats();

  // Categorize hackathons by status
  const upcomingHackathons = hackathons.filter(h => h.status === 'upcoming');
  const ongoingHackathons = hackathons.filter(h => h.status === 'ongoing');
  const previousHackathons = hackathons.filter(h => h.status === 'completed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "ongoing": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "completed": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const HackathonCard = ({ hackathon }: { hackathon: any }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                {hackathon.name}
              </CardTitle>
              <Badge className={getStatusColor(hackathon.status)}>
                {hackathon.status}
              </Badge>
            </div>
            <CardDescription className="text-base">
              {hackathon.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{hackathon.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{hackathon.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{hackathon.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{hackathon.currentParticipants || '0'} / {hackathon.maxParticipants || 'Unlimited'}</span>
            </div>
          </div>

          {/* Category and Prizes */}
          <div className="flex items-center justify-between">
            <Badge variant="outline">{hackathon.category}</Badge>
            {hackathon.prizes.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span>{hackathon.prizes.length} prize{hackathon.prizes.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button asChild className="flex-1">
              <Link href={`/hackathons/${hackathon.id}`}>
                View Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            {hackathon.registrationLink && (hackathon.status === 'upcoming' || hackathon.status === 'ongoing') && (
              <Button asChild variant="outline">
                <Link href={hackathon.registrationLink} target="_blank" rel="noopener noreferrer">
                  {hackathon.status === 'upcoming' ? 'Register' : 'Join Now'}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute inset-0 gradient-bg opacity-10" />
        <div className="container relative z-10 px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-space-grotesk">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Hackathons</span> & Competitions
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Join our exciting hackathons and coding competitions. Build innovative solutions, learn new technologies, and compete for amazing prizes.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.upcoming}</div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.totalParticipants}</div>
                <p className="text-sm text-muted-foreground">Total Participants</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">₹{(stats.totalPrizePool / 100000).toFixed(1)}L</div>
                <p className="text-sm text-muted-foreground">Total Prize Pool</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming Hackathons */}
      {upcomingHackathons.length > 0 && (
        <section className="py-16">
          <div className="container px-4 md:px-6">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk">
                  Upcoming <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Events</span>
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground">
                  Don't miss out on these exciting upcoming hackathons and competitions
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingHackathons.map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Ongoing Hackathons */}
      {ongoingHackathons.length > 0 && (
        <section className="py-16 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk">
                  Ongoing <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Events</span>
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground">
                  These hackathons are currently in progress
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ongoingHackathons.map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Previous Hackathons */}
      {previousHackathons.length > 0 && (
        <section className="py-16">
          <div className="container px-4 md:px-6">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk">
                  Previous <span className="bg-gradient-to-r from-gray-600 to-purple-600 bg-clip-text text-transparent">Events</span>
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground">
                  Explore our past hackathons and their amazing outcomes
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {previousHackathons.slice(0, 6).map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}
              </div>
              {previousHackathons.length > 6 && (
                <div className="text-center">
                  <Button variant="outline" size="lg">
                    View All Previous Events
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {hackathons.length === 0 && (
        <section className="py-16">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto" />
              <h2 className="text-2xl font-bold">No Hackathons Available</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're working on organizing exciting hackathons and competitions. Stay tuned for updates!
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
