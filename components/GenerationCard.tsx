import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface GenerationCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  item: string;
  title: string;
  description: string;
  status: string;
  onPress: () => void;
  disabled?: boolean;
  progressMessage?: string;
  progressPercentage: number;
  elapsedSecond?: string;
  onRecover?: () => void;
}

const GenerationCard = ({
  icon,
  item,
  title,
  description,
  status,
  onPress,
  disabled,
  progressMessage,
  progressPercentage,
  elapsedSecond,
  onRecover,
}: GenerationCardProps) => {
  const isProcessing = status === "processing";
  const isCompleted = status === "completed";
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isProcessing}
      className={`*:bg-white rounded-xl p-2 mb-3 border-2 flex-row mt-2 *:
    ${isCompleted ? "border-green-200" : "border-purple-200"} ${disabled || isProcessing ? "opicity-50" : ""}
    `}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        {/* Icon */}
        <View
          className={` w-12 h-12 rounded-full items-center justify-center ${isCompleted ? "bg-green-100" : "bg-purple-100"}`}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#7cc3aed" />
          ) : (
            <Ionicons name={icon} />
          )}
        </View>
      </View>

      {/* Content */}

      <View className="flex-1 ml-4">
        <Text className="text-grey-900 font-bold text-base">{title} </Text>
        <Text className="text-grey-600 text-sm mt-1">{description} </Text>
        {/* Profressbaaaar */}

        {isProcessing &&
          (progressMessage ||
            progressPercentage !== undefined ||
            elapsedSecond) && (
            <View className="mt-2">
              {/* progress message */}
              {progressPercentage !== undefined && (
                <View className="mb-2">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-purple-600 text-xs  font-semibold">
                      {Math.round(progressPercentage || 0)}%
                      {elapsedSecond && (
                        <Text className="text-gray-500 text-xs">
                          {Math.floor(parseFloat(elapsedSecond) || 0)}
                        </Text>
                      )}
                    </Text>
                  </View>

                  <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <View
                      className="h-fullbg-purple-500 rounded-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    >
                      {" "}
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

        {/* Progress message */}
        {progressMessage && (
          <Text className="text-purple-600 text-xs font-medium mt-1">
            {progressMessage}
          </Text>
        )}

        {/*  Percentage*/}

        {!progressPercentage && elapsedSecond && (
          <Text>{Math.floor(parseFloat(elapsedSecond) || 0)} seconds</Text>
        )}

        {/* Recover button */}

        {status === "failed" && onRecover && (
          <View className="mt-1">
            {progressMessage && (
              <Text className="text-gray-500 text-xs">
                <TouchableOpacity
                  className="bg-purple-100 rounded-lg py-2 px-3 flex-row items-center justify-center"
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh" size={16} color="#7cc3aed" />
                  <Text className="text-purple-600 text-xs font-medium ml-2">
                    Check Again
                  </Text>
                </TouchableOpacity>
              </Text>
            )}
          </View>
        )}

        {/* stattus badge  */}
      </View>
    </TouchableOpacity>
  );
};

export default GenerationCard;
