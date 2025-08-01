import ReturnButton from '@/components/buttons/ReturnButton'
import ManhwaCard from '@/components/ManhwaCard'
import SearchBar from '@/components/SearchBar'
import TopBar from '@/components/TopBar'
import CustomActivityIndicator from '@/components/util/CustomActivityIndicator'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Manhwa } from '@/helpers/types'
import { getItemGridDimensions, hp, wp } from '@/helpers/util'
import { dbSearchMangas } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { FlashList } from '@shopify/flash-list'
import { useSQLiteContext } from 'expo-sqlite'
import { debounce } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView, View } from 'react-native'


const PAGE_LIMIT = 30

const {width, height} = getItemGridDimensions(
  wp(4),
  10,
  2,
  AppConstants.COMMON.MANHWA_COVER_DIMENSION.WIDTH,
  AppConstants.COMMON.MANHWA_COVER_DIMENSION.HEIGHT
)

const estimatedItemSize = height + 20


const ManhwaSearch = () => {
  
  const db = useSQLiteContext()
  const page = useRef(0)
  const hasResults = useRef(true)
  const isInitialized = useRef(false)

  const [manhwas, setManhwas] = useState<Manhwa[]>([])
  const [loading, setLoading] = useState(false)
  const searchTerm = useRef('')  
  const flashListRef = useRef<FlashList<Manhwa>>(null)  
  
  useEffect(
    () => {
      let isCancelled = false
      const init = async () => {
        if (manhwas.length == 0) {
          setLoading(true)
            const m = await dbSearchMangas(db, searchTerm.current, 0, PAGE_LIMIT)
            if (isCancelled) { return }
            hasResults.current = m.length > 0
            setManhwas(m)
          setLoading(false)
        }
        isInitialized.current = true
      }
      init()
      return () => {
        isCancelled = true
      }
    },
    []
  )

  const handleSearch = async (value: string) => {
    searchTerm.current = value.trim()
    page.current = 0
    setLoading(true)
      const m = await dbSearchMangas(db, searchTerm.current, page.current * PAGE_LIMIT, PAGE_LIMIT)
      hasResults.current = m.length > 0
      flashListRef.current?.scrollToIndex({animated: false, index: 0})
      setManhwas(m)
    setLoading(false)
  }

  const debounceSearch = debounce(handleSearch, 400)

  const onEndReached = async () => {
    if (!hasResults.current || !isInitialized.current) { return }
    page.current += 1
    setLoading(true)
      const m: Manhwa[] = await dbSearchMangas(db, searchTerm.current, page.current * PAGE_LIMIT, PAGE_LIMIT)
      hasResults.current = m.length > 0
      setManhwas(prev => [...prev, ...m])
    setLoading(false)
  }

  const renderItem = ({item}: {item: Manhwa}) => {
    return (
        <ManhwaCard 
            showChaptersPreview={false}
            showManhwaStatus={true}
            width={width} 
            height={height} 
            marginBottom={6} 
            manhwa={item}
        />
    )
  }

  const renderFooter = () => {
      if (loading && hasResults) {
          return (
              <View style={{width: '100%', paddingVertical: 22, alignItems: "center", justifyContent: "center"}} >
                  <CustomActivityIndicator color={Colors.yellow}/>
              </View> 
          )
      }
      return <View style={{height: 60}} />
  }

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Search' titleColor={Colors.yellow} > 
        <ReturnButton color={Colors.yellow} />
      </TopBar>
      <View style={{flex: 1, gap: 10}} >
        <SearchBar onChangeValue={debounceSearch} color={Colors.yellow} placeholder='manhwa' />
        <View style={{flex: 1}} >
          <FlashList
              ref={flashListRef}
              keyboardShouldPersistTaps={'always'}
              data={manhwas}
              numColumns={2}
              keyExtractor={(item) => item.manhwa_id.toString()}
              estimatedItemSize={estimatedItemSize}
              drawDistance={hp(150)}
              onEndReached={onEndReached}
              scrollEventThrottle={4}
              onEndReachedThreshold={2}
              renderItem={renderItem}
              ListFooterComponent={renderFooter}
              />
        </View>      
      </View>
    </SafeAreaView>
  )
}

export default ManhwaSearch
