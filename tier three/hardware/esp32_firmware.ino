#include <ArduinoJson.h>
#include <DHT.h>
#include <HTTPClient.h>
#include <WiFi.h>

// WiFi credentials
const char *ssid = "YOUR_WIFI_SSID";
const char *password = "YOUR_WIFI_PASSWORD";

// Backend API Endpoint
const char *API_URL =
    "http://YOUR_BACKEND_IP:8000/api/soil-data"; // Replace with actual server
                                                 // IP mapped for your Farm

// Hardware Multi-Tenancy Identity
// This aligns the physical node with a specific registered farmer in the
// PostgreSQL database.
const int FARMER_ID = 1;

// DHT22 Pin & Type
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// Capacitive Soil Moisture Sensor Pin
#define SOIL_MOISTURE_PIN 34 // ADC1_CH6

// Analog pH Sensor Pin
#define PH_SENSOR_PIN 35 // ADC1_CH7

// --- Calibration Constants ---
// Soil Moisture
const int AIR_VALUE = 4095;   // Value when completely dry
const int WATER_VALUE = 1000; // Value when submerged

// pH Sensor (Standard 5V analog pH meter stepped down for ESP32 3.3V ADC)
// These values require manual calibration with pH 4.0 and pH 7.0 buffer
// solutions
const float PH_NEUTRAL_VOLTAGE = 1.5; // Voltage at pH 7.0
const float PH_STEP = 0.18;           // Voltage change per pH unit

void setup() {
  Serial.begin(115200);

  // Initialize DHT sensor
  dht.begin();

  // Set ADC resolution (ESP32 default is 12-bit: 0-4095)
  analogReadResolution(12);

  // Connect to WiFi network
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected successfully.");
}

void loop() {
  // Wait before next reading (e.g., 10 seconds for testing)
  delay(10000);

  // --- Read DHT22 ---
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();

  // --- Read Soil Moisture ---
  int soilAnalog = analogRead(SOIL_MOISTURE_PIN);
  int moisturePercent = map(soilAnalog, AIR_VALUE, WATER_VALUE, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);

  // --- Read pH Sensor ---
  int phAnalog = analogRead(PH_SENSOR_PIN);
  float phVoltage =
      phAnalog *
      (3.3 / 4095.0); // Convert 12-bit ADC to voltage (ESP32 is 3.3V)

  // Calculate actual pH based on calibration curve
  // Formula: pH = 7.0 - ((Voltage - NeutralVoltage) / VoltageStepPerPH)
  float soilPH = 7.0 - ((phVoltage - PH_NEUTRAL_VOLTAGE) / PH_STEP);
  soilPH = constrain(soilPH, 0.0, 14.0); // Keep within realistic 0-14 pH bounds

  // Check if any reads from the DHT sensor failed
  if (isnan(temp) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  Serial.println("--- Sensor Readings ---");
  Serial.printf("Temperature: %.2f °C\n", temp);
  Serial.printf("Humidity: %.2f %%\n", humidity);
  Serial.printf("Soil Moisture: %d %% (Analog: %d)\n", moisturePercent,
                soilAnalog);
  Serial.printf("Soil pH: %.2f (Voltage: %.2fV)\n", soilPH, phVoltage);

  // --- Create JSON Payload ---
  // Add the node's hardcoded owner ID so the backend correctly assigns this
  // telemetry.
  String requestBody = "{";
  requestBody += "\"farmer_id\": " + String(FARMER_ID) + ",";
  requestBody += "\"moisture\": " + String(moisturePercent) + ",";
  requestBody += "\"temp\": " + String(temp) + ",";
  requestBody += "\"humidity\": " + String(humidity) + ",";
  requestBody += "\"ph\": " + String(soilPH) + ",";
  requestBody +=
      "\"timestamp\": \"2023-10-27T10:00:00Z\""; // Placeholder, real app would
                                                 // sync NTP
  requestBody += "}";

  // --- Send POST Request ---
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
      Serial.printf("HTTP Response code: %d\n", httpResponseCode);
      String payload = http.getString();
      Serial.println(payload);
    } else {
      Serial.printf("Error occurred during POST: %s\n",
                    http.errorToString(httpResponseCode).c_str());
    }

    http.end();
  } else {
    Serial.println("WiFi Disconnected. Cannot send data.");
  }
}
