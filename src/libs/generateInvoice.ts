import { IInvoice } from "@/types/types";
import { jsPDF } from "jspdf";
import { formatDate } from "./dateConverter";

export const generateStatementPdf = (data: IInvoice, imageBase64: string) => {
  const doc = new jsPDF();

  if (imageBase64) {
    doc.addImage(imageBase64, "PNG", 50, 10, 90, 70);
  }

  doc.setFontSize(20);
  doc.text("Payment Statement", 50, 70);

  let y = 100;
  y += 10;

  doc.setFontSize(15);
  doc.text("Name", 10, y);
  doc.text(data.student || "N/A", 90, y);
  y += 10;

  doc.text("Amount Paid", 10, y);
  doc.text(data.amount ? data.amount.toString() + "Frw" : "N/A", 90, y);
  y += 10;
  doc.text("Remaining balance", 10, y);
  doc.setTextColor(255, 0, 0);
  doc.text(data.remaining ? data.remaining>=0? data.remaining.toString() + "Frw" : data.status + " " + (-data.remaining) +" Frw ": "N/A", 90, y);
  y += 10;
  doc.setTextColor(0, 0, 0);
  doc.text("Reason", 10, y);
  doc.text(data.reason || "N/A", 90, y);
  y += 10;

  doc.text("Date", 10, y);
  doc.text(formatDate(new Date()), 90, y);
  y += 10;
  doc.text("Signature", 10, y);
  doc.text("....................................", 90, y);
  y += 10;

  doc.line(10, y + 2, 200, y + 2);

  doc.setFontSize(23);
  doc.text("Our Services", 70, y + 10);
  doc.setFontSize(14);

  const services = [
    "Video Production and Film Making",
    "Professional Photography",
    "Graphic Design and Animation",
    "Computer Training",
    "Music and Audio Production",
  ];
  const services1 = [
    "Digital Marketing",
    "Piano  Lessons",
    "Software Development",
    "Mobile App Development",
    "Web Development",
  ];

  services.forEach((service, index) => {
    doc.text(`• ${service}`, 10, y + 30 + index * 10);
  });
  services.forEach((service, index) => {
    doc.text(`• ${service}`, 120 , y + 30 + index * 10);
  });

  doc.setFontSize(13);
  doc.text(
    "Thank you for your business!",
    70,
    doc.internal.pageSize.height - 40
  );
  doc.text(
    "Future Focus Academy | futurefocusacademie@gmail.com",
    50,
    doc.internal.pageSize.height - 30
  );
  doc.text(
    "www.futurefocus.co.rw | +250788518845",
    50,
    doc.internal.pageSize.height - 20
  );

  // Save the PDF with a meaningful filename
  doc.save("payment_statement.pdf");
};
