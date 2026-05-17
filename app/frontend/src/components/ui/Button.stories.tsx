import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus } from 'lucide-react'
import { Button } from './Button'

const meta = {
  title: 'UI/Button',
  component: Button,
  args: {
    children: 'Action principale',
    variant: 'primary',
    size: 'md',
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondaire',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Indisponible',
  },
}

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Chargement',
  },
}

export const WithIcon: Story = {
  args: {
    icon: <Plus className="h-4 w-4" />,
    children: 'Créer une offre',
  },
}
