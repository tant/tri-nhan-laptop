import { createFileRoute } from '@tanstack/react-router'
import { PartsPage } from '@/components/pages/PartsPage'

export const Route = createFileRoute('/linh-kien')({
  component: PartsPage,
  // TODO: Add authentication check here
})