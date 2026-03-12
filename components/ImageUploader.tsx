import { useContentStore } from "@/stores/content-store";
import { pickImageFromLibrary, takePhoto } from "@/utils/image-utils";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ImageUploaderProps {
  onImageSelected?: (uri: string) => void;
  mode?: "single" | "tryon";
}

const ImageUploader = ({
  onImageSelected,
  mode = "single",
}: ImageUploaderProps) => {
  const {
    currentImage,
    currentHumanImage,
    setCurrentImage,
    setCurrentHumanImage,
    setCurrentClothesImage,
  } = useContentStore();
  const [isLoading, setLoading] = useState(false);

  const handlePickImage = async (type?: "human" | "clothes") => {
    try {
      setLoading(true);
      const uri = await pickImageFromLibrary();

      if (uri) {
        if (mode === "tryon") {
          if (type === "human") {
            setCurrentHumanImage(uri);
          } else if (type === "clothes") {
            setCurrentClothesImage(uri);
          }
        } else {
          setCurrentImage(uri);
          onImageSelected?.(uri);
        }
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to pick photo");
    } finally {
      setLoading(false);
    }
  };

  const handleTakePhoto = async (type?: "human" | "clothes") => {
    try {
      setLoading(true);
      const uri = await takePhoto();

      if (uri) {
        if (mode === "tryon") {
          if (type === "human") {
            setCurrentHumanImage(uri);
          } else if (type === "clothes") {
            setCurrentClothesImage(uri);
          }
        } else {
          setCurrentImage(uri);
          onImageSelected?.(uri);
        }
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to pick photo");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "tryon") {
    return (
      <View>
        {/* Human image section */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-grey-700 mb-1">
            Persion Image
          </Text>

          {currentHumanImage ? (
            <View className="relative">
              <Image
                source={{ uri: currentHumanImage }}
                className="w-full h-48 rounded-2xl"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => handlePickImage("human")}
                className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg"
                disabled={isLoading}
              >
                <Ionicons name="images" size={24} color="#7c3aed" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => handlePickImage("human")}
              disabled={isLoading}
              className="border-2 border-dashed border-purple-300 rounded-2xl p-8 items-center justify-center bg-purple-50"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#7c3aed" />
              ) : (
                <Ionicons name="images" size={24} color="#7c3aed" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
  return (
    <View className="w-full">
      {currentImage ? (
        <>
          <Image
            source={{ uri: currentImage }}
            className="w-full h-64 rounded-2xl"
            resizeMode="cover"
          />

          <Pressable
            onPress={() => handlePickImage()}
            className="absolute bottom-4 right-4 bg-white rounded-full p-3 shadow-lg"
          >
            <Ionicons name="image" size={24} color="#7c3aed" />
          </Pressable>
        </>
      ) : (
        <>
          <Pressable
            onPress={() => handlePickImage()}
            className="border-2 border-dashed border-purple-300 rounded-2xl p-8 items-center justify-center bg-purple-50"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#7c3aed" />
            ) : (
              <>
                <Ionicons
                  name="cloud-upload-outline"
                  size={64}
                  color="#7c3aed"
                />

                <Text className="text-lg font-semibold text-purple-900 mt-4">
                  Upload Product Photo
                </Text>

                <Text>Tap to select from library</Text>
              </>
            )}
          </Pressable>

          <View className="flex-row items-center justify-center mt-4 gap-2">
            <View className="h-px bg-gray-300 flex-1" />
            <Text className="text-grey-500 text-sm">or</Text>
            <View className="h-px bg-gray-300 flex-1" />
          </View>

          <TouchableOpacity
            onPress={() => handleTakePhoto()}
            disabled={isLoading}
            className="mt-4 bg-white border-2 border-purple-300 rounded-xl py-6 flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="camera" size={24} color="#7c3aed" />
            <Text className="text-purple-900 font-semibold ml-2 text-base">
              Take Photo
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default ImageUploader;

const styles = StyleSheet.create({});
