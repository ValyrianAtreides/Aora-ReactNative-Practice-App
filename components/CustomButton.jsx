import { TouchableOpacity, Text } from 'react-native'
import React from 'react'

{/* We are defining main features of the custom button here. For using in other screens we can customize it when we are using*/}

const CustomButton = ({title,handlePress,containerStyles,textStyles, isLoading}) => {
  return (
    <TouchableOpacity  
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-secondary rounded-xl min-h-[62px] justify-center items-center ${containerStyles}
      ${isLoading ? 'opacity-50': ''}   `}
      disaAbled={isLoading}
      >
      <Text className={`text-primary font-psemibold text-lg ${textStyles}`}>
        {title}</Text>
    </TouchableOpacity>
  )
}

export default CustomButton