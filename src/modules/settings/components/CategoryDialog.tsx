import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

import { ModalHeading } from '@/components/patterns'
import { Button, Dialog, DialogContent, DialogFooter, Input, Label } from '@/components/ui'
import { t } from '@/lib/strings'

const schema = z.object({
  name: z.string().min(1),
})

export function CategoryDialog({
  onOpenChange,
  onSubmit,
  open,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSubmit: (value: { name: string }) => Promise<void>
}) {
  const form = useForm({
    defaultValues: { name: '' },
    onSubmit: async ({ value }) => {
      const parsed = schema.safeParse(value)
      if (!parsed.success) return
      await onSubmit({ name: parsed.data.name })
      onOpenChange(false)
      form.reset()
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (v) form.reset({ name: '' })
      }}
    >
      <DialogContent>
        <ModalHeading title={t.settings.add} description="Tên hiển thị tiếng Việt." />
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label>{t.settings.name}</Label>
                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
              </div>
            )}
          </form.Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit">{t.common.save}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
