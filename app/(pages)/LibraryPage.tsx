import ReturnButton from '@/components/buttons/ReturnButton'
import ManhwaGrid from '@/components/grid/ManhwaGrid'
import ReadingStatusPicker from '@/components/picker/ReadingStatusPicker'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { Manhwa } from '@/helpers/types'
import { dbGetManhwasByReadingStatus } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { useFocusEffect } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useCallback, useRef, useState } from 'react'
import { SafeAreaView, View } from 'react-native'


const PAGE_LIMIT = 30


const Library = () => {

  const db = useSQLiteContext()
  const [manhwas, setManhwas] = useState<Manhwa[]>([])
  const [loading, setLoading] = useState(false)
  const status = useRef('Reading')
  const page = useRef(0)
  const hasResults = useRef(true)

  const init = async () => {
    setLoading(true)
      const m = await dbGetManhwasByReadingStatus(db, status.current, 0, PAGE_LIMIT)
      hasResults.current = m.length > 0
      setManhwas(m)
    setLoading(false)
  }

  const load = async (append: boolean = false) => {
    setLoading(true)
      const m = await dbGetManhwasByReadingStatus(
        db,
        status.current,
        page.current * PAGE_LIMIT,
        PAGE_LIMIT
      )
      hasResults.current = m.length > 0
      setManhwas(prev => append ? [...prev, ...m] : m)
    setLoading(false)
  }

  useFocusEffect(
    useCallback(() => {
      init()
    }, [])
  )

  const onChangeValue = async (value: string | null) => {
    if (!value) { return }
    status.current = value
    page.current = 0
    await load()
  }

  const onEndReached = async () => {
    if (!hasResults.current) { return }
    page.current += 1
    await load(true)
  }

  return (
    <SafeAreaView style={AppStyle.safeArea}>
        <TopBar title='Library' titleColor={Colors.libraryColor} >
          <ReturnButton color={Colors.libraryColor} />
        </TopBar>
        <View style={{flex: 1, gap: 10}} >
          <ReadingStatusPicker onChangeValue={onChangeValue}/>
          <ManhwaGrid
            manhwas={manhwas}
            loading={loading}          
            numColumns={2}
            hasResults={true}
            shouldShowChapterDate={false}
            showManhwaStatus={false}
            onEndReached={onEndReached}
            listMode='FlashList'
            color={Colors.libraryColor}
          />
        </View>
    </SafeAreaView>
  )
}

export default Library
