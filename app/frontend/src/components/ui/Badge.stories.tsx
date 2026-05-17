import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './Badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  args: {
    children: 'Nouveau',
  },
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Validé',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'En attente',
  },
}

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Refusé',
  },
}
