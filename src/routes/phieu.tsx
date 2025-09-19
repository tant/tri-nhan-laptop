import { createFileRoute } from '@tanstack/react-router'
import { RepairTicketsPage } from '@/components/pages/RepairTicketsPage'

export const Route = createFileRoute('/phieu')({
  component: RepairTicketsPage,
  // TODO: Add authentication check here
})