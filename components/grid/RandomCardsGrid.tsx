import { Colors } from '@/constants/Colors'
import { ManhwaCard } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { spFetchRandomManhwaCards } from '@/lib/supabase'
import { useManhwaCardsState } from '@/store/randomManhwaState'
import { AppStyle } from '@/styles/AppStyle'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import React, { useEffect, useRef } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import Title from '../Title'
import RotatingButton from '../buttons/RotatingButton'
import Row from '../util/Row'


const MAX_WIDTH = wp(80)

const RandomCardsGrid = () => {
    
    const { cards, setCards } = useManhwaCardsState()
    const flashListRef = useRef<FlatList<ManhwaCard>>(null)

    useEffect(
        () => {
            const init = async () => {
                if (cards.length == 0) {
                    const r: ManhwaCard[] = await spFetchRandomManhwaCards()
                    setCards([...r])
                }
            }
            init()
        },
        []
    )    

    const onPress = (manhwa_id: number) => {
        router.navigate({pathname: '/ManhwaPage', params: {manhwa_id}})
    }

    const reload = async () => {
        const r: ManhwaCard[] = await spFetchRandomManhwaCards()
        setCards([...r])
        flashListRef.current?.scrollToIndex({index: 0, animated: true})
    }

    const renderItem = ({item}: {item: ManhwaCard}) => {

        const width = item.width > MAX_WIDTH ? MAX_WIDTH : item.width
        const height = (width * item.height) / item.width        

        return (
            <Pressable onPress={() => onPress(item.manhwa_id)} style={{marginRight: 10}} >
                <Image source={item.image_url} style={{width, height, borderRadius: 12}} contentFit='cover' />
                <View style={{maxWidth: '90%', position: 'absolute', top: 10, left: 10, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: Colors.orange}} >
                    <Text numberOfLines={1} style={AppStyle.textRegular}>{item.title}</Text>
                </View>
            </Pressable>
        )
    }
    
    return (
        <View style={styles.container} >
            <Row style={{width: '100%', justifyContent: "space-between"}} >
                <Title title='Random' iconName='dice'/>
                <RotatingButton onPress={reload}/>
            </Row>
            <FlatList
                ref={flashListRef}
                data={cards}
                horizontal={true}
                keyExtractor={(item: ManhwaCard) => item.manhwa_id.toString()}
                renderItem={renderItem}
            />
        </View>
    )
}

export default RandomCardsGrid

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 10,
        height: hp(100)
    }
})