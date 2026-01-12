import * as React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StyleSheet as UniStyleSheet } from 'react-native-unistyles';
import { t } from '@/text';

interface FallbackQRScannerProps {
    onScanned: (data: string) => void;
    onClose: () => void;
}

export const FallbackQRScanner = React.memo<FallbackQRScannerProps>(({ onScanned, onClose }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = React.useState(false);

    React.useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission, requestPermission]);

    const handleBarCodeScanned = React.useCallback(({ data }: { data: string }) => {
        if (!scanned) {
            setScanned(true);
            onScanned(data);
        }
    }, [scanned, onScanned]);

    if (!permission) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>{t('common.loading')}</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>{t('modals.cameraPermissionsRequiredToConnectTerminal')}</Text>
                <Pressable style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>{t('common.grantPermission')}</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={onClose}>
                    <Text style={styles.buttonText}>{t('common.cancel')}</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />
            <View style={styles.overlay}>
                <View style={styles.topOverlay} />
                <View style={styles.middleRow}>
                    <View style={styles.sideOverlay} />
                    <View style={styles.scanArea} />
                    <View style={styles.sideOverlay} />
                </View>
                <View style={styles.bottomOverlay}>
                    <Text style={styles.instructionText}>
                        {t('modals.scanQRCodeToConnect')}
                    </Text>
                    <Pressable style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>{t('common.cancel')}</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
});

const styles = UniStyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    camera: {
        flex: 1,
        width: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
    },
    topOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    middleRow: {
        flexDirection: 'row',
        height: 250,
    },
    sideOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    scanArea: {
        width: 250,
        borderWidth: 2,
        borderColor: theme.colors.button.primary.background,
        backgroundColor: 'transparent',
    },
    bottomOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 40,
    },
    instructionText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    closeButton: {
        backgroundColor: theme.colors.button.primary.background,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    message: {
        color: theme.colors.text,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: theme.colors.button.primary.background,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
}));
