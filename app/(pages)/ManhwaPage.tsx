import AddToLibray from '@/components/AddToLibray';
import BugReportButton from '@/components/buttons/BugReportButton';
import HomeButton from '@/components/buttons/HomeButton';
import OpenRandomManhwaButton from '@/components/buttons/OpenRandomManhwaButton';
import ReturnButton from '@/components/buttons/ReturnButton';
import ManhwaChapterGrid from '@/components/grid/ManhwaChapterGrid';
import ManhwaAuthorInfo from '@/components/ManhwaAuthorInfo';
import ManhwaGenreInfo from '@/components/ManhwaGenreInfo';
import { Colors } from '@/constants/Colors';
import { ToastMessages } from '@/constants/Messages';
import { Manhwa } from '@/helpers/types';
import { hp, wp } from '@/helpers/util';
import { dbReadManhwaById, dbUpdateManhwaViews } from '@/lib/database';
import { spUpdateManhwaViews } from '@/lib/supabase';
import { AppStyle } from '@/styles/AppStyle';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, {
  useEffect,
  useState
} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';


interface ItemProps {
  text: string
  backgroundColor: string
  textColor?: string
}

const Item = ({text, backgroundColor, textColor = Colors.backgroundColor}: ItemProps) => {
  return (
    <View style={[styles.item, {backgroundColor}]} >
      <Text style={[AppStyle.textRegular, {color: textColor}]}>{text}</Text>
    </View>
  )
}


const ManhwaPage = () => {

  const db = useSQLiteContext()
  const params = useLocalSearchParams()
  const manhwa_id: number = params.manhwa_id as any
  const [manhwa, setManhwa] = useState<Manhwa | null>(null)  

  useEffect(
    () => {
      async function init() {
        if (!manhwa_id) { 
          Toast.show(ToastMessages.EN.INVALID_MANGA)
          router.replace("/(pages)/HomePage")
          return
        }
        const m: Manhwa | null = await dbReadManhwaById(db, manhwa_id).catch(e => null)
        if (m === null) {
          Toast.show(ToastMessages.EN.INVALID_MANGA)
          router.replace("/(pages)/HomePage")
          return
        }
        setManhwa(m)
        spUpdateManhwaViews(manhwa_id)
        dbUpdateManhwaViews(db, manhwa_id)
      }
      init()
    },
    [db, manhwa_id]
  )

  if (!manhwa) {
    return (
      <SafeAreaView style={[AppStyle.safeArea, styles.container]} >        
        <View style={{flex: 1, alignItems: "center", justifyContent: "center"}} >
          <ActivityIndicator size={'large'} color={Colors.orange} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[AppStyle.safeArea, styles.container]} >
      <ScrollView style={{flex: 1}} keyboardShouldPersistTaps={'always'} showsVerticalScrollIndicator={false} >
        {/* Header */}
        <LinearGradient 
            colors={[manhwa.color, Colors.backgroundColor]}
            style={styles.linearBackground} />
        <View style={styles.topBar} >
            <HomeButton color={manhwa.color} />
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 16}} >
                <BugReportButton color={manhwa.color} title={manhwa.title} />                    
                <OpenRandomManhwaButton color={manhwa.color} />
                <ReturnButton color={manhwa.color} />
            </View>
        </View>

        {/* Manga Info */}
        <View style={styles.mangaContainer}>
            <View style={{width: '100%'}} >
              <Image
                source={manhwa.cover_image_url}
                cachePolicy={'disk'}
                contentFit='cover'
                style={styles.image} />
            </View>
            <View style={{alignSelf: "flex-start"}} >
              <Text style={AppStyle.textMangaTitle}>{manhwa!.title}</Text>
              <Text style={AppStyle.textRegular}>{manhwa.descr}</Text>
            </View>
            
            <ManhwaAuthorInfo manhwa={manhwa} />
            <ManhwaGenreInfo manhwa={manhwa} />
            <AddToLibray 
              manhwa={manhwa} 
              textColor={Colors.backgroundColor} 
              backgroundColor={manhwa.color} />

            <View style={{flexDirection: 'row', width: '100%', gap: 10, alignItems: "center", justifyContent: "flex-start"}} >
              <Item text={manhwa.status} textColor={Colors.backgroundColor} backgroundColor={manhwa.color} />
              <Item text={`Views: ${manhwa.views + 1}`} textColor={Colors.backgroundColor} backgroundColor={manhwa.color} />
            </View>

            <ManhwaChapterGrid manhwa={manhwa} />
        </View>          
      </ScrollView>
    </SafeAreaView>
  )
}

export default ManhwaPage

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0, 
    paddingVertical: 0,
    paddingTop: 0
  },
  linearBackground: {
    position: 'absolute',
    width: wp(100),
    left: 0,    
    top: 0,
    height: hp(100)
  },
  item: {
    height: 52,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  topBar: {
    width: '100%',     
    flexDirection: 'row', 
    alignItems: "center", 
    justifyContent: "space-between", 
    marginTop: 10,
    paddingHorizontal: wp(5),
    paddingVertical: hp(4),
    paddingBottom: 20
  },
  mangaContainer: {
    width: '100%', 
    gap: 10, 
    alignItems: "center", 
    paddingHorizontal: wp(4), 
    paddingBottom: hp(8)
  },
  image: {
    width: '100%',
    maxWidth: wp(92),
    height: 520, 
    borderRadius: 4
  }
})
