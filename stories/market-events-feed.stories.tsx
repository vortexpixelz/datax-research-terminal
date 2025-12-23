import type { Meta, StoryObj } from "@storybook/react"
import { MarketEventsFeed } from "@/components/market-events-feed"

const meta: Meta<typeof MarketEventsFeed> = {
  title: "Components/MarketEventsFeed",
  component: MarketEventsFeed,
  parameters: {
    layout: "centered",
  },
}

export default meta

type Story = StoryObj<typeof MarketEventsFeed>

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <MarketEventsFeed />
    </div>
  ),
}
