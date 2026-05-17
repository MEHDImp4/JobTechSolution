import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { Modal } from './Modal'

const meta = {
  title: 'UI/Modal',
  component: Modal,
} satisfies Meta<typeof Modal>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    onClose: () => undefined,
    title: 'Confirmer l’action',
    size: 'md',
    children: null,
  },
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(true)
      return (
        <div className="min-h-[320px] min-w-[320px]">
          <Button onClick={() => setOpen(true)}>Ouvrir</Button>
          <Modal open={open} onClose={() => setOpen(false)} title="Confirmer l’action">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Cette story valide le rendu du dialog et la hiérarchie visuelle.</p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setOpen(false)}>Annuler</Button>
                <Button onClick={() => setOpen(false)}>Confirmer</Button>
              </div>
            </div>
          </Modal>
        </div>
      )
    }
    return <Demo />
  },
}
