import GenerationCard from "@/components/GenerationCard";
import ImageUploader from "@/components/ImageUploader";
import { useContentStore } from "@/stores/content-store";
import { useGeneration } from "@/utils/use-generation";
import { useMemo } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = () => {
  const { currentHumanImage, currentClothesImage } = useContentStore();
  const {isGenerating,recoverTask}=useGeneration();
  const items = useContentStore((state) => state.items);

  const tryOnItem = useMemo(
    () => items.find((item) => item.type === "tryon"),
    [items]
  );
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
        contentContainerStyle={{ padding: 5, paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image uploader  */}
        <ImageUploader mode="tryon" />
        {/* Generate content section */}
        {currentHumanImage && currentClothesImage && (
          <>
            <View className="mt-8 ">
              <Text>Generate Content</Text>
              <GenerationCard
                icon="shirt"
                title="virtual Try-On"
                description="Try on clothing virtually with AI"
                status={tryOnItem?.status || "pending"}
                disabled={
                  !currentHumanImage ||
                  !currentClothesImage ||
                  !isGenerating ||
                  tryOnItem?.status === "processing" ||
                  tryOnItem?.status === "completed"
                }
                progressMessage={tryOnItem?.progressMessage || ""}
                progressPercentage={tryOnItem?.progressPercentage || "0"}
                elapsedSecond={tryOnItem?.elapsedSeconds || "0"}
                onRecover={
                  tryOnItem && tryOnItem?.status === "failed"
                    ? () => recoverTask(tryOnItem)
                    : undefined
                }
              />
            </View>
            {/* Generate all button */}

            {/*Info box  */}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
