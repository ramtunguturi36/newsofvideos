import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Heart,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              V-Edit
            </h3>
            <p className="text-slate-400 mb-4 text-sm">
              Your one-stop destination for premium video templates, pictures,
              video content, and audio collections.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-slate-700 hover:bg-purple-600 flex items-center justify-center transition-colors duration-300"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-slate-700 hover:bg-blue-500 flex items-center justify-center transition-colors duration-300"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-slate-700 hover:bg-pink-600 flex items-center justify-center transition-colors duration-300"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-slate-700 hover:bg-red-600 flex items-center justify-center transition-colors duration-300"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/folders"
                  className="text-slate-400 hover:text-purple-400 transition-colors"
                >
                  Video Templates
                </Link>
              </li>
              <li>
                <Link
                  to="/picture-templates"
                  className="text-slate-400 hover:text-purple-400 transition-colors"
                >
                  Pictures
                </Link>
              </li>
              <li>
                <Link
                  to="/video-content"
                  className="text-slate-400 hover:text-purple-400 transition-colors"
                >
                  Video Content
                </Link>
              </li>
              <li>
                <Link
                  to="/audio-content"
                  className="text-slate-400 hover:text-purple-400 transition-colors"
                >
                  Audio Content
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/help"
                  className="text-slate-400 hover:text-purple-400 transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-slate-400 hover:text-purple-400 transition-colors"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-slate-400 hover:text-purple-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-slate-400 hover:text-purple-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/refund"
                  className="text-slate-400 hover:text-purple-400 transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3 text-slate-400">
                <Mail className="h-5 w-5 flex-shrink-0 mt-0.5 text-purple-400" />
                <span>support@v-edit.com</span>
              </li>
              <li className="flex items-start space-x-3 text-slate-400">
                <Phone className="h-5 w-5 flex-shrink-0 mt-0.5 text-purple-400" />
                <span>+91 1234567890</span>
              </li>
              <li className="flex items-start space-x-3 text-slate-400">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5 text-purple-400" />
                <span>
                  123 Business Street
                  <br />
                  City, State 12345
                  <br />
                  India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-slate-400">
              © {currentYear} V-Edit. All rights reserved.
            </div>
            <div className="flex items-center space-x-1 text-sm text-slate-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
