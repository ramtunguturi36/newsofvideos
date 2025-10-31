import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Mail, Phone, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function RefundPolicy() {
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
            <DollarSign className="h-12 w-12 text-purple-400 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-white">Refund & Cancellation Policy</h1>
              <p className="text-purple-300 mt-1">Last Updated: January 2025</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 text-white space-y-8">

          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">1. Overview</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              At V EDIT HUB, we are committed to providing high-quality digital creative assets including video templates,
              audio files, thumbnails, and picture templates. Due to the instant digital nature of our products, we have
              established this Refund & Cancellation Policy to protect both our customers and our business interests.
            </p>
            <p className="text-white/80 leading-relaxed">
              This policy applies to all purchases made through <span className="text-purple-400">www.vedithub.in</span> and
              is designed to ensure fair treatment while acknowledging the unique characteristics of digital product sales.
            </p>
          </section>

          {/* Digital Product Nature */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">2. Nature of Digital Products</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              All products sold on V EDIT HUB are digital goods that are delivered instantly upon successful payment through
              QR codes and direct download links. Once you have received access to and downloaded these digital assets, they
              cannot be "returned" in the traditional sense.
            </p>
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 mt-4">
              <p className="text-blue-300 font-semibold mb-2">Important Note:</p>
              <p className="text-white/80 text-sm">
                By completing a purchase, you acknowledge that you understand the digital nature of these products and that
                standard "return" policies for physical goods do not apply.
              </p>
            </div>
          </section>

          {/* Refund Eligibility */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">3. Refund Eligibility Criteria</h2>

            <h3 className="text-xl font-semibold text-white mb-3">3.1 Valid Reasons for Refund</h3>
            <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-green-300 mb-2">Refunds will be considered for:</p>
                  <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                    <li><strong>Technical Defects:</strong> Files are corrupted, won't open, or are significantly different from the description</li>
                    <li><strong>Missing Files:</strong> Purchased package is incomplete or missing advertised components</li>
                    <li><strong>Quality Issues:</strong> Resolution, format, or quality is substantially lower than advertised</li>
                    <li><strong>Download Failures:</strong> Repeated inability to download due to our system errors (not internet issues)</li>
                    <li><strong>Duplicate Charges:</strong> You were accidentally charged multiple times for the same purchase</li>
                    <li><strong>Unauthorized Transactions:</strong> Purchase made without your authorization (requires verification)</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">3.2 Invalid Reasons for Refund</h3>
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <XCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-red-300 mb-2">Refunds will NOT be provided for:</p>
                  <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                    <li><strong>Change of Mind:</strong> No longer wanting the product after downloading</li>
                    <li><strong>Compatibility Issues:</strong> Your device or software doesn't support the file format (when requirements were clearly stated)</li>
                    <li><strong>User Error:</strong> Accidental purchase due to not reading product details</li>
                    <li><strong>Creative Differences:</strong> Subjective dissatisfaction with style or aesthetics</li>
                    <li><strong>Wrong Purchase:</strong> Buying the wrong item when the correct product was clearly available</li>
                    <li><strong>Found Elsewhere:</strong> Finding similar assets on other platforms after purchase</li>
                    <li><strong>Sharing Violations:</strong> Issues arising from sharing files with unauthorized users</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Timeframe */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">4. Refund Request Timeframe</h2>
            <div className="flex items-start space-x-4 bg-purple-500/20 border border-purple-400/30 rounded-lg p-4">
              <Clock className="h-8 w-8 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">7-Day Refund Window</h3>
                <p className="text-white/80 mb-3">
                  Refund requests must be submitted within <strong className="text-purple-300">7 days</strong> of the original purchase date.
                  Requests submitted after this period will not be considered, except in cases of:
                </p>
                <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                  <li>Technical issues that were not immediately apparent</li>
                  <li>Delayed discovery of missing files in large packages</li>
                  <li>System errors that prevented timely reporting</li>
                </ul>
                <p className="text-white/80 mt-3 text-sm">
                  Note: The 7-day window begins from the date of purchase, not the date of download.
                </p>
              </div>
            </div>
          </section>

          {/* Refund Process */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">5. How to Request a Refund</h2>

            <h3 className="text-xl font-semibold text-white mb-3">Step-by-Step Process:</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-300 font-bold">1</span>
                </div>
                <div>
                  <p className="font-semibold text-white">Contact Our Support Team</p>
                  <p className="text-white/80 text-sm">
                    Email us at <a href="mailto:vedithubwebsite@gmail.com" className="text-purple-400 hover:text-purple-300">vedithubwebsite@gmail.com</a> with
                    the subject line: "Refund Request - Order #[Your Order Number]"
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-300 font-bold">2</span>
                </div>
                <div>
                  <p className="font-semibold text-white">Provide Required Information</p>
                  <ul className="text-white/80 text-sm list-disc list-inside ml-4 mt-1">
                    <li>Order number and purchase date</li>
                    <li>Email address used for purchase</li>
                    <li>Detailed description of the issue</li>
                    <li>Screenshots or evidence of the problem (if applicable)</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-300 font-bold">3</span>
                </div>
                <div>
                  <p className="font-semibold text-white">Await Review</p>
                  <p className="text-white/80 text-sm">
                    Our team will review your request within 2-3 business days and respond with a decision or request for
                    additional information.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-300 font-bold">4</span>
                </div>
                <div>
                  <p className="font-semibold text-white">Refund Processing</p>
                  <p className="text-white/80 text-sm">
                    If approved, refunds are processed to your original payment method within 7-10 business days. You will
                    receive a confirmation email once processing begins.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Cancellation Policy */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">6. Order Cancellation Policy</h2>

            <h3 className="text-xl font-semibold text-white mb-3">6.1 Before Download</h3>
            <p className="text-white/80 mb-3">
              You may cancel your order and receive a full refund if you:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Request cancellation within 24 hours of purchase</li>
              <li>Have NOT downloaded or accessed the digital assets</li>
              <li>Have NOT scanned the QR codes or accessed download links</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">6.2 After Download</h3>
            <p className="text-white/80">
              Once you have downloaded or accessed the digital assets, cancellation is no longer possible. However, you
              may still request a refund based on the valid reasons outlined in Section 3.1 above.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">6.3 Payment Processing Failures</h3>
            <p className="text-white/80">
              If your payment fails or is declined, your order will be automatically cancelled. No refund is necessary as
              no charge was successfully processed. You may retry the purchase once payment issues are resolved.
            </p>
          </section>

          {/* Refund Methods */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">7. Refund Processing Methods</h2>

            <h3 className="text-xl font-semibold text-white mb-3">7.1 Original Payment Method</h3>
            <p className="text-white/80 mb-3">
              All refunds are processed to the original payment method used for purchase:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li><strong>Credit/Debit Cards:</strong> 7-10 business days for the amount to appear in your account</li>
              <li><strong>UPI:</strong> 3-5 business days</li>
              <li><strong>Net Banking:</strong> 5-7 business days</li>
              <li><strong>Digital Wallets:</strong> 3-5 business days</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">7.2 Partial Refunds</h3>
            <p className="text-white/80">
              In cases where only part of a bundle or folder purchase is defective, we may offer a partial refund
              corresponding to the affected items. The calculation will be based on the proportional value of the
              defective items within the complete package.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">7.3 Alternative Resolutions</h3>
            <p className="text-white/80 mb-3">
              Instead of a refund, we may offer:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Replacement files or updated versions</li>
              <li>Store credit for future purchases (equal to or greater than refund amount)</li>
              <li>Free additional assets to compensate for issues</li>
              <li>Technical support to resolve compatibility problems</li>
            </ul>
          </section>

          {/* Special Circumstances */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">8. Special Circumstances</h2>

            <h3 className="text-xl font-semibold text-white mb-3">8.1 Bulk Purchases</h3>
            <p className="text-white/80 mb-3">
              For purchases of multiple items or complete folder collections:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>You must identify specific defective items</li>
              <li>Refunds apply only to genuinely problematic files</li>
              <li>Partial refunds will be calculated proportionally</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">8.2 Promotional and Discounted Items</h3>
            <p className="text-white/80">
              Items purchased during sales, with coupon codes, or at discounted prices are eligible for refunds under
              the same conditions. The refunded amount will be the actual amount paid, not the original price.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">8.3 Account Suspension</h3>
            <p className="text-white/80">
              If your account is suspended or terminated due to violation of our Terms & Conditions, no refunds will
              be provided for any purchases, regardless of when they were made.
            </p>
          </section>

          {/* Access Revocation */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">9. Access Revocation After Refund</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              Once a refund is approved and processed:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Your license to use the refunded assets is immediately revoked</li>
              <li>Download links and QR codes will be deactivated</li>
              <li>You must delete all copies of the refunded files from your devices</li>
              <li>Any content created using refunded assets should be discontinued</li>
              <li>Continued use after refund constitutes copyright infringement</li>
            </ul>
          </section>

          {/* Disputes and Chargebacks */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">10. Disputes and Chargebacks</h2>
            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
              <p className="text-yellow-300 font-semibold mb-2">⚠️ Important: Contact Us Before Filing a Chargeback</p>
              <p className="text-white/80 mb-3">
                We strongly encourage you to contact our support team before initiating a chargeback with your bank or
                payment provider. Most issues can be resolved quickly and amicably.
              </p>
              <p className="text-white/80 text-sm">
                Filing a chargeback without first attempting to resolve the issue with us may result in account suspension
                and may affect your ability to make future purchases. Chargebacks also incur processing fees that harm
                small businesses like ours.
              </p>
            </div>
          </section>

          {/* Customer Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">11. Customer Responsibilities</h2>
            <p className="text-white/80 mb-3">To ensure smooth transactions and minimize refund requests:</p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li><strong>Preview Before Purchase:</strong> Review product descriptions, preview images, and file specifications</li>
              <li><strong>Check System Requirements:</strong> Ensure your device and software meet compatibility requirements</li>
              <li><strong>Verify Details:</strong> Double-check your cart before completing payment</li>
              <li><strong>Test Downloads Promptly:</strong> Download and test files within the refund window</li>
              <li><strong>Contact Support Early:</strong> Report issues as soon as you discover them</li>
              <li><strong>Provide Accurate Information:</strong> Give complete details when requesting refunds</li>
            </ul>
          </section>

          {/* Legal Compliance */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">12. Legal Compliance</h2>
            <p className="text-white/80 leading-relaxed">
              This Refund & Cancellation Policy complies with the Consumer Protection Act, 2019 of India and the
              Information Technology Act, 2000. As a digital goods provider, we follow industry best practices while
              balancing consumer rights with protection of intellectual property. This policy is subject to applicable
              Indian laws and regulations governing e-commerce and digital transactions.
            </p>
          </section>

          {/* Policy Updates */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">13. Changes to This Policy</h2>
            <p className="text-white/80 leading-relaxed">
              We reserve the right to modify this Refund & Cancellation Policy at any time. Changes will be effective
              immediately upon posting with an updated "Last Updated" date. Changes will not affect refund requests for
              purchases made before the policy update. We recommend reviewing this policy periodically.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-purple-300 mb-4">14. Contact Us for Refund Requests</h2>
            <p className="text-white/80 mb-4">
              For refund requests, cancellations, or questions about this policy, please contact us:
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-purple-300" />
                </div>
                <div>
                  <p className="font-semibold text-white">V EDIT HUB - Refund Department</p>
                  <p className="text-sm text-white/70">Digital Creative Assets Platform</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-purple-300" />
                </div>
                <div>
                  <p className="text-white/70">Email for Refunds:</p>
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

              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-300" />
                </div>
                <div>
                  <p className="text-white/70">Response Time:</p>
                  <p className="text-white">Within 2-3 business days</p>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-blue-500/20 border border-blue-400/30 rounded-lg p-3">
              <p className="text-blue-300 text-sm">
                <strong>Quick Tip:</strong> Include your order number in the subject line for faster processing!
              </p>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="border-t border-white/20 pt-6">
            <p className="text-white/60 text-sm leading-relaxed">
              By making a purchase on V EDIT HUB, you acknowledge that you have read, understood, and agree to this
              Refund & Cancellation Policy. You understand the digital nature of our products and the limitations on
              refunds as outlined above. For any clarifications, please contact us before making a purchase.
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
          <Link to="/privacy-policy" className="text-purple-400 hover:text-purple-300 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-white/40">•</span>
          <Link to="/terms" className="text-purple-400 hover:text-purple-300 transition-colors">
            Terms & Conditions
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
