import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './Input'

const meta = {
  title: 'UI/Input',
  component: Input,
  args: {
    label: 'Adresse e-mail',
    placeholder: 'vous@exemple.com',
  },
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Error: Story = {
  args: {
    label: 'Mot de passe',
    type: 'password',
    error: 'Le mot de passe est requis',
  },
}

export const Hint: Story = {
  args: {
    label: 'Mot de passe',
    type: 'password',
    hint: '8 caractères minimum',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'Lecture seule',
  },
}
