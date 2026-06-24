import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateContributionsPDF = (contributions, userDetails) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text("CivicNest - My Contributions", 14, 22);
  
  // User Info
  doc.setFontSize(12);
  doc.text(`Name: ${userDetails?.name || "Member"}`, 14, 32);
  doc.text(`Email: ${userDetails?.email || ""}`, 14, 40);
  doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 14, 48);
  
  // Table
  const tableColumn = ["Date", "Issue/Cause", "Type", "Amount (BDT)"];
  const tableRows = [];

  contributions.forEach(contrib => {
    const rowData = [
      new Date(contrib.date).toLocaleDateString(),
      contrib.title || contrib.issueId || "Unknown",
      contrib.type === "animal" ? "Animal Fund" : "Issue Contribution",
      contrib.amount
    ];
    tableRows.push(rowData);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 55,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [2, 128, 144] } // #028090 CivicNest Theme Color
  });

  const totalAmount = contributions.reduce((sum, item) => sum + Number(item.amount), 0);
  
  const finalY = doc.lastAutoTable.finalY || 55;
  doc.setFontSize(12);
  doc.text(`Total Contribution: ${totalAmount} BDT`, 14, finalY + 10);

  doc.save("civicnest-contributions.pdf");
};
