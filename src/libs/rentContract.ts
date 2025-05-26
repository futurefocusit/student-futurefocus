import { CartItem } from "@/context/cartContext";
import { jsPDF } from "jspdf";

const underlineText = (doc: jsPDF, text: string, x: number, y: number) => {
  const textWidth = doc.getTextWidth(text);
  doc.text(text, x, y);
  doc.line(x, y + 2, x + textWidth, y + 2);
};

export const printRentalContract = (renter, materials: CartItem[]) => {
  const doc = new jsPDF();
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.getHeight();

  const rentalTerms = [
    "Uwatijwe igikoresho asabwa kukirinda neza kuburyo kitangirika cyangwa ngo gikomereke",
    "Kubura igikoresho cyangwa kukigarura gifite ikibazo (cyangiritse) nticyakirwa ahubwo ugura igishya",
    "Kurenza igihe wahawe ucibwa amande angana n'iminsi warengejeho muburyo bw'amafaranga",
  ];

  let currentY = 10;

  const addTextBlock = (text: string, fontSize: number, x: number, y: number) => {
    doc.setFontSize(fontSize);
    doc.text(text, x, y);
    return y + lineHeight;
  };

  // Header
  currentY = addTextBlock("Future Focus Entertainment LTD", 16, 20, currentY);
  currentY = addTextBlock("Remera - Kigali - Rwanda", 14, 20, currentY + 5);
  currentY = addTextBlock("Email: futurefocusforum@gmail.com", 9, 20, currentY + 5);
  currentY = addTextBlock("Phone: +250788518845 / 0798664112", 9, 20, currentY + 5);

  // Title
  currentY += 10;
  doc.setFontSize(14);
  underlineText(doc, "LIST Y'IBIKORESHO BISOHOWE MURI FUTURE FOCUS LTD", 20, currentY);
  currentY += 15;

  // Renter Info
  doc.setFontSize(10);
  doc.text(`Ngewe Mr/Mrs ${renter.rendeeName} ufite ID No: ................................na telephone ................................`, 20, currentY);
  currentY += lineHeight;
  doc.text(`ntiye(nkodesheje) ibikoresho bya Future Focus ltd mbiherewe uburenganzira na Mr/Mrs ${renter.render}`, 20, currentY);
  currentY += lineHeight + 5;

  // Materials Title
  doc.setFontSize(14);
  underlineText(doc, "Ibikoresho bitwawe:", 20, currentY);
  currentY += 10;

  // Table Headers
  const headers = ["Izina", "Ubwoko", "Nimero", "Ingano"];
  const columnX = [20, 70, 120, 160];
  doc.setFontSize(10);
  headers.forEach((header, index) => doc.text(header, columnX[index], currentY));
  currentY += lineHeight;

  // Material Rows
  const cellWidth = 45;
  materials.forEach((material, index) => {
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = 20;
    }

    const nameLines = doc.splitTextToSize(material.materialName || "", cellWidth);
    const rowHeight = nameLines.length * lineHeight;

    doc.text(nameLines, columnX[0], currentY);
    doc.text(nameLines, columnX[1], currentY);
    doc.text(nameLines, columnX[2], currentY);
    doc.text((material.amount?.toString() || ""), columnX[3], currentY);

    currentY += rowHeight + 2;
  });

  // Rental Terms
  if (currentY > pageHeight - 50) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(14);
  underlineText(doc, "NB:", 20, currentY);
  currentY += lineHeight;

  doc.setFontSize(10);
  rentalTerms.forEach((term, index) => {
    const wrapped = doc.splitTextToSize(`${index + 1}. ${term}`, 170);
    doc.text(wrapped, 20, currentY);
    currentY += wrapped.length * lineHeight;
  });

  // Signatures
  if (currentY > pageHeight - 40) {
    doc.addPage();
    currentY = 20;
  }

  currentY += 10;
  underlineText(doc, "Signatures:", 20, currentY);
  currentY += lineHeight;

  doc.text("_____________________", 20, currentY);
  doc.text(`Renter's Signature: ${renter.rendeeName}`, 20, currentY + lineHeight);

  doc.text("_____________________", 140, currentY);
  doc.text(`Owner's Signature:`, 140, currentY + lineHeight);
  doc.text(renter.render, 140, currentY + 2 * lineHeight);

  doc.text(`Date: ${new Date().toLocaleDateString()}`, 75, currentY + 3 * lineHeight);

  doc.save("rental_contract.pdf");
};
