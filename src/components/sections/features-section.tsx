"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Code, Cpu, Rocket, Zap, Globe, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Code,
    title: "Technical Excellence",
    description: "Fostering innovation through cutting-edge technology and programming excellence.",
    color: "text-blue-600"
  },
  {
    icon: Cpu,
    title: "Hardware Innovation",
    description: "Building the future with robotics, electronics, and embedded systems.",
    color: "text-green-600"
  },
  {
    icon: Rocket,
    title: "Startup Culture",
    description: "Encouraging entrepreneurship and turning ideas into reality.",
    color: "text-purple-600"
  },
  {
    icon: Zap,
    title: "Fast Innovation",
    description: "Rapid prototyping and agile development methodologies.",
    color: "text-yellow-600"
  },
  {
    icon: Globe,
    title: "Global Impact",
    description: "Creating solutions that make a difference worldwide.",
    color: "text-indigo-600"
  },
  {
    icon: Brain,
    title: "AI & ML",
    description: "Exploring artificial intelligence and machine learning frontiers.",
    color: "text-red-600"
  }
]

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.feature-card')
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.remove('opacity-0')
                card.classList.add('opacity-100', 'animate-slide-up')
              }, index * 100)
            })
          }
        })
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-800/50" ref={sectionRef}>
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-space-grotesk">
              Why Choose Tech Council?
            </h2>
            <p className="mx-auto max-w-[900px] text-gray-600 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              We are the hub of technical innovation at IIT Gandhinagar, fostering creativity,
              collaboration, and cutting-edge research across multiple domains.
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="feature-card opacity-0 group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <div className="space-y-2 mt-4">
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            )
          })}
        </div>


      </div>
    </section>
  )
}
