import DeviceInfo from 'react-native-device-info';

export const getIp = () => {
    DeviceInfo.getIPAddress().then(ip => {
        return ip;
    });
}

export const getReport = (success) => {
    console.log('getting report')
    let loaded = 0;
    let data = {
        apiLevel: DeviceInfo.getAPILevel() || "",
        brand: DeviceInfo.getBrand() || "",
        carrier: DeviceInfo.getCarrier() || "",
        deviceCountry: DeviceInfo.getDeviceCountry() || "",
        deviceId: DeviceInfo.getDeviceId() || "",
        deviceLocale: DeviceInfo.getDeviceLocale() || "",
        deviceName: DeviceInfo.getDeviceName() || "",
        firstInstallTime: DeviceInfo.getFirstInstallTime() || "",
        manufacturer: DeviceInfo.getManufacturer() || "",
        model: DeviceInfo.getModel() || "",
        serialNumber: DeviceInfo.getSerialNumber() || "",
        phoneNumber: DeviceInfo.getPhoneNumber() || "",
        systemName: DeviceInfo.getSystemName() || "",
        systemVersion: DeviceInfo.getSystemVersion() || "",
        timezone: DeviceInfo.getTimezone() || "",
        storageSize: DeviceInfo.getTotalDiskCapacity() || "",
        totalMemory: DeviceInfo.getTotalMemory() || "",
        maxMemory: DeviceInfo.getMaxMemory() || "",
        uniqueId: DeviceInfo.getUniqueID() || "",
        userAgent: DeviceInfo.getUserAgent() || "",
        isTablet: DeviceInfo.isTablet(),
        hasNotch: DeviceInfo.hasNotch() || "",
        deviceType: DeviceInfo.getDeviceType() || ""
    }

    DeviceInfo.getIPAddress().then(ip => {
        data['ip'] = ip;
        loaded++;
        if(loaded > 1) success(data)
        // "92.168.32.44"
        //android.permission.ACCESS_WIFI_STATE
    });
    DeviceInfo.getMACAddress().then(mac => {
        data['macAddress'] = mac;
        loaded++;
        if(loaded > 1) success(data)
        // "E5:12:D8:E5:69:97"
    });
}
/*
DeviceInfo.getBatteryLevel().then(batteryLevel => {
  // 0.759999
});
const apiLevel = DeviceInfo.getAPILevel();
const brand = DeviceInfo.getBrand();
const carrier = DeviceInfo.getCarrier();
const deviceCountry = DeviceInfo.getDeviceCountry();
const deviceId = DeviceInfo.getDeviceId();
const deviceLocale = DeviceInfo.getDeviceLocale();
const deviceName = DeviceInfo.getDeviceName();
const firstInstallTime = DeviceInfo.getFirstInstallTime();
DeviceInfo.getIPAddress().then(ip => {
  // "92.168.32.44"
  //android.permission.ACCESS_WIFI_STATE
});
DeviceInfo.getMACAddress().then(mac => {
  // "E5:12:D8:E5:69:97"
});
const manufacturer = DeviceInfo.getManufacturer();
const model = DeviceInfo.getModel();
const serialNumber = DeviceInfo.getSerialNumber();
const systemName = DeviceInfo.getSystemName();
const systemVersion = DeviceInfo.getSystemVersion();
const timezone = DeviceInfo.getTimezone();
const storageSize = DeviceInfo.getTotalDiskCapacity(); // in bytes
const totalMemory = DeviceInfo.getTotalMemory();
const uniqueId = DeviceInfo.getUniqueID();
const userAgent = DeviceInfo.getUserAgent();
const isTablet = DeviceInfo.isTablet();
const hasNotch = DeviceInfo.hasNotch();
const deviceType = DeviceInfo.getDeviceType();
*/