import { StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center " edges={['top']}> 
      <StatusBar barStyle="dark-content"/>
      {/* Header */}
      <Text className="text-2xl font-bold">index</Text>
    </SafeAreaView>
  );
};

export default HomeScreen;
