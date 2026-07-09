'use client'

import { useState } from 'react'
import { Button, Loader, Select } from '@navikt/ds-react'
import { PencilIcon, XMarkIcon } from '@navikt/aksel-icons'
import { StatusTag } from '@/components/OppgaveListe'
import type { OppgaveStatus } from '@/lib/api'
import { oppdaterStatus } from '@/app/navkontor/actions'
import { useOptimisticAction } from '@/hooks/useOptimisticAction'

const STATUS_OPTIONS: { value: OppgaveStatus; label: string }[] = [
  { value: 'NY', label: 'Ny' },
  { value: 'UNDER_BEHANDLING', label: 'Under behandling' },
  { value: 'FERDIG', label: 'Ferdig' },
]

interface StatusCellProps {
  id: string
  status: OppgaveStatus
}

export default function StatusCell({ id, status }: StatusCellProps) {
  const [editing, setEditing] = useState(false)
  const { value, isPending, doAction } = useOptimisticAction(status, (newStatus) =>
    oppdaterStatus(id, newStatus),
  )

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    doAction(e.target.value as OppgaveStatus)
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <StatusTag status={value} />
        <Button
          variant="tertiary"
          size="small"
          icon={<PencilIcon aria-hidden />}
          onClick={() => setEditing(true)}
        >
          Endre
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        label="Status"
        hideLabel
        size="small"
        value={value}
        onChange={handleChange}
        disabled={isPending}
      >
        {STATUS_OPTIONS.map(({ value: optionValue, label }) => (
          <option key={optionValue} value={optionValue}>
            {label}
          </option>
        ))}
      </Select>
      {isPending ? (
        <Loader size="xsmall" title="Lagrer..." />
      ) : (
        <Button
          variant="tertiary"
          size="small"
          icon={<XMarkIcon aria-hidden />}
          onClick={() => setEditing(false)}
        >
          Avbryt
        </Button>
      )}
    </div>
  )
}
