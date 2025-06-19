import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { SearchBar } from "@/components/landing/search-bar"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { FeaturedExperiencesSection } from "@/components/landing/featured-experiences-section"
import { CallToActionSection } from "@/components/landing/call-to-action-section"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      <SearchBar />
      <HowItWorksSection />
      <FeaturedExperiencesSection />
      <CallToActionSection />
      <Footer />
    </div>
  )
}
