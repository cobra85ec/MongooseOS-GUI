# MongooseOS-GUI

## A Web-Based GUI to configure:
  * Device Name
  * Device Accesspoint SSID + Password
  * Station Scan
  * Station Accesspoint Credentials (WPA/WPA2/WPA2 Enterprise)
  * MQTT Server
  * User Credentials
  * Keep-Alive + Timeouts
 
#### The GUI Access Mongoose-OS configuration via RPC.

## Installtion
  1. Create a folder "gui" in you Applications Root-Directory and copy GUI-Files into.
  2. Enable Mongoose-OSs Webserver and set Document-Root to "/gui"
  3. Now create an extra Filesystem on your ESP for the files (in some cases it is necessary to run *mos flash --esp-erase-chip* before creating the file system)

  #### ESP8266
  ```bash
  #Create Filesystem
  mos call FS.Mkfs '{"dev_type": "sysflash", "fs_type": "SPIFFS", "fs_opts": "{\"addr\": 3145728, \"size\": 262144"}'
  #Mount Filesystem
  mos call FS.Mount '{"dev_type": "sysflash", "fs_type": "SPIFFS", "fs_opts": "{\"addr\": 3145728, \"size\": 262144}", "path": "/gui"}'
  #Config Filesystem to be mounted on restart
  mos config-set sys.mount.path=/gui sys.mount.dev_type=sysflash sys.mount.fs_type=SPIFFS 'sys.mount.fs_opts={"addr": 3145728, "size": 262144}'
  ```
  #### ESP32
  ```bash
  #Create Filesystem
  mos call FS.Mkfs '{"dev_type": "esp32part", "dev_opts": "{\"label\": \"gui\"}", "fs_type": "SPIFFS"}'
  #Mount Filesystem
  mos call FS.Mount '{"dev_type": "esp32part", "dev_opts": "{\"label\": \"gui\"}", "fs_type": "SPIFFS", "path": "/gui"}'
  #Config Filesystem to be mounted on restart
  mos call FS.Mount '{"dev_type": "esp32part", "dev_opts": "{\"label\": \"gui\"}", "fs_type": "SPIFFS", "path": "/gui"}'
  ```
  
  4. Enable the AP
  ```bash
  mos config-set wifi.ap.enable=true
  ```
  
  5. Upload GUI-Files to the new Created file system by running "uploadGUI.sh" in the /gui directory of your Application.
  6. Connect to your ESPs AccessPoint an call *192.168.4.1* in the Browser
  
## Developement Roadmap:
 * Launch Mongoose-OS libary for Einable/Disable AccessPoint on Keypress
 * Captive Portal
 * SNTP Time Settings
