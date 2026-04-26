import { type ReactNode } from 'react'

import { DialogDescription, DialogHeader, DialogTitle } from '../ui'

export type ModalHeadingProps = {
  title: ReactNode
  description?: ReactNode
}

/** Phần đầu Dialog lặp lại — đổi typography/layout một chỗ. */
export function ModalHeading({ description, title }: ModalHeadingProps) {
  return (
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      {description != null && description !== '' ? <DialogDescription>{description}</DialogDescription> : null}
    </DialogHeader>
  )
}
