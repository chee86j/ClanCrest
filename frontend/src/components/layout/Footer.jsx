const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">🏰 ClanCrest</h3>
            <p className="text-gray-300">
              Build and explore your family tree with our intuitive
              drag-and-drop interface.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-white">
                  About
                </a>
              </li>
              <li>
                <a href="/auth" className="text-gray-300 hover:text-white">
                  Sign In
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-300">
              Questions? Reach out to us at support@clancrest.com
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-300">
            © {new Date().getFullYear()} ClanCrest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
