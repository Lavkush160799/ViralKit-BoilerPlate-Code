import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";

const IndexGate = () => {
  const [loading, setLoading] = useState(true);
  const [isBoarding, setIsBoarding] = useState<boolean | null>(null);

  useEffect(() => {
    const checkObboarding = async () => {
      try {
        const hasFlag = await AsyncStorage.getItem("isBoarding");
        setIsBoarding(hasFlag === "true");
      } catch (error) {
        setIsBoarding(false);
      } finally {
        setLoading(false);
      }
    };
    checkObboarding();
  }, []);

  if (loading || isBoarding === null) {
    return null;
  }

  if (!isBoarding) {
    return <Redirect href="/onboarding" />;
  }
  return <Redirect href="/(tabs)" />;
};

export default IndexGate;
