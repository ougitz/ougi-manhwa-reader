import Button from '@/components/buttons/Button'
import OpenRandomManhwaButton from '@/components/buttons/OpenRandomManhwaButton'
import UpdateDatabaseButton from '@/components/buttons/UpdateDatabaseButton'
import GenreGrid from '@/components/grid/GenreGrid'
import ManhwaHorizontalGrid from '@/components/grid/ManhwaHorizontalGrid'
import RandomCardsGrid from '@/components/grid/RandomCardsGrid'
import LateralMenu from '@/components/LateralMenu'
import AppLogo from '@/components/util/Logo'
import Row from '@/components/util/Row'
import { Colors } from '@/constants/Colors'
import { hp, wp } from '@/helpers/util'
import { dbReadManhwasOrderedByUpdateAt, dbReadManhwasOrderedByViews } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { router } from 'expo-router'
import React, { useRef } from 'react'
import { Animated, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'


const MENU_WIDTH = 250
const ANIMATION_TIME = 300
const SCREEN_WIDTH = wp(100)
const SCREEN_HEIGHT = hp(100)


const HomePage = () => {

    const menuAnim = useRef(new Animated.Value(-MENU_WIDTH)).current 
    const backgroundAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current

    const menuVisible = useRef(false)

    const openMenu = () => {
        Animated.timing(menuAnim, {
            toValue: 0,
            duration: ANIMATION_TIME,      
            useNativeDriver: false
        }).start(() => {
            menuVisible.current = true
        })
        Animated.timing(backgroundAnim, {
            toValue: 0,
            duration: ANIMATION_TIME * 1.2,
            useNativeDriver: false
        }).start(() => {})
    }

    const closeMenu = () => {
        Animated.timing(menuAnim, {
            toValue: -MENU_WIDTH,
            duration: ANIMATION_TIME,
            useNativeDriver: false
        }).start(() => {
            menuVisible.current = false
        })
        Animated.timing(backgroundAnim, {
            toValue: -SCREEN_WIDTH,
            duration: ANIMATION_TIME,
            useNativeDriver: false
        }).start(() => {})
    }  

    const searchPress = () => {
        router.navigate("/(pages)/ManhwaSearch")
    }

    const toggleMenu = () => {
        menuVisible.current ? closeMenu() : openMenu()
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            
            {/* Header */}
            <Row style={{width: '100%', paddingRight: 2, marginBottom: 10, justifyContent: "space-between"}} >
                <AppLogo/>
                <Row style={{gap: 16}} >
                    <UpdateDatabaseButton iconColor={Colors.white} type='client' />
                    <Button iconName='search' onPress={searchPress} iconSize={28} iconColor={Colors.white} showLoading={false} />
                    <OpenRandomManhwaButton color={Colors.white} size={28} backgroundColor='' />
                    <Button iconName='options' onPress={toggleMenu} iconSize={28} iconColor={Colors.white} showLoading={false} />
                </Row>
            </Row>

            {/* Main content */}
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
                <View style={{gap: 10}} >
                    <GenreGrid/>
                    <ManhwaHorizontalGrid
                        title='Latest Updates'
                        iconName='rocket-outline'
                        onViewAll={() => router.navigate("/(pages)/LatestUpdatesPage")}
                        fetchFunction={dbReadManhwasOrderedByUpdateAt}
                    />
                    <ManhwaHorizontalGrid
                        title='Most View'
                        iconName='flame-outline'
                        onViewAll={() => router.navigate("/(pages)/MostViewPage")}
                        fetchFunction={dbReadManhwasOrderedByViews}
                    />
                    <RandomCardsGrid/>
                    <View style={{width: '100%', height: 60}} />
                </View>
            </ScrollView>

            {/* Lateral Menu */}
            <Animated.View style={[styles.menuBackground, { width: SCREEN_WIDTH, transform: [{ translateX: backgroundAnim }] }]}>
                <Pressable onPress={closeMenu} style={{width: '100%', height: '100%'}} />
            </Animated.View>
            <Animated.View style={[styles.sideMenu, { width: MENU_WIDTH, transform: [{ translateX: menuAnim }] }]}>
                <LateralMenu closeMenu={closeMenu}/>
            </Animated.View>

        </SafeAreaView>
    )
}


export default HomePage


const styles = StyleSheet.create({
    sideMenu: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,        
        backgroundColor: Colors.backgroundColor,
        elevation: 5,
        shadowColor: Colors.almostBlack,
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 5,    
        zIndex: 100
    },
    menuBackground: {
        position: 'absolute',
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        top: 0,
        left: 0,        
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        elevation: 4,        
        zIndex: 90
    }
})