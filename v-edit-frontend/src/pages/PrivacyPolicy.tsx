import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <div className="flex items-center mb-4">
            <Shield className="h-12 w-12 text-purple-400 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
              <p className="text-purple-300 mt-1">Last Updated: January 2025</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 text-white space-y-8">

          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">1. Introduction</h2>
            <p className="text-white/80 leading-relaxed">
              Welcome to V EDIT HUB ("we," "our," or "us"). We are committed to protecting your personal information
              and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you visit our website <span className="text-purple-400">www.vedithub.in</span> and
              use our services to purchase and download digital creative assets including video templates, audio files,
              thumbnails, and other editing resources.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-white mb-3">2.1 Personal Information</h3>
            <p className="text-white/80 mb-3">When you register or make a purchase, we collect:</p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Full name and email address</li>
              <li>Phone number (optional)</li>
              <li>Account credentials (username and encrypted password)</li>
              <li>Billing information processed through Razorpay payment gateway</li>
              <li>Purchase history and transaction details</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>IP address and browser type</li>
              <li>Device information and operating system</li>
              <li>Pages visited and time spent on our website</li>
              <li>Download activities and access patterns</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.3 Content Usage Data</h3>
            <p className="text-white/80">
              We track which templates and assets you download through our QR code delivery system to prevent
              unauthorized sharing and ensure license compliance.
            </p>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">3. How We Use Your Information</h2>
            <p className="text-white/80 mb-3">We use the collected information for:</p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Processing your orders and delivering purchased digital assets</li>
              <li>Managing your account and providing customer support</li>
              <li>Sending purchase confirmations, QR codes, and download links</li>
              <li>Improving our platform and user experience</li>
              <li>Preventing fraud and ensuring security</li>
              <li>Sending promotional emails (you can opt-out anytime)</li>
              <li>Analyzing usage patterns to curate better content</li>
              <li>Complying with legal obligations and enforcing our Terms & Conditions</li>
            </ul>
          </section>

          {/* Payment Processing */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">4. Payment Processing</h2>
            <p className="text-white/80 leading-relaxed">
              All payments are processed through <span className="font-semibold">Razorpay</span>, a secure third-party
              payment gateway. We do not store your complete credit/debit card information on our servers. Payment data
              is encrypted and handled in compliance with PCI-DSS standards. Please refer to Razorpay's Privacy Policy
              for details on how they handle your payment information.
            </p>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">5. Cookies and Tracking Technologies</h2>
            <p className="text-white/80 mb-3">We use cookies and similar technologies to:</p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Keep you logged in to your account</li>
              <li>Remember your preferences and settings</li>
              <li>Analyze site traffic and user behavior</li>
              <li>Provide personalized content recommendations</li>
              <li>Track download activities for license enforcement</li>
            </ul>
            <p className="text-white/80 mt-3">
              You can control cookies through your browser settings, but disabling them may affect website functionality.
            </p>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">6. How We Share Your Information</h2>
            <p className="text-white/80 mb-3">We may share your information with:</p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li><span className="font-semibold">Payment Processors:</span> Razorpay for transaction processing</li>
              <li><span className="font-semibold">Service Providers:</span> Hosting services, analytics tools, and email services</li>
              <li><span className="font-semibold">Legal Authorities:</span> When required by law or to protect our rights</li>
              <li><span className="font-semibold">Business Transfers:</span> In case of merger, acquisition, or asset sale</li>
            </ul>
            <p className="text-white/80 mt-3 font-semibold">
              We DO NOT sell your personal information to third parties for marketing purposes.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">7. Data Security</h2>
            <p className="text-white/80 leading-relaxed">
              We implement industry-standard security measures including SSL encryption, secure servers, and regular
              security audits to protect your data. However, no method of transmission over the internet is 100% secure,
              and we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your
              account credentials.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">8. Data Retention</h2>
            <p className="text-white/80 leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide services.
              Purchase records and transaction history are retained for 7 years to comply with Indian tax laws. You may
              request account deletion at any time, but we may retain certain information for legal compliance and fraud
              prevention purposes.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">9. Your Privacy Rights</h2>
            <p className="text-white/80 mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Access and review your personal information</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your account and data</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data in a readable format</li>
              <li>Object to automated decision-making and profiling</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="text-white/80 mt-3">
              To exercise these rights, contact us at <span className="text-purple-400">vedithubwebsite@gmail.com</span>
            </p>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">10. Third-Party Links and Services</h2>
            <p className="text-white/80 leading-relaxed">
              Our website may contain links to third-party websites including social media platforms (Instagram).
              We are not responsible for the privacy practices of these external sites. We encourage you to review
              their privacy policies before providing any personal information.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">11. Children's Privacy</h2>
            <p className="text-white/80 leading-relaxed">
              Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal
              information from children. If you are a parent or guardian and believe your child has provided us with
              personal information, please contact us immediately, and we will delete such information.
            </p>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">12. International Users</h2>
            <p className="text-white/80 leading-relaxed">
              V EDIT HUB operates from India. If you access our services from outside India, your information will be
              transferred to and processed in India. By using our services, you consent to this transfer and processing
              in accordance with Indian data protection laws.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">13. Changes to This Privacy Policy</h2>
            <p className="text-white/80 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.
              We will notify you of significant changes by posting the new policy on this page with an updated "Last Updated"
              date. Your continued use of our services after such modifications constitutes your acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-purple-300 mb-4">14. Contact Us</h2>
            <p className="text-white/80 mb-4">
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-300" />
                </div>
                <div>
                  <p className="font-semibold text-white">V EDIT HUB</p>
                  <p className="text-sm text-white/70">Digital Creative Assets Platform</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-purple-300" />
                </div>
                <div>
                  <p className="text-white/70">Email:</p>
                  <a href="mailto:vedithubwebsite@gmail.com" className="text-purple-400 hover:text-purple-300">
                    vedithubwebsite@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-purple-300" />
                </div>
                <div>
                  <p className="text-white/70">Website:</p>
                  <a href="https://www.vedithub.in" className="text-purple-400 hover:text-purple-300">
                    www.vedithub.in
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="border-t border-white/20 pt-6">
            <p className="text-white/60 text-sm leading-relaxed">
              By using V EDIT HUB, you acknowledge that you have read, understood, and agree to be bound by this
              Privacy Policy. This policy is effective as of the date mentioned above and applies to all users of
              our platform.
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
          <Link to="/terms" className="text-purple-400 hover:text-purple-300 transition-colors">
            Terms & Conditions
          </Link>
          <span className="text-white/40">•</span>
          <Link to="/refund-policy" className="text-purple-400 hover:text-purple-300 transition-colors">
            Refund & Cancellation Policy
          </Link>
          <span className="text-white/40">•</span>
          <Link to="/contact" className="text-purple-400 hover:text-purple-300 transition-colors">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
