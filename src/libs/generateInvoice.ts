import { IInvoice } from "@/types/types";
import { jsPDF } from "jspdf";
import { formatDate } from "./dateConverter";

export const generateStatementPdf = (data: IInvoice, imageBase64: string) => {
  const doc = new jsPDF();

  // Add the image if provided
  if (imageBase64) {
    doc.addImage(imageBase64, "PNG", 50, 10, 90, 70);
  }

  doc.setFontSize(20);
  doc.text("Payment Statement", 50, 80); // Adjusted position

  let y = 100; // Starting Y position

  // Set font size for details
  doc.setFontSize(14);

  // Define details array for cleaner code
  const details = [
    { label: "Name", value: data.student || "N/A" },
    { label: "Amount Paid", value: data.amount ? `${data.amount} Frw` : "N/A" },
    {
      label: "Remaining Balance",
      value:
        data.remaining !== undefined
          ? data.remaining >= 0
            ? `${data.remaining} Frw`
            : `${data.status} ${-data.remaining} Frw`
          : "N/A",
    },
    { label: "Reason", value: data.reason || "N/A" },
    { label: "Payment Method", value: data.paymentMethod || "N/A" },
    { label: "Date", value: formatDate(new Date()) },
    { label: "Signature", value: "...................................." },
  ];

  // Loop through details to display
  details.forEach((detail) => {
    doc.text(detail.label, 30, y);
    doc.text(detail.value, 90, y);
    y += 10; // Increment Y for next line
  });

  // Draw a line after details
  doc.line(10, y + 2, 200, y + 2);
  y += 10; // Increment Y after the line

  // Services section
  doc.setFontSize(23);
  doc.text("Our Services", 70, y);
  doc.setFontSize(14);
  y += 10; // Increment Y for services section

  const services = [
    "Video Production and Film Making",
    "Professional Photography",
    "Graphic Design and Animation",
    "Computer Training",
    "Music and Audio Production",
    "Digital Marketing",
    "Piano Lessons",
    "Software Development",
    "Mobile App Development",
    "Web Development",
  ];

  // Adjust Y for service entries
  services.forEach((service, index) => {
    const xPos = index < 5 ? 10 : 120; // Split into two columns
    const yPos = y + (index % 5) * 10; // Adjust Y based on index
    doc.text(`• ${service}`, xPos, yPos);
  });

  y += Math.ceil(services.length / 5) * 10; // Adjust Y for total services height

  // Footer
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

  // Save the document
  doc.save(`${data.student}_payment_statement.pdf`);
};

export const generateRegisterStatementPdf = (
  data: IInvoice,
  imageBase64: string
) => {
  const doc = new jsPDF();

  // Add the image if provided
  if (imageBase64) {
    doc.addImage(imageBase64, "PNG", 50, 10, 90, 70);
  }

  doc.setFontSize(20);
  doc.text("Payment Statement", 50, 80); // Adjusted Y position for title

  let y = 100;

  // Set font size for the details
  doc.setFontSize(14);

  const details = [
    { label: "Name", value: data.student || "N/A" },
    { label: "Amount Paid", value: "10000 Frw" },
    { label: "Reason", value: "Registration fees" },
    { label: "Payment Method", value: data.paymentMethod || " " },
    { label: "Date", value: formatDate(new Date()) },
    { label: "Signature", value: "...................................." },
  ];

  // Iterate through details to display them
  details.forEach((detail) => {
    doc.text(detail.label, 30, y);
    doc.text(detail.value, 90, y);
    y += 10; // Increment Y for next line
  });

  // Draw a line
  doc.line(10, y + 2, 200, y + 2);
  y += 10; // Increment Y after line

  // Services section
  doc.setFontSize(23);
  doc.text("Our Services", 70, y);
  doc.setFontSize(14);
  y += 10; // Increment Y for services section

  const services = [
    "Video Production and Film Making",
    "Professional Photography",
    "Graphic Design and Animation",
    "Computer Training",
    "Music and Audio Production",
    "Digital Marketing",
    "Piano Lessons",
    "Software Development",
    "Mobile App Development",
    "Web Development",
  ];

  services.forEach((service, index) => {
    const xPos = index < 5 ? 10 : 120; // Split services into two columns
    const yPos = y + (index % 5) * 10; // Adjust Y based on index
    doc.text(`• ${service}`, xPos, yPos);
  });

  y += Math.ceil(services.length / 5) * 10; // Adjust Y for total services height

  // Footer
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

  // Save the document
  doc.save(`${data.student}_registration_statement.pdf`);
};
