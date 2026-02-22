import { useEffect, useState } from 'react';
import { getSoilData, getDisasterAlerts, getDssInsight } from '../api';
import { Droplets, Thermometer, CloudRain, Activity, AlertTriangle, LineChart as ChartIcon, Leaf, Beaker, Zap, CloudDrizzle, BrainCircuit, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard({ farmerId, farmerName }) {
    const [soilData, setSoilData] = useState([]);
    const [dssInsight, setDssInsight] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [isGettingInsight, setIsGettingInsight] = useState(false);

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

    const generateInsight = async () => {
        if (!farmerId) return;
        setIsGettingInsight(true);
        try {
            const data = await getDssInsight(farmerId);
            setDssInsight(data);
        } catch (err) {
            setDssInsight({ explanation: "Failed to load Decision Support Insight.", crop_scores: [], recommended_crop: 'N/A', fertilizer_plan: 'Error loading plan' });
        } finally {
            setIsGettingInsight(false);
        }
    };

    useEffect(() => {
        fetchTelemetry(); // Initial poll
        const interval = setInterval(fetchTelemetry, 28800000);
        return () => clearInterval(interval);
    }, []);

    const latestData = soilData.length > 0 ? soilData[soilData.length - 1] : { moisture: 0, temp: 0, humidity: 0, ph: 0, nitrogen: 0, phosphorus: 0, potassium: 0, rainfall: 0 };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1rem' }}>
                <div className="live-badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)' }}>
                    <MapPin size={14} style={{ marginRight: '0.25rem' }} /> Sensor Coverage: ~50m²
                </div>
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

                <div className="glass-card telemetry-card">
                    <h3 style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>Nitrogen (N)</h3>
                    <div className="icon-wrapper icon-green">
                        <Leaf size={28} />
                    </div>
                    <div className="telemetry-value">
                        {latestData.nitrogen.toFixed(1)}<span className="telemetry-unit">mg/kg</span>
                    </div>
                    <p style={{ marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>DSS Extrapolated Telemetry</p>
                </div>

                <div className="glass-card telemetry-card">
                    <h3 style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>Phosphorus (P)</h3>
                    <div className="icon-wrapper icon-orange">
                        <Beaker size={28} />
                    </div>
                    <div className="telemetry-value">
                        {latestData.phosphorus.toFixed(1)}<span className="telemetry-unit">mg/kg</span>
                    </div>
                    <p style={{ marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>DSS Extrapolated Telemetry</p>
                </div>

                <div className="glass-card telemetry-card">
                    <h3 style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>Potassium (K)</h3>
                    <div className="icon-wrapper icon-blue">
                        <Zap size={28} />
                    </div>
                    <div className="telemetry-value">
                        {latestData.potassium.toFixed(1)}<span className="telemetry-unit">mg/kg</span>
                    </div>
                    <p style={{ marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>DSS Extrapolated Telemetry</p>
                </div>

                <div className="glass-card telemetry-card">
                    <h3 style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>Soil pH</h3>
                    <div className="icon-wrapper" style={{ background: 'rgba(156, 39, 176, 0.2)', color: '#ce93d8' }}>
                        <Activity size={28} />
                    </div>
                    <div className="telemetry-value">
                        {latestData.ph.toFixed(1)}<span className="telemetry-unit"></span>
                    </div>
                    <p style={{ marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>Ideal range: 6.0 - 7.5</p>
                </div>

                <div className="glass-card telemetry-card">
                    <h3 style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>Rainfall</h3>
                    <div className="icon-wrapper icon-blue">
                        <CloudDrizzle size={28} />
                    </div>
                    <div className="telemetry-value">
                        {latestData.rainfall.toFixed(1)}<span className="telemetry-unit">mm</span>
                    </div>
                    <p style={{ marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>Past 24h Accumulation</p>
                </div>
            </div>

            {/* Historical Data Chart */}
            <div className="glass-card" style={{ marginBottom: '1.5rem', marginTop: '1.5rem' }}>
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
                <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <BrainCircuit color="var(--accent-blue)" /> Intelligent Decision Support System
                        </h2>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <h4 style={{ color: 'var(--text-secondary)', margin: 0 }}>Comprehensive Analysis</h4>
                                {dssInsight?.region && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                                        <MapPin size={14} /> Valid for Region: <strong>{dssInsight.region}</strong>
                                    </span>
                                )}
                            </div>
                            <button onClick={generateInsight} disabled={isGettingInsight || soilData.length === 0} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                {isGettingInsight ? 'Analyzing Telemetry & Market Data...' : 'Generate DSS Insight'}
                            </button>
                        </div>

                        {dssInsight ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <h5 style={{ color: 'var(--accent-green)', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                                        🏆 Recommended Action: Plant {dssInsight.recommended_crop}
                                    </h5>
                                    <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--text-primary)', marginTop: '1rem' }}>
                                        <strong>Reasoning Summary:</strong><br />
                                        {dssInsight.explanation}
                                    </p>
                                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,165,0,0.1)', borderRadius: '8px', borderLeft: '4px solid var(--accent-orange)' }}>
                                        <h6 style={{ color: 'var(--accent-orange)', marginBottom: '0.75rem', fontSize: '1.05rem' }}>Precise Fertilizer Plan:</h6>
                                        <p style={{ margin: 0, lineHeight: 1.5 }}>{dssInsight.fertilizer_plan}</p>
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px' }}>
                                    <h5 style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '1.1rem' }}>Crop Suitability Scores</h5>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {dssInsight.crop_scores && dssInsight.crop_scores.map((crop, idx) => (
                                            <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <strong style={{ fontSize: '1.1rem' }}>{crop.crop}</strong>
                                                    <span style={{ fontWeight: 'bold', color: crop.suitability_score > 80 ? 'var(--accent-green)' : crop.suitability_score > 60 ? 'var(--accent-orange)' : 'var(--accent-blue)' }}>
                                                        {crop.suitability_score}% Match
                                                    </span>
                                                </div>
                                                <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', height: '8px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                                                    <div style={{ width: `${crop.suitability_score}%`, background: crop.suitability_score > 80 ? 'var(--accent-green)' : crop.suitability_score > 60 ? 'var(--accent-orange)' : '#f44336', height: '100%', borderRadius: '6px', transition: 'width 1s ease-in-out' }}></div>
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                                                    <strong>Cultivation Plan:</strong> {crop.cultivation_solution || 'Data syncing...'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '8rem' }}>
                                <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>
                                    Standby for manual AI generation...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Dashboard;
