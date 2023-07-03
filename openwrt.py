from openwrt_luci_rpc import OpenWrtRpc
import json

router = OpenWrtRpc("192.168.1.1", "root", "MySmartHome!")
result = router.get_all_connected_devices(only_reachable=False)

device_list = []
for device in result:
    device_dict = device._asdict()
    device_list.append(device_dict)

# Convert the device list to JSON
json_result = json.dumps(device_list, indent=4)

print(json_result)
