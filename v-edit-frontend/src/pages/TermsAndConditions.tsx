import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Mail, Phone, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function TermsAndConditions() {
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
            <FileText className="h-12 w-12 text-purple-400 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-white">Terms & Conditions</h1>
              <p className="text-purple-300 mt-1">Last Updated: January 2025</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 text-white space-y-8">

          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">1. Agreement to Terms</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              Welcome to V EDIT HUB. By accessing our website at <span className="text-purple-400">www.vedithub.in</span> and
              purchasing digital assets, you agree to be bound by these Terms and Conditions. These terms govern your use of
              our platform and the purchase of video templates, audio files, thumbnails, picture templates, and other creative
              editing resources.
            </p>
            <p className="text-white/80 leading-relaxed">
              If you disagree with any part of these terms, you may not access our services. By creating an account or making
              a purchase, you confirm that you are at least 18 years old and have the legal capacity to enter into this agreement.
            </p>
          </section>

          {/* Services Description */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">2. Services Provided</h2>
            <p className="text-white/80 mb-3">V EDIT HUB provides:</p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Digital video editing templates in various formats</li>
              <li>Audio files and sound effects for content creation</li>
              <li>Thumbnail templates and picture assets</li>
              <li>Organized content folders and collections</li>
              <li>QR code-based instant download delivery system</li>
              <li>User account dashboard for managing purchases</li>
            </ul>
            <p className="text-white/80 mt-3">
              All products are digital goods delivered electronically. No physical products are shipped.
            </p>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">3. Account Registration and Security</h2>

            <h3 className="text-xl font-semibold text-white mb-3">3.1 Account Creation</h3>
            <p className="text-white/80 mb-3">
              To purchase and access our digital assets, you must create an account by providing accurate, complete,
              and current information including your name, email address, and password.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">3.2 Account Security</h3>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
              <li>Sharing your account or purchased assets with others is strictly prohibited</li>
              <li>We reserve the right to suspend or terminate accounts that violate our policies</li>
            </ul>
          </section>

          {/* Purchases and Payments */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">4. Purchases and Payments</h2>

            <h3 className="text-xl font-semibold text-white mb-3">4.1 Pricing</h3>
            <p className="text-white/80 mb-3">
              All prices are displayed in Indian Rupees (INR) and include applicable taxes. We reserve the right to
              change prices at any time without prior notice. Pricing errors may be corrected, and orders may be
              cancelled if such errors occur.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">4.2 Payment Processing</h3>
            <p className="text-white/80 mb-3">
              Payments are processed securely through Razorpay, our third-party payment gateway. We accept:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Credit and Debit Cards (Visa, Mastercard, RuPay)</li>
              <li>UPI (Unified Payments Interface)</li>
              <li>Net Banking</li>
              <li>Digital Wallets</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">4.3 Order Completion</h3>
            <p className="text-white/80">
              Once payment is successfully processed, you will receive a confirmation email with QR codes for instant
              download access. Orders are non-transferable and can only be accessed by the purchasing account.
            </p>
          </section>

          {/* License and Usage Rights */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">5. License and Usage Rights</h2>

            <h3 className="text-xl font-semibold text-white mb-3">5.1 Personal Use License</h3>
            <p className="text-white/80 mb-3">
              Upon purchase, you are granted a non-exclusive, non-transferable license to use the digital assets for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Personal content creation projects</li>
              <li>Commercial projects for your own brand or clients</li>
              <li>Social media content, YouTube videos, and digital marketing</li>
              <li>Unlimited projects with no additional fees</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">5.2 Prohibited Uses</h3>
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-3">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-red-300 mb-2">You MAY NOT:</p>
                  <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                    <li>Resell, redistribute, or share downloaded assets with others</li>
                    <li>Upload assets to template marketplaces or stock websites</li>
                    <li>Claim ownership or authorship of the templates</li>
                    <li>Remove watermarks or copyright notices (where applicable)</li>
                    <li>Use assets for illegal, defamatory, or harmful purposes</li>
                    <li>Create derivative template products for commercial sale</li>
                    <li>Share QR codes or download links with non-purchasers</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">5.3 Copyright and Ownership</h3>
            <p className="text-white/80">
              V EDIT HUB retains all intellectual property rights to the digital assets. Your purchase grants you
              usage rights only, not ownership of the underlying files or copyrights.
            </p>
          </section>

          {/* Delivery and Access */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">6. Delivery and Access</h2>

            <h3 className="text-xl font-semibold text-white mb-3">6.1 Instant Delivery</h3>
            <p className="text-white/80 mb-3">
              Digital assets are delivered instantly via QR codes after successful payment. You can scan the QR code
              to download files directly or access them through your account dashboard.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">6.2 Download Limitations</h3>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Download links are valid for the lifetime of your account</li>
              <li>You can re-download purchased assets at any time</li>
              <li>We recommend backing up your downloads locally</li>
              <li>Download speeds depend on your internet connection</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">6.3 Technical Requirements</h3>
            <p className="text-white/80">
              You are responsible for ensuring your device and software are compatible with the downloaded assets.
              Minimum system requirements vary by product type and are displayed on product pages.
            </p>
          </section>

          {/* Refunds and Cancellations */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">7. Refunds and Cancellations</h2>
            <p className="text-white/80 mb-3">
              Due to the digital nature of our products, we have a specific refund policy:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Refund requests must be made within 7 days of purchase</li>
              <li>Valid reasons include technical defects, missing files, or significant quality issues</li>
              <li>Change of mind is not a valid reason after downloading</li>
              <li>Refunds are processed to the original payment method within 7-10 business days</li>
            </ul>
            <p className="text-white/80 mt-3">
              For complete details, please refer to our <Link to="/refund-policy" className="text-purple-400 hover:text-purple-300 underline">Refund & Cancellation Policy</Link>.
            </p>
          </section>

          {/* User Conduct */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">8. User Conduct and Responsibilities</h2>
            <p className="text-white/80 mb-3">You agree to:</p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Use the platform and assets in accordance with applicable laws</li>
              <li>Provide accurate information during registration and purchase</li>
              <li>Not attempt to hack, reverse engineer, or compromise our systems</li>
              <li>Not use automated tools or bots to scrape content</li>
              <li>Not create multiple accounts to exploit promotional offers</li>
              <li>Respect intellectual property rights of V EDIT HUB and third parties</li>
            </ul>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">9. Disclaimers and Limitations</h2>

            <h3 className="text-xl font-semibold text-white mb-3">9.1 Service Availability</h3>
            <p className="text-white/80 mb-3">
              We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. Scheduled maintenance,
              technical issues, or unforeseen circumstances may cause temporary service disruptions.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">9.2 Quality and Compatibility</h3>
            <p className="text-white/80 mb-3">
              While we ensure high-quality assets, we do not guarantee compatibility with all software versions or
              devices. Preview images and descriptions provide a general representation of products.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">9.3 Third-Party Content</h3>
            <p className="text-white/80">
              Some assets may include licensed music, fonts, or elements from third parties. Users are responsible
              for verifying licensing requirements for commercial projects.
            </p>
          </section>

          {/* Liability Limitations */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">10. Limitation of Liability</h2>
            <p className="text-white/80 leading-relaxed">
              To the maximum extent permitted by law, V EDIT HUB shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising from your use of our services. Our total liability
              is limited to the amount you paid for the specific product in question. This limitation applies to all
              claims, whether based on warranty, contract, tort, or any other legal theory.
            </p>
          </section>

          {/* Intellectual Property Claims */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">11. Intellectual Property Claims</h2>
            <p className="text-white/80 mb-3">
              If you believe any content on our platform infringes your intellectual property rights, please contact
              us immediately at <span className="text-purple-400">vedithubwebsite@gmail.com</span> with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Description of the copyrighted work or intellectual property</li>
              <li>Identification of the infringing material on our website</li>
              <li>Your contact information and proof of ownership</li>
              <li>A statement of good faith belief that the use is unauthorized</li>
            </ul>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">12. Account Termination</h2>

            <h3 className="text-xl font-semibold text-white mb-3">12.1 Termination by User</h3>
            <p className="text-white/80 mb-3">
              You may delete your account at any time through account settings. Upon deletion, access to purchased
              assets will be revoked, and no refunds will be provided for prior purchases.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">12.2 Termination by V EDIT HUB</h3>
            <p className="text-white/80 mb-3">
              We reserve the right to suspend or terminate accounts that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Violate these Terms & Conditions</li>
              <li>Engage in fraudulent activity or payment disputes</li>
              <li>Share purchased assets or account credentials</li>
              <li>Use our platform for illegal or harmful purposes</li>
            </ul>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">13. Governing Law and Disputes</h2>
            <p className="text-white/80 mb-3">
              These Terms & Conditions are governed by the laws of India. Any disputes arising from these terms or
              your use of V EDIT HUB shall be subject to the exclusive jurisdiction of the courts in India.
            </p>
            <p className="text-white/80">
              We encourage users to contact us first to resolve any issues amicably before pursuing legal action.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">14. Changes to Terms</h2>
            <p className="text-white/80 leading-relaxed">
              We reserve the right to modify these Terms & Conditions at any time. Changes will be effective immediately
              upon posting on this page with an updated "Last Updated" date. Your continued use of our services after
              changes constitutes acceptance of the modified terms. We recommend reviewing this page periodically.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-purple-300 mb-4">15. Contact Information</h2>
            <p className="text-white/80 mb-4">
              For questions, concerns, or issues regarding these Terms & Conditions, please contact us:
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-300" />
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
              By using V EDIT HUB, purchasing digital assets, or creating an account, you acknowledge that you have
              read, understood, and agree to be bound by these Terms & Conditions. This agreement constitutes a
              legally binding contract between you and V EDIT HUB.
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
          <Link to="/privacy-policy" className="text-purple-400 hover:text-purple-300 transition-colors">
            Privacy Policy
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
