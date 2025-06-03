const FeaturesSection = () => {
  return (
    <section className="py-16 bg-gray-100">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-12">Key Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Student Management</h3>
            <p>Efficiently manage student data, track progress,manage payments and maintain records seamlessly.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Attendance Management</h3>
            <p>Track attendance for both staff and students in real-time with ease.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Cash Flow Management</h3>
            <p>Monitor and manage cash flow with detailed reports and financial insights.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Inventory Management</h3>
            <p>Monitor and manage your matarials and equipments with detailed availability and renting records insights.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">HR Management</h3>
            <p> Human resources management</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">overal dashboard</h3>
            <p>Provides Dashboard that summerize all information in your systems</p>
          </div>
        </div>
        {/* <p className="text-3xl font-bold mt-12">For detailed features of <span className="text-green-400 font-bold">Xcool system</span> you can view <a href="https://rodrigue.xcooll.com/projects/681657d868a443a000b43a99" className="text-green-600">this page</a> </p> */}

      </div>

    </section>
  )
}

export default FeaturesSection
