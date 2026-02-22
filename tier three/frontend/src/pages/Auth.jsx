import { useState } from 'react';
import { registerFarmer, loginFarmer } from '../api';
import { UserPlus, LogIn, Leaf } from 'lucide-react';

function Auth({ onLogin }) {
    const [activeTab, setActiveTab] = useState('login');

    // Registration State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [regStatus, setRegStatus] = useState('');

    // Login State
    const [loginPhone, setLoginPhone] = useState('');
    const [loginError, setLoginError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await registerFarmer({ name, phone, location });
            setRegStatus('Successfully Registered! Please sign in.');
        } catch {
            setRegStatus('Registration Failed. Phone might exist.');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (loginPhone.trim() === '') {
            setLoginError('Please enter your registered phone number.');
            return;
        }

        try {
            const response = await loginFarmer(loginPhone);
            setLoginError('');
            onLogin(response.farmer_id, response.name);
        } catch (err) {
            setLoginError('Invalid phone number. Node not found.');
        }
    };

    return (
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-green)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                    <Leaf size={48} color="white" />
                </div>
                <h1>AgriSphere</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Next-Generation Field Intelligence</p>
            </div>

            <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '0' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={() => setActiveTab('login')}
                        style={{
                            flex: 1,
                            padding: '1.5rem',
                            background: activeTab === 'login' ? 'rgba(255,255,255,0.05)' : 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'login' ? '3px solid var(--accent-blue)' : '3px solid transparent',
                            color: activeTab === 'login' ? 'white' : 'var(--text-secondary)',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <LogIn size={20} /> Sign In
                    </button>
                    <button
                        onClick={() => setActiveTab('register')}
                        style={{
                            flex: 1,
                            padding: '1.5rem',
                            background: activeTab === 'register' ? 'rgba(255,255,255,0.05)' : 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'register' ? '3px solid var(--accent-green)' : '3px solid transparent',
                            color: activeTab === 'register' ? 'white' : 'var(--text-secondary)',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <UserPlus size={20} /> Register Node
                    </button>
                </div>

                <div style={{ padding: '2rem' }}>
                    {activeTab === 'login' && (
                        <form onSubmit={handleLogin} style={{ animation: 'fadeIn 0.3s ease' }}>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    value={loginPhone}
                                    onChange={e => setLoginPhone(e.target.value)}
                                    required
                                    placeholder="+1 234 567 8900"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', background: 'var(--accent-blue)' }}>
                                Access Dashboard
                            </button>
                            {loginError && <p style={{ marginTop: '1rem', color: 'var(--accent-orange)', textAlign: 'center' }}>{loginError}</p>}
                        </form>
                    )}

                    {activeTab === 'register' && (
                        <form onSubmit={handleRegister} style={{ animation: 'fadeIn 0.3s ease' }}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="tel" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+1 234 567 8900" />
                            </div>
                            <div className="form-group">
                                <label>Farm Location (Coords/City)</label>
                                <input type="text" className="form-control" value={location} onChange={e => setLocation(e.target.value)} required placeholder="34.05, -118.24" />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', background: 'var(--accent-green)', borderColor: 'var(--accent-green)' }}>
                                Deploy Network Node
                            </button>
                            {regStatus && <p style={{ marginTop: '1rem', color: regStatus.includes('Failed') ? 'var(--accent-orange)' : 'var(--accent-green)', textAlign: 'center' }}>{regStatus}</p>}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Auth;
