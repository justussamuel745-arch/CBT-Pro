import { useState } from 'react'
import { Link } from 'react-router'
import './Legal.css'

export function Legal(){
  // TABS NAVIGATION STATE
  const [ termsTab, setTermsTab ] = useState('active')
  const [ privacyTab, setPrivacyTab ] = useState('')
  
  // TABS NAVIGATION
  function showTermTab(){
    setTermsTab('active')
    setPrivacyTab('')
  }
  
  function showPrivacyTab(){
    setTermsTab('')
    setPrivacyTab('active')
  }
  
  return (
    <div className="legal-page">
      <nav>
        <div className="nav-container">
          <div className="nav-content">
            <Link to="/" className="logo">CBT Pro</Link>
          </div>
        </div>
      </nav>
      
      <div className="page-header">
        <div className="nav-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link> / Legal
          </div>
          <h1>Terms &amp; Privacy Policy</h1>
          <p className="last-updated">Last updated: June 30, 2026</p>
          
          <div className="tab-switcher">
            <button className={`tab-btn ${termsTab}`} onClick={showTermTab}>Terms of Service</button>
            <button className={`tab-btn ${privacyTab}`} onClick={showPrivacyTab}>Privacy Policy</button>
          </div>
        </div>
      </div>
      
      <div className="container">
        {/* Terms of Service */}
        <div id="terms" className={`tab-content ${termsTab}`}>
          <div className="content-card">
            <div className="highlight-box">
              <p>By using CBT Pro, you agree to these terms. Please read them carefully.</p>
            </div>
      
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using CBT Pro, you agree to be bound by these Terms of Service and all applicable laws and regulations. 
              If you do not agree with any part of these terms, you may not use our service.
            </p>
      
            <h2>2. User Accounts</h2>
            <p>You are responsible for:</p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
      
            <h2>3. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Upload malicious code or harmful content</li>
            </ul>
      
            <h2>4. Intellectual Property</h2>
            <p>
              All content, features, and functionality on CBT Pro are owned by us and are protected by copyright, trademark, 
              and other intellectual property laws. You may not reproduce or distribute our content without written permission.
            </p>
      
            <h2>5. Limitation of Liability</h2>
            <p>
              CBT Pro is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect, incidental, 
              or consequential damages arising from your use of the service.
            </p>
      
            <h2>6. Changes to Terms</h2>
            <p>
              We may update these terms at any time. We will notify users of material changes via email or in-app notification. 
              Continued use after changes constitutes acceptance.
            </p>
      
            <h2>7. Contact</h2>
            <p>
              Questions about these terms? Contact us at <a href="mailto:teamcbtpro@gmail.com" style={{color: "var(--primary)"}}>legal@cbtpro.com</a>
            </p>
          </div>
        </div>
      
        {/* Privacy Policy */}
        <div id="privacy" className={`tab-content ${privacyTab}`}>
          <div className="content-card">
            <div className="highlight-box">
              <p>Your privacy matters. We only collect data we need to make the product work better for you.</p>
            </div>
      
            <h2>1. Information We Collect</h2>
            <h3>Account Information</h3>
            <p>Email address, name, and password when you create an account.</p>
            
            <h3>Usage Data</h3>
            <p>Pages visited, features used, and time spent on the platform to improve user experience.</p>
            
            <h3>Cookies</h3>
            <p>We use essential cookies for authentication and optional analytics cookies to understand usage patterns.</p>
      
            <h2>2. How We Use Your Information</h2>
            <ul>
              <li>Provide and maintain the service</li>
              <li>Improve and personalize your experience</li>
              <li>Communicate updates and support messages</li>
              <li>Prevent fraud and ensure security</li>
            </ul>
      
            <h2>3. Data Sharing</h2>
            <p>
              We do not sell your personal data. We only share data with trusted service providers who help us operate the platform, 
              and only under strict confidentiality agreements.
            </p>
      
            <h2>4. Data Security</h2>
            <p>
              We use industry-standard encryption and security measures to protect your data. However, no system is 100% secure, 
              and we cannot guarantee absolute security.
            </p>
      
            <h2>5. Your Rights</h2>
            <p>You can:</p>
            <ul>
              <li>Request a copy of your personal data</li>
              <li>Request correction or deletion of your data</li>
              <li>Opt out of non-essential communications</li>
              <li>Delete your account at any time</li>
            </ul>
      
            <h2>6. Data Retention</h2>
            <p>
              We retain your data only as long as your account is active or as needed to provide services. You can request deletion anytime.
            </p>
      
            <h2>7. Contact</h2>
            <p>
              For privacy questions or data requests, email us at <a href="mailto:teamcbtpro@gmail.com" style={{color: "var(--primary)"}}>privacy@cbtpro.com</a>
            </p>
          </div>
        </div>
      </div>
      
      <footer>
        <div className="nav-container">
          © 2027 CBT Pro. All rights reserved.
        </div>
      </footer>
    </div>
  )
}