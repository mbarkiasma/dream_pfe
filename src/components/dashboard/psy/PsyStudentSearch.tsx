'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition, useRef, useState, useEffect } from 'react'
import { Search, X, UserRound } from 'lucide-react'

type Suggestion = {
  name: string
  email: string
}

type PsyStudentSearchProps = {
  placeholder: string
  suggestions: Suggestion[]
}

export function PsyStudentSearch({ placeholder, suggestions }: PsyStudentSearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const query = searchParams.get('q') ?? ''
  const [inputValue, setInputValue] = useState(query)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const filtered =
    inputValue.trim().length > 0
      ? suggestions.filter((s) => {
          const q = inputValue.toLowerCase()
          return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
        })
      : []

  function navigate(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  function handleChange(value: string) {
    setInputValue(value)
    setActiveIndex(-1)
    setIsOpen(true)
    navigate(value)
  }

  function handleSelect(suggestion: Suggestion) {
    setInputValue(suggestion.name)
    setIsOpen(false)
    setActiveIndex(-1)
    navigate(suggestion.name)
  }

  function handleClear() {
    setInputValue('')
    setIsOpen(false)
    setActiveIndex(-1)
    navigate('')
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || filtered.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(filtered[activeIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="psy-search-wrap">
      <Search className="psy-search-icon" aria-hidden="true" />
      <input
        ref={inputRef}
        type="text"
        className={`psy-search-input${isPending ? ' psy-search-input-loading' : ''}`}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => inputValue.trim() && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen && filtered.length > 0}
        aria-autocomplete="list"
      />
      {inputValue ? (
        <button type="button" onClick={handleClear} className="psy-search-clear" aria-label="Effacer">
          <X className="h-4 w-4" />
        </button>
      ) : null}

      {isOpen && filtered.length > 0 ? (
        <ul className="psy-search-dropdown" role="listbox">
          {filtered.map((suggestion, index) => (
            <li
              key={suggestion.email}
              role="option"
              aria-selected={index === activeIndex}
              className={`psy-search-option${index === activeIndex ? ' psy-search-option-active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(suggestion)
              }}
            >
              <span className="psy-search-option-icon">
                <UserRound className="h-4 w-4" />
              </span>
              <span className="psy-search-option-body">
                <span className="psy-search-option-name">{suggestion.name}</span>
                <span className="psy-search-option-email">{suggestion.email}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
