import { Card } from "@/components/ui/card"
import { Gamepad2, Monitor, Users } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Gamepad2,
      title: "Game Area",
      description:
        "Players can play games by inviting the other players. Coach can watch the games played by the students. It helps the students to play with the engine for practice.",
      image: "/chess-game-area-interface.jpg",
    },
    {
      icon: Monitor,
      title: "Online Classes",
      description:
        'Conduct interactive One to One or One to Many classes with students. Coach can conduct "Open Classroom" where the students under the coach can attend the classes.',
      image: "/online-chess-class-interface.jpg",
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Manage your chess academy team with professional coaches and track student progress effectively.",
      image: "/chess-team-management-dashboard.jpg",
    },
  ]

  return (
    <section id="features" className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Our Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Discover the comprehensive features that make our chess academy the perfect place for learning and growth.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-scale"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={feature.image || "/placeholder.svg"}
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground text-pretty">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
