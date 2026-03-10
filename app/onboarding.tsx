import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";
import AppInterSlider from "react-native-app-intro-slider";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Slide = {
  key: string;
  title: string;
  subtitle: string;
  text: string;
  image: string;
};
const slides: Slide[] = [
  {
    key: "one",
    title: "Create viral-ready",
    subtitle: "Content fast",
    text: "Generate eye-catching visuals in minutes",
    image: require("../assets/images/board-1.png"),
  },
  {
    key: "two",
    title: "AI Try-ons",
    subtitle: "Video generation",
    text: "Generate ai short videos in minutes   ",
    image: require("../assets/images/board-2.png"),
  },
  {
    key: "three",
    title: "Share Anywhere",
    subtitle: "Instantly",
    text: "Export and share content on social media",
    image: require("../assets/images/board-3.png"),
  },
];
const onboarding = () => {
  const slideIndex = useSharedValue(0);
  const AnimatedContainerStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(
      slideIndex.value,
      [0, 1, 2],
      ["#F4C637", "#7CD6DF", "#F3D0DC"]
    );
    return { backgroundColor: bg };
  });

  const handleDone = () => {
    AsyncStorage.setItem('isBoarding',"true")
    router.replace('/(tabs)')
  };

  const renderItem = ({ item }: { item: Slide }) => (
    <View className="flex-1 items-center justify-center">
      <View className="w-full h-[40%] items-center justify-center">
        <Image
          source={item.image}
          style={{ width: "100%", height: "100%", resizeMode: "contain" }}
        />
        <View className="items-left justify-center w-full px-6  ">
          <Text className="mt-8 text-4xl font-bold text-left">{item.title}</Text>
          <Text className="mt-3 text-4xl font-bold text-left">{item.subtitle}</Text>
          <Text className="mt-3 text-xl max-w-[80%] text-left text-grey-800">{item.text}</Text>
        </View>
      </View>
    </View>
  );
  return (
    <Animated.View style={[{ flex: 1 }, AnimatedContainerStyle]}>
      <AppInterSlider
        data={slides}
        renderItem={renderItem}
        onDone={handleDone}
        onSkip={handleDone}
        showSkipButton={true}
        showDoneButton={true}
        onSlideChange={(index) => {
          const next = (index as number) ?? 0;
          slideIndex.value = withTiming(next, { duration: 400 });
        }}
        renderSkipButton={() => (
          <Text className="px-4 py-2 text-base font-semibold">Skip</Text>
        )}
        renderNextButton={() => (
          <Text className="px-4 py-2 text-base font-semibold text-white">
            Next
          </Text>
        )}
        renderDoneButton={() => (
          <Text className="px-4 py-2 text-base font-semibold text-white">
            Get Started
          </Text>
        )}
      />
    </Animated.View>
  );
};

export default onboarding;
