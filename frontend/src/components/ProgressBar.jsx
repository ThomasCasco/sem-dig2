import { clsx } from 'clsx'

const ProgressBar = ({ progress, size = 'medium', className = '', showLabel = false }) => {
  const sizeClasses = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4'
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-success-500'
    if (progress >= 60) return 'bg-primary-500'
    if (progress >= 40) return 'bg-warning-500'
    return 'bg-danger-500'
  }

  return (
    <div className={clsx('w-full', className)}>
      <div className={clsx(
        'bg-gray-200 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={clsx(
            'h-full transition-all duration-300 ease-out rounded-full',
            getProgressColor(progress)
          )}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>0%</span>
          <span className="font-medium">{Math.round(progress)}%</span>
          <span>100%</span>
        </div>
      )}
    </div>
  )
}

export default ProgressBar
