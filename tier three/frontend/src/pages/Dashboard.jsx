import { useEffect, useState } from 'react';
import { getSoilData, getPredictCrop, getFertilizer, getDisasterAlerts } from '../api';
import { Droplets, Thermometer, CloudRain, Activity, AlertTriangle, LineChart as ChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard({ farmerId, farmerName }) {
    const [soilData, setSoilData] = useState([]);
    const [prediction, setPrediction] = useState('');
    const [fertilizer, setFertilizer] = useState('');
    const [alerts, setAlerts] = useState([]);
    const [isPredictingCrop, setIsPredictingCrop] = useState(false);
    const [isGettingFertilizer, setIsGettingFertilizer] = useState(false);

    const fetchTelemetry = async () => {
        if (!farmerId) return;
        try {
            const data = await getSoilData(farmerId);
            setSoilData(data);
            const alts = await getDisasterAlerts(farmerId);
            setAlerts(alts.alerts);
        } catch (err) {
            console.error("Error fetching telemetry.", err);
        }
    };

    const generateCropPrediction = async () => {
        if (!farmerId) return;
        setIsPredictingCrop(true);
        try {
            const crop = await getPredictCrop(farmerId);
            setPrediction(crop.prediction);
        } catch (err) {
            setPrediction("Failed to generate prediction.");
        } finally {
            setIsPredictingCrop(false);
        }
    };

    const generateFertilizerPlan = async () => {
        if (!farmerId) return;
        setIsGettingFertilizer(true);
        try {
            const fert = await getFertilizer(farmerId);
            setFertilizer(fert.recommendation);
        } catch (err) {
            setFertilizer("Failed to load recommendation.");
        } finally {
            setIsGettingFertilizer(false);
        }
    };

    useEffect(() => {
        fetchTelemetry(); // Initial poll
        // Poll telemetry strictly every 8 hours (28,800,000 milliseconds)
        const interval = setInterval(fetchTelemetry, 28800000);
        return () => clearInterval(interval);
    }, []);

    const latestData = soilData.length > 0 ? soilData[soilData.length - 1] : { moisture: 0, temp: 0, humidity: 0 };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <div className="live-badge">
                    <div className="pulse"></div>
                    Background Sync: 8hrs
                </div>
            </div>

            {alerts && alerts.length > 0 && alerts.map((alert, idx) => (
                <div key={idx} className="alert-banner" style={{ marginBottom: '1.5rem' }}>
                    <AlertTriangle className="alert-icon" size={24} />
                    <div>
                        <strong>{alert.type} Alert ({alert.severity}):</strong> {alert.message}
                    </div>
                </div>
            ))}

            <div className="dashboard-grid">
                <div className="glass-card telemetry-card">
                    <h3 style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>Soil Moisture</h3>
                    <div className="icon-wrapper icon-blue">
                        <Droplets size={28} />
                    </div>
                    <div className="telemetry-value">
                        {latestData.moisture.toFixed(1)}<span className="telemetry-unit">%</span>
                    </div>
                    <p style={{ marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>ESP32 Target Calibrated Target Range: 30-60%</p>
                </div>

                <div className="glass-card telemetry-card">
                    <h3 style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>Temperature</h3>
                    <div className="icon-wrapper icon-orange">
                        <Thermometer size={28} />
                    </div>
                    <div className="telemetry-value">
                        {latestData.temp.toFixed(1)}<span className="telemetry-unit">°C</span>
                    </div>
                    <p style={{ marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>DHT22 Sensor Reading</p>
                </div>

                <div className="glass-card telemetry-card">
                    <h3 style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>Environment Humidity</h3>
                    <div className="icon-wrapper icon-green">
                        <CloudRain size={28} />
                    </div>
                    <div className="telemetry-value">
                        {latestData.humidity.toFixed(1)}<span className="telemetry-unit">%</span>
                    </div>
                    <p style={{ marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>DHT22 Sensor Reading</p>
                </div>
            </div>

            {/* Historical Data Chart */}
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <ChartIcon color="var(--accent-blue)" /> Historical Telemetry Trends
                </h2>
                <div className="chart-container">
                    {soilData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={soilData.slice(-20)} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="timestamp"
                                    stroke="var(--text-secondary)"
                                    tickFormatter={(tick) => {
                                        try { return new Date(tick).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                                        catch (e) { return tick }
                                    }}
                                />
                                <YAxis yAxisId="left" stroke="var(--text-secondary)" />
                                <YAxis yAxisId="right" orientation="right" stroke="var(--text-secondary)" />
                                <Tooltip
                                    labelFormatter={(label) => {
                                        try { return new Date(label).toLocaleString() }
                                        catch (e) { return label }
                                    }}
                                />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="moisture" stroke="var(--accent-blue)" strokeWidth={2} activeDot={{ r: 6 }} name="Moisture (%)" />
                                <Line yAxisId="right" type="monotone" dataKey="temp" stroke="var(--accent-orange)" strokeWidth={2} name="Temperature (°C)" />
                                <Line yAxisId="left" type="monotone" dataKey="humidity" stroke="var(--accent-green)" strokeWidth={2} name="Humidity (%)" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                            Waiting for sensor data...
                        </div>
                    )}
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <Activity color="var(--accent-blue)" /> Generative AI Insights
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ color: 'var(--text-secondary)', margin: 0 }}>Optimal Crop Model</h4>
                                <button onClick={generateCropPrediction} disabled={isPredictingCrop || soilData.length === 0} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                    {isPredictingCrop ? 'Thinking...' : 'Generate Prediction'}
                                </button>
                            </div>
                            <p style={{ fontSize: '1.25rem', fontWeight: 600, minHeight: '3rem' }}>
                                {prediction || 'Standby for manual AI generation...'}
                            </p>
                        </div>

                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ color: 'var(--text-secondary)', margin: 0 }}>Fertilizer Plan</h4>
                                <button onClick={generateFertilizerPlan} disabled={isGettingFertilizer || soilData.length === 0} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                    {isGettingFertilizer ? 'Thinking...' : 'Generate Plan'}
                                </button>
                            </div>
                            <p style={{ fontSize: '1.1rem', lineHeight: 1.4, minHeight: '3rem' }}>
                                {fertilizer || 'Standby for manual AI generation...'}
                            </p>
                        </div>
                    </div>

                    <div className="hardware-panel" style={{ marginTop: '1.5rem' }}>
                        <strong>Hardware Calibration Note:</strong> Ensure the capacitive soil moisture sensor is properly calibrated in the ESP32 logic: <code>dry = 0%</code> (air) and <code>water = 100%</code>. Analog reads must be mapped appropriately before POSTing to <code>/api/soil-data</code>.
                    </div>
                </div>
            </div>
        </>
    );
}

export default Dashboard;
