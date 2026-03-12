import ImageUploader from "@/components/ImageUploader";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-white px-4 " edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}

      <View className="border-b border-gray-200 py-4">
        <Text className="text-3xl font-bold text-grey-900">PlutoX</Text>
        <Text className=" text-grey-600 mt-1">
          Create content using PlutoX AI
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image uploader  */}
        <ImageUploader mode="tryon" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
