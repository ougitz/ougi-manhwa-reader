import { AppConstants } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { Chapter, Manhwa } from '@/helpers/types';
import { dbReadLast3Chapters } from '@/lib/database';
import { AppStyle } from '@/styles/AppStyle';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import {
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle
} from 'react-native';
import ChapterLink from './chapter/ChapterLink';
import ManhwaStatusComponent from './ManhwaStatusComponent';



interface ManhwaCardProps {
    manhwa: Manhwa
    width?: number
    height?: number
    marginRight?: number
    marginBottom?: number
    styleProp?: StyleProp<ViewStyle>
    showChaptersPreview?: boolean
    shouldShowChapterDate?: boolean
}


const ManhwaCard = ({
    manhwa, 
    width = AppConstants.MangaCoverDimension.width, 
    height = AppConstants.MangaCoverDimension.height, 
    marginRight = 10,
    marginBottom = 0,
    styleProp = false,
    showChaptersPreview = true,
    shouldShowChapterDate = true    
}: ManhwaCardProps) => {
    
    const db = useSQLiteContext()
    const [chapters, setChapters] = useState<Chapter[]>([])
    
    const mangaStatusColor = manhwa.status === "Completed" ? 
        Colors.ononokiGreen : 
        Colors.neonRed
    
    const onPress = () => {
        router.push({
            pathname: '/(pages)/ManhwaPage', 
            params: {manhwa_id: manhwa.manhwa_id}
        })
    }
    
    useEffect(
        () => {
            async function init() {
                if (!showChaptersPreview) {
                    return
                }
                await dbReadLast3Chapters(db, manhwa.manhwa_id)
                    .then(values => setChapters(values))
            }
            init()
        },
        [db, manhwa, showChaptersPreview]
    )

    return (
        <Pressable style={[{width, marginRight, marginBottom}, styleProp]} onPress={onPress} >
            <Image 
                source={manhwa.cover_image_url} 
                contentFit='cover'
                cachePolicy={'disk'}
                style={[{borderRadius: 12, width, height}]}/>
            <View style={styles.container} >
                <Text numberOfLines={1} style={[AppStyle.textRegular, {fontSize: 20}]}>{manhwa.title}</Text>
                {
                    showChaptersPreview && 
                    chapters.map(
                        (item) => 
                            <ChapterLink 
                                shouldShowChapterDate={shouldShowChapterDate} 
                                key={item.chapter_num} 
                                manhwa={manhwa} 
                                chapter={item} />
                )}
            </View>
            <ManhwaStatusComponent
                style={{position: 'absolute', left: 8, top: 8, borderRadius: 12}}
                status={manhwa.status}
                paddingHorizontal={10}
                paddingVertical={8}
                fontSize={12}
                backgroundColor={mangaStatusColor}
                borderRadius={22}
            />
        </Pressable>
    )
}

export default ManhwaCard

const styles = StyleSheet.create({    
    container: {
        paddingVertical: 10,  
        width: '100%',
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4        
    }
})