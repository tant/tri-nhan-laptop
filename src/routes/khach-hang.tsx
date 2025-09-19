import { createFileRoute } from '@tanstack/react-router'
import { CustomersPage } from '@/components/pages/CustomersPage'

export const Route = createFileRoute('/khach-hang')({
  component: CustomersPage,
  // TODO: Add authentication check here
})