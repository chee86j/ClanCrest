const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            About ClanCrest 🏰
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Building bridges across generations through visual family mapping
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Our Mission
              </h2>
              <p className="text-gray-600">
                ClanCrest was born from a simple idea: making it easier for
                families to visualize and understand their connections across
                generations, languages, and cultures. We believe that
                understanding our family relationships shouldn't be limited by
                language barriers or complex terminology.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Why ClanCrest?
              </h2>
              <ul className="space-y-4 text-gray-600">
                <li>✨ Intuitive drag-and-drop interface</li>
                <li>🌏 Support for multiple languages</li>
                <li>🔍 Interactive relationship discovery</li>
                <li>💾 Secure data storage</li>
                <li>🤝 Family collaboration features</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">1. Create</h3>
              <p className="mt-2 text-gray-500">
                Start by adding family members and their information, including
                names in multiple languages.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">2. Connect</h3>
              <p className="mt-2 text-gray-500">
                Define relationships between family members using our visual
                connection tools.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">3. Explore</h3>
              <p className="mt-2 text-gray-500">
                Discover family connections and learn relationship terms in
                different languages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
