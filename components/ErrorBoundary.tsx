import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colores } from "../constants/Colors";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>¡Oops! Algo salió mal</Text>
          <Text style={styles.message}>
            La aplicación encontró un error inesperado.
          </Text>
          <Text style={styles.errorText}>
            {this.state.error?.message || "Error desconocido"}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ hasError: false, error: undefined })}
          >
            <Text style={styles.buttonText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colores.fondoPrincipal,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colores.textoBlanco,
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: Colores.textoGrisMedio,
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  errorText: {
    fontSize: 12,
    color: Colores.textoGrisMedio,
    marginBottom: 24,
    textAlign: "center",
    fontFamily: "monospace",
  },
  button: {
    backgroundColor: Colores.naranja,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: Colores.textoBlanco,
    fontSize: 16,
    fontWeight: "600",
  },
});
