"use client";
import Image from "next/image";
import { useState } from "react";
import { Home } from "lucide-react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import AzamImg from "../../../../public/devs/Azam.jpeg";
import LuckyImg from "../../../../public/devs/Lucky.jpeg";
import SuryaImg from "../../../../public/devs/Surya.jpeg";
import BrahmendraImg from "../../../../public/devs/Brahmendra.jpg";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AboutUs = () => {
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const teamMembers = [
    {
      id: 1,
      name: "N.D Brahmendra",
      role: "Creator",
      bio: "Frontend & Backend Development.",
      avatarImage: BrahmendraImg,
      social: {
        github: "https://github.com/StoreVia",
        instagram: "https://www.instagram.com/mrpan.js/",
        linkedin: "https://www.linkedin.com/in/brahmendra01/",
      },
    },
    {
      id: 2,
      name: "M. Azam Baig",
      role: "Creator",
      bio: "Development.",
      avatarImage: AzamImg,
      social: {
        github: "https://github.com/mikeyy143",
        instagram: "https://www.instagram.com/fkc_0011/",
        linkedin: "https://www.linkedin.com/in/MikeyAzam/",
      },
    },
    {
      id: 3,
      name: "G. Lucky Abhinay",
      role: "Team",
      bio: "Frontend Development.",
      avatarImage: LuckyImg,
      social: {
        github: "https://github.com/Luckyabhinay",
        instagram: "https://www.instagram.com/lucky_abhinay_/",
        linkedin: "https://www.linkedin.com/in/lucky-guntur-138813323/",
      },
    },
    {
      id: 4,
      name: "L. Surya Teja",
      role: "Team",
      bio: "Frontend Development.",
      avatarImage: SuryaImg,
      social: {
        github: "https://github.com/suryatejalakkimsetty123",
        instagram: "https://www.instagram.com/suryatej_2k7/",
        linkedin: "https://www.linkedin.com/in/surya-teja-lakkimsetty-251a5833a",
      },
    },
  ];

  return (
    <div className={isAuthenticated ? "w-full" : "container mx-auto px-4 py-8"}>
      {!isAuthenticated && (
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-max flex items-center gap-2"
          onClick={() => router.push("/")}
        >
          <Home className="h-4 w-4" />
          Home
        </Button>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {teamMembers.map((member) => (
          <Card
            key={member.id}
            className={`transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${hoveredMember === member.id ? "ring-2 ring-blue-500" : ""}`}
            onMouseEnter={() => setHoveredMember(member.id)}
            onMouseLeave={() => setHoveredMember(null)}
          >
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <Image
                    src={member.avatarImage}
                    alt={member.name}
                    fill
                    quality={100}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="text-base font-medium text-blue-600">
                    {member.role}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0 pb-4 px-4">
              <p className="text-muted-foreground mb-4">{member.bio}</p>
              <div className="flex flex-wrap gap-2">
                {member.social.github && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() =>
                      window.open(member.social.github, "_blank")
                    }
                  >
                    <Icon icon="simple-icons:github" className="h-4 w-4"/>
                    GitHub
                  </Button>
                )}

                {member.social.linkedin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() =>
                      window.open(member.social.linkedin, "_blank")
                    }
                  >
                    <Icon icon="simple-icons:linkedin" className="h-4 w-4"/>
                    LinkedIn
                  </Button>
                )}

                {member.social.instagram && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() =>
                      window.open(member.social.instagram, "_blank")
                    }
                  >
                    <Icon icon="simple-icons:instagram" className="h-4 w-4"/>
                    Instagram
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AboutUs;
