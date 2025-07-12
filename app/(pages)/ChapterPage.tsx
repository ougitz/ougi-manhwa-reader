import ChapterArrowUpButton from '@/components/buttons/ChapterArrowUpButton'
import ChapterFooter from '@/components/chapter/ChapterFooter'
import ChapterHeader from '@/components/chapter/ChapterHeader'
import { Colors } from '@/constants/Colors'
import { Chapter, ChapterImage } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { dbUpsertReadingHistory } from '@/lib/database'
import { spFetchChapterImages } from '@/lib/supabase'
import { useChapterState } from '@/store/chapterState'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { useLocalSearchParams } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, PixelRatio, StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'


const MAX_WIDTH = wp(100)
const SCREEN_HEIGHT = hp(100)
const HEADER_BOX_HEIGHT = 160
const FOOTER_BOX_HEIGHT = 500


const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);


const ChapterPage = () => {
    const db = useSQLiteContext()
    const params = useLocalSearchParams()
    const mangaTitle = params.mangaTitle as string
    const { chapters, currentChapterIndex, setCurrentChapterIndex } = useChapterState()
    const [images, setImages] = useState<ChapterImage[]>([])
    const [loading, setLoading] = useState(false)
    const flashListRef = useRef<FlashList<ChapterImage>>(null)

    const currentChapter: Chapter = chapters[currentChapterIndex]    
    const headerVisible = useSharedValue(true)
    const footerVisible = useSharedValue(false)
    const flashListTotalHeight = useSharedValue(hp(100))

    useEffect(
      () => {
        async function load() {
          if (currentChapterIndex < 0 || currentChapterIndex >= chapters.length) {
          return
        }
        setLoading(true)
          await Image.clearMemoryCache()
          const imgs = await spFetchChapterImages(currentChapter.chapter_id)
          Image.prefetch(imgs.slice(0, 3).map((i) => i.image_url))
          let newHeight = 0
          imgs.forEach(img => {
            const w = Math.min(img.width, MAX_WIDTH)
            const h = (w * img.height) / img.width
            newHeight += h
          })
          flashListTotalHeight.value = newHeight + FOOTER_BOX_HEIGHT
          footerVisible.value = false
          setImages(imgs)
        setLoading(false)

        dbUpsertReadingHistory(
          db,
          currentChapter.manhwa_id,
          currentChapter.chapter_id,
          currentChapter.chapter_num
        )
      }
      load()
    }, [currentChapterIndex])    
    
    const scrollToTop = () => {
      flashListRef.current?.scrollToOffset({ animated: false, offset: 0 })
    }
    
    const goToNextChapter = () => {
      if (currentChapterIndex + 1 < chapters.length) {
        setCurrentChapterIndex(currentChapterIndex + 1)
        scrollToTop()
      }
    }

    const goToPreviousChapter = () => {
      if (currentChapterIndex - 1 >= 0) {
        setCurrentChapterIndex(currentChapterIndex - 1)
        scrollToTop()
      }
    }

    const scrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
        headerVisible.value = event.contentOffset.y <= 50
        footerVisible.value = event.contentOffset.y + SCREEN_HEIGHT >= flashListTotalHeight.value - 100
      }
    })

    const animatedHeaderStyle = useAnimatedStyle(() => {
      return {        
        transform: [
          { translateY: withTiming(headerVisible.value ? 0 : -HEADER_BOX_HEIGHT, { duration: 400 }) }
        ],
        zIndex: 10,
        position: 'absolute',
        top: 0,
        left: 0
      }
    })

    const animatedFooterStyle = useAnimatedStyle(() => {
      return {        
        transform: [
          { translateY: withTiming(footerVisible.value ? -FOOTER_BOX_HEIGHT * 1.5: FOOTER_BOX_HEIGHT, { duration: 400 }) }
        ],
        zIndex: 10,
        width: '100%',
        position: 'absolute',
        bottom: -FOOTER_BOX_HEIGHT,
        left: 0
      }
    })

    const keyExtractor = (item: ChapterImage | 'BoxHeader' | 'BoxFooter'): string => {
      switch (item) {
        case "BoxHeader":
          return 'BoxHeader'
        case "BoxFooter":
          return 'BoxFooter'
        default:
          return item.image_url
      }
    }

    const renderItem = ({item}: {item: ChapterImage | 'BoxHeader' | 'BoxFooter'}) => {

      if (item === 'BoxHeader') {
        return <View style={{width: '100%', height: 160}} />
      }

      if (item === 'BoxFooter') {
        return <View style={{width: '100%', height: FOOTER_BOX_HEIGHT}} />
      }

      const width = Math.min(item.width, MAX_WIDTH)
      const height = PixelRatio.roundToNearestPixel((width * item.height) / item.width)

      return (
        <Image 
          style={{ width, height }} 
          source={item.image_url}
          contentFit="cover"
        />
      )
    }    

    return (
        <View style={styles.container} >          
          <Animated.View style={animatedHeaderStyle} > 
            <ChapterHeader
              mangaTitle={mangaTitle}
              currentChapter={currentChapter}
              loading={loading}
              goToNextChapter={goToNextChapter}
              goToPreviousChapter={goToPreviousChapter}
            />
          </Animated.View>
          <AnimatedFlashList
            data={[...['BoxHeader'], ...images, ...['BoxFooter']] as any}
            ref={flashListRef as any}
            keyExtractor={keyExtractor as any}
            renderItem={renderItem as any}
            estimatedItemSize={200}
            scrollEventThrottle={4}
            drawDistance={hp(300)}
            onScroll={scrollHandler}
            onEndReachedThreshold={3}
            ListEmptyComponent={<ActivityIndicator size={32} color={Colors.orange} />}
          />
          <Animated.View style={animatedFooterStyle} >
            <ChapterFooter
              mangaTitle={mangaTitle}
              currentChapter={currentChapter}
              loading={loading}
              goToNextChapter={goToNextChapter}
              goToPreviousChapter={goToPreviousChapter}
            />
          </Animated.View>
          <ChapterArrowUpButton onPress={scrollToTop} />
        </View>
    )
}


export default ChapterPage


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.black
  }
}) 