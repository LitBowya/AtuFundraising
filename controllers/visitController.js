import Visit from "../models/visitModel.js";

const getMonthlyVisits = async (req, res) => {
  try {
    const start = new Date();
    start.setDate(1); // Start from the first day of the current month
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setMonth(start.getMonth() + 1); // Go to the first day of the next month

    const visits = await Visit.aggregate([
      {
        $match: {
          timestamp: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    res.json(visits);
  } catch (error) {
    console.error("Error fetching visits:", error);
    res.status(500).json({ message: "Error fetching visits" });
  }
};

export { getMonthlyVisits };
