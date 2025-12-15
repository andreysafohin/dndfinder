import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SearchBar } from "@/components/search-bar"
import { CampaignCard } from "@/components/campaign-card"
import { mockCampaigns } from "@/lib/mock-data"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <SearchBar />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockCampaigns.map((campaign, index) => (
            <CampaignCard key={index} campaign={campaign} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
