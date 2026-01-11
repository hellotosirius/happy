import { useCameraPermissions } from "expo-camera";
import { Platform } from "react-native";

export function useCheckScannerPermissions(): () => Promise<boolean> {
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();

    return async () => {
        // Always check and request permissions on all platforms
        // This ensures compatibility with devices without Google services (e.g., Huawei P40)
        if (!cameraPermission) {
            // camera permissions are loading
            return false;
        }

        if (!cameraPermission.granted) {
            const reqRes = await requestCameraPermission();
            if (!reqRes.granted) {
                console.log('[CAMERA] Permission denied by user');
                return false;
            }
        }

        console.log('[CAMERA] Permission granted');
        return true;
    }
}