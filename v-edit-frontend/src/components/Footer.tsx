import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, Instagram, Globe, ExternalLink } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content - 4 Column Layout */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Company Info */}
          <div>
            <h3 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent tracking-wide">
              V EDIT HUB
            </h3>
            <p className="text-sm font-semibold text-purple-300 mb-4">
              Edit Smarter. Create Faster.
            </p>
            <p className="text-slate-400 mb-4 text-sm leading-relaxed">
              Stop searching endlessly for the perfect asset. We deliver
              thousands of pro-grade video and thumbnail resources. Instantly
              download everything you need to save hours of work. V EDIT HUB:
              Edit Smarter. Create Faster. Get your assets now.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-purple-300">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/contact"
                  className="text-slate-400 hover:text-purple-400 transition-colors flex items-center"
                >
                  <span className="mr-2">→</span>
                  Contact Us
                </Link>
              </li>
              <li className="flex items-start space-x-2 text-slate-400">
                <Mail className="h-4 w-4 flex-shrink-0 mt-0.5 text-purple-400" />
                <a
                  href="mailto:vedithubwebsite@gmail.com"
                  className="hover:text-purple-400 transition-colors break-all"
                >
                  vedithubwebsite@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Developed By */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-purple-300">
              Developed By
            </h4>
            <p className="text-white font-semibold mb-3">
              Innovatech Developers
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start space-x-2 text-slate-400">
                <Globe className="h-4 w-4 flex-shrink-0 mt-0.5 text-purple-400" />
                <a
                  href="https://innovatech-developers.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-400 transition-colors break-all"
                >
                  innovatech-developers.vercel.app
                </a>
              </li>
              <li className="flex items-start space-x-2 text-slate-400">
                <Mail className="h-4 w-4 flex-shrink-0 mt-0.5 text-purple-400" />
                <a
                  href="mailto:innovatechdeveloperss@gmail.com"
                  className="hover:text-purple-400 transition-colors break-all"
                >
                  innovatechdeveloperss@gmail.com
                </a>
              </li>
              <li className="flex items-start space-x-2 text-slate-400">
                <Phone className="h-4 w-4 flex-shrink-0 mt-0.5 text-purple-400" />
                <a
                  href="tel:6304623705"
                  className="hover:text-purple-400 transition-colors"
                >
                  6304623705
                </a>
              </li>
              <li className="flex items-start space-x-2 text-slate-400">
                <Instagram className="h-4 w-4 flex-shrink-0 mt-0.5 text-purple-400" />
                <a
                  href="https://instagram.com/innovatechdeveloperss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-400 transition-colors"
                >
                  @innovatechdeveloperss
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Developer Projects */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-purple-300">
              Developer Projects
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://www.padmalayahighschool.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-2 text-slate-400 hover:text-purple-400 transition-colors group"
                >
                  <ExternalLink className="h-4 w-4 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span>PadmalayaHighSchool.in</span>
                </a>
              </li>
              <li>
                <a
                  href="https://innovatech-developers.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-2 text-slate-400 hover:text-purple-400 transition-colors group"
                >
                  <ExternalLink className="h-4 w-4 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span>Innovatech Developers</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.vedithub.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-2 text-slate-400 hover:text-purple-400 transition-colors group"
                >
                  <ExternalLink className="h-4 w-4 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span>VeditHub.in</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-slate-400">
              © {currentYear} V EDIT HUB. All rights reserved.
            </div>
            <div className="text-sm text-slate-400">
              Developed by{" "}
              <a
                href="https://innovatech-developers.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
              >
                Innovatech Developers
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
