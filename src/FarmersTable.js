import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import "./FarmersTable.css";

function FarmersTable() {
  const [farmers, setFarmers] = useState([]);
  const [seasonData, setSeasonData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState("Yala");

  useEffect(() => {
    fetchFarmersAndSeasons();
  }, []);

  const fetchFarmersAndSeasons = async () => {
    try {
      setLoading(true);

      // Fetch farmers
      const farmersSnapshot = await getDocs(collection(db, "farmers"));
      const farmersList = farmersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFarmers(farmersList);

      // Create farmer map by idNumber
      const farmerMap = {};
      farmersList.forEach(farmer => {
        farmerMap[farmer.idNumber] = farmer;
      });

      // Fetch loans and purchases for each farmer
      const loansSnapshot = await getDocs(collection(db, "loans"));
      const purchasesSnapshot = await getDocs(collection(db, "purchases"));

      const seasonDataMap = {};
      const uniqueSeasons = new Set();

      loansSnapshot.docs.forEach((doc) => {
        const loanData = doc.data();
        const farmerIdNumber = loanData.idNumber;
        const season = loanData.season || "Unknown";

        uniqueSeasons.add(season);

        if (!seasonDataMap[farmerIdNumber]) seasonDataMap[farmerIdNumber] = {};
        if (!seasonDataMap[farmerIdNumber][season]) {
          seasonDataMap[farmerIdNumber][season] = {
            loans: 0,
            purchases: 0,
            loanAmount: 0,
            purchaseAmount: 0,
          };
        }

        seasonDataMap[farmerIdNumber][season].loans += 1;
        seasonDataMap[farmerIdNumber][season].loanAmount +=
          loanData.amount || 0;
      });

      purchasesSnapshot.docs.forEach((doc) => {
        const purchaseData = doc.data();
        const farmerIdNumber = purchaseData.idNumber;
        const season = purchaseData.season || "Unknown";

        uniqueSeasons.add(season);

        if (!seasonDataMap[farmerIdNumber]) seasonDataMap[farmerIdNumber] = {};
        if (!seasonDataMap[farmerIdNumber][season]) {
          seasonDataMap[farmerIdNumber][season] = {
            loans: 0,
            purchases: 0,
            loanAmount: 0,
            purchaseAmount: 0,
          };
        }

        seasonDataMap[farmerIdNumber][season].purchases += 1;
        seasonDataMap[farmerIdNumber][season].purchaseAmount +=
          purchaseData.amount || 0;
      });

      setSeasonData(seasonDataMap);
      if (Array.from(uniqueSeasons).length > 0) {
        setSelectedSeason("Yala");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="farmers-table-container"><p>Loading farmers data...</p></div>;
  }

  const getFilteredFarmers = () => {
    if (selectedSeason === "Both") {
      return farmers.filter(farmer => {
        const data = seasonData[farmer.idNumber];
        return data && (data["Yala"] || data["Maha"]);
      });
    } else {
      return farmers.filter(farmer => seasonData[farmer.idNumber] && seasonData[farmer.idNumber][selectedSeason]);
    }
  };

  const filteredFarmers = getFilteredFarmers();

  return (
    <div className="farmers-table-container">
      <h2>Farmers Details by Season</h2>
      <p className="subtitle">Complete overview of all farmers and their seasonal transactions</p>

      <div className="season-selector">
        <label htmlFor="season-select">Select Season: </label>
        <select
          id="season-select"
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
        >
          <option value="Yala">Yala</option>
          <option value="Maha">Maha</option>
          <option value="Both">Both</option>
        </select>
      </div>

      {filteredFarmers.length === 0 ? (
        <div className="no-data">No farmers found for {selectedSeason} season. Start by adding farmers and transactions.</div>
      ) : (
        <div className="table-wrapper">
          <table className="farmers-table">
            <thead>
              <tr>
                <th>Farmer ID</th>
                <th>NIC</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                {selectedSeason === "Both" ? (
                  <>
                    <th>Yala Loans</th>
                    <th>Yala Loan Amount (Rs)</th>
                    <th>Yala Purchases</th>
                    <th>Yala Purchase Amount (Rs)</th>
                    <th>Maha Loans</th>
                    <th>Maha Loan Amount (Rs)</th>
                    <th>Maha Purchases</th>
                    <th>Maha Purchase Amount (Rs)</th>
                    <th>Total Transactions</th>
                    <th>Total Value (Rs)</th>
                  </>
                ) : (
                  <>
                    <th>Loans (Count)</th>
                    <th>Loan Amount (Rs)</th>
                    <th>Purchases (Count)</th>
                    <th>Purchase Amount (Rs)</th>
                    <th>Total Transactions</th>
                    <th>Total Value (Rs)</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredFarmers.map((farmer) => {
                const farmerData = seasonData[farmer.idNumber] || {};
                const yalaData = farmerData["Yala"] || { loans: 0, purchases: 0, loanAmount: 0, purchaseAmount: 0 };
                const mahaData = farmerData["Maha"] || { loans: 0, purchases: 0, loanAmount: 0, purchaseAmount: 0 };

                if (selectedSeason === "Both") {
                  const totalTransactions = yalaData.loans + yalaData.purchases + mahaData.loans + mahaData.purchases;
                  const totalValue = (yalaData.purchaseAmount - yalaData.loanAmount) + (mahaData.purchaseAmount - mahaData.loanAmount);

                  return (
                    <tr key={`${farmer.idNumber}-both`}>
                      <td className="farmer-id-cell">{farmer.idNumber}</td>
                      <td>{farmer.nic || farmer.idNumber}</td>
                      <td>{farmer.name}</td>
                      <td>{farmer.phone}</td>
                      <td>{farmer.address}</td>
                      <td className="number-cell">{yalaData.loans}</td>
                      <td className="amount-cell">Rs {yalaData.loanAmount.toFixed(2)}</td>
                      <td className="number-cell">{yalaData.purchases}</td>
                      <td className="amount-cell">Rs {yalaData.purchaseAmount.toFixed(2)}</td>
                      <td className="number-cell">{mahaData.loans}</td>
                      <td className="amount-cell">Rs {mahaData.loanAmount.toFixed(2)}</td>
                      <td className="number-cell">{mahaData.purchases}</td>
                      <td className="amount-cell">Rs {mahaData.purchaseAmount.toFixed(2)}</td>
                      <td className="number-cell">{totalTransactions}</td>
                      <td className="total-cell">Rs {totalValue.toFixed(2)}</td>
                    </tr>
                  );
                } else {
                  const data = farmerData[selectedSeason];
                  const totalTransactions = data.loans + data.purchases;
                  const totalValue = data.purchaseAmount - data.loanAmount;

                  return (
                    <tr key={`${farmer.idNumber}-${selectedSeason}`}>
                      <td className="farmer-id-cell">{farmer.idNumber}</td>
                      <td>{farmer.nic || farmer.idNumber}</td>
                      <td>{farmer.name}</td>
                      <td>{farmer.phone}</td>
                      <td>{farmer.address}</td>
                      <td className="number-cell">{data.loans}</td>
                      <td className="amount-cell">Rs {data.loanAmount.toFixed(2)}</td>
                      <td className="number-cell">{data.purchases}</td>
                      <td className="amount-cell">Rs {data.purchaseAmount.toFixed(2)}</td>
                      <td className="number-cell">{totalTransactions}</td>
                      <td className="total-cell">Rs {totalValue.toFixed(2)}</td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default FarmersTable;
