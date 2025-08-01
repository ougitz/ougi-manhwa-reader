import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { FlatList, Text, View } from 'react-native'


interface AltNamesProps {
    names: string[]
}

const ManhwaAlternativeNames = ({names}: AltNamesProps) => {

    if (names.length === 0) {
        return <></>
    }

    return (
        <View style={{width: '100%', alignItems: "flex-start"}} >
            <FlatList
                data={names}
                keyExtractor={(item) => item}
                horizontal={true}
                renderItem={({item, index}) => 
                    <Text key={item} style={[AppStyle.textRegular, {marginRight: 8}]}>{item}{index < names.length - 1 ? ',' : ''}</Text>
                }
            />
        </View>
    )
}

export default ManhwaAlternativeNames
