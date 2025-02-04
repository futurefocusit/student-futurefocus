const FeaturesSection = () => {
  return (
    <section className="py-16 bg-gray-100">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-12">Key Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Student Management</h3>
            <p>Efficiently manage student data, track progress, and maintain records seamlessly.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Attendance Management</h3>
            <p>Track attendance for both staff and students in real-time with ease.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Cash Flow Management</h3>
            <p>Monitor and manage cash flow with detailed reports and financial insights.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
