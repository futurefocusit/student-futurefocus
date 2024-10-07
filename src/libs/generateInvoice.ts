import { IInvoice } from "@/types/types";
import { jsPDF } from "jspdf";
import { formatDate } from "./dateConverter";

export const generateStatementPdf = (data: IInvoice, imageBase64: string) => {
  const doc = new jsPDF();

  // Add the image safely
  if (imageBase64) {
    doc.addImage(imageBase64, "PNG", 30, 10, 70, 50);
  }

  doc.setFontSize(14);
  doc.text("Payment Statement", 30, 70);

  let y = 100;
  y += 10;

  // Use safe text handling
  doc.setFontSize(10);
  doc.text("Name", 10, y);
  doc.text(data.student || "N/A", 90, y);
  y += 10;

  doc.text("Amount", 10, y);
  doc.text(data.amount ? data.amount.toString() : "N/A", 90, y);
  y += 10;

  doc.text("Reason", 10, y);
  doc.text(data.reason || "N/A", 90, y);
  y += 10;

  doc.text("Date", 10, y);
  doc.text(formatDate(new Date()), 90, y);
  y += 10;

  doc.text("Signature", 10, y);
  doc.text("....................................", 90, y);
  y += 10;

  doc.setFillColor(50, 50, 50);
  doc.text("www.futurefocus.co.rw", 10, y + 1);
  doc.line(10, y + 2, 200, y + 2);

  doc.setFontSize(20);
  doc.text("Our Services", 60, y + 10);
  doc.setFontSize(10);

  const services = [
    "Video Production and Film Making",
    "Professional Photography",
    "Graphic Design and Animation",
    "Computer Training",
    "Music and Audio Production",
    "Creative Art and Painting",
    "Software Development",
    "Mobile App Development",
    "Web Development",
  ];

  services.forEach((service, index) => {
    doc.text(`• ${service}`, 10, y + 30 + index * 10);
  });

  doc.setFontSize(8);
  doc.text(
    "Thank you for your business!",
    70,
    doc.internal.pageSize.height - 20
  );
  doc.text(
    "Future Focus Academy | futurefocusforum@gmail.com",
    50,
    doc.internal.pageSize.height - 10
  );

  // Save the PDF with a meaningful filename
  doc.save("payment_statement.pdf");
};
