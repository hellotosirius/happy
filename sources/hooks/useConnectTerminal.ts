import * as React from 'react';
import { Platform } from 'react-native';
import { CameraView } from 'expo-camera';
import { useAuth } from '@/auth/AuthContext';
import { decodeBase64 } from '@/encryption/base64';
import { encryptBox } from '@/encryption/libsodium';
import { authApprove } from '@/auth/authApprove';
import { useCheckScannerPermissions } from '@/hooks/useCheckCameraPermissions';
import { Modal } from '@/modal';
import { t } from '@/text';
import { sync } from '@/sync/sync';

interface UseConnectTerminalOptions {
    onSuccess?: () => void;
    onError?: (error: any) => void;
}

export function useConnectTerminal(options?: UseConnectTerminalOptions) {
    const auth = useAuth();
    const [isLoading, setIsLoading] = React.useState(false);
    const checkScannerPermissions = useCheckScannerPermissions();

    const processAuthUrl = React.useCallback(async (url: string) => {
        if (!url.startsWith('happy://terminal?')) {
            Modal.alert(t('common.error'), t('modals.invalidAuthUrl'), [{ text: t('common.ok') }]);
            return false;
        }

        setIsLoading(true);
        try {
            console.log('[AUTH] Processing auth URL...');
            const tail = url.slice('happy://terminal?'.length);
            const publicKey = decodeBase64(tail, 'base64url');
            const responseV1 = encryptBox(decodeBase64(auth.credentials!.secret, 'base64url'), publicKey);
            let responseV2Bundle = new Uint8Array(sync.encryption.contentDataKey.length + 1);
            responseV2Bundle[0] = 0;
            responseV2Bundle.set(sync.encryption.contentDataKey, 1);
            const responseV2 = encryptBox(responseV2Bundle, publicKey);
            await authApprove(auth.credentials!.token, publicKey, responseV1, responseV2);

            console.log('[AUTH] Terminal connected successfully, triggering sync...');

            // Trigger sync to refresh device list
            await sync.refreshMachines();

            // Show success message and call onSuccess callback
            Modal.alert(t('common.success'), t('modals.terminalConnectedSuccessfully'), [
                {
                    text: t('common.ok'),
                    onPress: () => {
                        console.log('[AUTH] Success callback triggered');
                        options?.onSuccess?.();
                    }
                }
            ]);
            return true;
        } catch (e) {
            console.error('[AUTH] Failed to connect terminal:', e);
            Modal.alert(t('common.error'), t('modals.failedToConnectTerminal'), [{ text: t('common.ok') }]);
            options?.onError?.(e);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [auth.credentials, options]);

    const connectTerminal = React.useCallback(async () => {
        const hasPermission = await checkScannerPermissions();

        if (!hasPermission) {
            Modal.alert(t('common.error'), t('modals.cameraPermissionsRequiredToConnectTerminal'), [{ text: t('common.ok') }]);
            return;
        }

        try {
            console.log('[SCANNER] Launching barcode scanner...');
            // Use camera scanner
            await CameraView.launchScanner({
                barcodeTypes: ['qr']
            });
            console.log('[SCANNER] Scanner launched successfully');
        } catch (error) {
            console.error('[SCANNER] Failed to launch scanner:', error);
            Modal.alert(
                t('common.error'),
                t('modals.failedToOpenCamera'),
                [{ text: t('common.ok') }]
            );
        }
    }, [checkScannerPermissions]);

    const connectWithUrl = React.useCallback(async (url: string) => {
        return await processAuthUrl(url);
    }, [processAuthUrl]);

    // Set up barcode scanner listener
    React.useEffect(() => {
        if (CameraView.isModernBarcodeScannerAvailable) {
            const subscription = CameraView.onModernBarcodeScanned(async (event) => {
                if (event.data.startsWith('happy://terminal?')) {
                    // Dismiss scanner on Android is called automatically when barcode is scanned
                    if (Platform.OS === 'ios') {
                        await CameraView.dismissScanner();
                    }
                    await processAuthUrl(event.data);
                }
            });
            return () => {
                subscription.remove();
            };
        }
    }, [processAuthUrl]);

    return {
        connectTerminal,
        connectWithUrl,
        isLoading,
        processAuthUrl
    };
}
