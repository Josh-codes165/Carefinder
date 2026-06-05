type StarRatingProps = {
  rating: number
  onChange?: (rating: number) => void  
  size?: 'sm' | 'md' | 'lg'
}

function StarRating({ rating, onChange, size = 'md' }: StarRatingProps) {
  const sizeClass = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-3xl',
  }[size]

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange?.(star)}
          disabled={!onChange}
          className={`${sizeClass} transition-transform ${
            onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          } ${
            star <= rating
              ? 'text-[#EF9F27]'   
              : 'text-gray-200'    
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default StarRating