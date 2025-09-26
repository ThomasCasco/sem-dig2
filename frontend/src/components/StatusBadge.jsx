import { clsx } from 'clsx'

const StatusBadge = ({ status, size = 'small' }) => {
  const statusConfig = {
    'entregado': {
      label: 'Entregado',
      className: 'badge-success'
    },
    'pendiente': {
      label: 'Pendiente',
      className: 'badge-secondary'
    },
    'atrasado': {
      label: 'Atrasado',
      className: 'badge-danger'
    },
    'reentrega': {
      label: 'Reentrega',
      className: 'badge-warning'
    },
    'faltante': {
      label: 'Faltante',
      className: 'badge-danger'
    },
    'desconocido': {
      label: 'Desconocido',
      className: 'badge-secondary'
    }
  }

  const config = statusConfig[status] || statusConfig['desconocido']
  
  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    medium: 'text-sm px-2.5 py-1',
    large: 'text-base px-3 py-1.5'
  }

  return (
    <span className={clsx(
      'badge',
      config.className,
      sizeClasses[size]
    )}>
      {config.label}
    </span>
  )
}

export default StatusBadge
