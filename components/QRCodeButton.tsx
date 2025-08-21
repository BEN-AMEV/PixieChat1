import React from "react";
import { TouchableOpacity } from "react-native";
import IconButton from "./IconButton";
import { ThemedText } from "./ThemedText";

interface QRCodeButtonProps {
    handleOpenQRCode: () => void;
}

export default function QRCodeButton({ handleOpenQRCode }: QRCodeButtonProps) {
    return (
        <TouchableOpacity 
        onPress={handleOpenQRCode} 
        style={{ 
            width: 200,
            alignItems: "center",
            top: "65%",
            alignSelf: "center",
            padding: 6, 
            borderWidth: 3,
            borderColor: "white",
            borderRadius: 10,
            borderStyle: "dashed",
            }}
            >
                <IconButton iosName="qrcode" androidName="qr-code" onPress={handleOpenQRCode} />
            <ThemedText type="defaultSemiBold" style={{ color: "white" }}>
                Scanned QR code detected!
            </ThemedText>
        </TouchableOpacity>
    );
}