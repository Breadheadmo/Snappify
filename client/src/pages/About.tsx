import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Users, Award, TrendingUp, Shield, Headphones } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Snappify</h1>
          <p className="text-xl md:text-2xl text-primary-100 max-w-3xl">
            Your trusted destination for premium tech accessories and innovative solutions
          </p>
        </div>
      </div>

      {/* Our Story */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Founded with a passion for technology and innovation, Snappify has grown from a small startup 
                to become one of South Africa's leading online destinations for premium tech accessories.
              </p>
              <p>
                We believe that quality technology should be accessible to everyone. That's why we carefully 
                curate our product selection, ensuring that every item meets our high standards for quality, 
                functionality, and value.
              </p>
              <p>
                From wireless earbuds to phone accessories, smartwatches to charging solutions, we bring you 
                the latest innovations to enhance your digital lifestyle.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl p-8 shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&h=400&fit=crop" 
              alt="Snappify Team" 
              className="rounded-lg shadow-md w-full"
            />
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose Snappify?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Award className="h-12 w-12 text-primary-600" />,
                title: "Premium Quality",
                description: "We partner with trusted brands and rigorously test all products to ensure top-tier quality and performance."
              },
              {
                icon: <Shield className="h-12 w-12 text-primary-600" />,
                title: "Secure Shopping",
                description: "Your security is our priority. We use industry-standard encryption and secure payment gateways."
              },
              {
                icon: <TrendingUp className="h-12 w-12 text-primary-600" />,
                title: "Latest Technology",
                description: "Stay ahead with the newest tech innovations. We constantly update our catalog with trending products."
              },
              {
                icon: <Headphones className="h-12 w-12 text-primary-600" />,
                title: "Expert Support",
                description: "Our knowledgeable team is here to help you find the perfect products and resolve any concerns."
              },
              {
                icon: <ShoppingBag className="h-12 w-12 text-primary-600" />,
                title: "Fast Delivery",
                description: "Quick and reliable shipping across South Africa. Get your tech accessories delivered to your door."
              },
              {
                icon: <Users className="h-12 w-12 text-primary-600" />,
                title: "Customer First",
                description: "Your satisfaction drives everything we do. We're committed to providing exceptional service."
              }
            ].map((value, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10,000+", label: "Happy Customers" },
              { number: "500+", label: "Products Available" },
              { number: "98%", label: "Customer Satisfaction" },
              { number: "24/7", label: "Support Available" }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-primary-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-700 leading-relaxed">
              To empower individuals and businesses with cutting-edge technology accessories that enhance 
              productivity, connectivity, and lifestyle. We strive to make premium tech products accessible, 
              affordable, and backed by exceptional customer service.
            </p>
          </div>
          <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-700 leading-relaxed">
              To become Africa's most trusted and innovative online marketplace for technology accessories, 
              recognized for our commitment to quality, customer satisfaction, and staying at the forefront 
              of technological advancement.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Experience the Difference?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of satisfied customers who trust Snappify for their tech needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/products" 
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Shop Now
            </Link>
            <Link 
              to="/contact" 
              className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;