import { Card } from "@/components/ui/card"
import { CheckCircle, Target, Users, Award } from "lucide-react"

export function AboutSection() {
  const features = [
    {
      icon: Target,
      title: "Professional Training",
      description: "Learn from FIDE rated instructors and professional chess coaches.",
    },
    {
      icon: Users,
      title: "Safe Learning Environment",
      description: "We create a safe learning environment for students to develop their skills.",
    },
    {
      icon: Award,
      title: "Quality Training",
      description:
        "We provide quality training to all players to show their talent in local, national and international tournaments.",
    },
    {
      icon: CheckCircle,
      title: "Proven Methods",
      description: "We share examples from our collective experience to enhance learning.",
    },
  ]

  const process = [
    "Open Website",
    "Visit Royal Rooksacademy.com",
    "Select Online Coaching",
    "Enter User Name and Password",
    "Username: tca",
    "Password: 0123",
  ]

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Content */}
          <div className="animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
              "Royal Rooks academy is the place for professional chess training"
            </h2>

            <div className="space-y-4 mb-8">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Royal Rooks academy</h3>
                <p className="text-muted-foreground">www.Royal Rookacademy.com</p>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-4">Process For Online Classes</h4>
              <ol className="space-y-2">
                {process.map((step, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="bg-accent text-accent-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="animate-fade-scale">
            <div className="relative">
              <img
                src="/chess-academy-instructor-teaching-students.jpg"
                alt="Chess Academy Training"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>

        {/* About Us Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">About Us</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
            Founded by the desire to reimagine the traditional chess learning experience and develop in students a
            strong foundation for future success.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-scale"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground text-sm text-pretty">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
