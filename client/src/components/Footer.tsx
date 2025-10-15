import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-shimmerBlack-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img src={require('../assets/images/Logo.png')} alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
            </div>
            <p className="text-shimmerBlack-300 mb-4 max-w-md">
              Your trusted source for premium tech products. We offer the latest in chargers, 
              audio devices, and cutting-edge technology with exceptional customer service.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-shimmerBlack-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" className="text-shimmerBlack-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" className="text-shimmerBlack-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-shimmerBlack-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-shimmerBlack-300 hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=Chargers" className="text-shimmerBlack-300 hover:text-white transition-colors">
                  Chargers
                </Link>
              </li>
              <li>
                <Link to="/products?category=Audio" className="text-shimmerBlack-300 hover:text-white transition-colors">
                  Audio
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-shimmerBlack-400" />
                <span className="text-shimmerBlack-300">info@snappify.co.za</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-shimmerBlack-400" />
                <span className="text-shimmerBlack-300">+27 665818875</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-shimmerBlack-400" />
                <span className="text-shimmerBlack-300">55 Richards Drive, Halfway House, Midrand, 1685</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-shimmerBlack-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-shimmerBlack-400 text-sm">
              © 2024 Snappify. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy-policy" className="text-shimmerBlack-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-shimmerBlack-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/shipping-policy" className="text-shimmerBlack-400 hover:text-white text-sm transition-colors">
                Shipping Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
