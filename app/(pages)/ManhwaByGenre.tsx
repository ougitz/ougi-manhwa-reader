import ReturnButton from '@/components/buttons/ReturnButton'
import ManhwaGrid from '@/components/grid/ManhwaGrid'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { Manhwa } from '@/helpers/types'
import { dbReadManhwasByGenreId } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { useLocalSearchParams } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native'


const PAGE_LIMIT = 30


const MangaByGenre = () => {
    
    const db = useSQLiteContext()
    const params = useLocalSearchParams()
    const genre: string = params.genre as any
    const genre_id: number = parseInt(params.genre_id as any)

    const [manhwas, setManhwas] = useState<Manhwa[]>([])
    const [loading, setLoading] = useState(false)
    const hasResults = useRef(true)
    const page = useRef(0)
    const isInitialized = useRef(false)

    useEffect(
        () => {
            let isCancelled = false
            async function init() {
                setLoading(true)
                    const m = await dbReadManhwasByGenreId(db, genre_id, 0, PAGE_LIMIT)
                    if (isCancelled) { return }
                    setManhwas(m)
                    hasResults.current = m.length > 0
                    isInitialized.current = true
                setLoading(false)
            }
            init()
            return () => { isCancelled = true }
        },
        [db, genre_id]
    )

    const onEndReached = async () => {
        if (!hasResults.current || !isInitialized.current) {
            return
        }
        page.current += 1
        setLoading(true)
            const m = await dbReadManhwasByGenreId(db, genre_id, page.current * PAGE_LIMIT, PAGE_LIMIT)
            hasResults.current = m.length > 0
            setManhwas(prev => [...prev, ...m])
        setLoading(false)
    }  


    return (
        <SafeAreaView style={AppStyle.safeArea}>
            <TopBar title={genre} titleColor={Colors.yellow} >
                <ReturnButton color={Colors.yellow} />
            </TopBar>
            <ManhwaGrid
                manhwas={manhwas}
                numColumns={2}
                loading={loading}
                hasResults={true}
                listMode='FlashList'
                showChaptersPreview={false}
                onEndReached={onEndReached}/>
        </SafeAreaView>
    )
}


export default MangaByGenre

