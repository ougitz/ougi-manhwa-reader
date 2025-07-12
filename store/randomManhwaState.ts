import { ManhwaCard } from '@/helpers/types'
import { create } from 'zustand'


type ManhwaCardState = {
    cards: ManhwaCard[]
    setCards: (cards: ManhwaCard[]) => void
}


export const useManhwaCardsState = create<ManhwaCardState>(
    (set) => ({
        cards: [],
        setCards: (cards: ManhwaCard[]) => {
            (set((state) => {return {...state, cards}}))
        }
    })
)