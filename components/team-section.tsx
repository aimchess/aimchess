import { Card } from "@/components/ui/card"
import { Star, Award } from "lucide-react"

export function TeamSection() {
  const teamMembers = [
    {
      name: "Tejaswin Naresh",
      title: "FIDE Instructor, State Player and Chess Coach",
      rating: "FIDE Rated",
      image: "/professional-chess-coach-male-instructor.jpg",
      achievements: ["State Champion", "FIDE Instructor", "10+ Years Experience"],
    },
    {
      name: "Tejaswin Aruna",
      title: "FIDE Rated Player and Chess Coach",
      rating: "FIDE Rated",
      image: "/professional-chess-coach-female-instructor.jpg",
      achievements: ["FIDE Rated Player", "Tournament Winner", "8+ Years Experience"],
    },
    {
      name: "Ranghunathan K S",
      title: "International FIDE Rated",
      rating: "International FIDE",
      image: "/international-chess-master-coach.jpg",
      achievements: ["International Player", "Master Level", "15+ Years Experience"],
    },
    {
      name: "Kethavath Lokesh",
      title: "International FIDE Rated",
      rating: "International FIDE",
      image: "/chess-grandmaster-coach-instructor.jpg",
      achievements: ["International Master", "Tournament Director", "12+ Years Experience"],
    },
  ]

  return (
    <section id="team" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Our Team Members</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Meet our experienced and FIDE-rated chess coaches who are dedicated to helping you master the game.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <Card
              key={index}
              className="bg-card border-border overflow-hidden hover:scale-105 transition-all duration-300 animate-fade-scale"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-foreground">{member.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-current text-accent" />
                    <span className="text-xs text-muted-foreground">{member.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{member.title}</p>

                <div className="space-y-1">
                  {member.achievements.map((achievement, achievementIndex) => (
                    <div key={achievementIndex} className="flex items-center space-x-2">
                      <Award className="w-3 h-3 text-accent" />
                      <span className="text-xs text-foreground">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
