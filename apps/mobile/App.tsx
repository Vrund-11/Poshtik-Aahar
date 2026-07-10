import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useFonts, Anton_400Regular } from '@expo-google-fonts/anton';
import { 
  PlusJakartaSans_400Regular, 
  PlusJakartaSans_600SemiBold, 
  PlusJakartaSans_700Bold 
} from '@expo-google-fonts/plus-jakarta-sans';
import { MaterialIcons } from '@expo/vector-icons';

interface Restaurant {
  id: string;
  name: string;
  cuisineType: string;
  status: string;
  plan: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  staffCount: number;
}

interface Complaint {
  id: string;
  orderId: string;
  restaurantName: string;
  category: string;
  urgency: string;
  customerName: string;
  summary: string;
  rawText: string;
  isResolved: boolean;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Anton: Anton_400Regular,
    'Plus-Jakarta': PlusJakartaSans_400Regular,
    'Plus-Jakarta-SemiBold': PlusJakartaSans_600SemiBold,
    'Plus-Jakarta-Bold': PlusJakartaSans_700Bold,
  });

  const [screen, setScreen] = useState<
    'login' | 'forgot' | 'reset' | 'dashboard' | 'restaurants' | 'restaurant-details' | 'setup-restaurant' | 'analytics' | 'complaints' | 'complaint-details' | 'settings' | 'upgrade-plan'
  >('login');

  // Shared Data States
  const [restaurants, setRestaurants] = useState<Restaurant[]>([
    { id: '1', name: 'Copper Hearth', cuisineType: 'Artisan Baking', status: 'ACTIVE', plan: 'GROWTH', ownerName: 'Arthur Dent', ownerEmail: 'arthur@hitchhiker.com', staffCount: 14 },
    { id: '2', name: 'Levain & Leaf', cuisineType: 'Healthy Bowls', status: 'TRIAL', plan: 'BASIC', ownerName: 'Trillian Astra', ownerEmail: 'trill@galaxy.org', staffCount: 8 },
    { id: '3', name: 'Sora Sushi', cuisineType: 'Japanese Fine', status: 'ACTIVE', plan: 'GROWTH', ownerName: 'Ford Prefect', ownerEmail: 'ford@guide.net', staffCount: 18 },
    { id: '4', name: 'Neon Noodle', cuisineType: 'Casual Dining', status: 'EXPIRED', plan: 'BASIC', ownerName: 'Zaphod Beeblebrox', ownerEmail: 'prez@galaxy.gov', staffCount: 5 }
  ]);

  const [complaints, setComplaints] = useState<Complaint[]>([
    { id: '1', orderId: '8842', restaurantName: 'Copper Hearth', category: 'Service Delay: 45+ Mins', urgency: 'HIGH', customerName: 'JD', summary: 'Customer reported wait time exceeded 45 minutes for takeout. Driver was delayed.', rawText: 'I waited for over 45 minutes for my order at Copper Hearth! This is completely unacceptable, my food was cold when it arrived.', isResolved: false },
    { id: '2', orderId: '9012', restaurantName: 'Sora Sushi', category: 'Undercooked Poultry', urgency: 'CRITICAL', customerName: 'JS', summary: 'Allergen / hygiene issue. Undercooked ingredients flagged by guest. Immediate kitchen audit requested.', rawText: 'The chicken in my teriyaki bowl from Sora Sushi was raw inside. Safety hazard!', isResolved: false }
  ]);

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>('1');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>('1');
  
  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Reset Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);

  // Setup Restaurant Form States
  const [newRestName, setNewRestName] = useState('');
  const [newRestOwner, setNewRestOwner] = useState('');
  const [newRestEmail, setNewRestEmail] = useState('');
  const [newRestPhone, setNewRestPhone] = useState('');
  const [newRestPlan, setNewRestPlan] = useState<'BASIC' | 'GROWTH'>('GROWTH');
  const [newRestExpiry, setNewRestExpiry] = useState('2027-07-07');

  // Account Settings Form States
  const [adminDisplayName, setAdminDisplayName] = useState('Senior Admin Console');
  const [adminPassword, setAdminPassword] = useState('');
  const [trialDays, setTrialDays] = useState(30);

  // Upgrade Plan defaults
  const [upgradeSelectedPlan, setUpgradeSelectedPlan] = useState<'STARTER' | 'GROWTH' | 'ENTERPRISE'>('GROWTH');
  const [upgradeNotes, setUpgradeNotes] = useState('');

  // Calculate password strength score
  useEffect(() => {
    let score = 0;
    if (newPassword.length > 6) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    setPasswordScore(score);
  }, [newPassword]);

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, styles.centerAlign]}>
        <ActivityIndicator size="large" color="#b02f00" />
      </View>
    );
  }

  const handleLoginSubmit = () => {
    setLoginLoading(true);
    setTimeout(() => {
      setLoginLoading(false);
      setLoginSuccess(true);
      setTimeout(() => {
        setLoginSuccess(false);
        setScreen('dashboard');
      }, 1500);
    }, 1200);
  };

  const handleForgotSubmit = () => {
    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSuccess(true);
    }, 1200);
  };

  const handleResetSubmit = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setResetLoading(true);
    setTimeout(() => {
      setResetLoading(false);
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        setScreen('login');
      }, 1500);
    }, 1200);
  };

  const handleCreateRestaurantSubmit = () => {
    if (!newRestName || !newRestOwner || !newRestEmail) {
      alert("Please fill in all required fields!");
      return;
    }
    const newRestaurant: Restaurant = {
      id: (restaurants.length + 1).toString(),
      name: newRestName,
      cuisineType: 'General Dining',
      status: 'TRIAL',
      plan: newRestPlan,
      ownerName: newRestOwner,
      ownerEmail: newRestEmail,
      ownerPhone: newRestPhone,
      staffCount: 1
    };
    setRestaurants([newRestaurant, ...restaurants]);
    setNewRestName('');
    setNewRestOwner('');
    setNewRestEmail('');
    setNewRestPhone('');
    setScreen('restaurants');
  };

  const handleToggleStatus = (id: string) => {
    setRestaurants(restaurants.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        return { ...r, status: nextStatus };
      }
      return r;
    }));
  };

  const handleResolveComplaintSubmit = (id: string) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, isResolved: true } : c));
    setScreen('complaints');
  };

  // Find active data objects
  const activeRestaurant = restaurants.find(r => r.id === selectedRestaurantId) || restaurants[0];
  const activeComplaint = complaints.find(c => c.id === selectedComplaintId) || complaints[0];

  const activeCount = restaurants.filter(r => r.status === 'ACTIVE').length;
  const trialCount = restaurants.filter(r => r.status === 'TRIAL').length;
  const expiredCount = restaurants.filter(r => r.status === 'EXPIRED').length;
  const unresolvedCount = complaints.filter(c => !c.isResolved).length;

  // Render bottom nav bar for admin console screens
  const renderBottomNav = () => (
    <View style={styles.bottomNav}>
      <TouchableOpacity 
        style={styles.bottomNavItem}
        onPress={() => setScreen('dashboard')}
      >
        <View style={screen === 'dashboard' ? styles.bottomNavIconActive : null}>
          <MaterialIcons name="dashboard" size={20} color={screen === 'dashboard' ? '#541200' : '#5b4039'} />
        </View>
        <Text style={[styles.bottomNavText, screen === 'dashboard' && styles.bottomNavTextActive]}>Console</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.bottomNavItem}
        onPress={() => setScreen('restaurants')}
      >
        <View style={['restaurants', 'restaurant-details', 'setup-restaurant'].includes(screen) ? styles.bottomNavIconActive : null}>
          <MaterialIcons name="storefront" size={20} color={['restaurants', 'restaurant-details', 'setup-restaurant'].includes(screen) ? '#541200' : '#5b4039'} />
        </View>
        <Text style={[styles.bottomNavText, ['restaurants', 'restaurant-details', 'setup-restaurant'].includes(screen) && styles.bottomNavTextActive]}>Fleet</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.bottomNavItem}
        onPress={() => setScreen('complaints')}
      >
        <View style={['complaints', 'complaint-details'].includes(screen) ? styles.bottomNavIconActive : null}>
          <MaterialIcons name="chat-bubble" size={20} color={['complaints', 'complaint-details'].includes(screen) ? '#541200' : '#5b4039'} />
          <View style={styles.badgeDot} />
        </View>
        <Text style={[styles.bottomNavText, ['complaints', 'complaint-details'].includes(screen) && styles.bottomNavTextActive]}>Tickets</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.bottomNavItem}
        onPress={() => setScreen('analytics')}
      >
        <View style={screen === 'analytics' ? styles.bottomNavIconActive : null}>
          <MaterialIcons name="analytics" size={20} color={screen === 'analytics' ? '#541200' : '#5b4039'} />
        </View>
        <Text style={[styles.bottomNavText, screen === 'analytics' && styles.bottomNavTextActive]}>Insights</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.bottomNavItem}
        onPress={() => setScreen('settings')}
      >
        <View style={['settings', 'upgrade-plan'].includes(screen) ? styles.bottomNavIconActive : null}>
          <MaterialIcons name="settings" size={20} color={['settings', 'upgrade-plan'].includes(screen) ? '#541200' : '#5b4039'} />
        </View>
        <Text style={[styles.bottomNavText, ['settings', 'upgrade-plan'].includes(screen) && styles.bottomNavTextActive]}>Settings</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff8f0" />
      
      {['login', 'forgot', 'reset'].includes(screen) ? (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* SCREEN 1: LOGIN */}
            {screen === 'login' && (
              <View style={styles.screenInner}>
                <View style={styles.headerArea}>
                  <View style={styles.logoContainer}>
                    <MaterialIcons name="restaurant" size={32} color="#541200" />
                  </View>
                  <Text style={styles.brandTitle}>UMAMI OS</Text>
                  <Text style={styles.brandSubtitle}>Partner Management</Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Partner Login</Text>
                  <Text style={styles.cardDescription}>
                    Enter your credentials to access the kitchen dashboard.
                  </Text>

                  {loginSuccess && (
                    <View style={styles.successToast}>
                      <MaterialIcons name="check-circle" size={18} color="#16a34a" style={styles.toastIcon} />
                      <Text style={styles.successToastText}>AUTHENTICATED SUCCESSFULLY</Text>
                    </View>
                  )}

                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>EMAIL ADDRESS</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput 
                        style={styles.input}
                        placeholder="chef@umami.com"
                        placeholderTextColor="#e4beb4"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                      />
                      <MaterialIcons name="alternate-email" size={20} color="#907067" style={styles.inputIcon} />
                    </View>
                  </View>

                  <View style={styles.fieldContainer}>
                    <View style={styles.passwordLabelRow}>
                      <Text style={styles.label}>PASSWORD</Text>
                      <TouchableOpacity onPress={() => setScreen('forgot')}>
                        <Text style={styles.forgotLink}>FORGOT?</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.inputWrapper}>
                      <TextInput 
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#e4beb4"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                      />
                      <TouchableOpacity 
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.inputIcon}
                      >
                        <MaterialIcons 
                          name={showPassword ? 'visibility-off' : 'visibility'} 
                          size={20} 
                          color="#907067" 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.primaryButton, loginLoading && styles.disabledButton]} 
                    onPress={handleLoginSubmit}
                    disabled={loginLoading}
                  >
                    <Text style={styles.primaryButtonText}>
                      {loginLoading ? 'AUTHENTICATING...' : 'LOGIN TO KITCHEN'}
                    </Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#541200" />
                  </TouchableOpacity>
                </View>

                <View style={styles.helpSection}>
                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>New Location?</Text>
                    <View style={styles.dividerLine} />
                  </View>
                  <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen('dashboard')}>
                    <Text style={styles.secondaryButtonText}>Quick Admin Demo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* SCREEN 2: FORGOT PASSWORD */}
            {screen === 'forgot' && (
              <View style={styles.screenInner}>
                <View style={styles.appHeader}>
                  <TouchableOpacity onPress={() => setScreen('login')}>
                    <MaterialIcons name="arrow-back" size={24} color="#b02f00" />
                  </TouchableOpacity>
                  <Text style={styles.appHeaderTitle}>UMAMI OS</Text>
                  <View style={{ width: 24 }} />
                </View>

                <View style={[styles.card, { marginTop: 24 }]}>
                  <View style={styles.contextIconContainer}>
                    <View style={styles.contextIconBackground}>
                      <MaterialIcons name="lock-reset" size={40} color="#b02f00" />
                    </View>
                  </View>

                  <Text style={[styles.cardTitle, { textAlign: 'center' }]}>Forgot Password?</Text>
                  <Text style={[styles.cardDescription, { textAlign: 'center' }]}>
                    Enter your registered email below to receive a magic reset link.
                  </Text>

                  {forgotSuccess ? (
                    <View style={styles.successBox}>
                      <MaterialIcons name="check-circle" size={32} color="#16a34a" style={{ marginBottom: 8 }} />
                      <Text style={styles.successBoxTitle}>Link Sent!</Text>
                      <Text style={styles.successBoxDescription}>
                        If an account exists for that email, you'll receive reset instructions shortly.
                      </Text>
                      <TouchableOpacity 
                        style={styles.successBoxButton}
                        onPress={() => {
                          setForgotSuccess(false);
                          setScreen('reset');
                        }}
                      >
                        <Text style={styles.successBoxButtonText}>Got it</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Restaurant Email</Text>
                        <View style={styles.inputWrapper}>
                          <TextInput 
                            style={styles.input}
                            placeholder="chef@umami.com"
                            placeholderTextColor="#907067"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={forgotEmail}
                            onChangeText={setForgotEmail}
                          />
                          <MaterialIcons name="alternate-email" size={20} color="#907067" style={styles.inputIcon} />
                        </View>
                      </View>

                      <TouchableOpacity 
                        style={[styles.primaryButton, forgotLoading && styles.disabledButton, { marginTop: 16 }]} 
                        onPress={handleForgotSubmit}
                        disabled={forgotLoading}
                      >
                        <Text style={styles.primaryButtonText}>
                          {forgotLoading ? 'SENDING...' : 'Send Magic Link'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.backToLoginCenter}
                        onPress={() => setScreen('login')}
                      >
                        <Text style={styles.backToLoginLink}>Return to Login</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            )}

            {/* SCREEN 3: RESET PASSWORD */}
            {screen === 'reset' && (
              <View style={styles.screenInner}>
                <View style={styles.appHeader}>
                  <TouchableOpacity onPress={() => setScreen('forgot')}>
                    <MaterialIcons name="arrow-back" size={24} color="#b02f00" />
                  </TouchableOpacity>
                  <Text style={styles.appHeaderTitle}>UMAMI OS</Text>
                  <View style={{ width: 24 }} />
                </View>

                <View style={[styles.card, { marginTop: 24 }]}>
                  <View style={styles.contextIconContainer}>
                    <View style={[styles.contextIconBackground, { backgroundColor: '#ffdbd1' }]}>
                      <MaterialIcons name="lock-reset" size={40} color="#541200" />
                    </View>
                  </View>

                  <Text style={[styles.cardTitle, { textAlign: 'center' }]}>Reset Password</Text>
                  <Text style={[styles.cardDescription, { textAlign: 'center' }]}>
                    Secure your kitchen's dashboard with a new, strong password.
                  </Text>

                  {resetSuccess && (
                    <View style={styles.successToast}>
                      <MaterialIcons name="check-circle" size={18} color="#16a34a" style={styles.toastIcon} />
                      <Text style={styles.successToastText}>PASSWORD UPDATED SUCCESSFULLY</Text>
                    </View>
                  )}

                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>NEW PASSWORD</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput 
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#eae2d0"
                        secureTextEntry={!showNewPassword}
                        value={newPassword}
                        onChangeText={setNewPassword}
                      />
                      <TouchableOpacity 
                        onPress={() => setShowNewPassword(!showNewPassword)}
                        style={styles.inputIcon}
                      >
                        <MaterialIcons 
                          name={showNewPassword ? 'visibility-off' : 'visibility'} 
                          size={20} 
                          color="#7c544e" 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>CONFIRM PASSWORD</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput 
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#eae2d0"
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                      />
                      <TouchableOpacity 
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.inputIcon}
                      >
                        <MaterialIcons 
                          name={showConfirmPassword ? 'visibility-off' : 'visibility'} 
                          size={20} 
                          color="#7c544e" 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.strengthMeterContainer}>
                    <View style={[styles.strengthBar, passwordScore > 0 ? styles.strengthBarActive : styles.strengthBarInactive]} />
                    <View style={[styles.strengthBar, passwordScore > 1 ? styles.strengthBarActive : styles.strengthBarInactive]} />
                    <View style={[styles.strengthBar, passwordScore > 2 ? styles.strengthBarActive : styles.strengthBarInactive]} />
                    <View style={[styles.strengthBar, passwordScore > 3 ? styles.strengthBarActive : styles.strengthBarInactive]} />
                  </View>

                  <TouchableOpacity 
                    style={[styles.primaryButton, resetLoading && styles.disabledButton, { marginTop: 16 }]} 
                    onPress={handleResetSubmit}
                    disabled={resetLoading}
                  >
                    <Text style={styles.primaryButtonText}>
                      {resetLoading ? 'Updating...' : 'Update Password'}
                    </Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#541200" />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.backToLoginCenter}
                    onPress={() => setScreen('login')}
                  >
                    <Text style={styles.backToLoginLink}>Back to Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        /* ADMIN SCREENS LAYOUT */
        <View style={styles.adminMainContainer}>
          <ScrollView style={styles.adminScroll} contentContainerStyle={styles.adminScrollContent} showsVerticalScrollIndicator={false}>
            
            {/* SCREEN 4: DASHBOARD OVERVIEW */}
            {screen === 'dashboard' && (
              <View style={styles.dashboardContainer}>
                {/* Top App Bar Header */}
                <View style={styles.adminHeader}>
                  <Text style={styles.adminLogoText}>Umami</Text>
                  <View style={styles.adminHeaderRight}>
                    <TouchableOpacity style={styles.headerButton}>
                      <MaterialIcons name="notifications" size={22} color="#b02f00" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.avatarBorder} onPress={() => setScreen('settings')}>
                      <Image 
                        style={styles.avatarImage as any} 
                        source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkcABFaLs3sPKkHxDqRGon_MUonNvJdBn_4WQDKmodw_0AyHRuE9TvQJ0VZqoll0lIQTSjJooy98wd9c5mzq4cj8rXLZpIcysaF-Hjbe0clyS77q1nKHKbsJzuIu3-Cv0ciWSvI6W1Rzf6Ek3TgUFlxn-FKB5fyPc7ZPzkS3CsTKj0etIvX9u_WWXL8Md8KEkSGLuqeCwiUOc4iQacU1kdCiqg6ulPUgie2opL4nyDnwMW9vFdrpjwyLB0tlkjnrme1_PEQZRGWVs' }} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Hero title */}
                <View style={styles.heroSection}>
                  <Text style={styles.heroHeadline}>Platform Overview</Text>
                  <Text style={styles.heroParagraph}>Good morning, Admin. Here's what's happening across your {restaurants.length} locations.</Text>
                </View>

                {/* Bento Grid Metrics */}
                <View style={styles.bentoGrid}>
                  {/* Total Network Card */}
                  <View style={[styles.bentoCardLarge, { backgroundColor: '#b02f00' }]}>
                    <Text style={styles.bentoCardLabelWhite}>Total Network</Text>
                    <Text style={styles.bentoCardValueWhite}>{restaurants.length}</Text>
                    <View style={styles.bentoGrowthRow}>
                      <MaterialIcons name="trending-up" size={14} color="#ffffff" />
                      <Text style={styles.bentoGrowthTextWhite}>+12% from last month</Text>
                    </View>
                  </View>

                  {/* Active / Trial row */}
                  <View style={styles.bentoRow}>
                    <View style={[styles.bentoCardHalf, { backgroundColor: '#fcf3e1' }]}>
                      <View style={[styles.smallIconCircle, { backgroundColor: '#ffdbd1' }]}>
                        <MaterialIcons name="check-circle" size={16} color="#b02f00" />
                      </View>
                      <Text style={styles.bentoCardHalfValue}>{activeCount}</Text>
                      <Text style={styles.bentoCardHalfLabel}>Active</Text>
                    </View>

                    <View style={[styles.bentoCardHalf, { backgroundColor: '#fcf3e1' }]}>
                      <View style={[styles.smallIconCircle, { backgroundColor: '#fdc8bf' }]}>
                        <MaterialIcons name="hourglass-top" size={16} color="#7c544e" />
                      </View>
                      <Text style={styles.bentoCardHalfValue}>{trialCount}</Text>
                      <Text style={styles.bentoCardHalfLabel}>In Trial</Text>
                    </View>
                  </View>

                  {/* Warning banner */}
                  <View style={styles.warningAlertCard}>
                    <View style={styles.warningLeft}>
                      <View style={styles.warningIconBg}>
                        <MaterialIcons name="warning" size={18} color="#ffffff" />
                      </View>
                      <View>
                        <Text style={styles.warningTitle}>{expiredCount} Expired</Text>
                        <Text style={styles.warningSubtitle}>Require attention</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.warningActionButton} onPress={() => setScreen('restaurants')}>
                      <Text style={styles.warningActionText}>Action</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Recent activity list */}
                <View style={styles.activityFeedContainer}>
                  <View style={styles.activityFeedHeader}>
                    <Text style={styles.activityFeedTitle}>Recent Signups</Text>
                    <TouchableOpacity onPress={() => setScreen('restaurants')}>
                      <Text style={styles.activityFeedLink}>View All</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.activityList}>
                    {restaurants.slice(0, 3).map((r, index) => {
                      const coverImages = [
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuAfxxrPA0sm6HymyvLvOWTCXP0bNdYujKzHl0u6moQbmRz4UC3DrmqQPDQfx8P-_peMeLUwTExN3GKeXbwWUQB8Dqhk6WRkAlJ__i448OsoEcO4V_sw3gcXZTT03pfJJTqQI5Ecjzx8qJQ6tjoBK6jzR8T5TyGbotZhAkN_mHCDcQ2DlV1gTGiUlKvJSBZfcC9mUaNoxeSrbqunq72QRHB9DktOQqCH1vXE06e6xpPr6sadBf5Eto25ZHUS2q_XxNirnpvh0judQuI",
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuD54xMpk4pTmKYN_bONjddJUDEpk6uMjIHxtlKHS_eLQjIKIolPiMA2R2Nq9a3E0bPialfcmLhXKcL_EwBG_AtLY190f5gmLRzIEc-53Nb5e1s5szGlIygxVXKEzoOdSEPiGEerNNZhrvBsuiLzkJwR-bDlmP6r-FJkFe8i5n10BhIEsCQ3-rni-H85ag_A7D1uzhyqWL2Xgy-6QJd8wylTdN6wY-Ktn3Ait0Z_KljYAIvA1qRPbenHzOO-083KFnrMOplNNf_ZsT8",
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuBDmtVFYKB6Wsoe6ICPOjqEWE8VnE9qPTCDaXc9dwlf4ZodmrRwtEjqEDVBsL8NEhJHEoUWRjvGFC8OH43164up7zcqqfDwNavMi8GEKqic4avc00T9wp0b1ndXsTcsQw6Na-G2DGNQ4ia31cc9Pc898YSNohu-atpV3vjLxoigJuesKDE0GIRad1V9ukygzuIkkNCMHnLLn4KK1Y2fnze3bmMYp-pG7fFob_6Xbvyz3ajAAS4rK6yz-gb7W4IhBHqPXj3hOo9zcRA"
                      ];
                      return (
                        <TouchableOpacity 
                          key={r.id} 
                          style={styles.activityTicketCard}
                          onPress={() => {
                            setSelectedRestaurantId(r.id);
                            setScreen('restaurant-details');
                          }}
                        >
                          <Image style={styles.activityTicketImage as any} source={{ uri: coverImages[index % coverImages.length] }} />
                          <View style={styles.activityTicketBody}>
                            <View style={styles.activityTicketHeader}>
                              <Text style={styles.activityTicketName}>{r.name}</Text>
                              <View style={styles.activityTicketBadge}>
                                <Text style={styles.activityTicketBadgeText}>{r.plan}</Text>
                              </View>
                            </View>
                            <Text style={styles.activityTicketDetails}>{r.cuisineType} • Owner: {r.ownerName}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* System status alert */}
                <View style={styles.systemStatusBlock}>
                  <View>
                    <Text style={styles.systemStatusLabel}>System Status</Text>
                    <View style={styles.systemStatusActiveRow}>
                      <View style={styles.statusPulseDot} />
                      <Text style={styles.systemStatusActiveText}>All Systems Active</Text>
                    </View>
                  </View>
                  <MaterialIcons name="analytics" size={32} color="#ff5722" />
                </View>
              </View>
            )}

            {/* SCREEN 5: RESTAURANTS DIRECTORY */}
            {screen === 'restaurants' && (
              <View style={styles.directoryContainer}>
                {/* Header */}
                <View style={styles.adminHeader}>
                  <View style={styles.headerLeftRow}>
                    <TouchableOpacity onPress={() => setScreen('dashboard')}>
                      <MaterialIcons name="arrow-back" size={24} color="#b02f00" />
                    </TouchableOpacity>
                    <Text style={styles.adminHeaderTitle}>UMAMI OS</Text>
                  </View>
                  <TouchableOpacity style={styles.avatarBorder} onPress={() => setScreen('settings')}>
                    <Image style={styles.avatarImage as any} source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnglCVL_RycQTTNcpaQmU7dXw2mOFayaMe4Pp3T0bd7nBXrn_wiaC8Vp1wAxp8c9kKesbLk-jTaWLGXIw3qn1LWVWJY5Q4oct5STpsGbfO3dTfGeBP7uwXDP2N38h_17tGBXASDlJ7YsKuSAztmW5_LRfZ8OIL4EgBIwy4YqEJXT5EqIaPtps5fnAWSVS-G0sua_8nQn4079ggiVUMaTSexMyDOXua2yf9e3BT1VzlEYMaG8mgJCe1607uvuPBr-wItqGE0sn2nS0' }} />
                  </TouchableOpacity>
                </View>

                {/* Stats Bento */}
                <View style={styles.bentoRow}>
                  <View style={[styles.bentoCardHalf, { backgroundColor: '#fcf3e1' }]}>
                    <Text style={styles.statLabel}>Total Network</Text>
                    <Text style={styles.statValue}>{restaurants.length}</Text>
                  </View>
                  <View style={[styles.bentoCardHalf, { backgroundColor: '#fcf3e1' }]}>
                    <Text style={styles.statLabel}>Active Venues</Text>
                    <Text style={styles.statValue}>{activeCount}</Text>
                  </View>
                </View>

                {/* Search Bar */}
                <View style={[styles.inputWrapper, { marginVertical: 16 }]}>
                  <TextInput 
                    style={[styles.input, { paddingLeft: 48 }]}
                    placeholder="Search locations..."
                    placeholderTextColor="#907067"
                  />
                  <MaterialIcons name="search" size={20} color="#907067" style={{ position: 'absolute', left: 16 }} />
                </View>

                {/* Card list */}
                <View style={styles.cardsFeedList}>
                  {restaurants.map((r, index) => {
                    const coverImages = [
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuAy540E9kRKJC1kPp4t8sSu5ESlLof4ZXqTciOoPkSiZ6CMH9vZXUVQQJOADcZX8TsAqQ5_Vq2iOw3kyzrgoq9YzP4ux4_ddZ7O-PWFQ5ElG4G4sPGyJ5POTV7HSsdP5fFSPJQbI98nrxu7EfC-8y8usqq8AdC0Bma1YteeYJmkVz8mXUI2hcboihxN37HpChN1TdYlovEyeo-ZJLdZUvwimtcscK8NlH3gD18u6erwaHsmfehC2ibgpjg4fC42OuItKkjuTT3OE-E",
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuAqJJfaP9GhCYrUEAQlMlHHVdFuVUkxyH0WEJMB6JAcngJ9j0RmbDXaosgS7hKGpO7s_hB6leQgM2rnC2kp-oaBbILjDIV7QqNsG7rD8SEZCpGOxRgZ7MCiyFz-L9zHFS55DprLCmtKoe3u5YsLpzqOVwpPWXsyE0hSMAuxrvmCOOHZvreUjm9fkpGpbj7rM32yOumcmWv7h0_BF1Mu_uRyG2DHL9K81iR4SZJQBDLhXjGCnD51l3LwPdD38mjfMaI3Ir6a6ynqQkE",
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuDqLlr9pNBYIoIX1GJPZTGLU6M5QtZFxhyy3U8stU7GpqhscW0acZCkK9GWNQNxtWxRPEP6ca-97DR9-1tpFZTXGjeBvGYmIZsB7wvCCRSV29HepHC2SEkP1hsWGDrNglwtQQYaRlhl4wuSoXm_2uQRIUx-FuJFi_KHIeZn-cWdkuybo7RpYyRAdwkWxYLAnrk8RPZNg6qlFFGECZ_1GHK0GPcU8xfXKeQfZCG3iGcOxR-uU3skKEhO1ud9l9jWAVrjbFdklfDgBJc"
                    ];
                    return (
                      <View key={r.id} style={styles.restaurantFullCard}>
                        <View style={styles.fullCardHeader}>
                          <Image style={styles.fullCardCover as any} source={{ uri: coverImages[index % coverImages.length] }} />
                          <View style={styles.statusAbsoluteBadge}>
                            <Text style={styles.statusAbsoluteText}>{r.status}</Text>
                          </View>
                        </View>
                        <View style={styles.fullCardBody}>
                          <View style={styles.fullCardTitleRow}>
                            <View>
                              <Text style={styles.fullCardTitle}>{r.name}</Text>
                              <Text style={styles.fullCardSubtitle}>{r.cuisineType} • $$$</Text>
                            </View>
                            <View style={styles.netRevenueCol}>
                              <Text style={styles.netValueText}>$4.2k</Text>
                              <Text style={styles.netLabelText}>Net Today</Text>
                            </View>
                          </View>

                          <View style={styles.fullCardFooter}>
                            <View style={styles.footerDetailsRow}>
                              <MaterialIcons name="restaurant" size={14} color="#7c544e" />
                              <Text style={styles.footerDetailsText}>14 Tables</Text>
                              <MaterialIcons name="group" size={14} color="#7c544e" style={{ marginLeft: 8 }} />
                              <Text style={styles.footerDetailsText}>{r.staffCount} Staff</Text>
                            </View>
                            <TouchableOpacity 
                              style={styles.manageButton}
                              onPress={() => {
                                setSelectedRestaurantId(r.id);
                                setScreen('restaurant-details');
                              }}
                            >
                              <Text style={styles.manageButtonText}>MANAGE</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* SCREEN 6: SETUP NEW RESTAURANT */}
            {screen === 'setup-restaurant' && (
              <View style={styles.formContainer}>
                {/* Header */}
                <View style={styles.adminHeader}>
                  <TouchableOpacity onPress={() => setScreen('restaurants')} style={styles.headerLeftRow}>
                    <MaterialIcons name="arrow-back" size={24} color="#b02f00" />
                    <Text style={styles.backLinkText}>Fleet</Text>
                  </TouchableOpacity>
                  <Text style={styles.adminHeaderTitle}>UMAMI OS</Text>
                </View>

                {/* Headline */}
                <View style={styles.heroSection}>
                  <Text style={styles.heroHeadline}>New Restaurant</Text>
                  <Text style={styles.heroParagraph}>Onboard a fresh flavor to the Umami ecosystem.</Text>
                </View>

                {/* Form Group */}
                <View style={styles.card}>
                  <Text style={styles.formSectionTitle}>IDENTITY DETAILS</Text>

                  {/* Rest Name */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>RESTAURANT NAME</Text>
                    <TextInput 
                      style={styles.input}
                      placeholder="e.g. Sizzling Skillet"
                      placeholderTextColor="#e4beb4"
                      value={newRestName}
                      onChangeText={setNewRestName}
                    />
                  </View>

                  {/* Legal Owner */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>LEGAL OWNER</Text>
                    <TextInput 
                      style={styles.input}
                      placeholder="Stakeholder full name"
                      placeholderTextColor="#e4beb4"
                      value={newRestOwner}
                      onChangeText={setNewRestOwner}
                    />
                  </View>

                  {/* Email */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>CONTACT EMAIL</Text>
                    <TextInput 
                      style={styles.input}
                      placeholder="owner@restaurant.com"
                      placeholderTextColor="#e4beb4"
                      value={newRestEmail}
                      onChangeText={setNewRestEmail}
                    />
                  </View>

                  {/* Phone */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>OWNER PHONE</Text>
                    <TextInput 
                      style={styles.input}
                      placeholder="+1 (555) 019-2834"
                      placeholderTextColor="#e4beb4"
                      value={newRestPhone}
                      onChangeText={setNewRestPhone}
                    />
                  </View>

                  {/* Plan Grid */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>SUBSCRIPTION PLAN</Text>
                    <View style={styles.planSelectRow}>
                      <TouchableOpacity 
                        style={[styles.planCardHalf, newRestPlan === 'GROWTH' && styles.planCardHalfActive]}
                        onPress={() => setNewRestPlan('GROWTH')}
                      >
                        <MaterialIcons name="auto-awesome" size={24} color={newRestPlan === 'GROWTH' ? '#541200' : '#1f1b10'} />
                        <Text style={styles.planCardText}>Premium</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.planCardHalf, newRestPlan === 'BASIC' && styles.planCardHalfActive]}
                        onPress={() => setNewRestPlan('BASIC')}
                      >
                        <MaterialIcons name="restaurant-menu" size={24} color={newRestPlan === 'BASIC' ? '#541200' : '#1f1b10'} />
                        <Text style={styles.planCardText}>Standard</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Date picker */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>PLAN EXPIRY DATE</Text>
                    <TextInput 
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#e4beb4"
                      value={newRestExpiry}
                      onChangeText={setNewRestExpiry}
                    />
                  </View>

                  {/* Action buttons */}
                  <TouchableOpacity style={styles.formSubmitButton} onPress={handleCreateRestaurantSubmit}>
                    <Text style={styles.formSubmitText}>Create Restaurant</Text>
                    <MaterialIcons name="rocket-launch" size={18} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* SCREEN 7: RESTAURANT DETAILS */}
            {screen === 'restaurant-details' && activeRestaurant && (
              <View style={styles.detailsContainer}>
                {/* Header */}
                <View style={styles.adminHeader}>
                  <TouchableOpacity onPress={() => setScreen('restaurants')} style={styles.headerLeftRow}>
                    <MaterialIcons name="arrow-back" size={24} color="#b02f00" />
                  </TouchableOpacity>
                  <Text style={styles.adminHeaderTitle}>UMAMI OS</Text>
                  <View style={{ width: 24 }} />
                </View>

                {/* Rest Identity details */}
                <View style={styles.identityHeaderRow}>
                  <View>
                    <Text style={styles.detailsHeadline}>{activeRestaurant.name}</Text>
                    <Text style={styles.detailsSubtitle}>{activeRestaurant.plan} PARTNER • ID: #{activeRestaurant.id}</Text>
                  </View>
                  <View style={styles.activeStatusBadge}>
                    <MaterialIcons name="check-circle" size={12} color="#ff5722" />
                    <Text style={styles.activeStatusBadgeText}>{activeRestaurant.status}</Text>
                  </View>
                </View>

                {/* Cover visual */}
                <View style={styles.detailsCoverWrapper}>
                  <Image style={styles.detailsCoverImage as any} source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASrgSL7VwGONlPStMXbvcXb0dFQvB137BIxgPQeXXHlRWt7VZr9WA8lEqljhBnvoWP-NrK4pCOgfq6xdXtrdnbVAQJmabqS0br6Kn4f2YrRSDjXG0Qg6sIr24tzsp6xMAutdMe8T-N56wtaTPby5cWYbN1PHvQ5ri04TC_FfrNaWspOvE6kp0qwZl0rS9xLfJ4e-4WkDPJ44umU3KEwgFTWL65Gmk-xBxHIPBRDr0bt6Pm3-N6JRvhMGupi4Sjax07VoYnb8hB0kM' }} />
                </View>

                {/* Admin Quick Action buttons */}
                <View style={styles.detailsActionsRow}>
                  <TouchableOpacity 
                    style={styles.detailsActionButtonPrimary}
                    onPress={() => handleToggleStatus(activeRestaurant.id)}
                  >
                    <MaterialIcons name="pause-circle" size={16} color="#ffffff" />
                    <Text style={styles.detailsActionTextPrimary}>
                      {activeRestaurant.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.detailsActionButtonSecondary} onPress={() => setScreen('upgrade-plan')}>
                    <MaterialIcons name="edit" size={16} color="#1f1b10" />
                    <Text style={styles.detailsActionTextSecondary}>Edit Plan</Text>
                  </TouchableOpacity>
                </View>

                {/* Stats Bento grids */}
                <View style={styles.bentoRow}>
                  <View style={[styles.bentoCardHalf, { backgroundColor: '#fcf3e1' }]}>
                    <Text style={styles.statLabel}>Daily Revenue</Text>
                    <Text style={styles.statValue}>$4,280</Text>
                  </View>
                  <View style={[styles.bentoCardHalf, { backgroundColor: '#fcf3e1' }]}>
                    <Text style={styles.statLabel}>Active Orders</Text>
                    <Text style={styles.statValue}>12</Text>
                  </View>
                </View>

                {/* Branches */}
                <View style={styles.branchesListContainer}>
                  <Text style={styles.sectionHeaderTitle}>Branches</Text>
                  <View style={styles.branchItemRow}>
                    <View style={styles.branchLeft}>
                      <View style={styles.branchIconBg}>
                        <MaterialIcons name="location-on" size={18} color="#7c544e" />
                      </View>
                      <View>
                        <Text style={styles.branchTitleText}>Downtown Core</Text>
                        <Text style={styles.branchSubtitleText}>42 Market St, Suite 101</Text>
                      </View>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color="#907067" />
                  </View>
                </View>

                {/* Recent Live Orders Ticket Feed */}
                <View style={styles.liveOrdersContainer}>
                  <View style={styles.liveOrdersHeader}>
                    <Text style={styles.sectionHeaderTitle}>Recent Orders</Text>
                    <View style={styles.liveOrdersBadge}>
                      <Text style={styles.liveOrdersBadgeText}>LIVE</Text>
                    </View>
                  </View>

                  <View style={styles.ticketDetailsWrapper}>
                    <View style={styles.ticketDetailsCard}>
                      <View style={styles.ticketDetailsHeaderRow}>
                        <Text style={styles.ticketOrderId}>#ORD-9902</Text>
                        <Text style={styles.ticketTime}>2m ago</Text>
                      </View>
                      <Text style={styles.ticketItemsList}>2x Wagyu Truffle Burger</Text>
                      <Text style={styles.ticketItemsList}>1x Lobster Bisque</Text>

                      <View style={styles.ticketFooterRow}>
                        <View>
                          <Text style={styles.ticketTotalLabel}>Total</Text>
                          <Text style={styles.ticketTotalValue}>$124.50</Text>
                        </View>
                        <View style={styles.ticketStatusBadge}>
                          <Text style={styles.ticketStatusBadgeText}>Cooking</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* SCREEN 8: PLATFORM PERFORMANCE CHARTS */}
            {screen === 'analytics' && (
              <View style={styles.analyticsContainer}>
                {/* Header */}
                <View style={styles.adminHeader}>
                  <Text style={styles.adminLogoText}>Umami</Text>
                  <TouchableOpacity style={styles.avatarBorder} onPress={() => setScreen('settings')}>
                    <Image style={styles.avatarImage as any} source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvl2qjMxje_0BJAP9bUk4aZi_XDcohwpybqlQsUknfpmMheTNMfGOMEBDAZ9LkCdRGZUT0teisbvr2CNZRneSMMzmJt7EUwUsqggV2UmPQNG9ToTfAv-9ziRdZvkVkLcOXPr45mPYEhymkAuadjzrkShkFRROIHf-QwsK4N469nuGiJTo8Wj07x_vYikRsfhM0wN6OC1SAy_XbQLDjRNMPM7OK9CH8RrMr1pvlh-h8qOFlXTDAqHGCpJpJ_17McxjQQDszeuKSxJM' }} />
                  </TouchableOpacity>
                </View>

                {/* Dashboard title row */}
                <View style={styles.analyticsHeaderRow}>
                  <View>
                    <Text style={styles.analyticsTagText}>Performance</Text>
                    <Text style={styles.analyticsHeadlineText}>ANALYTICS</Text>
                  </View>
                  <View style={styles.dateTabsRow}>
                    <TouchableOpacity style={styles.dateTabItemActive}>
                      <Text style={styles.dateTabTextActive}>24H</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dateTabItem}>
                      <Text style={styles.dateTabText}>7D</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Scrollable metrics */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollMetrics}>
                  {/* Metric 1 */}
                  <View style={styles.horizontalMetricCard}>
                    <Text style={styles.hMetricLabel}>Revenue</Text>
                    <Text style={styles.hMetricValue}>$42,920</Text>
                    <View style={styles.hMetricGrowthRow}>
                      <MaterialIcons name="trending-up" size={12} color="#b02f00" />
                      <Text style={styles.hMetricGrowthText}>+12.4%</Text>
                    </View>
                  </View>
                  {/* Metric 2 */}
                  <View style={styles.horizontalMetricCard}>
                    <Text style={styles.hMetricLabel}>Orders</Text>
                    <Text style={styles.hMetricValue}>1,204</Text>
                    <View style={styles.hMetricGrowthRow}>
                      <MaterialIcons name="trending-down" size={12} color="#7c544e" />
                      <Text style={styles.hMetricGrowthText}>-2.1%</Text>
                    </View>
                  </View>
                  {/* Metric 3 */}
                  <View style={styles.horizontalMetricCard}>
                    <Text style={styles.hMetricLabel}>Customers</Text>
                    <Text style={styles.hMetricValue}>892</Text>
                    <View style={styles.hMetricGrowthRow}>
                      <MaterialIcons name="trending-up" size={12} color="#b02f00" />
                      <Text style={styles.hMetricGrowthText}>+8.5%</Text>
                    </View>
                  </View>
                </ScrollView>

                {/* Animated bar charts flow */}
                <View style={styles.chartBlockWrapper}>
                  <Text style={styles.sectionHeaderTitle}>Revenue Flow</Text>
                  <View style={styles.neobrutalistChartBg}>
                    <View style={[styles.chartBar, { height: '40%' }]} />
                    <View style={[styles.chartBar, { height: '65%' }]} />
                    <View style={[styles.chartBar, { height: '45%' }]} />
                    <View style={[styles.chartBar, { height: '80%' }]} />
                    <View style={[styles.chartBar, { height: '100%' }]} />
                    <View style={[styles.chartBar, { height: '70%' }]} />
                    <View style={[styles.chartBar, { height: '55%' }]} />
                    <View style={[styles.chartBar, { height: '90%' }]} />
                    <View style={[styles.chartBar, { height: '60%' }]} />
                  </View>
                  <View style={styles.chartLabelsRow}>
                    <Text style={styles.chartLabelText}>08:00</Text>
                    <Text style={styles.chartLabelText}>12:00</Text>
                    <Text style={styles.chartLabelText}>16:00</Text>
                    <Text style={styles.chartLabelText}>20:00</Text>
                  </View>
                </View>

                {/* Leaderboard locations */}
                <View style={styles.leaderboardContainer}>
                  <Text style={styles.sectionHeaderTitle}>Top Locations</Text>
                  <View style={styles.leaderboardItemCard}>
                    <View style={styles.leaderboardLeft}>
                      <View style={styles.leaderboardIconBg}>
                        <MaterialIcons name="restaurant" size={18} color="#b02f00" />
                      </View>
                      <View>
                        <Text style={styles.leaderboardName}>Downtown Bistro</Text>
                        <Text style={styles.leaderboardMeta}>428 Orders</Text>
                      </View>
                    </View>
                    <View style={styles.leaderboardRight}>
                      <Text style={styles.leaderboardRevenue}>$18,402</Text>
                      <Text style={styles.leaderboardGrowth}>+15%</Text>
                    </View>
                  </View>

                  <View style={styles.leaderboardItemCard}>
                    <View style={styles.leaderboardLeft}>
                      <View style={styles.leaderboardIconBg}>
                        <MaterialIcons name="bakery-dining" size={18} color="#b02f00" />
                      </View>
                      <View>
                        <Text style={styles.leaderboardName}>Uptown Bakery</Text>
                        <Text style={styles.leaderboardMeta}>312 Orders</Text>
                      </View>
                    </View>
                    <View style={styles.leaderboardRight}>
                      <Text style={styles.leaderboardRevenue}>$9,240</Text>
                      <Text style={[styles.leaderboardGrowth, { color: '#ba1a1a' }]}>-2%</Text>
                    </View>
                  </View>
                </View>

                {/* Insights bento */}
                <View style={styles.bentoRow}>
                  <View style={[styles.insightsCardItem, { backgroundColor: '#343024' }]}>
                    <MaterialIcons name="bolt" size={24} color="#ff5722" />
                    <View style={styles.insightsBottomRow}>
                      <Text style={styles.insightsCardLabel}>Peak Hour</Text>
                      <Text style={styles.insightsCardValue}>19:30 PM</Text>
                    </View>
                  </View>
                  <View style={[styles.insightsCardItem, { backgroundColor: '#fdc8bf' }]}>
                    <MaterialIcons name="star" size={24} color="#7c544e" />
                    <View style={styles.insightsBottomRow}>
                      <Text style={[styles.insightsCardLabel, { color: '#79514b' }]}>Top Dish</Text>
                      <Text style={[styles.insightsCardValue, { color: '#79514b' }]}>Spicy Ramen</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* SCREEN 9: GLOBAL COMPLAINTS FEED */}
            {screen === 'complaints' && (
              <View style={styles.complaintsContainer}>
                {/* Header */}
                <View style={styles.adminHeader}>
                  <Text style={styles.adminLogoText}>Umami</Text>
                  <TouchableOpacity style={styles.avatarBorder} onPress={() => setScreen('settings')}>
                    <Image style={styles.avatarImage as any} source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXEVlkXIV4P2TEmuvXP27EmDjNgVGMN4kGwUF9wuA2Zo2r-zw5QpQ5Np8mD61je1OvSGwRLHR5IwfjiLHLFNsipahU1z9130biIm76nIIgYVWS_6Pcsy-o_gD0CXmumHLMwefeX681ZjnsgkocfDwfWX1rRbcoIFmH8Sm-VM7Ii8STCR6WHLwA01Lxwmh765-ki9RNbI1vIFVnmswx1ix14Tb4Uo-MojbNZSnOO9lGQU0HZ0rhbcc2nrDumwlc0MSqKW-S_YWO708' }} />
                  </TouchableOpacity>
                </View>

                {/* Urgent Section */}
                <View style={styles.urgentSectionTitleRow}>
                  <Text style={styles.sectionHeaderTitle}>Urgent Attention</Text>
                  <View style={styles.urgentAlertCountBadge}>
                    <Text style={styles.urgentAlertCountText}>{unresolvedCount} New</Text>
                  </View>
                </View>

                {/* Horizontally scrollable urgency warnings */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollAlerts}>
                  <View style={styles.alertHorizontalCard}>
                    <View style={styles.alertHeaderRow}>
                      <MaterialIcons name="warning" size={20} color="#ba1a1a" />
                      <Text style={styles.alertTimeText}>2m ago</Text>
                    </View>
                    <Text style={styles.alertCardTitle}>Critical Food Safety</Text>
                    <Text style={styles.alertCardParagraph}>Guest reports undercooked poultry at the Downtown Plaza location.</Text>
                  </View>

                  <View style={styles.alertHorizontalCardSecondary}>
                    <View style={styles.alertHeaderRow}>
                      <MaterialIcons name="payments" size={20} color="#79514b" />
                      <Text style={styles.alertTimeTextSecondary}>15m ago</Text>
                    </View>
                    <Text style={styles.alertCardTitleSecondary}>Double Charge</Text>
                    <Text style={styles.alertCardParagraphSecondary}>POS glitch reported by multiple guests during lunchtime rush.</Text>
                  </View>
                </ScrollView>

                {/* Search Complaints */}
                <View style={[styles.inputWrapper, { marginVertical: 12 }]}>
                  <TextInput 
                    style={[styles.input, { paddingLeft: 48 }]}
                    placeholder="Search complaints..."
                    placeholderTextColor="#907067"
                  />
                  <MaterialIcons name="search" size={20} color="#907067" style={{ position: 'absolute', left: 16 }} />
                </View>

                {/* Feed Log cards */}
                <View style={styles.activityFeedContainer}>
                  <Text style={[styles.sectionHeaderTitle, { marginBottom: 12 }]}>Recent Activity</Text>
                  
                  {complaints.map((c) => (
                    <View key={c.id} style={styles.complaintTicketCard}>
                      <View style={styles.complaintTicketBody}>
                        <View style={styles.ticketDetailsHeaderRow}>
                          <View>
                            <Text style={styles.complaintOrderNo}>ORDER #{c.orderId} • {c.restaurantName.toUpperCase()}</Text>
                            <Text style={styles.complaintCategoryText}>{c.category}</Text>
                          </View>
                          <View style={styles.urgencyBadgeWrapper}>
                            <Text style={styles.urgencyBadgeText}>{c.urgency}</Text>
                          </View>
                        </View>

                        {/* AI Summary card inside */}
                        <View style={styles.aiSummaryCardBox}>
                          <MaterialIcons name="auto-awesome" size={16} color="#b02f00" style={{ marginRight: 6 }} />
                          <Text style={styles.aiSummaryText}>
                            <Text style={{ fontWeight: 'bold', color: '#1f1b10' }}>AI Summary: </Text>
                            {c.summary}
                          </Text>
                        </View>

                        {/* Footer row */}
                        <View style={styles.complaintFooterRow}>
                          <View style={styles.complaintCustomerAvatar}>
                            <Text style={styles.complaintCustomerAvatarText}>{c.customerName}</Text>
                          </View>
                          {c.isResolved ? (
                            <Text style={styles.resolvedStatusLabel}>RESOLVED</Text>
                          ) : (
                            <TouchableOpacity 
                              style={styles.resolveLinkButton}
                              onPress={() => {
                                setSelectedComplaintId(c.id);
                                setScreen('complaint-details');
                              }}
                            >
                              <Text style={styles.resolveLinkText}>RESOLVE</Text>
                              <MaterialIcons name="arrow-forward" size={14} color="#b02f00" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* SCREEN 10: SAFETY TICKET DETAILS */}
            {screen === 'complaint-details' && activeComplaint && (
              <View style={styles.detailsContainer}>
                {/* Header */}
                <View style={styles.adminHeader}>
                  <TouchableOpacity onPress={() => setScreen('complaints')} style={styles.headerLeftRow}>
                    <MaterialIcons name="arrow-back" size={24} color="#b02f00" />
                  </TouchableOpacity>
                  <Text style={styles.adminHeaderTitle}>UMAMI OS</Text>
                  <View style={{ width: 24 }} />
                </View>

                {/* Card ticket details */}
                <View style={styles.complaintTicketDetailsWrapper}>
                  <View style={styles.ticketDetailsCard}>
                    <View style={styles.ticketDetailsHeaderRow}>
                      <View>
                        <Text style={styles.ticketOrderId}>TICKET ID: #{activeComplaint.id}</Text>
                        <Text style={styles.detailsHeadline}>{activeComplaint.category}</Text>
                      </View>
                      <View style={styles.ticketStatusBadge}>
                        <Text style={styles.ticketStatusBadgeText}>{activeComplaint.urgency}</Text>
                      </View>
                    </View>

                    <View style={{ borderTopWidth: 1, borderTopColor: '#e4beb4', paddingTop: 12, marginTop: 12 }}>
                      <Text style={styles.ticketTotalLabel}>Customer Description</Text>
                      <Text style={styles.ticketItemsList}>{activeComplaint.rawText}</Text>
                    </View>

                    {/* Warning box */}
                    <View style={styles.churnRiskWarningCard}>
                      <View style={styles.warningLeftRow}>
                        <MaterialIcons name="warning" size={20} color="#ba1a1a" />
                        <Text style={styles.churnRiskWarningTitle}>Churn Risk Warning</Text>
                      </View>
                      <Text style={styles.churnRiskPercentText}>84%</Text>
                    </View>
                  </View>
                </View>

                {/* Details bento */}
                <View style={styles.bentoRow}>
                  <View style={[styles.bentoCardHalf, { backgroundColor: '#f6eddb' }]}>
                    <Text style={styles.statLabel}>Order Link</Text>
                    <Text style={[styles.statValue, { fontSize: 18, color: '#b02f00' }]}>#ORD-{activeComplaint.orderId}</Text>
                    <Text style={[styles.statLabel, { fontSize: 9 }]}>Click to audit details</Text>
                  </View>

                  <View style={[styles.bentoCardHalf, { backgroundColor: '#f6eddb' }]}>
                    <Text style={styles.statLabel}>Sentiment Analysis</Text>
                    <Text style={[styles.statValue, { fontSize: 16, color: '#ba1a1a' }]}>😡 NEGATIVE</Text>
                    <Text style={[styles.statLabel, { fontSize: 9 }]}>High threat level</Text>
                  </View>
                </View>

                {/* Actions area box */}
                <View style={styles.settingsSectionWrapper}>
                  <Text style={styles.sectionHeaderTitle}>Resolution Actions</Text>
                  
                  <View style={styles.resolutionActionsBlock}>
                    <TouchableOpacity 
                      style={[styles.primaryButton, { backgroundColor: activeComplaint.isResolved ? '#eae2d0' : '#4CAF50' }]}
                      onPress={() => handleResolveComplaintSubmit(activeComplaint.id)}
                      disabled={activeComplaint.isResolved}
                    >
                      <MaterialIcons name="check-circle" size={18} color="#ffffff" />
                      <Text style={[styles.primaryButtonText, { color: '#ffffff' }]}>
                        {activeComplaint.isResolved ? 'Resolved' : 'Mark Resolved'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.primaryButton, { backgroundColor: '#ff5722' }]}
                      onPress={() => handleResolveComplaintSubmit(activeComplaint.id)}
                    >
                      <MaterialIcons name="payments" size={18} color="#541200" />
                      <Text style={styles.primaryButtonText}>Refund Customer</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.secondaryButton, { height: 56, width: '100%', borderRadius: 28, justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={styles.secondaryButtonText}>Dismiss Dispute</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* SCREEN 11: SETTINGS */}
            {screen === 'settings' && (
              <View style={styles.settingsPageContainer}>
                {/* Header */}
                <View style={styles.adminHeader}>
                  <View style={styles.headerLeftRow}>
                    <TouchableOpacity onPress={() => setScreen('dashboard')}>
                      <MaterialIcons name="arrow-back" size={24} color="#b02f00" />
                    </TouchableOpacity>
                    <Text style={styles.adminHeaderTitle as any}>UMAMI OS</Text>
                  </View>
                  <TouchableOpacity style={styles.avatarBorder}>
                    <Image style={styles.avatarImage as any} source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXEVlkXIV4P2TEmuvXP27EmDjNgVGMN4kGwUF9wuA2Zo2r-zw5QpQ5Np8mD61je1OvSGwRLHR5IwfjiLHLFNsipahU1z9130biIm76nIIgYVWS_6Pcsy-o_gD0CXmumHLMwefeX681ZjnsgkocfDwfWX1rRbcoIFmH8Sm-VM7Ii8STCR6WHLwA01Lxwmh765-ki9RNbI1vIFVnmswx1ix14Tb4Uo-MojbNZSnOO9lGQU0HZ0rhbcc2nrDumwlc0MSqKW-S_YWO708' }} />
                  </TouchableOpacity>
                </View>

                {/* Profile preference header */}
                <View style={styles.profileHeaderCard}>
                  <View style={styles.profileHeaderAvatar}>
                    <Text style={styles.profileHeaderAvatarText}>JM</Text>
                  </View>
                  <View>
                    <Text style={styles.profileNameText}>Julian Moretti</Text>
                    <Text style={styles.profileRoleText}>Platform Administrator</Text>
                    <View style={[styles.activeStatusBadge, { marginTop: 6 }]}>
                      <Text style={styles.activeStatusBadgeText}>Root Console</Text>
                    </View>
                  </View>
                </View>

                {/* Preferences fields */}
                <View style={styles.settingsSectionWrapper}>
                  <Text style={styles.sectionHeaderTitle}>Account Settings</Text>
                  
                  <View style={styles.card}>
                    <View style={styles.fieldContainer}>
                      <Text style={styles.label}>Display Name</Text>
                      <TextInput 
                        style={styles.input}
                        value={adminDisplayName}
                        onChangeText={setAdminDisplayName}
                      />
                    </View>

                    <View style={styles.fieldContainer}>
                      <Text style={styles.label}>Admin Email</Text>
                      <TextInput 
                        style={[styles.input, { opacity: 0.6 }]}
                        value="admin@foodmart.com"
                        editable={false}
                      />
                    </View>

                    <View style={styles.fieldContainer}>
                      <Text style={styles.label}>New Password</Text>
                      <TextInput 
                        style={styles.input}
                        placeholder="Leave blank to keep current"
                        placeholderTextColor="#eae2d0"
                        secureTextEntry
                        value={adminPassword}
                        onChangeText={setAdminPassword}
                      />
                    </View>

                    <TouchableOpacity style={styles.formSubmitButton} onPress={() => alert("Profile Preferences updated!")}>
                      <Text style={styles.formSubmitText}>Save Profile Updates</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Stepper defaults */}
                <View style={styles.settingsSectionWrapper}>
                  <Text style={styles.sectionHeaderTitle}>Trial Duration</Text>
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity style={styles.stepperButton} onPress={() => setTrialDays(Math.max(1, trialDays - 5))}>
                      <Text style={styles.stepperButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepperValueText}>{trialDays} Days</Text>
                    <TouchableOpacity style={styles.stepperButton} onPress={() => setTrialDays(trialDays + 5)}>
                      <Text style={styles.stepperButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Danger zone actions */}
                <View style={styles.settingsSectionWrapper}>
                  <Text style={[styles.sectionHeaderTitle, { color: '#ba1a1a' }]}>Danger Zone</Text>
                  <View style={styles.dangerZoneCard}>
                    <TouchableOpacity style={styles.dangerButtonOutline} onPress={() => alert("Diagnostics logs purged!")}>
                      <MaterialIcons name="delete-forever" size={16} color="#ba1a1a" />
                      <Text style={styles.dangerButtonOutlineText}>Purge System Logs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dangerButtonOutline} onPress={() => alert("Backup file downloaded!")}>
                      <MaterialIcons name="backup" size={16} color="#1f1b10" />
                      <Text style={[styles.dangerButtonOutlineText, { color: '#1f1b10' }]}>Export System Backup</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* SCREEN 12: UPGRADE PLANS default configurations */}
            {screen === 'upgrade-plan' && (
              <View style={styles.formContainer}>
                {/* Header */}
                <View style={styles.adminHeader}>
                  <TouchableOpacity onPress={() => setScreen('settings')} style={styles.headerLeftRow}>
                    <MaterialIcons name="arrow-back" size={24} color="#b02f00" />
                  </TouchableOpacity>
                  <Text style={styles.adminHeaderTitle}>UMAMI OS</Text>
                  <View style={{ width: 24 }} />
                </View>

                {/* Title */}
                <View style={styles.heroSection}>
                  <Text style={styles.heroHeadline}>Upgrade Plan</Text>
                  <Text style={styles.heroParagraph}>PARTNER PROFILE DEFAULT SPECIFICATIONS</Text>
                </View>

                {/* Selector */}
                <View style={styles.card}>
                  <Text style={styles.formSectionTitle}>Subscription Plan</Text>
                  
                  {/* Starter card */}
                  <TouchableOpacity 
                    style={[styles.planUpgradeCard, upgradeSelectedPlan === 'STARTER' && styles.planUpgradeCardActive]}
                    onPress={() => setUpgradeSelectedPlan('STARTER')}
                  >
                    <View>
                      <Text style={styles.planUpgradeCardTitle}>Starter Plan</Text>
                      <Text style={styles.planUpgradeCardSubtitle}>Best for single venues & testing</Text>
                    </View>
                    <Text style={styles.planUpgradeCardPrice}>$49/mo</Text>
                  </TouchableOpacity>

                  {/* Growth card */}
                  <TouchableOpacity 
                    style={[styles.planUpgradeCard, upgradeSelectedPlan === 'GROWTH' && styles.planUpgradeCardActive]}
                    onPress={() => setUpgradeSelectedPlan('GROWTH')}
                  >
                    <View>
                      <Text style={styles.planUpgradeCardTitle}>Growth Plan</Text>
                      <Text style={styles.planUpgradeCardSubtitle}>Multiple locations & custom delivery</Text>
                    </View>
                    <Text style={styles.planUpgradeCardPrice}>$149/mo</Text>
                  </TouchableOpacity>

                  {/* Enterprise card */}
                  <TouchableOpacity 
                    style={[styles.planUpgradeCard, upgradeSelectedPlan === 'ENTERPRISE' && styles.planUpgradeCardActive]}
                    onPress={() => setUpgradeSelectedPlan('ENTERPRISE')}
                  >
                    <View>
                      <Text style={styles.planUpgradeCardTitle}>Enterprise Plan</Text>
                      <Text style={styles.planUpgradeCardSubtitle}>High volume networks & APIs</Text>
                    </View>
                    <Text style={styles.planUpgradeCardPrice}>$399/mo</Text>
                  </TouchableOpacity>

                  {/* Calendar Input */}
                  <View style={[styles.fieldContainer, { marginTop: 16 }]}>
                    <Text style={styles.label}>Expiration Date</Text>
                    <TextInput 
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#eae2d0"
                    />
                  </View>

                  {/* Notes Area */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Kitchen Internal Notes</Text>
                    <TextInput 
                      style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
                      placeholder="Add comments regarding pricing terms or custom onboarding items."
                      placeholderTextColor="#5b4039"
                      multiline
                      value={upgradeNotes}
                      onChangeText={setUpgradeNotes}
                    />
                  </View>

                  {/* Buttons */}
                  <TouchableOpacity 
                    style={styles.formSubmitButton}
                    onPress={() => {
                      alert("Plan update defaults successfully applied!");
                      setScreen('settings');
                    }}
                  >
                    <Text style={styles.formSubmitText}>Confirm Plan Update</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

          </ScrollView>

          {/* Nav bar footer layout */}
          {renderBottomNav()}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff8f0',
  },
  container: {
    flex: 1,
  },
  centerAlign: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  screenInner: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 12,
  },
  appHeaderTitle: {
    fontFamily: 'Anton',
    fontSize: 28,
    color: '#b02f00',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#ff5722',
    borderRadius: 16,
    transform: [{ rotate: '3deg' }],
  },
  brandTitle: {
    fontFamily: 'Anton',
    fontSize: 48,
    color: '#b02f00',
    textTransform: 'uppercase',
    letterSpacing: -1,
    marginBottom: 4,
  },
  brandSubtitle: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 14,
    color: '#5b4039',
    textTransform: 'uppercase',
    letterSpacing: 2.5,
  },
  card: {
    backgroundColor: '#f6eddb',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: '#343024',
    marginBottom: 24,
  },
  cardTitle: {
    fontFamily: 'Anton',
    fontSize: 32,
    color: '#1f1b10',
    marginBottom: 4,
  },
  cardDescription: {
    fontFamily: 'Plus-Jakarta',
    fontSize: 16,
    color: '#5b4039',
    lineHeight: 24,
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Anton',
    fontSize: 12,
    color: '#5b4039',
    marginBottom: 6,
    paddingHorizontal: 8,
    letterSpacing: 0.5,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  forgotLink: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 12,
    color: '#b02f00',
    paddingHorizontal: 8,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#343024',
    borderRadius: 28,
    paddingHorizontal: 24,
    fontSize: 14,
    fontFamily: 'Plus-Jakarta-SemiBold',
    color: '#1f1b10',
  },
  inputIcon: {
    position: 'absolute',
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    height: 64,
    backgroundColor: '#ff5722',
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#343024',
  },
  disabledButton: {
    opacity: 0.8,
  },
  primaryButtonText: {
    fontFamily: 'Anton',
    fontSize: 20,
    color: '#541200',
    textTransform: 'uppercase',
  },
  helpSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e4beb4',
  },
  dividerText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 12,
    color: '#5b4039',
    textTransform: 'uppercase',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#343024',
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontFamily: 'Anton',
    fontSize: 16,
    color: '#343024',
    textTransform: 'uppercase',
  },
  successToast: {
    backgroundColor: '#ffdad6',
    borderWidth: 2,
    borderColor: '#343024',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  toastIcon: {
    marginRight: 8,
  },
  successToastText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 12,
    color: '#93000a',
  },
  contextIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  contextIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fdc8bf',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#343024',
  },
  backToLoginCenter: {
    alignItems: 'center',
    marginTop: 24,
  },
  backToLoginLink: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 14,
    color: '#b02f00',
    textDecorationLine: 'underline',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successBoxTitle: {
    fontFamily: 'Anton',
    fontSize: 28,
    color: '#1f1b10',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  successBoxDescription: {
    fontFamily: 'Plus-Jakarta',
    fontSize: 16,
    color: '#5b4039',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  successBoxButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#1f1b10',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#343024',
  },
  successBoxButtonText: {
    fontFamily: 'Anton',
    fontSize: 16,
    color: '#fff8f0',
    textTransform: 'uppercase',
  },
  strengthMeterContainer: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  strengthBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  strengthBarActive: {
    backgroundColor: '#ff5722',
  },
  strengthBarInactive: {
    backgroundColor: '#eae2d0',
  },

  // ADMIN STYLES
  dashboardContainer: {
    flex: 1,
  },
  adminMainContainer: {
    flex: 1,
    backgroundColor: '#fff8f0',
  },
  adminScroll: {
    flex: 1,
  },
  adminScrollContent: {
    paddingBottom: 120,
  },
  adminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 80,
    paddingHorizontal: 24,
    backgroundColor: '#fff8f0',
    borderBottomWidth: 1,
    borderBottomColor: '#eae2d0',
  },
  adminLogoText: {
    fontFamily: 'Anton',
    fontSize: 32,
    color: '#b02f00',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  adminHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f6eddb',
  },
  avatarBorder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#b02f00',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 4,
  },
  heroHeadline: {
    fontFamily: 'Anton',
    fontSize: 32,
    color: '#1f1b10',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  heroParagraph: {
    fontFamily: 'Plus-Jakarta-SemiBold',
    fontSize: 13,
    color: '#5b4039',
  },
  bentoGrid: {
    paddingHorizontal: 24,
    gap: 16,
  },
  bentoCardLarge: {
    borderRadius: 24,
    padding: 20,
    height: 140,
    justifyContent: 'space-between',
    shadowColor: '#3e1f1a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  bentoCardLabelWhite: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 11,
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.8,
  },
  bentoCardValueWhite: {
    fontFamily: 'Anton',
    fontSize: 36,
    color: '#ffffff',
    lineHeight: 40,
  },
  bentoGrowthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bentoGrowthTextWhite: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 11,
    color: '#ffffff',
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 24,
    marginTop: 12,
  },
  bentoCardHalf: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    height: 110,
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#e4beb4',
  },
  smallIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoCardHalfValue: {
    fontFamily: 'Anton',
    fontSize: 24,
    color: '#b02f00',
    lineHeight: 28,
  },
  bentoCardHalfLabel: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 11,
    color: '#7c544e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  warningAlertCard: {
    backgroundColor: '#ffdad6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#ba1a1a',
    marginHorizontal: 24,
    marginTop: 16,
  },
  warningLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  warningIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ba1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningTitle: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 14,
    color: '#ba1a1a',
  },
  warningSubtitle: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 10,
    color: '#93000a',
    textTransform: 'uppercase',
  },
  warningActionButton: {
    backgroundColor: '#ba1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  warningActionText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 11,
    color: '#ffffff',
  },
  activityFeedContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  activityFeedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  activityFeedTitle: {
    fontFamily: 'Anton',
    fontSize: 22,
    color: '#1f1b10',
    textTransform: 'uppercase',
  },
  activityFeedLink: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 13,
    color: '#b02f00',
    borderBottomWidth: 1.5,
    borderBottomColor: '#b02f00',
    paddingBottom: 1,
  },
  activityList: {
    gap: 12,
  },
  activityTicketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    borderWidth: 1,
    borderColor: '#e4beb4',
  },
  activityTicketImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e4beb4',
  },
  activityTicketBody: {
    flex: 1,
    justifyContent: 'center',
  },
  activityTicketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTicketName: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 15,
    color: '#1f1b10',
  },
  activityTicketBadge: {
    backgroundColor: '#ffdbd1',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activityTicketBadgeText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 9,
    color: '#862200',
    textTransform: 'uppercase',
  },
  activityTicketDetails: {
    fontFamily: 'Plus-Jakarta-SemiBold',
    fontSize: 12,
    color: '#5b4039',
    marginTop: 4,
  },
  systemStatusBlock: {
    backgroundColor: '#343024',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 24,
  },
  systemStatusLabel: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 11,
    color: '#eae2d0',
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  systemStatusActiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  statusPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  systemStatusActiveText: {
    fontFamily: 'Anton',
    fontSize: 18,
    color: '#f9f0de',
    textTransform: 'uppercase',
  },

  // BOTTOM NAVIGATION
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 84,
    backgroundColor: '#f0e7d5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eae2d0',
    paddingBottom: Platform.OS === 'ios' ? 12 : 0,
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
  },
  bottomNavIconActive: {
    backgroundColor: '#ff5722',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 14,
  },
  bottomNavText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 10,
    color: '#5b4039',
    textTransform: 'uppercase',
  },
  bottomNavTextActive: {
    fontFamily: 'Plus-Jakarta-Bold',
    color: '#b02f00',
  },
  badgeDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ba1a1a',
  },

  // DIRECTORY STYLES
  directoryContainer: {
    flex: 1,
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminHeaderTitle: {
    fontFamily: 'Anton',
    fontSize: 24,
    color: '#b02f00',
    textTransform: 'uppercase',
  },
  statLabel: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 10,
    color: '#7c544e',
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  statValue: {
    fontFamily: 'Anton',
    fontSize: 24,
    color: '#1f1b10',
  },
  cardsFeedList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  restaurantFullCard: {
    backgroundColor: '#f6eddb',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#e4beb4',
  },
  fullCardHeader: {
    height: 110,
    width: '100%',
    position: 'relative',
  },
  fullCardCover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statusAbsoluteBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#1f1b10',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusAbsoluteText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 9,
    color: '#ff5722',
    textTransform: 'uppercase',
  },
  fullCardBody: {
    padding: 16,
  },
  fullCardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  fullCardTitle: {
    fontFamily: 'Anton',
    fontSize: 18,
    color: '#1f1b10',
    textTransform: 'uppercase',
  },
  fullCardSubtitle: {
    fontFamily: 'Plus-Jakarta-SemiBold',
    fontSize: 12,
    color: '#5b4039',
    marginTop: 2,
  },
  netRevenueCol: {
    alignItems: 'flex-end',
  },
  netValueText: {
    fontFamily: 'Anton',
    fontSize: 18,
    color: '#b02f00',
  },
  netLabelText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 9,
    color: '#7c544e',
    textTransform: 'uppercase',
  },
  fullCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1.5,
    borderTopColor: '#e4beb4',
    paddingTop: 12,
    marginTop: 12,
  },
  footerDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerDetailsText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 9,
    color: '#5b4039',
    textTransform: 'uppercase',
    marginLeft: 3,
  },
  manageButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  manageButtonText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 11,
    color: '#b02f00',
    textTransform: 'uppercase',
  },

  // FORM AND SETUP STYLES
  formContainer: {
    flex: 1,
  },
  backLinkText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 14,
    color: '#b02f00',
    textTransform: 'uppercase',
  },
  formSectionTitle: {
    fontFamily: 'Anton',
    fontSize: 14,
    color: '#5b4039',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  planSelectRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  planCardHalf: {
    flex: 1,
    height: 72,
    borderWidth: 2,
    borderColor: '#5b4039',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  planCardHalfActive: {
    backgroundColor: '#ff5722',
    borderColor: '#ff5722',
  },
  planCardText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 12,
    color: '#1f1b10',
  },
  formSubmitButton: {
    height: 56,
    backgroundColor: '#b02f00',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  formSubmitText: {
    fontFamily: 'Anton',
    fontSize: 16,
    color: '#ffffff',
    textTransform: 'uppercase',
  },

  // DETAILS STYLES
  detailsContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  identityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  detailsHeadline: {
    fontFamily: 'Anton',
    fontSize: 28,
    color: '#1f1b10',
    textTransform: 'uppercase',
  },
  detailsSubtitle: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 10,
    color: '#5b4039',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  activeStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1f1b10',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeStatusBadgeText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 9,
    color: '#ff5722',
    textTransform: 'uppercase',
  },
  detailsCoverWrapper: {
    height: 160,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e4beb4',
    marginVertical: 16,
  },
  detailsCoverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  detailsActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  detailsActionButtonPrimary: {
    flex: 1,
    height: 48,
    backgroundColor: '#b02f00',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  detailsActionTextPrimary: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 12,
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  detailsActionButtonSecondary: {
    flex: 1,
    height: 48,
    borderWidth: 2,
    borderColor: '#1f1b10',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  detailsActionTextSecondary: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 12,
    color: '#1f1b10',
    textTransform: 'uppercase',
  },
  sectionHeaderTitle: {
    fontFamily: 'Anton',
    fontSize: 20,
    color: '#1f1b10',
    textTransform: 'uppercase',
  },
  branchesListContainer: {
    marginTop: 20,
    gap: 12,
  },
  branchItemRow: {
    backgroundColor: '#fcf3e1',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e4beb4',
  },
  branchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  branchIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eae2d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchTitleText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 14,
    color: '#1f1b10',
  },
  branchSubtitleText: {
    fontFamily: 'Plus-Jakarta-SemiBold',
    fontSize: 11,
    color: '#5b4039',
  },
  liveOrdersContainer: {
    marginTop: 24,
  },
  liveOrdersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveOrdersBadge: {
    backgroundColor: '#fdc8bf',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  liveOrdersBadgeText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 9,
    color: '#79514b',
  },
  ticketDetailsWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e4beb4',
  },
  ticketDetailsCard: {
    backgroundColor: '#f6eddb',
    padding: 16,
  },
  ticketDetailsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketOrderId: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 12,
    color: '#b02f00',
  },
  ticketTime: {
    fontFamily: 'Plus-Jakarta-SemiBold',
    fontSize: 11,
    color: '#5b4039',
  },
  ticketItemsList: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 14,
    color: '#1f1b10',
    marginTop: 2,
  },
  ticketFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 16,
  },
  ticketTotalLabel: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 9,
    color: '#5b4039',
    textTransform: 'uppercase',
  },
  ticketTotalValue: {
    fontFamily: 'Anton',
    fontSize: 22,
    color: '#b02f00',
    lineHeight: 24,
  },
  ticketStatusBadge: {
    backgroundColor: '#1f1b10',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  ticketStatusBadgeText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 9,
    color: '#ff5722',
    textTransform: 'uppercase',
  },

  // ANALYTICS SPECIFIC
  analyticsContainer: {
    flex: 1,
  },
  analyticsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    marginTop: 16,
  },
  analyticsTagText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 10,
    color: '#7c544e',
    textTransform: 'uppercase',
  },
  analyticsHeadlineText: {
    fontFamily: 'Anton',
    fontSize: 28,
    color: '#1f1b10',
  },
  dateTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#f0e7d5',
    borderRadius: 16,
    padding: 3,
    gap: 4,
  },
  dateTabItemActive: {
    backgroundColor: '#ff5722',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  dateTabTextActive: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 11,
    color: '#541200',
  },
  dateTabItem: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  dateTabText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 11,
    color: '#5b4039',
  },
  horizontalScrollMetrics: {
    paddingHorizontal: 24,
    marginVertical: 16,
  },
  horizontalMetricCard: {
    width: 140,
    backgroundColor: '#fcf3e1',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e4beb4',
    marginRight: 12,
  },
  hMetricLabel: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 10,
    color: '#7c544e',
    textTransform: 'uppercase',
  },
  hMetricValue: {
    fontFamily: 'Anton',
    fontSize: 20,
    color: '#b02f00',
    marginTop: 4,
  },
  hMetricGrowthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  hMetricGrowthText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 9,
    color: '#b02f00',
  },
  chartBlockWrapper: {
    paddingHorizontal: 24,
    gap: 12,
  },
  neobrutalistChartBg: {
    height: 180,
    backgroundColor: '#eae2d0',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e4beb4',
  },
  chartBar: {
    width: 16,
    backgroundColor: '#b02f00',
    borderRadius: 2,
  },
  chartLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  chartLabelText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 9,
    color: '#7c544e',
  },
  leaderboardContainer: {
    paddingHorizontal: 24,
    marginTop: 20,
    gap: 12,
  },
  leaderboardItemCard: {
    backgroundColor: '#fcf3e1',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e4beb4',
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leaderboardIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eae2d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardName: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 14,
    color: '#1f1b10',
  },
  leaderboardMeta: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 10,
    color: '#7c544e',
    textTransform: 'uppercase',
  },
  leaderboardRight: {
    alignItems: 'flex-end',
  },
  leaderboardRevenue: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 14,
    color: '#1f1b10',
  },
  leaderboardGrowth: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 10,
    color: '#b02f00',
  },
  insightsCardItem: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    height: 110,
    justifyContent: 'space-between',
  },
  insightsBottomRow: {
    gap: 2,
  },
  insightsCardLabel: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 10,
    color: '#eae2d0',
    textTransform: 'uppercase',
  },
  insightsCardValue: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 16,
    color: '#f9f0de',
  },

  // COMPLAINTS OVERVIEW STYLES
  complaintsContainer: {
    flex: 1,
  },
  urgentSectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 16,
  },
  urgentAlertCountBadge: {
    backgroundColor: '#b02f00',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  urgentAlertCountText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 9,
    color: '#ffffff',
  },
  horizontalScrollAlerts: {
    paddingHorizontal: 24,
    marginVertical: 12,
  },
  alertHorizontalCard: {
    width: 240,
    backgroundColor: '#ffdad6',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ba1a1a',
    marginRight: 12,
  },
  alertHorizontalCardSecondary: {
    width: 240,
    backgroundColor: '#fdc8bf',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#79514b',
    marginRight: 12,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTimeText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 10,
    color: '#ba1a1a',
    opacity: 0.7,
  },
  alertTimeTextSecondary: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 10,
    color: '#79514b',
    opacity: 0.7,
  },
  alertCardTitle: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 14,
    color: '#ba1a1a',
    marginTop: 8,
  },
  alertCardParagraph: {
    fontFamily: 'Plus-Jakarta',
    fontSize: 11,
    color: '#93000a',
    marginTop: 4,
  },
  alertCardTitleSecondary: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 14,
    color: '#79514b',
    marginTop: 8,
  },
  alertCardParagraphSecondary: {
    fontFamily: 'Plus-Jakarta',
    fontSize: 11,
    color: '#79514b',
    marginTop: 4,
  },
  complaintTicketCard: {
    backgroundColor: '#fcf3e1',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4beb4',
    marginBottom: 16,
  },
  complaintTicketBody: {
    padding: 16,
  },
  complaintOrderNo: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 9,
    color: '#b02f00',
    textTransform: 'uppercase',
  },
  complaintCategoryText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 14,
    color: '#1f1b10',
    marginTop: 2,
  },
  urgencyBadgeWrapper: {
    backgroundColor: '#1f1b10',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  urgencyBadgeText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 9,
    color: '#ff5722',
  },
  aiSummaryCardBox: {
    backgroundColor: '#eae2d0',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e4beb4',
  },
  aiSummaryText: {
    flex: 1,
    fontFamily: 'Plus-Jakarta-SemiBold',
    fontSize: 11,
    color: '#5b4039',
    lineHeight: 16,
  },
  complaintFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  complaintCustomerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fdc8bf',
    borderWidth: 1,
    borderColor: '#b02f00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  complaintCustomerAvatarText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 9,
    color: '#b02f00',
  },
  resolveLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  resolveLinkText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 11,
    color: '#b02f00',
  },
  resolvedStatusLabel: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 10,
    color: '#16a34a',
  },

  // COMPLAINT TICKET DETAILS SPECIFIC
  complaintTicketDetailsWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e4beb4',
    marginVertical: 12,
  },
  churnRiskWarningCard: {
    backgroundColor: '#ffd9d3',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ba1a1a',
  },
  warningLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  churnRiskWarningTitle: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 12,
    color: '#ba1a1a',
  },
  churnRiskPercentText: {
    fontFamily: 'Anton',
    fontSize: 20,
    color: '#ba1a1a',
  },
  resolutionActionsBlock: {
    gap: 12,
    marginTop: 8,
  },

  // SETTINGS PAGE STYLES
  settingsPageContainer: {
    flex: 1,
  },
  profileHeaderCard: {
    backgroundColor: '#fcf3e1',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 24,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e4beb4',
  },
  profileHeaderAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fdc8bf',
    borderWidth: 2,
    borderColor: '#b02f00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeaderAvatarText: {
    fontFamily: 'Anton',
    fontSize: 20,
    color: '#b02f00',
  },
  profileNameText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 18,
    color: '#1f1b10',
    lineHeight: 20,
  },
  profileRoleText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 11,
    color: '#7c544e',
    textTransform: 'uppercase',
  },
  settingsSectionWrapper: {
    paddingHorizontal: 24,
    marginTop: 20,
    gap: 12,
  },
  stepperContainer: {
    flexDirection: 'row',
    height: 48,
    borderWidth: 2,
    borderColor: '#5b4039',
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  stepperButton: {
    width: 60,
    height: '100%',
    backgroundColor: '#fcf3e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 18,
    color: '#1f1b10',
  },
  stepperValueText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 12,
    color: '#1f1b10',
    textTransform: 'uppercase',
  },
  dangerZoneCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1f1b10',
    padding: 16,
    gap: 12,
  },
  dangerButtonOutline: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#ba1a1a',
    backgroundColor: '#ffdad6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dangerButtonOutlineText: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 12,
    color: '#ba1a1a',
    textTransform: 'uppercase',
  },

  // UPGRADE PLAN DETAILS SPECIFIC
  planUpgradeCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#5b4039',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planUpgradeCardActive: {
    backgroundColor: '#ff5722',
    borderColor: '#ff5722',
  },
  planUpgradeCardTitle: {
    fontFamily: 'Plus-Jakarta-Bold',
    fontSize: 14,
    color: '#1f1b10',
    textTransform: 'uppercase',
  },
  planUpgradeCardSubtitle: {
    fontFamily: 'Plus-Jakarta',
    fontSize: 11,
    color: '#5b4039',
    marginTop: 2,
  },
  planUpgradeCardPrice: {
    fontFamily: 'Anton',
    fontSize: 18,
    color: '#1f1b10',
  },
});
