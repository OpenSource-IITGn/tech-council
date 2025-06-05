"use client"

import { useEffect, useState } from "react"
import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Club {
  id: string;
  name: string;
  description: string;
  type: "club" | "hobby-group";
  category: string;
  logoPath?: string;
}

// Helper function to get logo path
const getLogoPath = (club: Club) => {
  if (club.logoPath) {
    return club.logoPath;
  }

  // Fallback to static logo mapping for existing clubs
  const logoMap: Record<string, string> = {
    // Technical Clubs
    'metis': '/logos/clubs/metis.jpeg',
    'digis': '/logos/clubs/digis.jpg',
    'mean-mechanics': '/logos/clubs/mean-mechanics.png',
    'odyssey': '/logos/clubs/odyssey.jpg',
    'grasp': '/logos/clubs/grasp.png',
    'machine-learning': '/logos/clubs/machine-learning.jpeg',
    'tinkerers-lab': '/logos/clubs/tinkerers-lab.png',
    'anveshanam': '/logos/clubs/anveshanam.png',

    // Hobby Groups
    'embed': '/logos/hobby-groups/embed.png',
    'blockchain-hobby': '/logos/hobby-groups/blockchain-hobby.png',
  }

  return logoMap[club.id] || null
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClubs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/clubs", {
        cache: 'no-store', // Ensure fresh data
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch clubs: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setClubs(data);
    } catch (error) {
      console.error("Error fetching clubs:", error);
      setError(error instanceof Error ? error.message : "Failed to load clubs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  // Separate clubs, hobby groups, and technical council groups
  const technicalClubs = clubs.filter(item => item.type === "club")
  const hobbyGroups = clubs.filter(item => item.type === "hobby-group")
  const technicalCouncilGroups = clubs.filter(item => item.type === "technical-council-group")

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading clubs and hobby groups...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
        <p className="text-red-600 mb-4 text-center max-w-md">{error}</p>
        <Button onClick={fetchClubs} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute inset-0 gradient-bg opacity-10" />
        <div className="container relative z-10 px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-space-grotesk">
              Clubs and Hobby Groups Under the <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Technical Council</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Discover your passion and join a community of like-minded innovators across technical clubs and hobby groups
            </p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-muted/20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {technicalClubs.length}
              </div>
              <div className="text-lg font-semibold">Technical Clubs</div>
              <div className="text-sm text-muted-foreground">
                Cutting-edge technology and innovation
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {hobbyGroups.length}
              </div>
              <div className="text-lg font-semibold">Hobby Groups</div>
              <div className="text-sm text-muted-foreground">
                Creative and recreational activities
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                500+
              </div>
              <div className="text-lg font-semibold">Active Members</div>
              <div className="text-sm text-muted-foreground">
                Students engaged across all groups
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Clubs Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk mb-4">
              Technical <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Clubs</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join our technical clubs to enhance your skills, work on cutting-edge projects, and collaborate with fellow tech enthusiasts
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {technicalClubs.map((club) => (
              <Link
                key={club.id}
                href={`/clubs/${club.id}`}
                className="group block"
              >
                <div className="flex items-start gap-4 p-6 rounded-lg bg-white/10 dark:bg-white/5 backdrop-blur-md border-0 transition-all duration-300 hover:bg-white/20 hover:dark:bg-white/10 hover:shadow-lg hover:scale-105 hover:-translate-y-1">
                  {/* Club Logo */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center overflow-hidden">
                    {getLogoPath(club) ? (
                      <Image
                        src={getLogoPath(club)!}
                        alt={`${club.name} logo`}
                        width={64}
                        height={64}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="text-xl font-bold text-muted-foreground/80">
                        {club.name.split(' ').map((word: string) => word[0]).join('')}
                      </div>
                    )}
                  </div>

                  {/* Club Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                      {club.name}
                    </h3>

                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {club.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Groups under Technical Council Section */}
      <section className="py-16 bg-muted/20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk mb-4">
              Groups under <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Technical Council</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Specialized groups operating under the Technical Council, providing unique resources and opportunities for innovation and development
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {technicalCouncilGroups.map((group) => (
              <Link
                key={group.id}
                href={`/clubs/${group.id}`}
                className="group block"
              >
                <div className="flex items-start gap-4 p-6 rounded-lg bg-white/10 dark:bg-white/5 backdrop-blur-md border-0 transition-all duration-300 hover:bg-white/20 hover:dark:bg-white/10 hover:shadow-lg hover:scale-105 hover:-translate-y-1">
                  {/* Group Logo */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-green-600/20 to-teal-600/20 flex items-center justify-center overflow-hidden">
                    {getLogoPath(group) ? (
                      <Image
                        src={getLogoPath(group)!}
                        alt={`${group.name} logo`}
                        width={64}
                        height={64}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="text-xl font-bold text-muted-foreground/80">
                        {group.name.split(' ').map((word: string) => word[0]).join('')}
                      </div>
                    )}
                  </div>

                  {/* Group Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-green-600 transition-colors">
                      {group.name}
                    </h3>

                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {group.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hobby Groups Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk mb-4">
              Hobby <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Groups</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore your creative side and pursue your hobbies with like-minded individuals in our diverse hobby groups
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hobbyGroups.map((group) => (
              <Link
                key={group.id}
                href={`/clubs/${group.id}`}
                className="group block"
              >
                <div className="flex items-start gap-4 p-6 rounded-lg bg-white/10 dark:bg-white/5 backdrop-blur-md border-0 transition-all duration-300 hover:bg-white/20 hover:dark:bg-white/10 hover:shadow-lg hover:scale-105 hover:-translate-y-1">
                  {/* Group Logo */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center overflow-hidden">
                    {getLogoPath(group) ? (
                      <Image
                        src={getLogoPath(group)!}
                        alt={`${group.name} logo`}
                        width={64}
                        height={64}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="text-xl font-bold text-muted-foreground/80">
                        {group.name.split(' ').map((word: string) => word[0]).join('')}
                      </div>
                    )}
                  </div>

                  {/* Group Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-600 transition-colors">
                      {group.name}
                    </h3>

                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {group.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


    </div>
  )
}
