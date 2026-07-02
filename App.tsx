import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator, Dimensions, PixelRatio } from "react-native";
import { WebView } from "react-native-webview";
import NetInfo from "@react-native-community/netinfo";
import { StatusBar } from "expo-status-bar";

export default function App() {
  const [isConnected, setIsConnected] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);

  // 👉 Récupère la vraie taille physique de l'écran
  const { width: dpWidth, height: dpHeight } = Dimensions.get("window");
  const pixelRatio = PixelRatio.get();
  const realWidth = Math.round(dpWidth * pixelRatio);
  const realHeight = Math.round(dpHeight * pixelRatio);

  // Vérifie la connexion
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(Boolean(state.isConnected && state.isInternetReachable));
    });
    return () => unsubscribe();
  }, []);

  const handleReload = useCallback(() => {
    setReloadKey(prev => prev + 1);
    setLoading(true);
  }, []);

  if (!isConnected) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>🚫 Pas de connexion Internet</Text>
        <Button title="Réessayer" onPress={handleReload} />
      </View>
    );
  }

  const WEBVIEW_URL = "https://data.fidaburundi.org";

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#FF6600" />
        </View>
      )}
      <WebView
        key={reloadKey}
        source={{ uri: WEBVIEW_URL }}
        style={{ flex: 1 }}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        userAgent="Mozilla/5.0 (Linux; Android TV 9; SHIELD Android TV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
        injectedJavaScript={`
          (function() {
            var meta = document.querySelector('meta[name=viewport]');
            if (!meta) {
              meta = document.createElement('meta');
              meta.setAttribute('name', 'viewport');
              document.head.appendChild(meta);
            }
            // Calcule scale = largeur logique / largeur réelle
            var scale = ${dpWidth} / ${realWidth};
            meta.setAttribute('content', 'width=${realWidth}, initial-scale=' + scale + ', maximum-scale=' + scale + ', user-scalable=no');
          })();
          true;
        `}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 1,
  },
  errorText: {
    color: "white",
    fontSize: 22,
    marginBottom: 20,
    textAlign: "center"
  }
});
