import { CartItem } from "@/context/cartContext";
import { jsPDF } from "jspdf";

const underlineText = (doc: jsPDF, text:string, x:number, y:number) => {
  const textWidth = doc.getTextWidth(text);
  doc.text(text, x, y);
  doc.line(x, y + 2, x + textWidth, y + 2); // Draw a line beneath the text
};
export const printRentalContract = (renter, materials:CartItem[]) => {
  const doc = new jsPDF();
const rentalTerms = [
    "Uwatijwe igikoresho asabwa kukirinda neza kuburyo kitangirika cyangwa ngo gikomereke",
    "Kubura igikoresho cyangwa kukigarura gifite ikibazo (cyangiritse) nticyakirwa ahubwo ugura igishya",
    "Kurenza igihe wahawe ucibwa amande angana n'iminsi warengejeho muburyo bw'amafaranga"
]
  // Title
  doc.setFontSize(16);
 doc.text( "Future Focus Entertainment LTD", 20, 10);
  doc.setFontSize(14);
 doc.text("Remera - Kigali - Rwanda", 20, 20);
  doc.setFontSize(9);
 doc.text( "Email: futurefocusforum@gmail.com", 20, 30);
 doc.text( "Phone: +250788518845 / 0798664112", 20, 40);

  doc.setFontSize(14);
  underlineText(
    doc,
    "LIST Y'IBIKORESHO BISOHOWE MURI FUTURE FOCUS LTD",
    20,
    70
  );

  doc.setFontSize(10);
  doc.text(
    `Ngewe Mr/Mrs ${renter.rendeeName} ufite ID No: ................................na telephone ................................ `,
    20,
    100
  );
  doc.text(
    `ntiye(nkodesheje) ibikoresho bya Future Focus ltd mbiherewe uburenganzira na Mr/Mrs ${renter.render}`,
    20,
    110
  );

  // Material Information Table
  doc.setFontSize(14);
  underlineText(doc, "Ibikoresho bitwawe:", 20, 120);
  doc.setFontSize(10);

  const startY = 140;
  const columnHeaders = ["Izina", "Ubwoko", "Nimero", "Ingano"];
  const columnWidths = [40, 40, 40, 40];

 
  columnHeaders.forEach((header, index) => {
    doc.text(header, 20 + index * columnWidths[index], startY);
  });
  materials.forEach((material, index) => {
    const yPosition = startY + 10 + index * 10; // Adjust spacing for multiple materials
    doc.text(material?.materialName || "", 20, yPosition);
    doc.text(material?.materialName || "", 20 + columnWidths[0], yPosition);
    doc.text(material?.materialName || "", 20 + columnWidths[0] * 2, yPosition);
    doc.text(material?.amount.toString() || "", 20 + columnWidths[0] * 3, yPosition);
  });

  // Rental Terms
  doc.setFontSize(14);
  underlineText(doc, "NB:", 20, startY + 30 + materials.length * 10);
  doc.setFontSize(10);

  rentalTerms.forEach((term, index) => {
    doc.text(
      `${index + 1}. ${term}`,
      20,
      startY + 40 + materials.length * 10 + index * 10
    );
  });

  doc.setFontSize(10);
  underlineText(doc, "Signatures:", 20, 230);
  doc.text("_____________________", 20, 240); 
  doc.text(`Renter's Signature: ${renter.rendeeName}`, 20, 250);
  doc.text("_____________________", 150, 240); 
  doc.text(`Owner's Signature:`, 140, 250);
  doc.text(renter.render, 140, 260);

  doc.text(`Date: ${new Date().toLocaleDateString()}`, 75, 280);


  doc.save("rental_contract.pdf");
};
